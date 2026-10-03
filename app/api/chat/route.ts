import { NextResponse } from 'next/server';
import { buscar } from '@/lib/busqueda';
import type { EntradaIndice } from '@/lib/busqueda';

/**
 * POST /api/chat — proxy mínimo hacia NVIDIA NIM para el asistente del sitio.
 *
 * Es la única pieza con servidor del proyecto (las páginas siguen siendo
 * estáticas): existe para que la clave de NIM nunca salga al navegador y
 * para que nadie pueda usar el widget como un ChatGPT libre. Todo lo que
 * limita el uso vive aquí y no confía en el cliente:
 *
 * - Solo preguntas sueltas de hasta 500 caracteres, sin historial.
 * - Primero se busca en el índice generado; si nada relevante supera el
 *   umbral, se devuelve una negativa fija SIN llamar al modelo (ahorra
 *   coste y cierra la puerta a temas fuera del análisis).
 * - El modelo solo recibe los extractos recuperados y una instrucción de
 *   responder únicamente a partir de ellos, con citas. Temperatura baja y
 *   tope de 350 tokens de salida.
 * - Cuota best-effort por IP en memoria (10/hora): suficiente para un uso
 *   honesto, sin prometer un límite distribuido que no existe.
 *
 * Variables de entorno (Vercel, nunca en el repo): NIM_API_KEY (secreto),
 * NIM_MODEL_ID (opcional; por defecto Llama 3.1 8B instruct según el
 * catálogo de NIM — confirmar el identificador exacto en su consola).
 */

const NIM_BASE = 'https://integrate.api.nvidia.com/v1';
// Modelo pequeño disponible en la clave (verificado contra /v1/models):
// el 3.1 8B no está servido en esta cuenta; el 3.2 11B instruct es el
// instruct general más pequeño. NIM_MODEL_ID lo sustituye si hace falta.
const MODELO_POR_DEFECTO = 'meta/llama-3.2-11b-vision-instruct';
const MAX_PREGUNTA = 500;
const MAX_TOKENS_SALIDA = 350;
const CUOTA_MAX = 10;
const CUOTA_VENTANA_MS = 60 * 60 * 1000;
/** Cada cuántas peticiones se barren las IP caducadas. */
const CUOTA_LIMPIEZA_CADA = 50;

const NEGATIVA =
  'Eso queda fuera del ámbito de este análisis: solo respondo preguntas sobre los reales decretos-ley 26/2026 y 27/2026 de vivienda. Prueba con el buscador del sitio.';

const SISTEMA = [
  'Respondes preguntas sobre un análisis divulgativo de los reales decretos-ley 26/2026 y 27/2026 de vivienda en España.',
  'AMBOS DECRETOS QUEDARON DEROGADOS al rechazarse su convalidación el 2-10-2026. Sus medidas no se aplican a nadie.',
  'Regla de primer orden: si la pregunta da por supuesto que una medida está en vigor, empieza diciendo que fue derogada el 2-10-2026 y solo después explica qué decía la medida. Nunca la describas como aplicable.',
  'Responde ÚNICAMENTE a partir del CONTEXTO que se te da.',
  'Si el contexto incluye una pregunta frecuente igual o muy parecida a la pregunta, responde a partir de ella: ese caso sí tiene respuesta y no debes rechazarlo.',
  'Cifras, plazos, porcentajes y artículos: tómalos SIEMPRE del CONTEXTO, nunca de la pregunta. Si la pregunta trae un número que el CONTEXTO no confirma, corrígelo con el del CONTEXTO y no lo repitas.',
  'No inventes nada que no esté en el CONTEXTO. En particular, si el CONTEXTO no describe un régimen sancionador, una multa o una sanción, no deduzcas ninguno: di que el análisis no lo recoge.',
  'Sobre la posición jurídica de una persona concreta, nunca respondas con un sí o un seco. Explica qué dice el análisis y añade que no es asesoramiento jurídico.',
  'Cita las entradas del CONTEXTO con su número entre corchetes, por ejemplo [1]. Cita solo las que uses.',
  'Solo cuando ninguna entrada del contexto guarde relación con la pregunta, responde exactamente: «Eso queda fuera del ámbito de este análisis».',
  'Responde en español, en un máximo de dos párrafos cortos.',
].join(' ');

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

  // Índice generado en el build, siempre fresco por construcción.
  const origen = new URL(request.url).origin;
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
  // Contexto numerado, con el texto indexado completo (no el extracto de 160):
  // las respuestas FAQ van íntegras y las secciones hasta el tope del índice.
  // Con extractos recortados a mitad de frase el modelo se negaba con razón.
  //
  // Numerado porque el modelo cita con [n] y `citas` sale de ahí. Antes se
  // mandaba todo lo recuperado y se listaba entero: la respuesta hablaba del
  // tope de la renta y debajo aparecían tres títulos sin relación con ella.
  //
  // El recorte es por entrada, no sobre el bloque joined: con 3000 caracteres
  // sobre la concatenación, la primera entrada larga se comía el hueco y las
  // demás llegaban cortadas o no llegaban.
  const PRESUPUESTO = 3000;
  const bloque: string[] = [];
  let gastado = 0;
  utiles.forEach((r, i) => {
    if (gastado >= PRESUPUESTO) return;
    const pie = `### [${i + 1}] ${r.titulo}\n`;
    const texto = `${pie}${r.contexto}`.slice(0, PRESUPUESTO - gastado);
    bloque.push(texto);
    gastado += texto.length;
  });
  const contexto = bloque.join('\n\n');

  // Sin contexto con peso suficiente: negativa fija, sin llamar al modelo.
  if (utiles.length === 0 || contexto.trim().length < 40) {
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
  const respuesta = datos.choices?.[0]?.message?.content?.trim();
  if (!respuesta) {
    return NextResponse.json({ error: 'Respuesta vacía del modelo.' }, { status: 502 });
  }
  // Solo se listan las entradas hasta la última citada, no las tres siempre:
  // el widget pinta las citas como enlaces en el mismo orden que las marcas
  // [n] del texto, así que un hueco intermedio haría que [3] apuntara a la
  // fuente equivocada. Cortando por la última citada la numeración sigue
  // cuadrando y solo se cae lo que el modelo no llega a usar. Si no cita
  // ninguna, se queda con la primera, que es la que encabeza el bloque.
  const ultima = Math.max(
    0,
    ...[...respuesta.matchAll(/\[(\d{1,2})\]/g)]
      .map((m) => Number(m[1]))
      .filter((n) => n >= 1 && n <= utiles.length),
  );
  const fuentes = utiles.slice(0, ultima > 0 ? ultima : 1);

  return NextResponse.json({
    respuesta,
    citas: fuentes.map((r) => ({ titulo: r.titulo, href: r.href })),
  });
}
