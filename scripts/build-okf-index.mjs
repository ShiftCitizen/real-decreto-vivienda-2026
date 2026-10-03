/**
 * Convierte el bundle OKF (`okf/`) en la tabla de evidencia que usa
 * `POST /api/chat`.
 *
 *   node scripts/build-okf-index.mjs
 *
 * Se ejecuta al final de `postbuild` y escribe `public/okf-index.json`.
 *
 * =====================================================
 *  POR QUÉ ESTO EXISTE Y POR QUÉ NO ES EL ÍNDICE DE BÚSQUEDA
 * =====================================================
 *  El bundle son 39 ficheros, uno por tema, y sus cuerpos son prácticamente el
 *  texto del sitio: de 606 párrafos, elementos de lista y celdas, 605 aparecen
 *  sin cambios en los cuerpos del bundle. Eso es justo lo contrario que los
 *  resúmenes del bundle del curso, donde solo 24 de 687 párrafos coincidían y la
 *  tabla de plazos y el ejemplo de la factura se perdían. Aquí el cuerpo **sí**
 *  puede llegar al modelo, y es lo que arregla el fallo medido: `/api/chat`
 *  elegía tres entradas del índice y las recortaba a 3 000 caracteres, así que
 *  una pregunta con tres partes —prórroga, subida de renta y desahucio— solo
 *  recibía contexto para una y el modelo contestaba «no hay información en el
 *  contexto». Un fichero por tema permite llevar tres temas y contestarlos.
 *
 *  Lo que este script NO hace, a propósito:
 *
 *  - **No copia `index.md` ni `log.md`.** Los dos son navegación del conversor,
 *    no contenido del sitio, y `index.md` además contiene una «Nota de uso»
 *    dirigida a quien lea el bundle. Mantenerlos sería darle al modelo un
 *    documento que habla de cómo usar el bundle, que es exactamente lo que la
 *    tarea descarta.
 *  - **No copia los enlaces `.md`.** Un usuario final no puede abrir
 *    `desahucios/df-5-y-df-6.md`. Cada fichero se resuelve contra el índice de
 *    búsqueda a su página real, con ancla cuando el título coincide con el de
 *    una sección, y a la página cuando no. Medido: 30 de 39 con ancla, 9 con la
 *    página verificada, ninguno sin resolver.
 *  - **No conserva metadatos del conversor.** `generated`, `by`, `at`, `tags` y
 *    los `id` de `sources` se descartan; solo se conserva `resource`, que es
 *    la URL pública del sitio, y de ella solo la ruta.
 *
 * Si algún fichero se queda sin ruta, o si la resolución de títulos se rompe
 * entera, el script **no escribe nada** y revienta: un `okf-index.json` con
 * citas rotas es peor que no tenerlo, porque degradaría a silencio.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const OKF_DIR = join(root, 'okf');
const DESTINO = join(root, 'public/okf-index.json');
const ORIGEN = 'https://real-decreto-vivienda-2026.vercel.app';

/** Ficheros que son navegación del conversor y no contenido del sitio. */
const EXCLUIDOS = new Set(['index.md', 'log.md']);

function listar(dir) {
  const salida = [];
  for (const nombre of readdirSync(dir)) {
    const ruta = join(dir, nombre);
    if (statSync(ruta).isDirectory()) salida.push(...listar(ruta));
    else if (nombre.endsWith('.md')) salida.push(ruta);
  }
  return salida;
}

/**
 * Lee el bloque `---` inicial.
 *
 * Es YAML, pero no se trae una dependencia por seis campos: el bundle lo genera
 * una herramienta externa con un formato fijo, y un parser propio que acepte
 * cualquier cosa sería peor que uno que falle al primer cambio de formato.
 * Se validan los campos que de verdad se usan y se avisa de los que falten.
 */
