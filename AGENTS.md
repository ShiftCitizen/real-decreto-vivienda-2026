# AGENTS.md

Guidance for AI agents working in this repository. Read before editing.

## What this project is

A hybrid Next.js 16 + TypeScript site that explains two Spanish
**reales decreto-ley** on housing (RDL 26/2026 and RDL 27/2026). It is a reading
aid, not legal advice, and the site says so.

**There is no database.** All six pages are statically prerendered; the only
server code is `POST /api/chat`, the chatbot proxy (it holds the NIM key
server-side so the widget cannot become a free ChatGPT). Every other change
must still work as static output.

## Commands

```bash
npm run typecheck   # tsc --noEmit  — run this after every change
npm run build       # hybrid build + regenerates the search index
npm start           # next start locally (needs a prior build; the API only lives here or on Vercel)
npm run dev         # dev server
```

`npm run build` is the only correct way to regenerate the search index. Run
`npm run typecheck` before claiming any change is done. Requires **Node 22.6+** —
the build script imports `.ts` data files directly using native type stripping.

Do **not** hard-code the search-index entry counts into this file or the
README. They are derived from the data and change whenever content does; read
them off the `postbuild` line of a real build.

## Hard constraints

### 1. Hybrid build rules

`next.config.mjs` sets `trailingSlash: true` and deliberately no longer sets
`output: 'export'` — `/api/chat` is a dynamic route handler, so a pure export
build would reject it. Therefore:

- All six pages stay statically prerendered; the **only** server code allowed
  is `POST /api/chat`. No server actions, no other route handlers, no dynamic
  rendering, no ISR anywhere else.
- `redirects()`, `rewrites()` and `headers()` in `next.config.mjs` are
  **silently ignored**. They belong in `vercel.json` if you need them.
- `npm start` runs `next start` (needs a prior build). There is no `out/`
  anymore; do not recreate it and do not serve the site with a static server
  when verifying the chatbot — the API only exists under `next start` or on
  Vercel.
- **`.vercelignore` is not optional here.** Vercel only falls back to
  `.gitignore`; it treats `public/` as a static-asset directory and uploads it
  regardless. So the reduced dev index from `predev` ships and would **shadow**
  the built `public/search-index.json`, silently killing section search in
  production while the build log still reports the full entry count. If you add
  another generated file to `public/`, add it there too. (The stale `out` line
  in that file is vestigial and harmless; leave it.)
- **Deploys are manual.** The git remote is a Cursor host, which Vercel's Git
  integration does not support (GitHub/GitLab/Bitbucket only), so there is no
  webhook and `git push` deploys nothing. Run `npx vercel --prod` yourself.
  Do not delete `.vercel/project.json`.
- Old `*.html` URLs from the pre-Next site are **not** redirected. That was a
  deliberate decision, not an oversight.

### 2. The search index is generated, not authored

`public/search-index.json` is a build artefact, gitignored. Never hand-edit it.

- **Prod:** `postbuild` (`scripts/build-search-index.mjs`) reads section anchors
  back out of the freshly prerendered `.next/server/app/*.html` — never out of
  a reused `out/` directory, which no longer exists and would be stale if it
  did. If you add or rename an anchored heading, rebuild — the index follows
  automatically.
- **Dev:** `predev` writes a reduced index (no section entries) because there is
  no built HTML to read. This is expected, not a bug.
- Section entries carry their **body text** (first `MAX_BODY` chars) in
  `keywords`. That is what makes `<table>` and `<li>` content matchable. A term
  that falls past the cap is genuinely unsearchable — that is the trade-off, not
  a bug to "fix" by duplicating the text elsewhere.
- The last anchored section on a page slices to end-of-file, which is where the
  RSC flight payload lives (`<script>self.__next_f.push(...)</script>` at the
  tail of `<body>`). The script's `plain()` therefore drops whole
  `script`/`style`/`noscript`/`template` elements, content included — a plain
  tag strip does not, because script *content* is not markup. Do not
  "simplify" that away.
- The index script throws on a duplicate anchor, so it cannot regress quietly.

### 3. Anchor ids are generated in TSX, not by a post-processing script

Heading ids come from `slugify()` in `lib/slug.ts`, called **directly in the
page components** at render time (`id={slugify('…')}`). There is deliberately
**no** `scripts/add-heading-ids.mjs`: a post-processor that rewrites built HTML
could disagree with the ids React emitted, and the disagreement would be
invisible until a deep link broke. Keep ids in the TSX.

