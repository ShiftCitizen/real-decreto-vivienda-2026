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

const NEGATIVA =
  'Eso queda fuera del ámbito de este análisis: solo respondo preguntas sobre los reales decretos-ley 26/2026 y 27/2026 de vivienda. Prueba con el buscador del sitio.';

const SISTEMA = [
  'Respondes preguntas sobre un análisis divulgativo de los reales decretos-ley 26/2026 y 27/2026 de vivienda en España.',
  'Responde ÚNICAMENTE a partir del CONTEXTO que se te da. Si la pregunta no se puede responder con ese contexto, responde exactamente: «Eso queda fuera del ámbito de este análisis».',
  'No inventes cifras, fechas ni artículos. No des asesoramiento jurídico: el análisis es divulgativo y prevalece el texto oficial del BOE.',
  'Responde en español, en un máximo de dos párrafos cortos.',
].join(' ');

// Cuota por IP en memoria del proceso. Best-effort: en serverless cada
// instancia lleva su propio conteo, así que es un freno al abuso casual,
// no un límite distribuido exacto.
const ventanas = new Map<string, number[]>();

function cuotaAgotada(ip: string): boolean {
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
  const cabecera = request.headers.get('x-forwarded-for');
  return cabecera?.split(',')[0]?.trim() || 'desconocida';
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
  const contexto = utiles.map((r) => `### ${r.titulo}\n${r.extracto}`).join('\n\n');

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
  return NextResponse.json({
    respuesta,
    citas: utiles.map((r) => ({ titulo: r.titulo, href: r.href })),
  });
}