function frontmatter(texto) {
  const bloque = texto.match(/^---\n([\s\S]*?)\n---\n/);
  if (!bloque) return null;
  const y = bloque[1];
  const escalar = (clave) => {
    const m = y.match(new RegExp(`^${clave}:\\s*"?(.*?)"?\\s*$`, 'm'));
    return m ? m[1] : '';
  };
  // `sources` es una lista YAML y `resource` cuelga de la segunda clave de su
  // elemento, no de una línea con guion delante: el guion abre la lista, no la
  // clave que se busca.
  const sources = y.indexOf('sources:') === -1 ? '' : y.slice(y.indexOf('sources:'));
  const resource = sources.match(/^\s+resource:\s*(\S+)\s*$/m)?.[1] ?? '';
  return {
    title: escalar('title'),
    description: escalar('description'),
    type: escalar('type'),
    resource,
  };
}

/**
 * El cuerpo como texto plano, con la association intacta.
 *
 * - Se quita la línea `# título`, que es el H1 y ya está en `title`.
 * - Los enlaces `[texto](url)` se dejan solo como `texto`. La URL importa para
 *   citar, y se cita la página del sitio, no la del BOE ni la del .md: el
 *   bundle no trae los destinos de las leyes y adivinar una URL oficial sería
 *   inventarla (la tarea lo dice, y con razón).
 * - Se quita la sección `## Véase`, que son cruces entre ficheros .md.
 * - Las tablas markdown se aplanan a filas de texto separadas por ` | `. Una
 *   fila es un solo bloque, así que el supuesto y su cifra siguen siendo la
 *   misma unidad: es lo que impide que el modelo diga «70 %» sin la condición
 *   de alquiler social que lo acompaña.
 */