The FAQ lives in `components/FaqList.tsx` (a client component) rather than in
`app/page.tsx`, because the `faq` search entries have `href: '/#<id>'` — the id of
a **closed** `<details>`. Without `openFromHash()` the user clicks a search
result and gets the question with no answer. Keep both halves of that: the
`useEffect` **mount** path (arriving from another route, or a direct URL load) and
the `hashchange` path (the palette navigates via the client router, and the
  component does not re-mount when only the hash changes). Client components are
  still server-rendered, so the `<details>` and their answers are still in
  the prerendered HTML for the index scraper — that is unchanged, but do not "optimise"
  the FAQ back out of SSR.

`FAQ` ids are deep-link targets; keep them stable unless you intend to break the
link.

### 4. The citation audit is strict on purpose

`scripts/build-search-index.mjs` fails the build on any article reference that
does not name its norm. The rule is **"every article reference names its
norm"**, not "every reference lives in a `<Cite>`" — prose like
"art. 347 de la Ley de los Mercados de Valores" is fine, "(art. 16)" is not.

To keep it green, either wrap the reference in `<Cite norma="…" art="…" />`, or
name the norm in the surrounding clause. Do **not** weaken `NORM_WORDS`,
`ART_REF`, `CLAUSE_BREAK` or `isReferenceDot` just to get a green build; they
encode fixes for real false positives (`art. 10.5 y 10.6`, `art. 3.k`,
`artículo 7.1.c`, `10.Ocho`, `91.Uno.2`).

Two traps in `<Cite>`:

- `art` takes the **bare** reference (`art="10.5"`), not `"artículo 10.5"`. The
  component prefixes `art.` itself; passing the word in renders "art. artículo
  10.5". It only prefixes when `art` starts with a digit, so
  `art="disposición final segunda"` stays intact.
- Check **both quote styles**. `lib/faq.ts` and `lib/cronologia.ts` hold
  `art: '…'` as single-quoted object values, which a `grep` for the double-quoted
  call-site form will miss.

### 5. `next lint` does not exist

It was removed in Next 16. Use `npm run typecheck`. If you add linting, wire up
ESLint directly — do not restore a `next lint` script.

### 6. The chatbot must never become a free ChatGPT

`POST /api/chat` holds `NIM_API_KEY` server-side; the widget is a dumb
single-shot form. Keep every limit on the server and never trust the client:

- The NIM key lives **only** in Vercel env vars. Grep for it before every
  commit; it must appear nowhere in the repo, the bundle, logs, or error
  messages returned to the browser.
- Retrieval first: if nothing in the generated index clears the bar, return
  the fixed refusal **without calling the model**. No history, 500-char input
  cap, low temperature, ~350 output tokens, best-effort per-IP quota.
- The system prompt answers **solely** from the injected excerpts, demands
  page citations, and refuses everything else. The widget repeats the
  no-legal-advice note under every answer.

## React gotchas in this codebase

These have already caused real bugs here. Re-introducing them will cause them again.

- **`autoFocus` does not fire on a permanently-mounted element.** Modals that
  are always rendered and toggled with `hidden` must use explicit refs instead.
  Our modals avoid this by mounting only while open — `document.querySelectorAll(
  '[role="dialog"]').length` is 0 while closed. Keep it that way.
- **Never read `event.currentTarget` inside a `setTimeout`/async callback.**
  React nulls it once the handler returns. Use `event.target`.
- **Body scroll lock:** `body.search-open { overflow: hidden }` propagates to the
  viewport and will swallow any scroll issued afterwards. Scroll *before*
  locking.
- **Every dialog must restore focus** on close, and must stop keyboard events
  from reaching the components behind it (`event.stopPropagation()` on Escape).
  Opening via ⌘K with no prior focused element correctly restores focus to
  `<body>`; opening via the sidebar button must restore focus to that button.
- **Never mutate state through a stale closure.** The search fetch guard uses a
  ref, not a boolean in the dependency array.
- **Never put `scroll-behavior: smooth` on `html`.** Next scrolls to the top on
  every route change, but a smooth scroll is an animation: React replaces the
  page content mid-flight and the browser abandons the scroll wherever it had
  reached — every new page opened slightly scrolled. Ask for smooth at the call
  site instead. `block: 'nearest'` in the search palette is fine; it is not an
  animation.

## Content rules

- **Spanish text is content data, never markup.** It may contain
  `<strong>`, `<em>` and same-page `<a href="#…">` only. Do not widen any tag
  allowlist without a reason.
- **Do not retype legal text from memory.** Every substantive claim in the site
  was checked against the BOE texts of RDL 26/2026 (`BOE-A-2026-20266`) and
  RDL 27/2026 (`BOE-A-2026-20385`). If you cannot verify a claim against the
  source, **remove it** rather than hedge it. Two unverifiable claims were
  already deleted for exactly this reason, and `/estado` carries an explicit
  "Lo que este sitio no afirma" box because of it.
