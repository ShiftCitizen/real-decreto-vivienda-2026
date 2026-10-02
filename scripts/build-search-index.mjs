/**
 * Generates search-index.json for the ⌘K palette.
 *
 * Pages come from lib/nav.ts, FAQ and norma entries from lib/faq.ts and
 * lib/normas.ts. Sections are read back out of the *built* HTML, so the
 * index can never drift from the anchors that actually ship — and the prose is
 * never duplicated into a data file that could fall out of date.
 *
 * Runs the citation audit at the same time: every "art." / "artículo N" in the
 * built text must name its norm, either through a <cite> element or in its own
 * clause. A bare article number on a legal-information site is a defect, not a
 * style choice, and there are two decrees with an article 1.
 */
import { readFileSync, readdirSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { NAV_SECTIONS } from '../lib/nav.ts';
import { FAQ } from '../lib/faq.ts';
import { NORMA_IDS, NORMAS } from '../lib/normas.ts';

// Resolve everything from the script's location, never from CWD: installers
// and CI builders (Vercel included) may invoke the script from another
// working directory, and a relative '.next/...' would then silently point
// at nothing.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const EXPORT_DIR = join(ROOT, 'out');

// Next writes required-server-files.json *inside* its own distDir. '.next' is
// the default and the only value we can probe for without already knowing
// distDir, so look there and honour whatever it reports.
const DEFAULT_DIST_DIR = '.next';

function resolveDistDir() {
  const file = join(ROOT, DEFAULT_DIST_DIR, 'required-server-files.json');
  if (!existsSync(file)) return DEFAULT_DIST_DIR;
  try {
    const reported = JSON.parse(readFileSync(file, 'utf8'))?.config?.distDir;
    return typeof reported === 'string' && reported ? reported : DEFAULT_DIST_DIR;
  } catch {
    return DEFAULT_DIST_DIR;
  }
}

const DIST_DIR = resolveDistDir();

// Where the prerendered HTML lives is NOT the same on Vercel's cloud builder as
// on a plain `next build`.
//
// Plain build: Next writes <distDir>/server/app/<route>.html and leaves it
// there, so the script reads it straight out of `.next/server/app`.
//
// Vercel cloud build: the adapter applies `modifyConfig` and then runs
// `onBuildComplete`, and by the time `postbuild` runs the pages are gone from
// `.next/server/app` — the directory exists but holds no `.html` at all. The
// build still reports every route as `○ (Static)` and the pages serve fine, so
// this failed silently and shipped a section-less index. A local `vercel build`
// does NOT reproduce it (the CLI does not apply those adapter hooks), so the
// cloud build log is the only evidence.
//
// So: try each known layout in order and take the first that actually holds
// HTML. If none does, fail loudly and dump the build-output tree into the error
// — build logs are readable via the Vercel API, so the next attempt is
// informed rather than blind.
const CANDIDATE_SRCS = [
  [`${DIST_DIR}/server/app`, join(ROOT, DIST_DIR, 'server', 'app')],
  ['.vercel/output/static', join(ROOT, '.vercel', 'output', 'static')],
  // The cloud builder writes its Build Output API tree outside the project.
  ['/vercel/output/static', join('/vercel', 'output', 'static')],
];

/** Recursive list of names, for an error message: enough to locate the HTML
 *  without dumping megabytes of markup into the build log. */
function* tree(dir, depth = 3, prefix = '') {
  if (depth < 0) return;
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    yield `${prefix}${dir} (unreadable)`;
    return;
  }
  for (const entry of entries.slice(0, 40)) {
    yield `${prefix}${entry.name}${entry.isDirectory() ? '/' : ''}`;
    if (entry.isDirectory()) {
      yield* tree(join(dir, entry.name), depth - 1, `${prefix}  `);
    }
  }
}

// Two modes:
//   default (postbuild) -> section entries included, read from built HTML.
//   --dev (predev)      -> no sections: there is no built HTML to read.
const isDev = process.argv.includes('--dev');

// Source of built HTML for sections and the citation audit. A candidate
// qualifies only if it holds HTML for at least one real route: the build-output
// tree also contains 404.html / 500.html, so "has any .html" would happily pick
// a directory with no pages in it — which is exactly the trap this script
// already fell into once, where existsSync() was the only test.
const SRC_DIR = isDev
  ? EXPORT_DIR
  : (CANDIDATE_SRCS.find(([, dir]) => {
      try {
        return [...htmlFiles(dir)].some((file) => routeFor(file, dir) !== null);
      } catch {
        return false;
      }
    })?.[1] ?? null);

