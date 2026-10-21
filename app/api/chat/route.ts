import { NextResponse } from 'next/server';
import { responderAmplia } from '@/lib/amplia';
import { buscar, esSaludo, palabrasDeConsulta } from '@/lib/busqueda';
import type { EntradaIndice } from '@/lib/busqueda';
import { seleccionar } from '@/lib/okf';
import type { Evidencia, TablaOkf } from '@/lib/okf';

/**
 * POST /api/chat — proxy mínimo hacia múltiples proveedores para el asistente del sitio.
 *
 * Es la única pieza con servidor del proyecto (las páginas siguen siendo
 * estáticas): existe para que las claves de API nunca salgan al navegador y
 * para que nadie pueda usar el widget como un ChatGPT libre. Todo lo que
 * limita el uso vive aquí y no confía en el cliente:
 *
 * - Solo preguntas sueltas de hasta 500 caracteres, sin historial.
 * - Primero se elige evidencia; si no hay nada del análisis, se devuelve una
 *   negativa fija SIN llamar al modelo (ahorra coste y cierra la puerta a
 *   temas fuera del análisis).
 * - Un pedido amplio (resumen del sitio o de una página, puntos clave, lienzo)
 *   no pasa por esa búsqueda: se contesta con frases ya publicadas en las
 *   páginas, cada una con su enlace, y con la frase de estado junto a cada
 *   medida. Cabe entera, así que no usa el tope de 350 tokens. Una pregunta
 *   estrecha no entra por ahí.
 * - El modelo solo recibe los extractos recuperados y una instrucción de
 *   responder únicamente a partir de ellos, con citas. Temperatura baja y
 *   tope de 350 tokens de salida. La clave, la cuota y el proveedor no cambian.
 * - Cuota best-effort por IP en memoria (10/hora): suficiente para un uso
 *   honesto, sin prometer un límite distribuido que no existe.
 *
 * =====================================================
 *  POR QUÉ NUNCA HAY UN 500 VACÍO
 * =====================================================
 *  Medido el 21-10-2026 contra producción: dos de seis llamadas devolvieron
 *  un 500 con `content-length: 0`, y el widget —que hacía `await res.json()`
 *  sobre un cuerpo vacío— lo traducía como «No hay conexión con el
 *  asistente». El diagnóstico del cliente era falso: la red estaba bien y
 *  lo que se caía era la llamada al proveedor.
 *
 *  Ahora hay tres redes de seguridad, y ninguna depende de que el proveedor
 *  esté sano:
 *
 *  1. **Cadena de proveedores.** Se prueba Mistral (API directa), luego NVIDIA NIM,
 *     luego OpenRouter. Cada proveedor tiene su propia clave de API. El
 *     catálogo de modelos se retira rápido, así que una cadena de proveedores
 *     aumenta las probabilidades de que al menos uno esté disponible.
 *  2. **Plan B.** Si el modelo no contesta, la respuesta son los pasajes
 *     recuperados, con `origen: 'texto'`. Un análisis a medias es mejor que
 *     un error: lo que el visitante pierde es la síntesis, no la información.
 *  3. **`try/catch` alrededor de todo.** Ninguna excepción sale de aquí: un
 *     fallo inesperado es un 502 con `{ error }` en JSON, que el widget
 *     muestra como lo que es.
 *
 *  El failover **solo** salta ante 400/404/410 (identificador no servible con
 *  esa configuración). Ante un timeout, un 5xx o un error de red se va al plan
 *  B: encadenar un segundo proveedor tras un timeout duplicaría la espera, y
 *  35 s + 35 s no caben en los 60 s de la función.
 *
 * Variables de entorno (Vercel, nunca en el repo):
 * - MISTRAL_API_KEY: clave para Mistral API directa
 * - NIM_API_KEY: clave para NVIDIA NIM (secreto)
 * - OPENROUTER_API_KEY: clave para OpenRouter
 * - NIM_MODEL_ID (opcional; si está, manda sobre la cadena y se usa solo en NIM
 *   con `temperature` 0,2).
 */

const NIM_BASE = 'https://integrate.api.nvidia.com/v1';
const MISTRAL_BASE = 'https://api.mistral.ai/v1';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

/**
 * Tiempo máximo de una función en Vercel.
 *
 * El timeout del modelo son 35 s, así que 60 s dejan margen para el resto de
 * la función y para un failover —que solo ocurre ante errores rápidos— sin
 * depender de que el plan de Vercel lo permita por defecto.
 */
export const maxDuration = 60;

/**
 * Proveedores disponibles y sus modelos.
 *
 * Orden: Mistral (API directa) primero, luego NVIDIA NIM, luego OpenRouter.
 * Cada proveedor tiene su URL base y su modelo por defecto.
 *
 * Modelos verificados (octubre 2026):
 * Usamos mistral-small-latest en todos los proveedores: es suficiente para
 * esta tarea (respuestas cortas basadas en contexto con citas), más rápido
 * y más económico que los modelos grandes.
 *
 * - Mistral API: mistral-small-latest
 * - NVIDIA NIM: mistralai/mistral-small-latest
 * - OpenRouter: mistralai/mistral-small-latest
 *
 * Variables de entorno requeridas:
 * - MISTRAL_API_KEY: para Mistral API directa
 * - NIM_API_KEY: para NVIDIA NIM
 * - OPENROUTER_API_KEY: para OpenRouter
 *
 * NIM_MODEL_ID (opcional) sigue mandando sobre todo: si está definido, se usa
 * ese modelo único en NVIDIA NIM con temperatura 0.2.
 */
