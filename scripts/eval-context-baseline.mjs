/**
 * Experimento baseline: retrieval vs full OKF bundle vs retrieval-large.
 *
 * Manual / nightly only — never in the PR workflow.
 * Requires MISTRAL_API_KEY. Never uses NIM_API_KEY nor POST /api/chat.
 *
 *   npm run build && MISTRAL_API_KEY=… npm run eval:context
 *
 * Env:
 *   EVAL_CONTEXT_REPS          (default 3)
 *   EVAL_PROVIDER_TIMEOUT_MS   (default 60000; also reports a 14s slice)
 *   EVAL_CONTEXT_MODEL         (default mistral-small-latest)
 *   EVAL_LONG_CONTEXT_MODEL    (optional arm B2)
 *   EVAL_CONTEXT_LIMIT         (cap questions; default all selected)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';
import { load as parseYaml } from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(
        pathToFileURL(join(root, specifier.slice(2) + '.ts')).href,
        context,
      );
    }
    if (/^\.{1,2}\//.test(specifier)) {
      const relativo = specifier.replace(/\.js$/, '');
      return nextResolve(
        new URL(relativo.endsWith('.ts') ? relativo : relativo + '.ts', context.parentURL)
          .href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

const mistralKey = process.env.MISTRAL_API_KEY;
if (!mistralKey) {
  console.error(
    'Falta MISTRAL_API_KEY. Este eval es manual/on-demand y no usa la cuota del sitio.',
  );
  process.exit(1);
}
if (process.env.NIM_API_KEY) {
  console.warn(
    'Aviso: NIM_API_KEY está definida en el entorno; este script NO la usa.',
  );
}

const {
  armarEvidencia,
  aEvidenciaRuta,
  montarContexto,
  presupuestoDeModo,
  PRESUPUESTO_LARGE,
  TOPE_FICHERO_LARGE,
  MAX_FICHERS_LARGE,
  PRESUPUESTO_DEFECTO,
} = await import('@/lib/chat-contexto');
const { SISTEMA, MAX_TOKENS_SALIDA } = await import('@/lib/chat-sistema');
const { ajustarCitas } = await import('@/lib/citas');

const okfPath = join(root, 'public/okf-index.json');
if (!existsSync(okfPath)) {
  console.error('Falta public/okf-index.json — ejecuta npm run build primero.');
  process.exit(1);
}
const okf = JSON.parse(readFileSync(okfPath, 'utf8'));

const REPS = Math.max(1, Number(process.env.EVAL_CONTEXT_REPS || 3));
const TIMEOUT_PROD_MS = 14_000;
const TIMEOUT_MS = Math.max(
  TIMEOUT_PROD_MS,
  Number(process.env.EVAL_PROVIDER_TIMEOUT_MS || 60_000),
);
const MODEL = process.env.EVAL_CONTEXT_MODEL || 'mistral-small-latest';
const MODEL_B2 = process.env.EVAL_LONG_CONTEXT_MODEL || '';
const LIMIT = Number(process.env.EVAL_CONTEXT_LIMIT || 0);

/** ~USD per 1M tokens (documentado; ajustar si cambia el precio). */
const COST_IN_PER_M = 0.1;
const COST_OUT_PER_M = 0.3;

const ORIGINAL_FAIL = {
  id: 'original-prorroga-renta-desahucio',
  pregunta:
    '¿Me aplica la prórroga del contrato, me pueden subir la renta un 5 % en enero y me pueden desahuciar si soy vulnerable?',
  categoria: 'multi_part',
  min_topics: 2,
  topics_esperados: ['prorroga', 'subir-renta', 'desahucio'],
};