// The production build writes the full index to public/search-index.json,
// which Vercel serves as a static asset alongside the prerendered routes.
// There is no out/ any more (the build is hybrid, not an export), so that is
// the only target.
const TARGETS = [join(ROOT, 'public', 'search-index.json')];

// Script and style *content* is not markup, so a plain tag strip does not
// remove it. Next ships the RSC flight payload as a series of
// <script>self.__next_f.push(...)</script> blocks at the end of <body>; without
// this the last anchored section on a page slices straight through them and
// indexes several kB of escaped JSON. Drop the whole element, content included.
const dropNonContent = (html) =>
  html.replace(/<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1>/gi, ' ');

/** Strips tags and collapses whitespace, for plain-text excerpts. */
const plain = (html) =>
  dropNonContent(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// Section bodies are capped so one enormous page cannot dominate the index.
const MAX_BODY = 1200;
const MAX_EXCERPT = 160;

function* htmlFiles(dir) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      yield* htmlFiles(full);
    } else if (entry.endsWith('.html')) {
      yield full;
    }
  }
}

/** Route for a built file, e.g. out/estado/index.html or
 *  .next/server/app/estado.html -> /estado, and index.html -> / */
function routeFor(file, srcDir = SRC_DIR) {
  const rel = file
    .slice(srcDir.length + 1)
    .replace(/\/index\.html$/, '')
    .replace(/\.html$/, '');
  // Internal files (_not-found, route groups) are not site routes.
  if (rel === 'index' || rel === '') return '/';
  if (rel.startsWith('_') || rel.includes('/_')) return null;
  // Status pages are real files in the build-output tree (404.html, 500.html)
  // but are not routes a reader can search for.
  if (/^\d{3}$/.test(rel)) return null;
  return `/${rel}`;
}

/** Nav label for a route, so section entries can name the page they came from. */
function pageLabel(route) {
  const wanted = route === '/' ? '/' : `${route}/`;
  for (const nav of NAV_SECTIONS) {
    const hit = nav.links.find((link) => (link.href === '/' ? '/' : `${link.href}/`) === wanted);
    if (hit) return hit.label;
  }
  return undefined;
}

const entries = [];

// --- Pages -----------------------------------------------------------------
for (const section of NAV_SECTIONS) {
  for (const link of section.links) {
    entries.push({
      type: 'page',
      title: link.label,
      href: link.href === '/' ? '/' : `${link.href}/`,
      section: section.title,
      keywords: `${link.label} ${link.resumen}`,
      excerpt: link.resumen.slice(0, MAX_EXCERPT),
    });
  }
}

// --- Sections (h2/h3 anchors from the built HTML) ---------------------------
// Never read sections in dev: there is no built HTML there, and stale
// anchors would point at ids the dev server no longer renders.
const built = !isDev && SRC_DIR !== null;
if (!isDev && !built) {
  // Fail, never ship a degraded index: a section-less file in production
  // silently kills section search (and starves the chatbot's retrieval)
  // while the deploy still reports success. See CANDIDATE_SRCS for why the
  // obvious location can be empty on Vercel.
  const tried = CANDIDATE_SRCS.map(([label, dir]) => `  ${label} -> ${dir}`).join('\n');
  const dumps = [
    ...tree(join(ROOT, DIST_DIR), 2),
    ...tree(join(ROOT, '.vercel', 'output'), 2),
    ...tree('/vercel/output', 2),
  ].slice(0, 120);
  throw new Error(
    `no built HTML in any known location (script root: ${ROOT}, cwd: ${process.cwd()}):\n` +
      `${tried}\n` +
      'Build output tree:\n' +
      dumps.map((line) => `  ${line}`).join('\n') +
      '\nRun after `next build` in the project root, or pass --dev for the reduced index.',
  );
}

// --- Citation audit ---------------------------------------------------------
// The rule is "every article reference names its norm", not "every article
// reference lives in a <Cite>". Both forms satisfy it, and the difference is
// only meaningful where a norm has no <Cite> to sit in: a typed data row, a
// table cell, a heading.
//
// So: drop the <cite> elements, then for each surviving reference look at its
// clause — from the last sentence break before it to the first one after it —
// and require a norm name in there. "art. 347 de la Ley de los Mercados de
// Valores" passes; "Línea de avales de 2.000 M€ (art. 16)" fails, because the
// reader cannot tell which of the two decrees' article 16 is meant.
const ART_REF = /\bart(?:ículos?|\.)?\s*\d+(?:\.\d+)*(?:[ªº°])?/gi;
// A clause break is a full stop, colon, semicolon or the end of a quoted
// passage. Commas deliberately do not break: "los artículos 1566 y 1581 del
// Código Civil" names its norm across a comma, and treating that as two
// clauses would flag it for no reason.
const CLAUSE_BREAK = /[.;:»]/;

