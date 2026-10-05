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
- **Deploys are automatic.** The repo lives on GitHub (connected to Vercel),
  so every push to `main` deploys to production — `git push` is the deploy.
  `vercel.json` pins `buildCommand: npm run build` so the search index and
  citation audit always run there; never rely on the dashboard default (bare
  `next build` skips `postbuild`). Do not delete `.vercel/project.json`.
- **Changes go in via pull request, never by pushing to `main`.** Work on a
  short-lived branch (`flash/<tema>-<dia>` for news flashes), commit only the
  files the task allows, push the branch and open a PR against `main` for
  review. Merging the PR is the deploy (see above), so a green PR is not live
  yet: verify promotion with `readySubstate` as usual. Standing user preference
  since 2026-10-05: no direct commits to `main`, no `vercel deploy`.
- **"Built green" is not "deployed". Check `readySubstate`, not `readyState`.**
  This bit on 2026-10-03: four deployments built successfully and were left
  `STAGED`, never `PROMOTED`, so the alias kept serving an older commit while
  the build log reported a clean deploy. `vercel ls` prints `Ready` for both —
  it shows `readyState`, so it cannot tell you. A staged production deployment
  means the domain was never auto-assigned and **nothing goes live silently**:
  - Check with the REST API, not the CLI:
    `GET /v6/deployments?projectId=prj_3SkPYbowj08LYrMvy52f3Lo8bjhk&teamId=team_lHgxDkPcjsK71EhnRzS2DBoA`
    and read `readySubstate` (`PROMOTED` = live) plus `source` (`git` or `cli`).
  - Promote with `vercel promote <deployment-id>`; it re-points the alias
    without rebuilding.
  - `GET /v9/projects/<id>` has no field that explains a missing promotion.
    `autoAssignCustomDomains: true` and `live: false` both read normally —
    **`live` is `false` on every project in this team, including ones that
    deploy correctly, so it is not a signal.** The control that proves a cause
    is always a same-team project that is working. Do not chase it.
  - The remedy that worked: `POST /v1/projects/<id>/unpause?teamId=<team>`.
    It answers `200` with an **empty body and does not flip `live`**, so it
    looks like a no-op — but auto-assignment came back immediately and the
    next `git push` promoted on its own (verified 2026-10-04, commit
    `3a01b01`). Do not read the empty response as failure.
  - Staging is otherwise driven by the Production environment's Branch
    Tracking ("Auto-assign Custom Production Domains"), a dashboard toggle
    with no environment REST endpoint. So the recovery path is `unpause`,
    and `vercel promote <id>` when you need the site live *right now*.
- Old `*.html` URLs from the pre-Next site are **not** redirected. That was a
  deliberate decision, not an oversight.

### 2. The search index is generated, not authored

`public/search-index.json` is a build artefact, gitignored. Never hand-edit it.

- **Prod:** `postbuild` (`scripts/build-search-index.mjs`) reads section anchors
  back out of the freshly prerendered HTML — never out of a reused `out/`
  directory, which no longer exists and would be stale if it did. If you add or
  rename an anchored heading, rebuild — the index follows automatically.