type Proveedor = {
  nombre: 'mistral' | 'nim' | 'openrouter';
  baseUrl: string;
  modelo: string;
  /** Tope de espera de este proveedor; la suma cabe en `maxDuration`. */
  timeoutMs: number;
  temperature: number;
  topP: number;
  headers: (clave: string) => Record<string, string>;
};

const PROVEEDORES: Proveedor[] = [
  {
    nombre: 'mistral',
    baseUrl: MISTRAL_BASE,
    modelo: 'mistral-small-latest',
    timeoutMs: 14_000,
    temperature: 0.6,
    topP: 0.95,
    headers: (clave: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clave}`,
    }),
  },
  {
    nombre: 'nim',
    baseUrl: NIM_BASE,
    // `mistralai/mistral-small-latest` no existe en el catálogo de NIM
    // (comprobado el 21-10-2026 en /v1/models). Este es el que funcionaba.
    modelo: 'meta/llama-3.2-11b-vision-instruct',
    timeoutMs: 22_000,
    temperature: 0.2,
    topP: 0.95,
    headers: (clave: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clave}`,
    }),
  },
  {
    nombre: 'openrouter',
    baseUrl: OPENROUTER_BASE,
    // `mistralai/mistral-small-latest` no está en la lista pública de
    // OpenRouter (21-10-2026). La clave tiene límite de gasto 0 $ (log del
    // preview: 403 «Key limit exceeded»), así que solo sirven modelos :free.
    // Es el mismo que usan los cursos de ShiftCitizen.
    modelo: 'google/gemma-4-31b-it:free',
    timeoutMs: 14_000,
    temperature: 0.6,
    topP: 0.95,
    headers: (clave: string) => ({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clave}`,
      'HTTP-Referer': 'https://real-decreto-vivienda-2026.vercel.app',
      'X-Title': 'Asistente RDL Vivienda 2026',
    }),
  },
];

type Modelo = { id: string; temperature: number; topP: number };

/**
 * Timeout de la llamada al modelo.
 *
 * Con 25 s se agotaba: dos de las seis llamadas medidas en producción lo
 * agotaron. Las que contestaron tardaron entre 8,6 y 16,1 s, así que 35 s
 * deja pasar todas y cabe en los 60 s de la función.
 */
const TIMEOUT_NIM_MS = 35_000;

/**
 * Presupuesto total para la cadena de proveedores (21-10-2026). La función
 * tiene 60 s; se dejan 10 s para la recuperación y la respuesta. Cada
 * proveedor espera lo suyo o lo que quede del presupuesto, lo que sea menor.
 */
const PRESUPUESTO_CADENA_MS = 50_000;

const MAX_PREGUNTA = 500;
const MAX_TOKENS_SALIDA = 550; // 21-10-2026: cabe explicar dos procedimientos con su estado
const CUOTA_MAX = 10;
const CUOTA_VENTANA_MS = 60 * 60 * 1000;
/** Cada cuántas peticiones se barren las IP caducadas. */
const CUOTA_LIMPIEZA_CADA = 50;

/**
 * Tope de contexto por fichero.
 *
 * Antes el tope eran 3 000 caracteres **sobre todo el bloque**, y por eso una
 * FAQ entera se comía el hueco: una pregunta de tres partes recibía como mucho
 * tres entradas y las tres podían ser del mismo tema equivocado. Ahora el tope
 * es por fichero y `lib/okf.ts` elige qué bloques entran, así que 7 000 es
 * holgado para cuatro temas y dos fichas de estado.
 */
const PRESUPUESTO = 7000;

/**
 * Tope del texto que devuelve el plan B.
 *
 * Son 3 000 caracteres para los ficheros de tema y 1 500 reservados para las
 * dos fichas de estado: el estado no es decoración, es lo que hace que la
 * respuesta diga qué decreto rige la medida.
 */
const TOPE_TEXTO_PLAN_B = 5700;
const TOPE_TEXTO_PLAN_B_TEMA = 4200; // 21-10-2026: cabe la remisión a la enervación entera (subrogación incluida)
const TOPE_TEXTO_PLAN_B_ESTADO = 1500;

const NEGATIVA =
  'Eso queda fuera del ámbito de este análisis: solo respondo preguntas sobre los reales decretos-ley de vivienda 26/2026, 27/2026, 28/2026 y 29/2026. Prueba con el buscador del sitio.';

const SISTEMA = [
  'Respondes preguntas sobre un análisis divulgativo de los reales decretos-ley de vivienda 26/2026, 27/2026, 28/2026 y 29/2026 en España. Es un análisis, no asesoramiento jurídico.',
  '',
  'REGLA 1 — Estado vigente, siempre y en todas partes.',
  'El 6 de octubre de 2026 el Consejo de Ministros aprobó dos nuevos reales decretos-ley de vivienda, publicados en el BOE el 7 de octubre: el RDL 29/2026 (BOE-A-2026-20823, paquete principal: desahucios, alquiler, fiscal, financiación) y el RDL 28/2026 (BOE-A-2026-20822, estabilidad de los contratos de arrendamiento).',
  'El RDL 29/2026 entró en vigor el 8 de octubre de 2026 (día siguiente a su publicación) y está pendiente de convalidación por la Diputación Permanente. El RDL 28/2026 NO está en vigor: su disposición final segunda retrasa su entrada en vigor al 15 de noviembre de 2026, de modo que solo produce efectos si la Diputación Permanente lo convalida antes.',
  'La Diputación Permanente (69 miembros, mayoría absoluta de 35) debe votar la convalidación de ambos decretos en el plazo de treinta días (hacia el 6 de noviembre de 2026). No hay fecha de sesión fijada.',
  'Si la pregunta trata sobre los nuevos decretos, di siempre su número (RDL 29/2026 o RDL 28/2026), su fecha de publicación (7 de octubre de 2026) y su estado de convalidación. No digas que el RDL 28/2026 está en vigor. No digas que ninguno de los dos ha sido convalidado.',
  '',
  'REGLA 1b — Derogación del 2-10-2026 (historial).',
  'Los dos decretos anteriores ENTRARON EN VIGOR: el RDL 26/2026 el 1-10-2026 y el RDL 27/2026 el 2-10-2026. El 2-10-2026 el Congreso rechazó su convalidación y ambos quedaron DEROGADOS ese mismo día. Nunca digas que nunca entraron en vigor: entraron y se derogaron.',
  '',
  'REGLA 1c — DEROGAR UN DECRETO NO ES DEROGAR UNA MEDIDA. Esta es la regla que más se ha incumplido.',
  'Casi todas las medidas del RDL 26/2026 y del RDL 27/2026 las reproduce el RDL 29/2026 (en vigor) o el RDL 28/2026 (todavía no en vigor). Antes de decir que una medida está derogada, que no se aplica o que no está en vigor, mira en el CONTEXTO qué decreto la rige AHORA.',
  'Si el CONTEXTO dice que la medida sigue vigente, di SIEMPRE qué decreto la recoge ahora y si ese decreto está en vigor o pendiente de convalidación. Solo después, como dato histórico, puedes decir que la versión anterior (RDL 26/2026 o RDL 27/2026) quedó derogada el 2-10-2026. Nunca presentes como derogada una medida que el CONTEXTO diga que sigue vigente, por mucho que su artículo original sea de los decretos derogados.',
  'Al revés tampoco: si el CONTEXTO dice que la medida NO está en vigor —por ejemplo, la prórroga por plazos sucesivos y la indemnización, que solo regirán cuando entre el RDL 28/2026 el 15-11-2026—, no la presentes como aplicable hoy; di que no lo está y por qué.',
  'Cada medida del CONTEXTO viene con un bloque «Estado: …» que dice qué decreto la rige y con qué estado. Ese bloque manda: úsalo para el estado de la medida, sin contradecirlo ni reescribirlo.',
  'La derogación no borra todo efecto anterior: las sumas, indemnizaciones y actuaciones anteriores al 2-10-2026 pueden seguir teniendo consecuencias, así que no digas que no dejó ningún efecto.',
  'Si la pregunta menciona una notificación, aviso, demanda, requerimiento o comunicación fechada el 1 o el 2 de octubre de 2026, añade que la lleve a un abogado o a un sindicato de inquilinos.',
  'Derogar un decreto tampoco significa que no quede nada: pueden seguir vigentes la LAU, la LEC y las demás normas anteriores. Nunca concluyas que no existe ninguna protección.',
  '',
  'REGLA 2 — Responde parte por parte.',
  'Si la pregunta tiene varias partes, contesta a CADA una en su propio párrafo, en el orden en que se preguntan. No te centres en la primera ni unas las otras.',
  '',
  'REGLA 3 — No afirmes que el análisis no recoge algo si el contexto sí lo dice.',
  'El CONTEXTO es la única fuente. Si algo está en el contexto, úsalo. Solo si una parte concreta no aparece en el CONTEXTO puedes decir que el análisis no la recoge, y entonces refiérete únicamente a esa parte.',
  'Prohibido contradecir lo que acabas de decir: si en el contexto hay una reducción del IRPF para el propietario que alquila a una entidad sin fines lucrativos, no añadas después que el análisis no recoge ninguna ventaja para el propietario.',
  '',
  'REGLA 4 — Cifras y plazos salen del CONTEXTO, nunca de la pregunta.',
  'Si la pregunta trae un porcentaje, plazo o artículo que el CONTEXTO no confirma, corrígelo con el del CONTEXTO y no repitas el de la pregunta.',
  '',
  'REGLA 5 — No inventes.',
  'No deduzcas un régimen sancionador, una multa, una sanción o un plazo que el CONTEXTO no describa. Si el contexto no lo recoge, dilo y no lo rellenes.',
  '',
  'REGLA 6 — Nada de sí o no sobre la posición de una persona.',
  'Ante una pregunta sobre el contrato, el impago, los impuestos o la retención de la renta de alguien concreto, nunca respondas con un «sí» o un «no» secos. Explica qué dice el análisis y añade que no es asesoramiento jurídico. Aunque te pidan solo sí o no.',
  '',
  'REGLA 6b — Estado de cada norma que cites.',
  'Cada vez que nombres un real decreto-ley, di su estado tal como lo da el CONTEXTO (por ejemplo: en vigor desde tal fecha y pendiente de convalidación, o derogado en tal fecha). Si el CONTEXTO no da el estado, no lo inventes.',
  '',
  'REGLA 6c — Todos los procedimientos que respondan a la pregunta.',
  'Si el CONTEXTO describe más de un procedimiento o mecanismo que responda a la pregunta (por ejemplo, uno remite a otro con «solo si no opera…»), explica cada uno con sus plazos, quién debe hacer qué y qué pasa si no lo hace. No te quedes solo con el primero.',
  '',
  'REGLA 6d — Quién actúa o paga, exactamente como dice el texto.',
  'Atribuye cada acción, plazo, pago u obligación al sujeto que nombra el CONTEXTO (el tribunal, la administración competente, el arrendatario, el demandante…). Nunca cambies un sujeto por otro: si el texto dice que paga la administración competente, no digas que paga el tribunal.',
  '',
  'REGLA 6e — Cita los artículos.',
  'Junto a cada afirmación jurídica, nombra el artículo y la norma que el CONTEXTO da para ella (por ejemplo, art. 2.2 RDL 29/2026).',
  '',
  'REGLA 7 — Citas.',
  'Cita con su número entre corchetes, por ejemplo [1]. Cita SOLO las entradas del CONTEXTO que uses, y cita todas las que uses.',
  '',
  'REGLA 8 — Estilo.',
  'Responde en español, en un máximo de cuatro párrafos cortos. No muestres tu razonamiento ni nombres las reglas. Solo cuando ninguna entrada del CONTEXTO guarde relación con la pregunta, responde exactamente: «Eso queda fuera del ámbito de este análisis».',
].join('\n');

// Cuota por IP en memoria del proceso. Best-effort: en serverless cada
// instancia lleva su propio conteo, así que es un freno al abuso casual,
// no un límite distribuido exacto.
const ventanas = new Map<string, number[]>();
let peticionesDesdeLimpieza = 0;

/**
 * Barre las ventanas caducadas.
 *
 * Sin esto, `ventanas` conserva una entrada por cada IP vista *para siempre*:
 * las llamadas anónimas no cesan, y el Map crece sin límite hasta que la
 * instancia se queda sin memoria. Consultar una IP solo limpia esa IP, porque
 * el filtro de la cuota no toca las demás.
 */
function barrerCaducadas(): void {
  const ahora = Date.now();
  for (const [ip, marcas] of ventanas) {
    const vivas = marcas.filter((t) => ahora - t < CUOTA_VENTANA_MS);
    if (vivas.length === 0) ventanas.delete(ip);
    else if (vivas.length !== marcas.length) ventanas.set(ip, vivas);
  }
}

/**
 * Consume una unidad de cuota. `false` significa que la cuota estaba agotada.
 */
function consumirCuota(ip: string): boolean {
  peticionesDesdeLimpieza += 1;
  if (peticionesDesdeLimpieza >= CUOTA_LIMPIEZA_CADA) {
    peticionesDesdeLimpieza = 0;
    barrerCaducadas();
  }

  const ahora = Date.now();
  const marcas = (ventanas.get(ip) ?? []).filter((t) => ahora - t < CUOTA_VENTANA_MS);
  if (marcas.length >= CUOTA_MAX) {
    ventanas.set(ip, marcas);
    return false;
  }
  marcas.push(ahora);
  ventanas.set(ip, marcas);
  return true;
}

/**
 * Devuelve la última unidad consumida.
 *
 * Se llama cuando la respuesta final es un error: el visitante no ha recibido
 * nada, así que gastar una de las diez preguntas por hora sin contestarle es
 * injusto. Medido: un timeout agotaba una de las diez sin devolver nada.
 */
function devolverCuota(ip: string): void {
  const ahora = Date.now();
  const marcas = (ventanas.get(ip) ?? []).filter((t) => ahora - t < CUOTA_VENTANA_MS);
  if (marcas.length > 0) marcas.pop();
  if (marcas.length === 0) ventanas.delete(ip);
  else ventanas.set(ip, marcas);
}

function ipDe(request: Request): string {
  // `x-vercel-forwarded-for` primero: Vercel lo fija él y no lo reescribe un
  // proxy intermedio, así que es el único que no depende del cliente. Solo si
  // no está (servidor local, otro hosting) se cae a `x-forwarded-for`.
  //
  // Y de ese se toma el ÚLTIMO valor, no el primero: la cadena crece de fuera
  // hacia dentro, así que el último es el que añadió el servidor más cercano al
  // origen. El primero lo pone cualquiera que mande la cabecera, y usarlo hace
  // la cuota falsificable con un `curl`.
  const cabecera =
    request.headers.get('x-vercel-forwarded-for') ?? request.headers.get('x-forwarded-for');
  const ip = cabecera?.split(',').pop()?.trim() || 'desconocida';
  // Una IP no puede ser arbitrariamente larga ni llevar espacios: se usa como
  // clave de un Map que crece sin límite, y una cabecera manipulada convertiría
  // eso en agotamiento de memoria.
  return /^[0-9a-f:.]{1,45}$/i.test(ip) ? ip : 'desconocida';
}

/**
 * Índice del bundle OKF, leído una vez por instancia.
 *
 * `public/okf-index.json` mide unos 124 kB y no cambia entre peticiones, así que
 * se cachea a nivel de módulo. Antes de existirse leía el índice de búsqueda
 * por HTTP en cada llamada; aquí se mantiene el mismo patrón —leer del origen
 * sirve, y no del disco— pero una sola vez.
 *
 * Si el fichero no está, se devuelve `null` y el llamante cae a `buscar()`: la
 * tabla del bundle es una mejora, no un requisito para que el asistente
 * funcione.
 */
let okfCache: Promise<TablaOkf | null> | null = null;
/**
 * Cabeceras para leer los índices del propio despliegue.
 *
 * En un preview con Deployment Protection, `fetch(origen/…json)` sin más
 * recibe la página de login (302 → HTML) y el `json()` revienta: el chat
 * contestaba 502 sin llegar al modelo. Se reenvía el bypass que trajo la
 * petición (cabecera o cookie). En producción no hay protección y no cambia nada.
 */
function cabecerasInternas(request: Request): HeadersInit {
  const h: Record<string, string> = {};
  const bypass = request.headers.get('x-vercel-protection-bypass');
  if (bypass) h['x-vercel-protection-bypass'] = bypass;
  const cookie = request.headers.get('cookie');
  if (cookie) h.cookie = cookie;
  return h;
}

async function cargarOkf(origen: string, cabeceras: HeadersInit = {}): Promise<TablaOkf | null> {
  if (!okfCache) {
    okfCache = (async () => {
      try {
        const res = await fetch(`${origen}/okf-index.json`, { headers: cabeceras });
        if (!res.ok) {
          console.error(`[chat] okf-index.json status ${res.status}`);
          okfCache = null;
          return null;
        }
        const datos = (await res.json()) as TablaOkf;
        return Array.isArray(datos?.ficheros) && datos.ficheros.length > 0 ? datos : null;
      } catch (e) {
        console.error(`[chat] okf-index.json ilegible: ${(e instanceof Error ? e.message : String(e)).slice(0, 300)}`);
        okfCache = null;
        return null;
      }
    })();
  }
  return okfCache;
}

type Fuente = { titulo: string; href: string };
/** Una evidencia con su texto: lo que ve el modelo, o lo que ve el plan B. */
type EvidenciaRuta = Fuente & { texto: string; estado?: boolean };

/**
 * Deja solo las fuentes citadas y **renumera** para que `[n]` siga apuntando a
 * la correcta.
 *
 * El widget pinta las citas como enlaces en el mismo orden que las marcas `[n]`
 * del texto, así que con un hueco intermedio `[3]` apuntaría a la fuente
 * equivocada. Se recoge el conjunto de números citados, se ordenan y se
 * reescriben a 1..n, y el texto se ajusta con el mismo mapa. Solo se listan las
 * que el modelo usó de verdad: cada fuente no relacionada que se liste es una
 * fuente que no debería estar.
 */
function ajustarCitas(respuesta: string, total: number): { texto: string; fuentes: number[] } {
  const citadas = [
    ...new Set(
      [...respuesta.matchAll(/\[(\d{1,2})\]/g)]
        .map((m) => Number(m[1]))
        .filter((n) => n >= 1 && n <= total),
    ),
  ].sort((a, b) => a - b);
  const usadas = citadas.length > 0 ? citadas : [1];
  // mapa: número original → número nuevo (1-based). El iterador da (valor, índice),
  // así que `viejo` es el número original y `i + 1` el nuevo correlativo.
  const mapa = new Map(usadas.map((viejo, i) => [viejo, i + 1]));
  const texto = respuesta.replace(/\[(\d{1,2})\]/g, (marca, n) => {
    const viejo = Number(n);
    return mapa.has(viejo) ? `[${mapa.get(viejo)}]` : marca;
  });
  return { texto, fuentes: usadas };
}

/**
 * Monta el contexto que ve el modelo, y las fuentes que lo sostienen.
 *
 * El número del bloque (`### [n]`) es el mismo que el de la fuente, y ambos
 * cuentan desde 1: es lo que permite que `ajustarCitas()` renumere a la vez
 * el texto y la lista.
 */
function montarContexto(
  evidencia: EvidenciaRuta[],
  presupuesto: number,
): { contexto: string; fuentes: Fuente[] } {
  const bloque: string[] = [];
  const fuentes: Fuente[] = [];
  let gastado = 0;
  for (const [i, e] of evidencia.entries()) {
    if (gastado >= presupuesto) break;
    const texto = `### [${i + 1}] ${e.titulo}\n${e.texto}`.slice(0, presupuesto - gastado);
    bloque.push(texto);
    gastado += texto.length;
    fuentes.push({ titulo: e.titulo, href: e.href });
  }
  return { contexto: bloque.join('\n\n'), fuentes };
}

/**
 * Recorta por el último final de frase, o `null` si no hay ninguno.
 *
 * Un texto cortado a media palabra es peor que no mostrarlo: el modelo
 * recibiría una afirmación sin sujeto.
 */
function porFrase(texto: string, tope: number): string | null {
  if (texto.length <= tope) return texto;
  const corte = texto.lastIndexOf('. ', tope - 1);
  if (corte <= 0) return null;
  return texto.slice(0, corte + 1);
}

/**
 * Plan B: la respuesta es el texto recuperado, sin modelo.
 *
 * Es lo que se devuelve cuando el proveedor no contesta. Los pasajes van
 * numerados igual que las citas —`[1]`, `[2]`— y en el mismo orden, así que el
 * widget los pinta como enlaces que apuntan al passage correcto.
 *
 * El tope está repartido: 3 000 caracteres para los ficheros de tema y 1 500
 * para las dos fichas de estado, que no se recortan porque son las que dicen
 * qué decreto rige cada medida.
 */
function respuestaDeTexto(evidencia: EvidenciaRuta[]): { respuesta: string; citas: Fuente[] } {
  const citas: Fuente[] = [];
  const lineas: string[] = [];
  let gastado = 0;
  let gastadoEstado = 0;
  for (const e of evidencia) {
    const esEstado = e.estado === true;
    const usado = esEstado ? gastadoEstado : gastado;
    const disponible =
      (esEstado ? TOPE_TEXTO_PLAN_B_ESTADO : TOPE_TEXTO_PLAN_B_TEMA) - usado;
    if (disponible < 40) continue;
    const trozo = porFrase(e.texto, disponible);
    if (!trozo || trozo.length < 40) continue;
    const n = citas.length + 1;
    citas.push({ titulo: e.titulo, href: e.href });
    lineas.push(`[${n}] ${trozo}`);
    if (esEstado) gastadoEstado += trozo.length;
    else gastado += trozo.length;
  }
  return { respuesta: lineas.join('\n\n'), citas };
}

/** Lo que devuelve una llamada al modelo. */
type ResultadoModelo =
  | { ok: true; texto: string }
  /** 400/404/410: ese identificador no es servible; toca el siguiente. */
  | { ok: false; motivo: 'no-servible' }
  /** Cualquier otra cosa: timeout, 5xx, error de red, respuesta vacía. */
  | { ok: false; motivo: 'fallo' };

/**
 * Una llamada a un proveedor, con su timeout y su lectura defensiva.
 *
 * No lanza: cualquier fallo se traduce en un motivo, porque quien llama tiene
 * que poder distinguir «prueba con el siguiente proveedor» de «ve al plan B».
 *
 * 21-10-2026: se añade logging de errores para diagnosticar fallos del
 * proveedor. El log incluye el modelo intentado, el status HTTP y el
 * mensaje de error, lo que permite identificar si el problema es la clave,
 * el modelo EOL o un error transitorio.
 */
async function llamarProveedor(
  proveedor: Proveedor,
  clave: string,
  contexto: string,
  pregunta: string,
  timeoutMs: number,
): Promise<ResultadoModelo> {
  const etiqueta = `[chat] ${proveedor.nombre} ${proveedor.modelo}`;
  const inicio = Date.now();
  const endpoint = proveedor.nombre === 'openrouter' ? '/chat/completions' : '/chat/completions';
  const url = `${proveedor.baseUrl}${endpoint}`;
  
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: proveedor.headers(clave),
      body: JSON.stringify({
        model: proveedor.modelo,
        temperature: proveedor.temperature,
        top_p: proveedor.topP,
        max_tokens: MAX_TOKENS_SALIDA,
        messages: [
          { role: 'system', content: SISTEMA },
          {
            role: 'user',
            content: `CONTEXTO:\n${contexto}\n\nPREGUNTA:\n${pregunta.trim()}`,
          },
        ],
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    // Timeout agotado o error de red: no se reintenta con otro proveedor, se va
    // al plan B. Encadenar aquí duplicaría la espera.
    // Log: registra el proveedor y el error para diagnóstico
    console.error(`${etiqueta} sin respuesta tras ${Date.now() - inicio} ms (tope ${timeoutMs} ms): ${(e instanceof Error ? e.message : String(e)).slice(0, 300)}`);
    return { ok: false, motivo: 'fallo' };
  }

  if (!res.ok) {
    // 400/404/410: el identificador no es servible con esta configuración.
    // Solo en estos casos se prueba el siguiente de la cadena.
    // Log: registra el status y el proveedor para identificar modelos EOL
    const textoError = await res.text().catch(() => 'sin cuerpo');
    console.error(`${etiqueta} status ${res.status} en ${Date.now() - inicio} ms: ${textoError.slice(0, 300)}`);
    if (res.status === 400 || res.status === 404 || res.status === 410) {
      return { ok: false, motivo: 'no-servible' };
    }
    return { ok: false, motivo: 'fallo' };
  }

  let datos: {
    choices?: {
      message?: { content?: string; reasoning_content?: string };
      finish_reason?: string;
    }[];
  };
  try {
    datos = (await res.json()) as typeof datos;
  } catch (e) {
    console.error(`[${proveedor.nombre.toUpperCase()}] Error parseando JSON de ${proveedor.modelo}:`, e instanceof Error ? e.message : String(e));
    return { ok: false, motivo: 'fallo' };
  }

  const eleccion = datos.choices?.[0];
  const contenido =
    typeof eleccion?.message?.content === 'string' ? eleccion.message.content.trim() : '';
  if (!contenido) {
    // `content` vacío. O el modelo no respondió, o es uno de razonamiento que
    // deja el texto en `reasoning_content`: con 350 tokens de salida ese canal
    // no cabe, así que el plan B es la respuesta.
    console.error(`${etiqueta} status ${res.status}: content vacío (finish_reason ${eleccion?.finish_reason ?? '-'})`);
    return { ok: false, motivo: 'fallo' };
  }

  console.log(`${etiqueta} status ${res.status} ok en ${Date.now() - inicio} ms`);
  let cruda = contenido;
  if (eleccion?.finish_reason === 'length') {
    // Cortada por el tope de tokens: se recorta al último final de frase, para
    // no dejar la respuesta a medias.
    const corte = cruda.lastIndexOf('. ');
    if (corte > 0) cruda = cruda.slice(0, corte + 1);
  }
  return { ok: true, texto: cruda };
}

export async function POST(request: Request) {
  let cuerpo: unknown;
  try {
    cuerpo = await request.json();
  } catch {
    return NextResponse.json({ error: 'Cuerpo JSON no válido.' }, { status: 400 });
  }
  const pregunta =
    typeof cuerpo === 'object' && cuerpo !== null && 'pregunta' in cuerpo
      ? (cuerpo as { pregunta: unknown }).pregunta
      : undefined;
  if (typeof pregunta !== 'string' || pregunta.trim().length === 0) {
    return NextResponse.json({ error: 'Falta la pregunta.' }, { status: 400 });
  }
  if (pregunta.length > MAX_PREGUNTA) {
    return NextResponse.json(
      { error: `La pregunta no puede superar los ${MAX_PREGUNTA} caracteres.` },
      { status: 413 },
    );
  }

  const ip = ipDe(request);
  if (!consumirCuota(ip)) {
    return NextResponse.json(
      { error: 'Cuota agotada: inténtalo de nuevo más tarde.' },
      { status: 429 },
    );
  }

  try {
    return await responder(request, pregunta, ip);
  } catch (e) {
    console.error(`[chat] excepción en responder: ${(e instanceof Error ? e.message : String(e)).slice(0, 300)}`);
    // Ninguna excepción sale de aquí. Un 500 vacío era lo que el widget
    // traducía como «No hay conexión con el asistente».
    devolverCuota(ip);
    return NextResponse.json(
      { error: 'El asistente no ha podido responder. Vuelve a intentarlo.' },
      { status: 502 },
    );
  }
}

/**
 * El cuerpo de la petición, ya con la cuota consumida.
 *
 * Va aparte de `POST()` para que el `try/catch` que devuelve un 502 con
 * `{ error }` cubra **todas** las operaciones con red: la lectura del índice
 * de búsqueda, su `json()`, la llamada al modelo y la lectura de su cuerpo.
 * Antes ninguna de ellas estaba dentro de un `try`, y un fallo de proveedor
 * se traducía en un 500 sin cuerpo.
 */
async function responder(request: Request, pregunta: string, ip: string): Promise<NextResponse> {
  // Pedido amplio: resumen del sitio o de un tema, en frases de las páginas.
  // La cuota y el tope de 500 caracteres ya se aplicaron arriba. No llama al
  // modelo, así que no usa el tope de 350 tokens ni la clave. Una pregunta que
  // no lo es —incluida la que cae fuera del análisis— sigue abajo y, si no hay
  // evidencia, recibe la negativa fija.
  const amplia = responderAmplia(pregunta);
  if (amplia) {
    return NextResponse.json({
      respuesta: amplia.respuesta,
      citas: amplia.citas,
      origen: 'publicado',
    });
  }

  // Un saludo no es una pregunta. Medido: «hola, buenos días» llegaba al
  // modelo con las raíces «buen» y «dias» y contestaba con la cita
  // equivocada. Sin llamar al modelo, y con la negativa fija.
  if (esSaludo(pregunta)) {
    return NextResponse.json({ respuesta: NEGATIVA, citas: [] });
  }

  // Una consulta sin palabras de contenido («de», «el») no busca nada. Antes
  // devolvía las seis páginas al modelo, que contestaba sobre la portada.
  if (palabrasDeConsulta(pregunta).length === 0) {
    return NextResponse.json({ respuesta: NEGATIVA, citas: [] });
  }

  // Índice generado en el build, siempre fresco por construcción.
  const origen = new URL(request.url).origin;

  /**
   * Evidencia: primero el bundle OKF, y si no está disponible, `buscar()`.
   *
   * El camino antiguo se conserva entero y por un motivo concreto: `buscar()`
   * sigue siendo **el cerrojo de ámbito**. Decide si la pregunta es del
   * análisis, y de eso depende que una pregunta de cocina no gaste una llamada
   * al modelo. El bundle OKF elige *qué* texto se le pasa una vez que la
   * pregunta ya es del temario; no sustituye a esa puerta.
   */
  const evidencia: EvidenciaRuta[] = [];

  const okf = await cargarOkf(origen, cabecerasInternas(request));
  if (okf) {
    const seleccionada: Evidencia[] | null = seleccionar(pregunta, okf);
    if (seleccionada) {
      for (const e of seleccionada) {
        evidencia.push({ titulo: e.titulo, href: e.href, texto: e.texto, estado: e.estado === true });
      }
    }
  }

  if (evidencia.length === 0) {
    const indiceRes = await fetch(`${origen}/search-index.json`, { headers: cabecerasInternas(request) });
    if (!indiceRes.ok) {
      devolverCuota(ip);
      return NextResponse.json({ error: 'Índice no disponible.' }, { status: 502 });
    }
    const indice = (await indiceRes.json()) as EntradaIndice[];
    const utiles = buscar(indice, pregunta).slice(0, 3);
    // La respuesta concreta (FAQ o sección) debe llegar la primera al modelo:
    // ante un bloque genérico de página seguido de la respuesta exacta, el
    // modelo a veces se ancla al primero y rechaza. A igualdad de puntos,
    // FAQ y sección van antes que página, norma y autor.
    const RANGO_TIPO: Record<string, number> = {
      faq: 0,
      section: 1,
      page: 2,
      norma: 3,
      autor: 4,
    };
    utiles.sort(
      (a, b) => b.puntos - a.puntos || (RANGO_TIPO[a.tipo] ?? 9) - (RANGO_TIPO[b.tipo] ?? 9),
    );
    for (const r of utiles) {
      evidencia.push({ titulo: r.titulo, href: r.href, texto: r.contexto, estado: false });
    }
  }

  const { contexto, fuentes } = montarContexto(evidencia, PRESUPUESTO);

  // Sin contexto con peso suficiente: negativa fija, sin llamar al modelo.
  if (contexto.trim().length < 40) {
    return NextResponse.json({ respuesta: NEGATIVA, citas: [] });
  }

  // Verificar que al menos un proveedor tenga clave configurada
  const tieneClave = 
    process.env.MISTRAL_API_KEY || 
    process.env.NIM_API_KEY || 
    process.env.OPENROUTER_API_KEY;
  
  if (!tieneClave) {
    devolverCuota(ip);
    return NextResponse.json(
      { error: 'Asistente no disponible en este momento.' },
      { status: 503 },
    );
  }

  /**
   * La cadena de proveedores.
   *
   * `NIM_MODEL_ID`, si está definido, manda sobre la cadena: es un modelo
   * único en NVIDIA NIM, con la temperatura baja de siempre. Quien configura
   * el modelo a mano no quiere que se le cambie debajo.
   *
   * Orden por defecto: Mistral (API directa), NVIDIA NIM, OpenRouter.
   * Cada proveedor usa su propia clave de API.
   */
  let cadena: Proveedor[];
  
  if (process.env.NIM_MODEL_ID) {
    // Modo legado: solo NVIDIA NIM con el modelo especificado
    cadena = [
      {
        nombre: 'nim',
        baseUrl: NIM_BASE,
        modelo: process.env.NIM_MODEL_ID,
        timeoutMs: TIMEOUT_NIM_MS,
        temperature: 0.2,
        topP: 0.95,
        headers: (clave: string) => ({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${clave}`,
        }),
      },
    ];
  } else {
    cadena = PROVEEDORES;
  }

  const inicioCadena = Date.now();
  for (const proveedor of cadena) {
    // Obtener la clave correspondiente al proveedor
    let claveProveedor: string | undefined;
    switch (proveedor.nombre) {
      case 'mistral':
        claveProveedor = process.env.MISTRAL_API_KEY;
        break;
      case 'nim':
        claveProveedor = process.env.NIM_API_KEY;
        break;
      case 'openrouter':
        claveProveedor = process.env.OPENROUTER_API_KEY;
        break;
    }
    
    if (!claveProveedor) {
      console.error(`[${proveedor.nombre.toUpperCase()}] No hay clave de API configurada`);
      continue;
    }
    
    const queda = PRESUPUESTO_CADENA_MS - (Date.now() - inicioCadena);
    if (queda < 3_000) {
      console.error(`[chat] sin tiempo para ${proveedor.nombre} (quedan ${queda} ms)`);
      break;
    }
    const r = await llamarProveedor(
      proveedor,
      claveProveedor,
      contexto,
      pregunta,
      Math.min(proveedor.timeoutMs, queda),
    );
    if (r.ok) {
      const { texto: respuesta, fuentes: usadas } = ajustarCitas(r.texto, fuentes.length);
      return NextResponse.json({
        respuesta,
        citas: usadas.map((i) => fuentes[i - 1]),
        origen: 'modelo',
      });
    }
    // Solo un identificador no servible pasa al siguiente proveedor. Un timeout o
    // un 5xx van al plan B: encadenar después de un timeout duplicaría la
    // espera y no cabe en los 60 s de la función.
    // 21-10-2026: cualquier fallo (timeout, 4xx, 5xx, vacío) pasa al
    // siguiente proveedor. Antes solo 400/404/410 lo hacían, y un fallo del
    // primero (Mistral) dejaba sin probar a NIM y OpenRouter. El tope por
    // proveedor y el presupuesto total mantienen la cadena dentro de 60 s.
    continue;
  }

  // Plan B: el modelo no está, pero el texto recuperado sí. Se responde con
  // él, y el widget lo dice: `origen: 'texto'`.
  const planB = respuestaDeTexto(evidencia);
  if (planB.respuesta.trim().length === 0) {
    devolverCuota(ip);
    return NextResponse.json({ error: 'El modelo no responde.' }, { status: 502 });
  }
  return NextResponse.json({ ...planB, origen: 'texto' });
}
