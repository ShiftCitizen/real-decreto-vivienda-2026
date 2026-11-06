/**
 * One-shot lexical paraphrase report (no LLM).
 *   node scripts/report-paraphrase.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';
import { load as parseYaml } from 'js-yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
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

const { seleccionar } = await import('@/lib/okf');
const okf = JSON.parse(readFileSync(join(root, 'public/okf-index.json'), 'utf8'));
const doc = parseYaml(readFileSync(join(root, 'evals/cases/paraphrase.yaml'), 'utf8'));

function coincide(hrefs, topic, titulos = []) {
  const t = topic.toLowerCase();
  if (hrefs.some((h) => h.toLowerCase().includes(t))) return true;
  return titulos.some((titulo) => titulo.toLowerCase().includes(t));
}

const handled = [];
const misses = [];
for (const c of doc.casos) {
  const ev = seleccionar(c.pregunta, okf);
  const hrefs = ev ? ev.map((e) => e.href) : [];
  const titulos = ev ? ev.map((e) => e.titulo) : [];
  const hit = !!ev && (c.topics_esperados || []).some((t) => coincide(hrefs, t, titulos));
  const line = {
    id: c.id,
    pregunta: c.pregunta,
    top: hrefs[0] || null,
    titulo: titulos[0] || null,
    hrefs,
  };
  (hit ? handled : misses).push(line);
}

const report = {
  created: '2026-11-06',
  note: 'Lexical/OKF paraphrase recall. Misses are evidence for a later semantic candidate generator behind existing scope controls — not authorization to add embeddings now.',
  handled_count: handled.length,
  miss_count: misses.length,
  total: handled.length + misses.length,
  handled,
  misses,
};

const outDir = join(root, 'evals/reports');
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'paraphrase-lexical-2026-11-06.json'), JSON.stringify(report, null, 2) + '\n');
const md = [
  '# Citizen paraphrase lexical recall (6 Nov 2026)',
  '',
  `${handled.length}/${report.total} handled by current OKF/lexical retrieval (topic anywhere in selected evidence).`,
  '',
  '## Handled',
  ...handled.map((h) => `- **${h.id}**: ${h.pregunta} → \`${h.top}\``),
  '',
  '## Misses (lexical gap)',
  ...misses.map(
    (h) =>
      `- **${h.id}**: ${h.pregunta} → ${h.top ? `\`${h.top}\` (${h.titulo})` : '_niega_ / sin evidencia'}`,
  ),
  '',
  'Misses justify measuring a semantic candidate later; scope/refusal unchanged; no vector store added.',
  '',
].join('\n');
writeFileSync(join(outDir, 'paraphrase-lexical-2026-11-06.md'), md);
console.log(md);