- Figures that belong to a norm *other than* the decree being discussed (the two
  LAU figures on the home page, for instance) must keep `norma` and `cita`
  separate in `FIGURAS`: `norma` is which decree introduces the figure, `cita`
  is what the reader must cite.
- After writing or editing Spanish prose, re-run a Unicode corruption scan before
  typechecking. The only legitimate non-ASCII characters in the source are `€`,
  `⌘` and `⌕`.
- Mermaid-style diagrams are npm imports if you add any. Do not introduce CDN
  `<script>` tags.

## Styling

- All styles live in `app/globals.css`. There are no CSS modules and no
  Tailwind. Keep it that way.
- **`.main-content` and `.site-footer` must stay the same width** (860px box,
  24px padding, 812px of content), and there is deliberately **no per-block
  measure cap**. A cap written in `ch` is the trap: `ch` resolves against each
  child's own `font-size`, so `.main-content > * { max-width: 68ch }` gave
  paragraphs 612px, `h2` 782px and `h3` 629px — every level aligned to a
  different right edge. If you need a cap, use an absolute length. `.lead`'s
  own `58ch` cap had the same defect.
- The global reset sets `box-sizing: border-box` on everything, and
  `overflow-wrap: anywhere` is global so long `<code>` filenames cannot push the
  document sideways. Do not shorten an example filename to make it fit — the real
  name must stay visible and copyable.
- **Beware typos in CSS values.** A malformed value (e.g. `margin: 0 .1.25rem`)
  makes browsers discard the *entire declaration* silently. When a style change
  appears to do nothing, inspect the computed value before assuming the selector
  is wrong.
- **Never put `white-space: nowrap` on `.cite`.** A long disposition reference
  plus its tag does not fit a 320 px viewport and it dragged the whole document
  sideways. `.cite-norma` keeps its own `nowrap` so `RDL 26/2026` never splits;
  the `art.` part may wrap, which is fine.
- The sidebar is a flex column with a fixed header and a scrollable
  `.sidebar-nav`, which has `scrollbar-width: none` plus a `::-webkit-scrollbar`
  fallback. **Do not remove those** — verify at 1440×768 before changing nav
  spacing.

## Narrow viewports

- **Wrap every table in `<ScrollTable label="…">`.** A three-column table cannot
  shrink below its content, and letting it overflow pushes the *whole document*
  sideways. Do not "fix" this with `display: block` on the table — that drops the
  implicit table role and breaks the header association. `ScrollTable` keeps the
  table's own display and adds `role="region"` plus `tabIndex={0}`, because a
  scroll container with no focusable child is unreachable by keyboard. The
  `label` is required; an unlabelled focusable region announces only as "group".
- **Check every route at 390px and 320px, not only the route you edited.** When a
  wide element was reported, measuring the whole site found two further broken
  routes nobody had mentioned. Read `scrollWidth - clientWidth` per route;
  eyeballing a single page is not evidence the site is clean.

## Printing

`@media print` hides the sidebar, mobile bar, search trigger, skip link and
modal chrome, and unpacks every `<details>`.

The unpacking needs **both** halves, and the obvious half is not enough:

```css
details.faq-item::details-content {
  content-visibility: visible !important;
  block-size: auto !important;
}
.faq-item > div,
.faq-answer { display: block !important; }
```

A closed `<details>` exposes its non-`<summary>` children inside
`::details-content`, which the browser paints with `content-visibility: hidden`
and a collapsed `block-size` for the open/close animation. Setting `display:
block` on the child changes nothing — the computed style reads `block` and the
text still does not print. The `display` rules are kept only for engines without
`::details-content`.

If you ever "simplify" this to the `display` rule alone, the printed page
silently loses every FAQ answer. Verify by generating a PDF with print media
**emulated** (`page.emulateMedia({ media: 'print' })` before `page.pdf()` —
Playwright honours the last `emulateMedia` call, and a PDF made under screen
media will look fine and prove nothing) and extracting the text.

## Verification expectations

Do not report a change as done on the strength of the code alone.

- `npm run typecheck` clean.
- `npm run build` succeeds; the `postbuild` line reports the expected entry
  counts and `citation audit: 0`.
- If search or deep links changed, check the built HTML rather than the source —
  the client component will not render server-side.
- Measure rather than assume: `getBoundingClientRect`, computed styles, canvas
  pixel sampling and `pdftotext` output have all caught bugs that reading the
  code did not.
- **Do not report a defect from memory — grep for it.** "Typos" listed for fixing
  have twice turned out not to exist in the codebase at all, which would have
  shipped a no-op change and a false report.