- **Where that HTML is depends on the builder, and this cost a debugging
  session.** A plain `next build` leaves it in `.next/server/app/*.html`. Vercel's
  cloud builder applies `modifyConfig` and then runs `onBuildComplete`, and by
  the time `postbuild` runs those pages are **gone** — `.next/server/app`
  exists but holds zero `.html`, while the build still prints every route as
  `○ (Static)` and the pages serve fine. That is how a section-less index
  (35 entries) shipped to production repeatedly without any visible error.
  A local `vercel build` does **not** reproduce it, because the CLI does not
  apply those adapter hooks — so `locatePages()` in the script cannot rely on a
  fixed path. It prefers a known build-output directory, and otherwise searches
  the whole build output for the pages, deriving each route from a slug in its
  path and keeping, per route, the file with the most anchored headings (the
  adapter leaves both a real page and an empty shell next to each other).
  Two consequences worth keeping:
  - **Existence is not proof.** A candidate qualifies only if it holds HTML for
    at least one real route. The build-output tree also contains `404.html` /
    `500.html`, so a "has any `.html`" test picks a directory with no pages.
  - **Build logs are readable from the CLI after all**, via
    `GET /v3/deployments/<id>/events?builds=1` on `api.vercel.com` with the
    token in `~/.local/share/com.vercel.cli/auth.json` (`vercel logs` is
    runtime-only and will mislead you). A previous session concluded from a
    file fetched over HTTP that the cloud builder was broken; the file had in
    fact been generated locally and uploaded. Read the log. The script's
    no-HTML error dumps the build-output tree into the build log on purpose —
    that is how the real layout was found, without a diagnostic deploy.
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
- Outside `--dev`, the script throws if no built HTML exists instead of writing
  a section-less index: a degraded file would ship silently and starve both
  section search and the chatbot's retrieval.

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
- **Retrieval first: if nothing in the generated index clears the bar, return
  the fixed refusal *without calling the model*.** `npm run check:chat` is the
  gate: it runs `buscar()` against the built index exactly as `POST /api/chat`
  does, and it exists because the bar used to leak in both directions. The
  route now tries `seleccionar()` (§7) first and falls back to `buscar()` when
  the OKF table is missing or returns `null`; **both return nothing for an
  out-of-scope question**, so the scope guarantee does not depend on either one
  being well tuned.
  - **`buscar()` matches whole words, never substrings.** It used to test
    `text.includes(token)`, so «hace» matched inside «hacer» and
    «¿Qué tiempo hace mañana en Madrid?» recuperaba tres entradas de vivienda.
    That is a scope failure, not a ranking nit: the refusal is the only thing
    keeping this endpoint from answering about anything.
  - **Stopwords are a function-word list, and it is load-bearing.** «me», «por»,
    «con», «en», «es» appear in nearly every entry; leaving them in satisfied
    the all-words rule by itself and the ranking collapsed to noise.
  - **Bare numbers in the question are dropped.** They are usually a claim the
    visitor wants checked («¿el límite es del 5 %?», and the site says 2 %),
    not a search term. Counting them lowered the coverage of the entry that
    actually has the answer.
  - **A light suffix stemmer and a rarity factor do the paraphrase work.**
    `raiz()` plus `mismaRaiz()` links «subida»/«subir»; the rarity factor
    (`log(n/df)`) is what stops a page that merely mentions «vivienda» from
    outranking the section titled «Art. 8. IBI». Both strip suffixes with a
    **minimum length of 3**, not 4 — at 4 «subido» and «subir» stay different
    roots, which is the exact pair the question and the FAQ title use.
  - **`puntos` carries the whole ordering, because `/api/chat` re-sorts on it.**
    Any key that only exists inside `buscar()` is discarded by that re-sort.
    The literal-match band is `1e9`-ish for the same reason: it must still win.
- **The system prompt has to do work the retrieval cannot.** The decrees were
  repealed on 2-10-2026, so the prompt states that as a first-order rule and
  orders the model to say so *before* explaining a measure, rather than letting
  it describe a repealed measure as applicable. It also forbids taking figures
  from the question, forbids inventing a sanction regime that the context does
  not describe, and forbids a bare yes/no about a person's legal position.
- **Citations are renumbered, not sliced.** The widget renders sources as links
  in the same order as the `[n]` markers in the text, so dropping a middle entry
  would make `[3]` point at the wrong source. The old `slice(0, ultima)` kept
  the numbering honest but still listed everything below the last citation,
  which is how a reply about the rent cap came with three unrelated titles
  underneath it. `ajustarCitas()` now keeps *only* the cited numbers, renumbers
  them to `1..n`, and rewrites the markers with the same map — so a source that
  the model did not use is never shown.
- No history, 500-char input cap, low temperature, ~350 output
  tokens, best-effort per-IP quota.
- **The quota is keyed on `x-vercel-forwarded-for`, not `x-forwarded-for`,**
  and on the **last** value of it, never the first. The first entry of
  `x-forwarded-for` is the one a client controls, so keying on it makes the
  quota bypassable by anyone who sets the header; Vercel only happens to
  overwrite that header today, and would stop doing so behind a proxy. The IP
  is also shape-checked before it becomes a Map key.
- **`ventanas` is swept.** A quota map that only ever filters the calling IP
  retains every IP ever seen, which is an unbounded-memory vector on a
  publicly reachable endpoint. `barrerCaducadas()` runs every
  `CUOTA_LIMPIEZA_CADA` requests. Do not remove it as redundant: filtering a
  single key is not eviction.
- **Known trap: `/api/chat` fetches its own index over HTTP** (`new
  URL(request.url).origin`). If this project ever turns on **Deployment
  Protection** (Vercel Authentication), that self-fetch receives the auth
  challenge instead of the JSON and the assistant starts returning 502 with
  nothing in the log — the 401 is not an exception, it is a successful response.
  `curso-digitalizacion-2026` hit exactly this and now reads the index from disk
  via `includeFiles`; port that approach here before enabling protection.
  The OKF table is read the same way, but only once per instance
  (`okfCache` in the route): it is 124 kB and cannot change between requests.
- The system prompt answers **solely** from the injected excerpts, demands
  page citations, and refuses everything else. The widget repeats the
  no-legal-advice note under every answer.

### 7. `lib/okf.ts` — evidence selection from the OKF bundle