function cargarCasos() {
  const casesDir = join(root, 'evals/cases');
  const out = [ORIGINAL_FAIL];
  const seen = new Set([ORIGINAL_FAIL.id]);
  for (const f of [
    'multi-part.yaml',
    'single-intent.yaml',
    'numeric-state-citation.yaml',
  ]) {
    const doc = parseYaml(readFileSync(join(casesDir, f), 'utf8'));
    for (const c of doc.casos ?? []) {
      if (c.categoria === 'scope_gate') continue;
      if (c.niega) continue;
      if (
        !['multi_part', 'single_intent', 'citation_validity', 'state_inclusion'].includes(
          c.categoria,
        )
      ) {
        continue;
      }
      if (seen.has(c.id)) continue;
      seen.add(c.id);
      out.push(c);
    }
  }
  return LIMIT > 0 ? out.slice(0, LIMIT) : out;
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

/** Misma heurística que scripts/eval-faithfulness.mjs (overlap ≥0.7 / ratio ≥0.95). */
function fidelidad(respuesta, evidencia) {
  const frases = respuesta
    .split(/(?<=[.!?])\s+/)
    .map((f) => f.trim())
    .filter((f) => f.length > 20);
  if (frases.length === 0) return { ok: true, ratio: 1, unsupported: [] };
  const unsupported = [];
  for (const f of frases) {
    if (evidencia.includes(f)) continue;
    if (solape(evidencia, f) >= 0.7) continue;
    unsupported.push(f);
  }
  const ratio = 1 - unsupported.length / frases.length;
  return { ok: ratio >= 0.95, ratio, unsupported };
}

function citationValidity(respuesta, nFuentes) {
  const nums = [...respuesta.matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1]));
  if (nums.length === 0) return { ok: false, reason: 'sin-citas' };
  for (const n of nums) {
    if (n < 1 || n > nFuentes) return { ok: false, reason: `fuera-de-rango:${n}` };
  }
  return { ok: true };
}

