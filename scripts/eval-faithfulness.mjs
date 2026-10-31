/**
 * Faithfulness bajo demanda (ADR 0001 / KL-S-032).
 *
 * Usa solo MISTRAL_API_KEY. Nunca NIM_API_KEY ni POST /api/chat de producción.
 *
 *   MISTRAL_API_KEY=… npm run eval:faithfulness
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { load as parseYaml } from 'js-yaml';
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';

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

const okf = JSON.parse(readFileSync(join(root, 'public/okf-index.json'), 'utf8'));
const baselinePath = join(root, 'evals/fixtures/baseline-responses.json');
const casesDir = join(root, 'evals/cases');

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
      model: process.env.MISTRAL_MODEL_ID || 'mistral-small-latest',
      temperature: 0.2,
      max_tokens: 350,
      messages: [
        {
          role: 'system',
          content:
            'Responde solo con el CONTEXTO. Si no está, dilo. Cita con [n]. No inventes cifras.',
        },
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
  : { version: 1, responses: {} };
const actualizar = process.argv.includes('--update-baseline');

let fallos = 0;
const nuevas = { ...baseline.responses };

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
  const prev = baseline.responses[c.id];
  if (prev && prev === respuesta) {
    console.log(`  ok   ${c.id} (igual al baseline, faithfulness=${(ratio ?? 1).toFixed(2)})`);
  } else if (prev && !actualizar) {
    console.log(`  DIFF ${c.id}: respuesta distinta del baseline (usa --update-baseline si es intencional)`);
    fallos += 1;
  } else if (!ok) {
    console.log(`  FALLA ${c.id}: faithfulness=${(ratio ?? 0).toFixed(2)}`);
    for (const u of unsupported.slice(0, 3)) console.log(`         unsupported: ${u.slice(0, 120)}`);
    fallos += 1;
  } else {
    console.log(`  ok   ${c.id} faithfulness=${(ratio ?? 1).toFixed(2)}`);
  }
  nuevas[c.id] = respuesta;
}

const baselineVacio = Object.keys(baseline.responses || {}).length === 0;
if (actualizar || baselineVacio) {
  writeFileSync(baselinePath, JSON.stringify({ version: 1, responses: nuevas }, null, 2) + '\n');
  console.log(`\nBaseline escrito en ${baselinePath}`);
}

if (fallos) {
  console.error(`\n${fallos} fallos`);
  process.exit(1);
}
console.log('\nFaithfulness OK');
