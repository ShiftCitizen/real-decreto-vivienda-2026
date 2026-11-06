# Context-baseline experiment — blocker record (6 Nov 2026)

## Goal

Finish the existing three-way comparison (retrieval vs full OKF vs
retrieval-large) from branch `evals/context-baseline-experiment` before
considering extra retrieval infrastructure.

## What was brought onto this branch

From `github/evals/context-baseline-experiment` (not reinvented):

- `scripts/eval-context-baseline.mjs`
- `evals/context-baseline.test.ts` (smoke without LLM)
- `lib/chat-contexto.ts`, `lib/chat-sistema.ts`
- `app/api/chat/route.ts` / `lib/okf.ts` wired to the shared modules
- `package.json` script `eval:context`

## Run status

**Blocked for the LLM comparison:** this Cloud Agent environment has no
`MISTRAL_API_KEY`. Per the Notion acceptance criteria and ADR 0001, results
were **not invented**. NIM quota and `POST /api/chat` were not used.

Smoke (no LLM) is covered by `evals/context-baseline.test.ts` inside
`npm run eval:retrieval` after `npm run build`.

## How to complete the numbers later

```bash
npm run build
MISTRAL_API_KEY=… npm run eval:context
# optional: EVAL_CONTEXT_LIMIT=10 EVAL_CONTEXT_REPS=1
```

The script writes `evals/reports/context-baseline-*.json` and `.md`.
Interpret metrics as lexical faithfulness vs the injected context on a
single Mistral model — not production failover reliability, and not a
green light for a vector store.

## Implication for this small corpus (pending numbers)

Until the on-demand run lands, the architectural conclusion stays open:
keep the existing lexical/OKF path; do not add vector infrastructure on
the strength of an unrun experiment.
