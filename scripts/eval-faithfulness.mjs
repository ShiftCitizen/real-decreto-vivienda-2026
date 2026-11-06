/**
 * Faithfulness bajo demanda (ADR 0001 / KL-S-032).
 *
 * Usa solo MISTRAL_API_KEY. Nunca NIM_API_KEY ni POST /api/chat de producción.
 *
 *   MISTRAL_API_KEY=… npm run eval:faithfulness
 *   MISTRAL_API_KEY=… npm run eval:faithfulness -- --update-baseline
 *
 * Alineación con la app (2026-11-06):
 * - System prompt: el mismo `SISTEMA` de `lib/chat-sistema.ts` (producción).
 * - Modelo por defecto: `ministral-8b-latest` (brazo Mistral de producción).
 * - max_tokens: `MAX_TOKENS_SALIDA` (550).
 * Deltas documentados (no se cierran aquí a propósito):
 * - temperature 0.2 (reproducibilidad); producción usa 0.6 en el brazo Mistral.
 * - Solo Mistral API; producción puede caer a NIM u OpenRouter.
 * - La heurística de solape (≥0.7 por frase, ratio ≥0.95) no prueba semántica
 *   jurídica: una paráfrasis fiel puede fallar y una cita incorrecta con
 *   solape léxico alto puede pasar. No afirma fiabilidad de producción.
 *
 * El baseline committed es extractivo (corpus publicado), no salidas de modelo.
 * `--update-baseline` lo sustituye por respuestas del modelo eval; documenta
 * la procedencia en el JSON.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { registerHooks } from 'node:module';

const root = fileURLToPath(new URL('..', import.meta.url));

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(pathToFileURL(join(root, `${specifier.slice(2)}.ts`)).href, context);
    }
    if (/^\.{1,2}\//.test(specifier)) {
      const relativo = specifier.replace(/\.js$/, '');
      return nextResolve(
        new URL(relativo.endsWith('.ts') ? relativo : `${relativo}.ts`, context.parentURL).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

if (process.env.NIM_API_KEY) {
  console.error('ABORT: NIM_API_KEY esta definida. Faithfulness no debe usar NIM (ADR 0001).');
  process.exit(2);
}

const mistralKey = process.env.MISTRAL_API_KEY;
if (!mistralKey) {
  console.error('Falta MISTRAL_API_KEY. Este eval es bajo demanda y no usa la cuota del sitio.');
  process.exit(1);
}

const { seleccionar } = await import('@/lib/okf');
const { SISTEMA, MAX_TOKENS_SALIDA } = await import('@/lib/chat-sistema');

const okf = JSON.parse(readFileSync(join(root, 'public/okf-index.json'), 'utf8'));
const baselinePath = join(root, 'evals/fixtures/baseline-responses.json');
const casesDir = join(root, 'evals/cases');

/** Modelo del brazo Mistral de producción; override con MISTRAL_MODEL_ID. */
const MODEL = process.env.MISTRAL_MODEL_ID || 'ministral-8b-latest';
/** Eval usa 0.2 a propósito (ver cabecera); prod Mistral usa 0.6. */
const TEMPERATURE = Number(process.env.MISTRAL_EVAL_TEMPERATURE || 0.2);

function cargarGolden() {
  const out = [];
  for (const f of ['single-intent.yaml', 'multi-part.yaml', 'numeric-state-citation.yaml']) {
    const doc = parseYaml(readFileSync(join(casesDir, f), 'utf8'));
    for (const c of doc.casos ?? []) {
      if (c.categoria === 'scope_gate') continue;
      out.push(c);
    }
  }
  return out.slice(0, 20);
}

function solape(a, b) {
  const ta = new Set(
    a
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .split(/[^\p{L}\p{N}]+/u)
      .filter((w) => w.length > 3),
  );
  const tb = b
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .split(/[^\p{L}\p{N}]+/u)
    .filter((w) => w.length > 3);
  if (tb.length === 0) return 1;
  let hit = 0;
  for (const w of tb) if (ta.has(w)) hit += 1;
  return hit / tb.length;
}

