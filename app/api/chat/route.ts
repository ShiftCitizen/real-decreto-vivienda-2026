import { NextResponse } from 'next/server';
import { responderAmplia } from '@/lib/amplia';
import { buscar } from '@/lib/busqueda';
import type { EntradaIndice } from '@/lib/busqueda';
import { seleccionar } from '@/lib/okf';
import type { Evidencia, TablaOkf } from '@/lib/okf';

/**
 * POST /api/chat — proxy mínimo hacia NVIDIA NIM para el asistente del sitio.
 *
 * Es la única pieza con servidor del proyecto (las páginas siguen siendo
 * estáticas): existe para que la clave de NIM nunca salga al navegador y
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
 * Variables de entorno (Vercel, nunca en el repo): NIM_API_KEY (secreto),
 * NIM_MODEL_ID (opcional; por defecto Llama 3.2 11B vision instruct).
 */

const NIM_BASE = 'https://integrate.api.nvidia.com/v1';
const MODELO_POR_DEFECTO = 'meta/llama-3.2-11b-vision-instruct';
const MAX_PREGUNTA = 500;
const MAX_TOKENS_SALIDA = 350;
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

const NEGATIVA =
  'Eso queda fuera del ámbito de este análisis: solo respondo preguntas sobre los reales decretos-ley de vivienda 26/2026, 27/2026, 28/2026 y 29/2026. Prueba con el buscador del sitio.';

