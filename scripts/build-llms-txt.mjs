/**
 * Genera public/llms.txt y public/llms-full.txt desde nav, estado, normas y
 * concordancia — para que no se desincronice a mano.
 *
 *   node scripts/build-llms-txt.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://real-decreto-vivienda-2026.vercel.app';

const concordancia = JSON.parse(
  readFileSync(join(root, 'data/concordancia.json'), 'utf8'),
);

/** Extrae NAV_SECTIONS a mano del TS (sin ejecutar TypeScript). */
function parseNav() {
  const src = readFileSync(join(root, 'lib/nav.ts'), 'utf8');
  const links = [];
  const re =
    /href:\s*'([^']+)'\s*,\s*label:\s*'([^']+)'\s*,\s*resumen:\s*'((?:\\'|[^'])*)'/gs;
  let m;
  while ((m = re.exec(src))) {
    links.push({
      href: m[1],
      label: m[2],
      resumen: m[3].replace(/\\'/g, "'"),
    });
  }
  return links;
}

function parseEstado() {
  const src = readFileSync(join(root, 'lib/estado-votacion.ts'), 'utf8');
  const lastUpdated = /lastUpdated:\s*'([^']+)'/.exec(src)?.[1] ?? '';
  const nota = /notaFutura:\s*'((?:\\'|[^'])*)'/.exec(src)?.[1]?.replace(/\\'/g, "'") ?? '';
  return { lastUpdated, nota };
}

function pageUrl(href) {
  return href === '/' ? `${ORIGIN}/` : `${ORIGIN}${href}/`;
}

function boeLine(id, label, boe, eli) {
  const doc = `https://www.boe.es/buscar/doc.php?id=${boe}`;
  return `- [${label}](${doc}) (${boe}${eli ? `; ELI: ${eli}` : ''}).`;
}

const links = parseNav();
const estado = parseEstado();
const meta = concordancia.meta;
const sources = meta.sources;

const mapped = concordancia.entries.filter((e) => e.status === 'mapped' && e.from);
const pending = concordancia.entries.filter((e) => e.status === 'pending');
const news = concordancia.entries.filter((e) => e.status === 'new_in_successor');

const short = `# Vivienda 2026: RDL 29/2026 y RDL 28/2026

> Ayuda de lectura, en español, sobre los reales decretos-ley españoles de vivienda de octubre de 2026. Material divulgativo, sin valor de asesoramiento jurídico; prevalece el texto oficial del BOE. Elaborado con ayuda de herramientas de inteligencia artificial.

## Estado actual (última actualización de datos: ${estado.lastUpdated})

- **RDL 29/2026** (BOE-A-2026-20823): en vigor desde el 8-10-2026, pendiente de convalidación. Reproduce en lo sustancial el RDL 26/2026.
- **RDL 28/2026** (BOE-A-2026-20822): publicado el 7-10-2026; **no está en vigor** (entrada prevista el 15-11-2026 solo si se convalida). Reproduce el RDL 27/2026.
- **RDL 26/2026** y **RDL 27/2026**: derogados el 2-10-2026 al no ser convalidados.
- ${estado.nota}

Las páginas de detalle citan primero el artículo de la norma sucesora y, entre paréntesis, el del decreto derogado. La tabla de concordancia está en \`data/concordancia.json\` y la expone WebMCP como \`get_concordance\`.

## Páginas

${links
  .map((l) => `- [${l.label}](${pageUrl(l.href)}): ${l.resumen}`)
  .join('\n')}

## Fuentes oficiales (BOE)

${boeLine('rdl29', 'RDL 29/2026', sources.rdl29.boe, sources.rdl29.eli)}
${boeLine('rdl28', 'RDL 28/2026', sources.rdl28.boe, sources.rdl28.eli)}
${boeLine('rdl26', 'RDL 26/2026 (derogado)', sources.rdl26.boe, sources.rdl26.eli)}
${boeLine('rdl27', 'RDL 27/2026 (derogado)', sources.rdl27.boe, sources.rdl27.eli)}

## Concordancia (resumen)

- Entradas mapeadas artículo a artículo: ${mapped.length}. Pendientes de revisión humana: ${pending.length}. Solo en el sucesor: ${news.length}.
- Renumeraciones clave: art. 20 RDL 26 (LMV/cuenta) → art. 21 RDL 29; art. 20 RDL 29 es nuevo (publicidad de arrendamientos). DF undécima RDL 26 → DF decimoprimera RDL 29.
- Tabla completa: ver \`/llms-full.txt\` o la herramienta WebMCP \`get_concordance\`.

## Datos legibles por máquina

- [Índice de búsqueda](${ORIGIN}/search-index.json)
- [Mapa del sitio](${ORIGIN}/sitemap.xml)
- [agents.txt](${ORIGIN}/agents.txt) / [agents.json](${ORIGIN}/agents.json)

## WebMCP

En Chrome con WebMCP, cada página registra herramientas de solo lectura en inglés: search_site, read_page, list_pages, get_faqs, list_norms, get_norm, get_timeline, get_concordance, get_site_status. Las citas a decretos derogados incluyen el artículo sucesor en \`formerly\` cuando hay mapeo.

## Aviso

No es asesoramiento jurídico. Si una cifra o plazo de este sitio contradice el BOE, prevalece el BOE.
`;

const fullRows = mapped
  .map((e) => {
    const fr = e.from;
    const to = e.to;
    return `| ${fr.norma} ${fr.art} | ${to.norma} ${to.art} | ${e.note || '—'} |`;
  })
  .join('\n');

const full = `${short}

## Concordancia completa (mapeadas)

| Desde | Hacia | Nota |
| --- | --- | --- |
${fullRows}

${
  news.length
    ? `## Solo en el sucesor\n\n${news
        .map((e) => `- ${e.to.norma} art. ${e.to.art}: ${e.to.title || ''} — ${e.note}`)
        .join('\n')}\n`
    : ''
}
${
  pending.length
    ? `## Pendientes de revisión humana\n\n${pending
        .map((e) => `- ${JSON.stringify(e.from)} → ${JSON.stringify(e.to)}: ${e.note}`)
        .join('\n')}\n`
    : ''
}
`;

writeFileSync(join(root, 'public/llms.txt'), short, 'utf8');
writeFileSync(join(root, 'public/llms-full.txt'), full, 'utf8');
console.log(
  `llms.txt + llms-full.txt: ${links.length} pages, ${mapped.length} mapped, ${pending.length} pending`,
);