function multiPartCoverage(respuesta, caso, fuentes) {
  const topics = caso.topics_esperados ?? [];
  if (topics.length === 0) return { ok: true, hits: 0, min: 0 };
  const blob = `${respuesta}\n${fuentes.map((f) => `${f.titulo} ${f.href}`).join('\n')}`.toLowerCase();
  const hits = topics.filter((t) => blob.includes(String(t).toLowerCase().replace(/^#/, '')));
  const min = caso.min_topics ?? Math.min(2, topics.length);
  return { ok: hits.length >= min, hits: hits.length, min, matched: hits };
}

function statusAccuracy(respuesta) {
  const t = respuesta.toLowerCase();
  // Heurística documentada: RDL 29 en vigor / pendiente convalidación; RDL 28 no en vigor / 15 nov.
  const menciona29 = /rdl\s*29/.test(t) || /29\/2026/.test(t);
  const menciona28 = /rdl\s*28/.test(t) || /28\/2026/.test(t);
  const ok29 =
    !menciona29 ||
    (/en vigor|vigente|pendiente de convalidaci/.test(t) && !/29\/2026[^.]*derogad/.test(t));
  const ok28 =
    !menciona28 ||
    /no (está|esta) en vigor|pendiente|15 de noviembre|15-11|noviembre de 2026/.test(t);
  // Si no menciona ninguno, no puntuamos (n/a) — muchas preguntas no tocan estado.
  if (!menciona29 && !menciona28) return { ok: null, na: true };
  return { ok: ok29 && ok28, na: false, ok29, ok28 };
}

function estimateTokens(chars) {
  return Math.ceil(chars / 4);
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const i = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, i)];
}

async function llamarMistral({ pregunta, contexto, model, timeoutMs }) {
  const t0 = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${mistralKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: MAX_TOKENS_SALIDA,
        messages: [
          { role: 'system', content: SISTEMA },
          {
            role: 'user',
            content: `CONTEXTO:\n${contexto}\n\nPREGUNTA:\n${pregunta}`,
          },
        ],
      }),
      signal: controller.signal,
    });
    const latencyMs = Date.now() - t0;
    const raw = await res.text();
    if (!res.ok) {
      return {
        ok: false,
        motivo: res.status >= 500 ? '5xx' : 'http',
        status: res.status,
        latencyMs,
        body: raw.slice(0, 200),
      };
    }
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return { ok: false, motivo: 'parse', latencyMs };
    }
    const texto = data.choices?.[0]?.message?.content?.trim() ?? '';
    if (!texto) {
      return { ok: false, motivo: 'vacio', latencyMs, usage: data.usage };
    }
    return {
      ok: true,
      texto,
      latencyMs,
      usage: data.usage,
      finish: data.choices?.[0]?.finish_reason,
    };
  } catch (e) {
    const latencyMs = Date.now() - t0;
    const msg = e instanceof Error ? e.message : String(e);
    const timeout = /abort/i.test(msg);
    return { ok: false, motivo: timeout ? 'timeout' : 'red', latencyMs, error: msg.slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

const ARMS = [
  { id: 'A', mode: 'retrieval', label: 'retrieval (prod)' },
  { id: 'B', mode: 'full', label: 'full bundle' },
  { id: 'C', mode: 'retrieval-large', label: 'retrieval-large' },
];
if (MODEL_B2) {
  ARMS.push({ id: 'B2', mode: 'full', label: 'full + long-context model', model: MODEL_B2 });
}

const casos = cargarCasos();
console.log(
  `context-baseline: ${casos.length} preguntas × ${REPS} reps × ${ARMS.length} arms; model=${MODEL}; timeout=${TIMEOUT_MS}ms (prod slice ${TIMEOUT_PROD_MS}ms)`,
);
console.log(
  `arm C constants: PRESUPUESTO=${PRESUPUESTO_LARGE} TOPE_FICHERO=${TOPE_FICHERO_LARGE} MAX_FICHERS=${MAX_FICHERS_LARGE} (prod PRESUPUESTO=${PRESUPUESTO_DEFECTO})`,
);

const runs = [];

for (const arm of ARMS) {
  for (const caso of casos) {
    for (let rep = 1; rep <= REPS; rep++) {
      const ev = armarEvidencia(caso.pregunta, okf, arm.mode);
      if (!ev) {
        runs.push({
          arm: arm.id,
          mode: arm.mode,
          casoId: caso.id,
          categoria: caso.categoria,
          rep,
          skipped: 'scope-gate',
        });
        continue;
      }
      const evidenciaRuta = aEvidenciaRuta(ev);
      const presupuesto = presupuestoDeModo(arm.mode);
      const { contexto, fuentes } = montarContexto(evidenciaRuta, presupuesto);
      const model = arm.model || MODEL;
      const r = await llamarMistral({
        pregunta: caso.pregunta,
        contexto,
        model,
        timeoutMs: TIMEOUT_MS,
      });

      const base = {
        arm: arm.id,
        mode: arm.mode,
        model,
        casoId: caso.id,
        categoria: caso.categoria,
        rep,
        nFuentes: fuentes.length,
        contextoChars: contexto.length,
        timeoutMsUsed: TIMEOUT_MS,
        wouldTimeoutAtProd: r.latencyMs > TIMEOUT_PROD_MS,
      };

      if (!r.ok) {
        runs.push({
          ...base,
          ok: false,
          planB: true,
          motivo: r.motivo,
          latencyMs: r.latencyMs,
          status: r.status,
          error: r.error || r.body,
        });
        console.log(`  ${arm.id} ${caso.id} r${rep}: PLAN_B/${r.motivo} ${r.latencyMs}ms`);
        continue;
      }

      const { texto, fuentes: usadasIdx } = ajustarCitas(r.texto, fuentes.length);
      const fuentesUsadas = usadasIdx.map((i) => fuentes[i - 1]).filter(Boolean);
      const faith = fidelidad(texto, contexto);
      const cit = citationValidity(texto, fuentes.length);
      const multi = multiPartCoverage(texto, caso, fuentes);
      const status = statusAccuracy(texto);
      const inTok = r.usage?.prompt_tokens ?? estimateTokens(SISTEMA.length + contexto.length + caso.pregunta.length);
      const outTok = r.usage?.completion_tokens ?? estimateTokens(texto.length);
      const cost =
        (inTok / 1e6) * COST_IN_PER_M + (outTok / 1e6) * COST_OUT_PER_M;

      runs.push({
        ...base,
        ok: true,
        planB: false,
        latencyMs: r.latencyMs,
        respuestaChars: texto.length,
        citasUsadas: usadasIdx,
        faithfulnessOk: faith.ok,
        faithfulnessRatio: faith.ratio,
        citationOk: cit.ok,
        multiOk: multi.ok,
        multiHits: multi.hits,
        statusOk: status.ok,
        statusNa: status.na,
        inputTokens: inTok,
        outputTokens: outTok,
        costUsdEst: Number(cost.toFixed(6)),
        finish: r.finish,
      });
      console.log(
        `  ${arm.id} ${caso.id} r${rep}: ok faith=${faith.ratio?.toFixed(2)} cit=${cit.ok} ${r.latencyMs}ms`,
      );
    }
  }
}

function agg(armId) {
  const subset = runs.filter((r) => r.arm === armId && !r.skipped);
  const answered = subset.filter((r) => r.ok);
  const lat = answered.map((r) => r.latencyMs).sort((a, b) => a - b);
  const byCat = {};
  for (const r of subset) {
    byCat[r.categoria] ??= { n: 0, faith: 0, cit: 0, multi: 0, status: 0, statusN: 0, planB: 0 };
    const c = byCat[r.categoria];
    c.n += 1;
    if (r.planB) c.planB += 1;
    if (r.ok) {
      if (r.faithfulnessOk) c.faith += 1;
      if (r.citationOk) c.cit += 1;
      if (r.multiOk) c.multi += 1;
      if (r.statusOk === true) {
        c.status += 1;
        c.statusN += 1;
      } else if (r.statusOk === false) {
        c.statusN += 1;
      }
    }
  }
  const rate = (num, den) => (den === 0 ? null : { ok: num, total: den, pct: num / den });
  return {
    arm: armId,
    nRuns: subset.length,
    nAnswered: answered.length,
    faithfulness: rate(
      answered.filter((r) => r.faithfulnessOk).length,
      answered.length,
    ),
    citationValidity: rate(
      answered.filter((r) => r.citationOk).length,
      answered.length,
    ),
    multiPart: rate(
      answered.filter((r) => r.categoria === 'multi_part' && r.multiOk).length,
      answered.filter((r) => r.categoria === 'multi_part').length,
    ),
    statusAccuracy: rate(
      answered.filter((r) => r.statusOk === true).length,
      answered.filter((r) => r.statusOk === true || r.statusOk === false).length,
    ),
    planBRate: rate(subset.filter((r) => r.planB).length, subset.length),
    timeoutRate: rate(subset.filter((r) => r.motivo === 'timeout').length, subset.length),
    latencyP50: percentile(lat, 50),
    latencyP95: percentile(lat, 95),
    avgInputTokens: answered.length
      ? answered.reduce((s, r) => s + r.inputTokens, 0) / answered.length
      : 0,
    avgOutputTokens: answered.length
      ? answered.reduce((s, r) => s + r.outputTokens, 0) / answered.length
      : 0,
    avgCostUsd: answered.length
      ? answered.reduce((s, r) => s + r.costUsdEst, 0) / answered.length
      : 0,
    wouldTimeoutAtProdRate: rate(
      subset.filter((r) => r.wouldTimeoutAtProd).length,
      subset.length,
    ),
    byCategory: byCat,
  };
}

const date = new Date().toISOString().slice(0, 10);
const outDir = join(root, 'evals/reports');
mkdirSync(outDir, { recursive: true });
const summary = {
  date,
  sampleSize: casos.length,
  reps: REPS,
  arms: ARMS.map((a) => ({
    id: a.id,
    mode: a.mode,
    label: a.label,
    model: a.model || MODEL,
  })),
  constants: {
    PRESUPUESTO_DEFECTO,
    PRESUPUESTO_LARGE,
    TOPE_FICHERO_LARGE,
    MAX_FICHERS_LARGE,
    MAX_TOKENS_SALIDA,
    TIMEOUT_MS,
    TIMEOUT_PROD_MS,
    faithfulnessJudge: 'heuristic-overlap-0.7 / ratio>=0.95 (same as eval-faithfulness.mjs)',
    generatorModel: MODEL,
    generatorIsAlsoJudgeFamily: MODEL.startsWith('mistral'),
  },
  aggregates: Object.fromEntries(ARMS.map((a) => [a.id, agg(a.id)])),
  runs,
};

const jsonPath = join(outDir, `context-baseline-${date}.json`);
writeFileSync(jsonPath, JSON.stringify(summary, null, 2) + '\n');

function pct(r) {
  if (!r) return 'n/a';
  return `${(r.pct * 100).toFixed(1)}% (${r.ok}/${r.total})`;
}

const md = [];
md.push(`# Context baseline ${date}`);
md.push('');
md.push(`Sample: **${casos.length}** questions × **${REPS}** reps. One failure ≈ **${(100 / Math.max(1, casos.length)).toFixed(1)}** points on a rate.`);
md.push('');
md.push(`Pinned model: \`${MODEL}\` (failover disabled). Faithfulness judge: lexical overlap heuristic (same as \`eval-faithfulness.mjs\`) — **same model family as generator** (${MODEL.startsWith('mistral') ? 'yes' : 'no'}).`);
md.push('');
md.push(`Timeout used: **${TIMEOUT_MS} ms** (production Mistral is ${TIMEOUT_PROD_MS} ms). Arm C: \`PRESUPUESTO=${PRESUPUESTO_LARGE}\`, \`TOPE_FICHERO=${TOPE_FICHERO_LARGE}\`, \`MAX_FICHERS=${MAX_FICHERS_LARGE}\`.`);
md.push('');
md.push('| Arm | Faithfulness | Citation | Multi-part | Status | Plan B | Timeout | P50 ms | P95 ms | avg in tok | avg cost $ |');
md.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
for (const a of ARMS) {
  const s = summary.aggregates[a.id];
  md.push(
    `| ${a.id} (${a.label}) | ${pct(s.faithfulness)} | ${pct(s.citationValidity)} | ${pct(s.multiPart)} | ${pct(s.statusAccuracy)} | ${pct(s.planBRate)} | ${pct(s.timeoutRate)} | ${s.latencyP50} | ${s.latencyP95} | ${s.avgInputTokens.toFixed(0)} | ${s.avgCostUsd.toFixed(4)} |`,
  );
}
md.push('');
md.push('## Would have timed out under production 14 s');
md.push('');
for (const a of ARMS) {
  const s = summary.aggregates[a.id];
  md.push(`- **${a.id}**: ${pct(s.wouldTimeoutAtProdRate)}`);
}
md.push('');
md.push('## What the numbers do and don’t show');
md.push('');
md.push('With ~20 questions, a single failure moves a percentage by about five points; treat differences smaller than the spread across the N repetitions as noise, not a winner. This run pins one model and turns off provider failover, so Plan B / timeout rates here are about **this** provider under the recorded timeout — not the production Mistral→NIM→OpenRouter chain. Faithfulness is a lexical overlap heuristic against the injected context, not a human legal review and not a separate judge model. Status accuracy only scores answers that mention RDL 28/29. Full-bundle (B) input tokens dwarf retrieval (A); if B looks worse, that may be long-context weakness of the small model rather than proof that retrieval is intrinsically better — arm B2 (when `EVAL_LONG_CONTEXT_MODEL` is set) exists to separate those.');
md.push('');
md.push('## Limitations');
md.push('');
md.push('- Cost is an estimate from documented $/M rates, not the invoice.');
md.push('- Citation “validity” checks index range, not that the cited passage supports the claim (that needs the faithfulness heuristic).');
md.push('- Multi-part coverage matches topic strings in answer/source titles, not semantic completeness.');
md.push('- Raw provider response bodies are not stored (only short error snippets).');
md.push('');

const mdPath = join(outDir, `context-baseline-${date}.md`);
writeFileSync(mdPath, md.join('\n'));
console.log(`\nWrote ${jsonPath}`);
console.log(`Wrote ${mdPath}`);