`buscar()` decides *whether* a question is about the decrees. `lib/okf.ts`
decides *which text* the model is shown, by whole topic instead of by isolated
index entry. Both are kept: `buscar()` is still the scope gate, and
`seleccionar()` returns `null` for anything outside the analysis, which is what
lets the route return the fixed refusal without calling the model.

**Why it exists, measured.** The route used to take
`buscar(indice, q).slice(0, 3)` and concatenate to 3 000 chars. A three-part
question could therefore receive at most three entries, and one long FAQ ate the
budget: the measured context for the four-part question contained no extension,
no rent update and no eviction entry, so the model truthfully answered "no hay
información en el contexto". That was a retrieval-cap failure, not a
missing-content one — the bundle was complete the whole time.

**Why the bundle bodies can be fed to the model here** (unlike the course
bundle): of 606 paragraphs, list items and table cells in `okf/`, 605 appear
unchanged in the site. That is why `okf/` is a build input rather than a
summary to route on.

Three findings, each measured, that will look like arbitrary constants:

- **Rarity must be counted with the same fuzzy matcher that is used to compare.**
  Looking up `pesoDe(t)` by the question's *exact* root while matching with
  `coincide()` (a prefix rule) made `alquil` — a root that barely exists
  written, because the site says "alquiler"/"alquilo" — score as if it were the
  rarest word in the bundle. That put the tourist-rental and IRPF FAQs above the
  LAU reform for "¿Puedo dejar de pagar el alquiler?". `peso()` sums the
  document frequency of every root the question's root matches, which is what
  `frecuencia()` already did in `busqueda.ts`.
- **Title and description are different weights.** Grouping them as one "strong"
  set gave the art. 2 eviction-suspension file 13.5 points against 10.8 for
  "Lo que afecta al tercer sector", because the word "vulnerable" appears in
  art. 2's *description*. Title 3, description 2, body 1.
- **Title coverage must not multiply.** This is the same bug `busqueda.ts`
  already documents for `mejorTitulo`: a file matching one of three title words
  was doubled, which alone put the tourist-rental FAQ ahead of the rent FAQ.
  `cobertura` is still returned by `puntuarFicheros()` for debugging, but it
  does not score.

Other values, all from `scripts/chat-check.mjs`'s acceptance block:
`coincide()` requires a shared prefix of ≥4 characters and a length difference
≤4 (5 lost the "lucro"/"lucrativos" pair; 3 would reintroduce "enero" →
"enervación", so 4 is the measured value); `PUNTUACION_MINIMA = 4`;
`MIN_RAICES = 2`; `MAX_FICHERS = 4`; the `Estado:` block of every file always
travels with the measure; and `estado/situacion-de-cada-medida.md` +
`faq/esta-en-vigor.md` are appended to every substantive answer, because they
are the only two places that say precisely that the decrees *entered into force
on 1 and 2 October* and were repealed on 2 October.

**Selection is per part, and parts come first.** `partesDe()` splits a
multi-part question on punctuation and connectives; each part picks its own
file. Scoring the question as one block let the file with the most *generic*
overlap win and starved the other parts. Ordering the part winners ahead of the
whole-question winner is what makes P3 correct: the whole-question ranking puts
art. 2 first on "vulnerable", while the part that actually asks the question —
"soy propietario y alquilo a una asociación sin ánimo de lucro" — is the one
that identifies the third-sector file.

**Two known limitations, do not try to "fix" them with a synonym list:**

- In the four-part question, the clause "me preocupa que me suban la renta un 5 %
  en enero" is won by "En 1 minuto", which literally contains "casero" and
  "nada". `raiz("suban")` is "suban" and `raiz("subida")` is "subid" — they
  share three characters, so no prefix rule connects them.
- The clause "¿Me protege algo de lo que aprobó el Gobierno?" picks
  `financiacion/cuenta-de-ahorro.md`, because "aprobó" and "Gobierno" are the
  only content words in it and that file contains both.

Both are genuine lexical near-misses, not a broken rule; closing them needs a
hand-written synonym list of the site's vocabulary, which this work explicitly
does not want. Everything else in the acceptance set passes.

**Files.** `okf/` holds the 39 content files; `index.md` and `log.md` are
converter navigation and are deliberately excluded — `index.md` contains a usage
note addressed to whoever reads the bundle, and feeding that to the model is
exactly the "bundle metadata is not an instruction" case. `scripts/build-okf-index.mjs`
flattens markdown tables per row (so "Alquiler social … | 70 %" stays one unit
and the condition stays attached to the figure), resolves each file to a live
anchor by exact-then-containment title match, and **throws rather than writing
a degraded table**. 37 of 39 resolve to an anchor; 2 fall back to the page.

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