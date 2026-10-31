## Why

El chatbot RAG de real-decreto-vivienda-2026 tiene mecanismos anti-alucinación, pero la única red sistemática es `scripts/chat-check.mjs` (retrieval). No hay corpus estructurado, faithfulness, ni CI. Sin eso no se miden regresiones ni se puede demostrar fiabilidad. Hay que hacerlo **sin quemar** la cuota NIM del sitio (`NIM_API_KEY` / `POST /api/chat` de producción).

## What Changes

- Añadir harness de evals alineado con KL-S-030…036 y con el ADR 0001 (Accepted): retrieval sin LLM; faithfulness con Mistral free tier **bajo demanda**.
- Corpus YAML/JSON de preguntas de prueba (`evals/cases/`).
- Evals de recall@k, scope gate, citas estructurales y cobertura multi-parte (locales, &lt;2s, sin secrets).
- Eval de faithfulness (~20 golden) vía `MISTRAL_API_KEY`, lanzable a mano / `workflow_dispatch` — sin cron nightly, sin cada PR.
- Workflow CI opcional de retrieval en PR; faithfulness nunca usa NIM ni pega al endpoint público.
- Documentación: ADR ya en `docs/adr/0001-…` y Decisions de Notion; puntero en README.

## Capabilities

### New Capabilities

- `eval-corpus`: dataset estructurado de preguntas (campos, categorías, carga en el harness).
- `eval-retrieval`: recall@k OKF, scope gate, validez de citas y cobertura multi-parte sin llamadas a LLM.
- `eval-faithfulness`: comprobación de claims ⊆ evidencia con Mistral bajo demanda y baseline versionado.
- `eval-ci`: integración en GitHub Actions (retrieval sin secrets; faithfulness solo bajo demanda).

### Modified Capabilities

(none — no hay specs previas de evals; `estado-actual` no cambia requisitos.)

## Impact

- Nuevos: `evals/`, scripts npm (`eval:retrieval`, `eval:faithfulness`), posiblemente Vitest + deps de desarrollo.
- CI: `.github/workflows/evals.yml` (si aún no existe).
- No toca `app/api/chat/route.ts` salvo lecturas; **no** introduce uso de `NIM_API_KEY` en evals.
- Reutiliza `lib/okf.ts`, `lib/busqueda.ts`, `ajustarCitas` y los índices generados en build.
- Gates existentes (`typecheck`, `build`, `check:chat`) siguen; el harness nuevo no los sustituye de golpe (puede convivir o absorber casos de `chat-check` por fases).
