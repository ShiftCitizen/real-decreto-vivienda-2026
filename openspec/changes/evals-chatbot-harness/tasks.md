## 1. Documentación y scaffolding

- [x] 1.1 Confirmar ADR 0001 en `docs/adr/` + puntero README
- [x] 1.2 Vitest + scripts `eval:retrieval` / `eval:faithfulness`
- [x] 1.3 Carpeta `evals/` inicial (MVP)

## 2. Corpus (KL-S-030) — cierre DoD Approved

- [x] 2.1 Schema + loader (MVP en `evals/lib/`)
- [x] 2.4 Alinear nombres de spec: `evals/types.ts` + `evals/loader.ts`
- [x] 2.5 Ampliar corpus a **80–90+ casos** en las 7 categorías (~110)
- [x] 2.6 Añadir categoría `broad` con `responderAmplia()`
- [x] 2.7 Casos multi-part con umbrales 2 / 3 (+ 4 topics_esperados; min medido 3)

## 3. Retrieval evals — tests partidos (KL-S-031/033/034/035)

- [x] 3.1 Helper índices + `seleccionar` / `buscar` / scope
- [x] 3.6 `evals/metrics.ts` (Recall@1, Recall@4, Scope, Citation, Latency)
- [x] 3.7 `evals/scope.test.ts` (100% scope gate)
- [x] 3.8 `evals/retrieval.test.ts` centrado en recall@k + literal + sin falsos positivos
- [x] 3.9 `evals/multipart.test.ts`
- [x] 3.10 `evals/citation.test.ts` (hrefs + `ajustarCitas`)
- [x] 3.11 Informe JSON **y** Markdown al final del run (también Latency/Cost placeholders)

## 4. Faithfulness (KL-S-032)

- [x] 4.1 Script `eval-faithfulness.mjs` + guardrails NIM
- [x] 4.5 `evals/faithful.test.ts` (skip sin `MISTRAL_API_KEY`; on-demand)

## 5. CI (KL-S-036)

- [x] 5.1–5.3 Workflow retrieval en PR; faithfulness `workflow_dispatch`; sin cron
- [x] 5.4 Alinear mensaje CI con ADR (`workflow_dispatch` + Description «under demand»; sin cron/nightly)

## 6. Verificación

- [x] 6.1–6.4 Gates MVP
- [x] 6.5 `npm run eval:retrieval` verde con corpus ampliado
- [x] 6.6 `openspec validate` + push a PR #16
