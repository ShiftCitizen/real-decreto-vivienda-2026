# real-decreto-vivienda-2026

Sitio de lectura que explica qué cambian los **reales decreto-ley 26/2026** y
**27/2026** (vivienda), en cifras y en fechas. No es asesoramiento jurídico y el
sitio lo dice explícitamente en `/estado`.

Sitio híbrido Next.js 16: las seis páginas se prerenderizan como estáticas y
hay una única ruta dinámica, `POST /api/chat` (el proxy del asistente, que
guarda la clave de NIM en el servidor). **No hay base de datos**.

## Puesta en marcha

Requiere **Node 22.6+** (el script de build importa ficheros `.ts` directamente
con *type stripping* nativo).

```bash
npm install
npm run typecheck   # tsc --noEmit
npm run build       # build híbrido + regenera el índice de búsqueda
npm start           # next start (necesita un build previo; la API solo vive aquí o en Vercel)
npm run dev         # servidor de desarrollo
```

## Fuentes

El contenido se ha contrastado con los textos oficiales del BOE:

| Norma | BOE | ELI |
| --- | --- | --- |
| RDL 26/2026 | `BOE-A-2026-20266` | <https://www.boe.es/eli/es/rdl/2026/09/29/26> |
| RDL 27/2026 | `BOE-A-2026-20385` | <https://www.boe.es/eli/es/rdl/2026/09/29/27> |

Los identificadores y etiquetas de cada norma están en `lib/normas.ts`, que es la
única fuente de verdad para el resto del sitio.

## Estructura

```
app/
  layout.tsx                  sidebar, <main id="contenido">, footer
  globals.css                 único fichero de estilos (sin CSS modules ni Tailwind)
  page.tsx                    resumen, figuras, cronología, FAQ
  desahucios-y-alquiler/      Título V LAU, enervación y desahucio
  fiscal/                     IRPF, IVA, IBI, IIVTNU, SOCIMI
  financiacion/               avales, TU CASA, parque público
  estado/                     qué está en vigor y qué no, con advertencias
  normas/                     registro de normas y guía «no confundas estas dos»
components/
  Cite.tsx                    <cite> con referencia a artículo + norma
  FaqList.tsx                 FAQ desplegable + apertura por deep link
  ScrollTable.tsx             envolvente accesible para tablas anchas
  SiteNav.tsx                 sidebar, cajón móvil, disparador de búsqueda, índice «En esta página»
  SearchPalette.tsx           paleta ⌘K / Ctrl-K
  ChatWidget.tsx              asistente (pregunta suelta, vía /api/chat)
  WebMcpTools.tsx             herramientas WebMCP de solo lectura (solo Chrome con bandera)
lib/
  normas.ts   nav.ts   cronologia.ts   faq.ts   slug.ts   busqueda.ts
app/api/chat/
  route.ts                    proxy a NVIDIA NIM con cuota, tope y negativa sin LLM
scripts/
  build-search-index.mjs      postbuild: índice + auditoría de citas
```

El texto en prosa vive en los `.tsx`; a `lib/` solo va lo que varios sitios
comparten o lo que necesita un tipo. El buscador no lee los `.tsx`: **raspa el
HTML ya construido**.

## Funcionalidades

- **Barra lateral** fija en escritorio, cajón en móvil, con índice «En esta
  página» derivado del DOM en tiempo de ejecución.
- **Buscador ⌘K / Ctrl-K** sobre un índice estático que se descarga de forma
  perezosa. Normalización sin acentos ni mayúsculas, ranking por niveles,
  `aria-activedescendant`, Escape y restauración del foco.
- **FAQ** en `/` como `<details>` desplegables, indexada para el buscador.
- **Cronología** con columna de fecha ampliada.
- **Impresión**: sin sidebar ni buscador, y con todas las respuestas del FAQ
  desplegadas.

## El índice de búsqueda

`public/search-index.json` es un **artefacto de build**, no un fichero escrito
a mano, y está en `.gitignore`.

- `postbuild` lee las anclas de las secciones directamente del HTML ya
  construido (`.next/server/app/*.html` del build que acaba de correr; nunca
  de un `out/` reutilizado). Si añades o renombras un encabezado con `id`,
  reconstruye y el índice se actualiza solo.
- `predev` escribe un índice reducido (sin entradas de sección) porque en
  desarrollo no hay HTML construido. Es lo esperado, no un fallo.
- Las entradas de sección llevan los primeros `MAX_BODY` caracteres de su
  cuerpo, y eso es lo que hace buscables las tablas y las listas.

**No codifiques a mano el número de entradas** en este README ni en
`AGENTS.md`: se deriva de los datos y cambia con el contenido. Léelo de la línea
`postbuild` de un build real.

### `.vercelignore` es obligatorio

Vercel solo recurre a `.gitignore` cuando no encuentra `.vercelignore`, pero
trata `public/` como directorio de estáticos y lo sube igualmente. Así, el índice
de desarrollo que escribe `predev` llega a producción y **hace sombra** al
bueno: se pierde la búsqueda por secciones sin que el log del build dé ninguna
pista. No borres ese fichero, y añade aquí cualquier otro fichero generado que
acaba en `public/`.

## Despliegue

El remoto de git es un host de Cursor, que la integración de Vercel no admite
(sólo GitHub, GitLab y Bitbucket). **No hay webhook: `git push` no despliega
nada.** El despliegue es manual:

```bash
npx vercel --prod
```

`vercel ls` debe mostrar entonces un despliegue nuevo para el commit actual. No
borres `.vercel/project.json`.

Las URLs antiguas `*.html` del sitio estático anterior **no** están redirigidas.
Fue una decisión consciente, no un descuido.

## Reglas para quien edite

Lee [`AGENTS.md`](./AGENTS.md) antes de tocar nada. En resumen:

- `npm run typecheck` antes de dar cualquier cosa por hecha; `npm run build`
  tiene que pasar con `citation audit: 0`.
- Todo `Cite` debe citar su norma, y el build falla si una referencia a un
  artículo no la nombra. No relajes la auditoría para que el build pase.
- `art="10.5"`, nunca `art="artículo 10.5"` — el componente pone el `art.`.
- Envuelve cada tabla en `<ScrollTable label="…">` y no pongas nunca
  `white-space: nowrap` en `.cite`.
- Comprueba todas las rutas a 390 px y 320 px, no solo la que has editado.
- No reescribas el texto legal de memoria: verifícalo contra el BOE o quita la
  afirmación.