/** Heurística: frases de la respuesta con solape >= 0.7 vs evidencia, o substring. */
function fidelidad(respuesta, evidencia) {
  const frases = respuesta
    .split(/(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 20);
  if (frases.length === 0) return { ok: true, unsupported: [] };
  const unsupported = [];
  for (const f of frases) {
    if (evidencia.includes(f)) continue;
    if (solape(evidencia, f) >= 0.7) continue;
    unsupported.push(f);
  }
  const ratio = 1 - unsupported.length / frases.length;
  return { ok: ratio >= 0.95, ratio, unsupported };
}

async function llamarMistral(pregunta, contexto) {
  const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mistralKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      temperature: TEMPERATURE,
      max_tokens: MAX_TOKENS_SALIDA,
      messages: [
        { role: 'system', content: SISTEMA },
        { role: 'user', content: `CONTEXTO:\n${contexto}\n\nPREGUNTA:\n${pregunta}` },
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Mistral ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}

const golden = cargarGolden();
const baseline = existsSync(baselinePath)
  ? JSON.parse(readFileSync(baselinePath, 'utf8'))
  : { version: 2, responses: {} };
const actualizar = process.argv.includes('--update-baseline');
const respuestasBaseline = baseline.responses || {};

let fallos = 0;
const nuevas = { ...respuestasBaseline };

console.log(`Modelo eval: ${MODEL} · max_tokens=${MAX_TOKENS_SALIDA} · temp=${TEMPERATURE}`);
console.log(`Baseline kind: ${baseline.kind || 'unknown'} · cases=${golden.length}`);

for (const c of golden) {
  const ev = seleccionar(c.pregunta, okf);
  if (!ev) {
    console.log(`  SKIP ${c.id}: sin evidencia (scope)`);
    continue;
  }
  const contexto = ev.map((e, i) => `### [${i + 1}] ${e.titulo}\n${e.texto}`).join('\n\n');
  let respuesta;
  try {
    respuesta = await llamarMistral(c.pregunta, contexto.slice(0, 7000));
  } catch (e) {
    console.error(`  FALLA ${c.id}: ${e.message}`);
    fallos += 1;
    continue;
  }
  const { ok, ratio, unsupported } = fidelidad(respuesta, contexto);
  const prev = respuestasBaseline[c.id];
  if (prev && prev === respuesta) {
    console.log(`  ok   ${c.id} (igual al baseline, faithfulness=${(ratio ?? 1).toFixed(2)})`);
  } else if (prev && !actualizar) {
    // Extractive baselines are not expected to equal model output.
    if (baseline.kind === 'extractive-corpus') {
      if (!ok) {
        console.log(`  FALLA ${c.id}: faithfulness=${(ratio ?? 0).toFixed(2)} (vs evidencia; baseline extractivo no exige igualdad)`);
        for (const u of unsupported.slice(0, 3)) console.log(`         unsupported: ${u.slice(0, 120)}`);
        fallos += 1;
      } else {
        console.log(`  ok   ${c.id} faithfulness=${(ratio ?? 1).toFixed(2)} (baseline extractivo; no se compara igualdad)`);
      }
    } else {
      console.log(`  DIFF ${c.id}: respuesta distinta del baseline (usa --update-baseline si es intencional)`);
      fallos += 1;
    }
  } else if (!ok) {
    console.log(`  FALLA ${c.id}: faithfulness=${(ratio ?? 0).toFixed(2)}`);
    for (const u of unsupported.slice(0, 3)) console.log(`         unsupported: ${u.slice(0, 120)}`);
    fallos += 1;
  } else {
    console.log(`  ok   ${c.id} faithfulness=${(ratio ?? 1).toFixed(2)}`);
  }
  nuevas[c.id] = respuesta;
}

if (actualizar) {
  const out = {
    version: 2,
    kind: 'model-mistral',
    created: new Date().toISOString().slice(0, 10),
    provenance: `Generated by eval-faithfulness.mjs with ${MODEL}; SISTEMA from lib/chat-sistema.ts; temp=${TEMPERATURE}. Not production NIM/OpenRouter.`,
    model: MODEL,
    max_tokens: MAX_TOKENS_SALIDA,
    temperature: TEMPERATURE,
    responses: nuevas,
  };
  writeFileSync(baselinePath, JSON.stringify(out, null, 2) + '\n');
  console.log(`\nBaseline escrito en ${baselinePath}`);
}

if (fallos) {
  console.error(`\n${fallos} fallos`);
  process.exit(1);
}
console.log('\nFaithfulness OK');