/**
 * True when the full stop at `i` belongs to an article reference rather than to
 * a sentence: "17.6", "10.Ocho", "91.Uno.2.10".
 *
 * Without this the scan truncates "art. 10.5 y 10.6 de la LAU" at the dot in
 * "10.6" and judges the reference by a clause that no longer contains its norm.
 * The digit on the left is what keeps "art. 5. El plazo vence" splitting in two.
 */
function isReferenceDot(text, i) {
  return (
    text[i] === '.' && /\d/.test(text[i - 1] ?? '') && /[\p{L}\p{N}]/u.test(text[i + 1] ?? '')
  );
}

const NORM_WORDS = [
  // Abbreviations and short labels from lib/normas.ts.
  /\bRDL\s+\d{1,2}\/\d{4}\b/,
  /\b(?:Real\s+)?[Dd]ecreto-ley\s+\d{1,2}\/\d{4}\b/,
  /\bLAU\b/,
  /\bLEC\b/,
  /\bLIRPF\b/,
  /\bLIVA\b/,
  /\bLRHL\b/,
  /\bLMV\b/,
  /\bCE\b/,
  /\bReglamento\s*\(UE\)/,
  /\bReglamento\s+de\s+gesti[óo]n\s+tributaria\b/,
  /\bLey\s+12\/2023\b/,
  /\bLey\s+11\/2009\b/,
  /\bLey\s+5\/2019\b/,
  // Norms the pages name by their official number rather than by an acronym.
  /\bLey\s+29\/1994\b/,
  /\bLey\s+33\/2003\b/,
  // Full names, as they read in prose.
  /\bLey\s+de\s+Arrendamientos\s+Urbanos\b/,
  /\bLey\s+de\s+Enjuiciamiento\s+Civil\b/,
  /\bLey\s+de\s+los\s+Mercados\s+de\s+Valores\b/,
  /\bLey\s+del\s+IVA\b/,
  /\bLey\s+del\s+IRPF\b/,
  /\bLey\s+del\s+Impuesto\s+sobre\s+Sociedades\b/,
  /\bConstituci[óo]n\b/,
  /\bC[óo]digo\s+Civil\b/,
];

const namesItsNorm = (clause) => NORM_WORDS.some((re) => re.test(clause));

/** The clause a match sits in, for judging whether it names its own norm. */
function clauseAround(text, start, end) {
  let from = 0;
  for (let i = start - 1; i >= 0; i -= 1) {
    if (CLAUSE_BREAK.test(text[i]) && !isReferenceDot(text, i)) {
      from = i + 1;
      break;
    }
  }
  let to = Math.min(text.length, end + 200);
  for (let i = end; i < text.length && i < end + 200; i += 1) {
    if (CLAUSE_BREAK.test(text[i]) && !isReferenceDot(text, i)) {
      to = i;
      break;
    }
  }
  return text.slice(from, to);
}

const citationFailures = [];
const seenAnchors = new Map();