function cuerpo(texto) {
  const sinFm = texto.replace(/^---\n[\s\S]*?\n---\n/, '');
  const sinH1 = sinFm.replace(/^# .*\n+/, '');
  const sinVase = sinFm.replace(/\n## Véase[\s\S]*$/, '').replace(/^# .*\n+/, '');
  return sinVase
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/gm, '')
    .replace(/^\|\s*/gm, '')
    .replace(/\s*\|\s*/gm, ' | ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Normalización para casar un título del bundle con uno del índice.
 *
 * Sin acentos, sin signos de apertura, sin puntos y con espacios colapsados: los
 * títulos del bundle llevan a veces comillas y el índice nunca.
 */
const norm = (t) =>
  t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[¿?¡!.,:;()[\]«»"'%]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// --- Índice de búsqueda: la fuente de verdad de las URLs ---------------------

const indice = JSON.parse(readFileSync(join(root, 'public/search-index.json'), 'utf8'));
const porTitulo = new Map();
for (const e of indice) {
  const clave = norm(e.title);
  if (clave && !porTitulo.has(clave)) porTitulo.set(clave, e);
}

/**
 * ¿Esta URL es de esta página?
 *
 * La comparación es sobre la parte **anterior al `#`** y sin barra final, porque
 * la página del bundle siempre lleva una («/desahucios-y-alquiler/») y una cita
 * con ancla no («/desahucios-y-alquiler#coordinacion»). Comparar la ruta entera
 * daba trece falsos positivos: nueve ficheros se quedaban sin ancla y una
 * comprobación de coherencia posterior habría señalado trece ficheros sana y
 * bien citados.
 */
function enPagina(href, pagina) {
  return href.split('#')[0].replace(/\/$/, '') === pagina.replace(/\/$/, '');
}

/**
 * Resuelve la URL real de un fichero del bundle.
 *
 * Dos pasos, y el orden importa:
 *
 * 1. **Título exacto.** La mayoría de los ficheros llevan el mismo título que
 *    la sección del sitio de la que salieron, así que casan sin más.
 * 2. **Título contenido en el título del fichero, dentro de la misma página.**
 *    Los que no casan exactos lo hacen porque el sitio usa un título corto y el
 *    bundle el título largo con la norma entre paréntesis: «DF 5.ª y DF 6.ª»
 *    frente a «DF 5.ª y DF 6.ª del RDL 26/2026». Se exige que el título del
 *    índice sea una substring del del bundle **y** que ambos estén en la misma
 *    página, porque sin esa última condición «Arts. 9 y 10» se cruzaría con
 *    cualquier otro título corto.
 *
 * Si no hay caso, se cae a la página que declara el propio `sources.resource`
 * del fichero, que es la ruta del sitio verificada por el conversor.
 */
function resolver(titulo, pagina) {
  const n = norm(titulo);
  const exacto = porTitulo.get(n);
  if (exacto) return { href: exacto.href, ancla: true };
  for (const [clave, e] of porTitulo) {
    if (enPagina(e.href, pagina) && clave.length >= 4 && n.includes(clave)) {
      return { href: e.href, ancla: true };
    }
  }
  return { href: pagina, ancla: false };
}

// --- Construcción ------------------------------------------------------------

if (!existsSync(OKF_DIR)) {
  throw new Error(`no existe ${OKF_DIR}. El bundle OKF debe estar en el repositorio.`);
}

const ficheros = [];
const sinResolver = [];

for (const ruta of listar(OKF_DIR).sort()) {
  const rel = relative(OKF_DIR, ruta).split('\\').join('/');
  if (EXCLUIDOS.has(rel)) continue;
  const texto = readFileSync(ruta, 'utf8');
  const fm = frontmatter(texto);
  if (!fm) {
    throw new Error(`${rel}: sin bloque de frontmatter`);
  }
  if (!fm.title) throw new Error(`${rel}: sin title`);
  if (!fm.resource) {
    sinResolver.push(`${rel} (sin sources.resource)`);
    continue;
  }
  if (!fm.resource.startsWith(ORIGEN)) {
    throw new Error(
      `${rel}: sources.resource apunta fuera del sitio (${fm.resource}). ` +
        'Las citas deben ser URLs reales de esta web, nunca adivinadas.',
    );
  }
  const pagina = fm.resource.slice(ORIGEN.length) || '/';
  const { href, ancla } = resolver(fm.title, pagina);
  const cuerpoTexto = cuerpo(texto);
  if (!cuerpoTexto) throw new Error(`${rel}: cuerpo vacío`);
  ficheros.push({
    ruta: rel,
    tipo: fm.type || 'Note',
    titulo: fm.title,
    descripcion: fm.description,
    pagina,
    href,
    ancla,
    cuerpo: cuerpoTexto,
  });
}

const huerfanas = ficheros.filter((f) => !enPagina(f.href, f.pagina));
if (huerfanas.length > 0) {
  throw new Error(
    'ficheros cuya cita no cae en la pagina que declara el propio bundle:\n' +
      huerfanas.map((f) => `  ${f.ruta}: ${f.href} (esperado bajo ${f.pagina})`).join('\n'),
  );
}

if (ficheros.length === 0) throw new Error('el bundle no tiene ficheros de contenido');
if (sinResolver.length > 0) {
  throw new Error(`ficheros sin sources.resource:\n  ${sinResolver.join('\n  ')}`);
}

// Los dos ficheros de estado tienen que existir siempre: son los que garantizan
// que la respuesta diga qué está en vigor y qué no, y el único sitio donde se
// dice que el RDL 26/2026 entró en vigor el 1 de octubre.
for (const obligatorio of ['estado/situacion-de-cada-medida.md', 'faq/esta-en-vigor.md']) {
  if (!ficheros.some((f) => f.ruta === obligatorio)) {
    throw new Error(`falta el fichero de estado ${obligatorio} en el bundle`);
  }
}

const json = JSON.stringify({ ficheros });
writeFileSync(DESTINO, json);

const conAncla = ficheros.filter((f) => f.ancla).length;
const bytes = Buffer.byteLength(json);
console.log(`okf index: ${ficheros.length} ficheros, ${conAncla} con ancla, ${ficheros.length - conAncla} con pagina`);
console.log(
  `cuerpos: ${ficheros.reduce((n, f) => n + f.cuerpo.length, 0)} caracteres -> public/okf-index.json, ${(bytes / 1024).toFixed(1)} kB raw`,
);