const SISTEMA = [
  'Respondes preguntas sobre un análisis divulgativo de los reales decretos-ley 26/2026 y 27/2026 de vivienda en España. Es un análisis, no asesoramiento jurídico.',
  '',
  'REGLA 1 — Estado vigente, siempre y en todas partes.',
  'El 6 de octubre de 2026 el Consejo de Ministros aprobó dos nuevos reales decretos-ley de vivienda, publicados en el BOE el 7 de octubre: el RDL 29/2026 (BOE-A-2026-20823, paquete principal: desahucios, alquiler, fiscal, financiación) y el RDL 28/2026 (BOE-A-2026-20822, estabilidad de los contratos de arrendamiento).',
  'El RDL 29/2026 entró en vigor el 8 de octubre de 2026 (día siguiente a su publicación) y está pendiente de convalidación por la Diputación Permanente. El RDL 28/2026 NO está en vigor: su disposición final segunda retrasa su entrada en vigor al 15 de noviembre de 2026, de modo que solo produce efectos si la Diputación Permanente lo convalida antes.',
  'La Diputación Permanente (69 miembros, mayoría absoluta de 35) debe votar la convalidación de ambos decretos en el plazo de treinta días (hacia el 6 de noviembre de 2026). No hay fecha de sesión fijada.',
  'Si la pregunta trata sobre los nuevos decretos, di siempre su número (RDL 29/2026 o RDL 28/2026), su fecha de publicación (7 de octubre de 2026) y su estado de convalidación. No digas que el RDL 28/2026 está en vigor. No digas que ninguno de los dos ha sido convalidado.',
  '',
  'REGLA 1b — Derogación del 2-10-2026 (historial).',
  'Los dos decretos anteriores ENTRARON EN VIGOR: el RDL 26/2026 el 1-10-2026 y el RDL 27/2026 el 2-10-2026. El 2-10-2026 el Congreso rechazó su convalidación y ambos quedaron DEROGADOS ese mismo día. Nunca digas que nunca entraron en vigor: entraron y se derogaron.',
  'Cuando expliques una medida, di siempre «derogado el 2-10-2026» (o «derogados el 2 de octubre de 2026»): nunca digas solo «no se aplica» sin la fecha de derogación. La derogación no borra todo efecto anterior: las sumas, indemnizaciones y actuaciones anteriores a esa fecha pueden seguir teniendo consecuencias, así que no digas que no dejó ningún efecto.',
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
  'REGLA 7 — Citas.',
  'Cita con su número entre corchetes, por ejemplo [1]. Cita SOLO las entradas del CONTEXTO que uses, y cita todas las que uses.',
  '',
  'REGLA 8 — Estilo.',
  'Responde en español, en un máximo de dos o tres párrafos cortos. No muestres tu razonamiento ni nombres las reglas. Solo cuando ninguna entrada del CONTEXTO guarde relación con la pregunta, responde exactamente: «Eso queda fuera del ámbito de este análisis».',
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
 * el filtro de `cuotaAgotada` no toca las demás.
 */
function barrerCaducadas(): void {
  const ahora = Date.now();
  for (const [ip, marcas] of ventanas) {
    const vivas = marcas.filter((t) => ahora - t < CUOTA_VENTANA_MS);
    if (vivas.length === 0) ventanas.delete(ip);
    else if (vivas.length !== marcas.length) ventanas.set(ip, vivas);
  }
}

function cuotaAgotada(ip: string): boolean {
  peticionesDesdeLimpieza += 1;
  if (peticionesDesdeLimpieza >= CUOTA_LIMPIEZA_CADA) {
    peticionesDesdeLimpieza = 0;
    barrerCaducadas();
  }

  const ahora = Date.now();
  const marcas = (ventanas.get(ip) ?? []).filter((t) => ahora - t < CUOTA_VENTANA_MS);
  if (marcas.length >= CUOTA_MAX) {
    ventanas.set(ip, marcas);
    return true;
  }
  marcas.push(ahora);
  ventanas.set(ip, marcas);
  return false;
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
async function cargarOkf(origen: string): Promise<TablaOkf | null> {
  if (!okfCache) {
    okfCache = (async () => {
      try {
        const res = await fetch(`${origen}/okf-index.json`);
        if (!res.ok) return null;
        const datos = (await res.json()) as TablaOkf;
        return Array.isArray(datos?.ficheros) && datos.ficheros.length > 0 ? datos : null;
      } catch {
        return null;
      }
    })();
  }
  return okfCache;
}

type Fuente = { titulo: string; href: string };

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

  if (cuotaAgotada(ipDe(request))) {
    return NextResponse.json(
      { error: 'Cuota agotada: inténtalo de nuevo más tarde.' },
      { status: 429 },
    );
  }

  // Pedido amplio: resumen del sitio o de un tema, en frases de las páginas.
  // La cuota y el tope de 500 caracteres ya se aplicaron arriba. No llama al
  // modelo, así que no usa el tope de 350 tokens ni la clave. Una pregunta que
  // no lo es —incluida la que cae fuera del análisis— sigue abajo y, si no hay
  // evidencia, recibe la negativa fija.
  const amplia = responderAmplia(pregunta);
  if (amplia) {
    return NextResponse.json({ respuesta: amplia.respuesta, citas: amplia.citas });
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
  let fuentes: Fuente[] = [];
  let contexto = '';
  let ambitoOk = false;

  const okf = await cargarOkf(origen);
  if (okf) {
    const evidencia: Evidencia[] | null = seleccionar(pregunta, okf);
    if (evidencia) {
      ambitoOk = true;
      const bloque: string[] = [];
      let gastado = 0;
      for (const [i, e] of evidencia.entries()) {
        if (gastado >= PRESUPUESTO) break;
        const texto = `### [${i + 1}] ${e.titulo}\n${e.texto}`.slice(0, PRESUPUESTO - gastado);
        bloque.push(texto);
        gastado += texto.length;
        fuentes.push({ titulo: e.titulo, href: e.href });
      }
      contexto = bloque.join('\n\n');
    }
  }

  if (!ambitoOk) {
    const indiceRes = await fetch(`${origen}/search-index.json`);
    if (!indiceRes.ok) {
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
    const bloque: string[] = [];
    let gastado = 0;
    utiles.forEach((r, i) => {
      if (gastado >= PRESUPUESTO) return;
      const texto = `### [${i + 1}] ${r.titulo}\n${r.contexto}`.slice(0, PRESUPUESTO - gastado);
      bloque.push(texto);
      gastado += texto.length;
      fuentes.push({ titulo: r.titulo, href: r.href });
    });
    contexto = bloque.join('\n\n');
    ambitoOk = utiles.length > 0 && contexto.trim().length >= 40;
  }

  // Sin contexto con peso suficiente: negativa fija, sin llamar al modelo.
  if (!ambitoOk || contexto.trim().length < 40) {
    return NextResponse.json({ respuesta: NEGATIVA, citas: [] });
  }

  const clave = process.env.NIM_API_KEY;
  if (!clave) {
    return NextResponse.json(
      { error: 'Asistente no disponible en este momento.' },
      { status: 503 },
    );
  }

  const modelo = process.env.NIM_MODEL_ID ?? MODELO_POR_DEFECTO;
  const nimRes = await fetch(`${NIM_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clave}`,
    },
    body: JSON.stringify({
      model: modelo,
      temperature: 0.2,
      max_tokens: MAX_TOKENS_SALIDA,
      messages: [
        { role: 'system', content: SISTEMA },
        {
          role: 'user',
          content: `CONTEXTO:\n${contexto}\n\nPREGUNTA:\n${pregunta.trim()}`,
        },
      ],
    }),
    signal: AbortSignal.timeout(25000),
  });
  if (!nimRes.ok) {
    return NextResponse.json({ error: 'El modelo no responde.' }, { status: 502 });
  }
  const datos = (await nimRes.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const cruda = datos.choices?.[0]?.message?.content?.trim();
  if (!cruda) {
    return NextResponse.json({ error: 'Respuesta vacía del modelo.' }, { status: 502 });
  }

  const { texto: respuesta, fuentes: usadas } = ajustarCitas(cruda, fuentes.length);

  return NextResponse.json({
    respuesta,
    citas: usadas.map((i) => fuentes[i - 1]),
  });
}