for (const file of built ? htmlFiles(SRC_DIR) : []) {
  const route = routeFor(file);
  if (route === null) continue;
  const html = readFileSync(file, 'utf8');

  if (!isDev) {
    const outsideCites = html.replace(/<cite\b[^>]*>[\s\S]*?<\/cite>/gi, ' ');
    const text = plain(outsideCites);
    for (const m of text.matchAll(ART_REF)) {
      const start = m.index ?? 0;
      const clause = clauseAround(text, start, start + m[0].length);
      if (!namesItsNorm(clause)) {
        citationFailures.push({ route, match: m[0].trim(), clause: clause.slice(0, 90) });
      }
    }
  }

  // Every heading, anchored or not: the unanchored ones still bound the section
  // above them, so they are needed to slice bodies correctly.
  const headings = [...html.matchAll(/<(h[1-6])([^>]*)>([\s\S]*?)<\/\1>/g)];

  headings.forEach((match, i) => {
    const [raw, tag, attrs, inner] = match;
    const level = Number(tag.slice(1));
    const id = /\sid="([^"]+)"/.exec(attrs)?.[1];
    if (!id) return;

    const title = plain(inner);
    if (!title) return;

    // A duplicated id is a silent failure: the DOM keeps only the first, so
    // every deep link for the second opens the wrong place and no browser
    // reports an error.
    const key = `${route}#${id}`;
    if (seenAnchors.has(key)) {
      throw new Error(
        `duplicate anchor "${key}": already used by ${seenAnchors.get(key)}. ` +
          'Give one heading an explicit distinct id.',
      );
    }
    seenAnchors.set(key, title);

    // Body runs from just after this heading to the next heading of the same
    // or higher rank. This is what puts table cells into the searchable text.
    let end = headings[i + 1]?.index ?? html.length;
    for (let j = i + 1; j < headings.length; j += 1) {
      if (Number(headings[j][1].slice(1)) <= level) {
        end = headings[j].index;
        break;
      }
    }
    const body = plain(html.slice(match.index + raw.length, end)).slice(0, MAX_BODY);

    entries.push({
      type: 'section',
      title,
      href: `${route}#${id}`,
      section: pageLabel(route) ?? 'Sección',
      keywords: `${title} ${body}`,
      ...(body ? { excerpt: body.slice(0, MAX_EXCERPT) } : {}),
      level,
    });
  });
}

if (citationFailures.length > 0) {
  const shown = citationFailures.slice(0, 40);
  const lines = shown.map((f) => `  ${f.route}: ${JSON.stringify(f.match)} in ${JSON.stringify(f.clause)}`);
  throw new Error(
    `citation audit failed: ${citationFailures.length} article reference(s) that do not name their norm. ` +
      'Either wrap it in <Cite norma="..." art="..." /> or name the norm in the same clause.\n' +
      lines.join('\n') +
      (citationFailures.length > shown.length
        ? `\n  … and ${citationFailures.length - shown.length} more`
        : ''),
  );
}

// --- FAQ -------------------------------------------------------------------
for (const item of FAQ) {
  const body = item.respuesta.join(' ');
  entries.push({
    type: 'faq',
    title: item.pregunta,
    href: `/#${item.id}`,
    section: 'Preguntas frecuentes',
    keywords: `${item.pregunta} ${body}`,
    excerpt: body.slice(0, MAX_EXCERPT),
  });
}

// --- Normas ----------------------------------------------------------------
for (const id of NORMA_IDS) {
  const norma = NORMAS[id];
  entries.push({
    type: 'norma',
    title: `${norma.etiqueta} — ${norma.titulo}`,
    href: `/normas/#${id}`,
    section: 'Normas citadas',
    keywords: `${norma.etiqueta} ${norma.titulo} ${norma.boe ?? ''}`,
    excerpt: norma.titulo.slice(0, MAX_EXCERPT),
  });
}

// --- Autor -----------------------------------------------------------------
// Entrada estática: el nombre vive en el pie de layout, sin ancla propia
// salvo el id del footer, así que se declara aquí en vez de leerse del HTML.
entries.push({
  type: 'autor',
  title: 'Carlos Marchena — autor del análisis',
  href: '/#autor',
  section: 'Autor',
  keywords:
    'Carlos Marchena autor análisis resumen no oficial inteligencia artificial LinkedIn',
  excerpt:
    'Resumen no oficial elaborado por Carlos Marchena con ayuda de herramientas de inteligencia artificial.',
});

const counts = entries.reduce((acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }), {});
if (!isDev && (counts.section ?? 0) === 0) {
  // The directory held HTML (it was chosen because it did) but yielded no
  // anchored section. That is the exact shape of the silent production
  // failure this file is guarded against, so refuse to write it.
  throw new Error(
    `read ${counts.section ?? 0} section entries from ${SRC_DIR}: the HTML parsed but no ` +
      'anchored headings were found. Refusing to ship a section-less index.',
  );
}
const json = JSON.stringify(entries);
for (const target of TARGETS) {
  writeFileSync(target, json);
}

const bytes = Buffer.byteLength(json);
console.log('search index:', counts);
console.log(
  `total ${entries.length} entries, ${(bytes / 1024).toFixed(1)} kB raw -> ${TARGETS.join(', ')}`,
);
if (isDev) {
  console.log('dev mode: section entries omitted (no built HTML available)');
} else {
  console.log(`citation audit: 0 article references that fail to name their norm`);
}
