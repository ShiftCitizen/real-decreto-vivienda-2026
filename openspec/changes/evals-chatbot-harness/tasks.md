## 1. Documentación y scaffolding

- [x] 1.1 Confirmar ADR 0001 en `docs/adr/` + puntero README (ya redactados en la rama)
- [x] 1.2 Añadir Vitest + deps de desarrollo; scripts `eval:retrieval` y `eval:faithfulness` en `package.json`
- [x] 1.3 Crear `vitest.eval.config.mts` y carpeta `evals/` (`cases/`, `fixtures/`, `lib/`)

## 2. Corpus (KL-S-030)

- [x] 2.1 Definir schema de caso (TypeScript) y loader YAML/JSON con errores por `id`
- [x] 2.2 Sembrar `evals/cases/` desde casos OFF/ON de `chat-check.mjs` (scope, single_intent, multi_part, state)
- [x] 2.3 Añadir casos mínimos de `citation_validity` y `numeric_contamination`

## 3. Retrieval evals (KL-S-031/033/034/035)

- [x] 3.1 Helper que carga índices (`search-index.json`, `okf-index.json`) y envuelve `seleccionar` / `esSaludo` / `buscar`
- [x] 3.2 Tests Vitest: scope gate 100%, Recall@1, Recall@4 multi-part, sin LLM
- [x] 3.3 Tests de validez de hrefs / `ajustarCitas` (exportar helper puro si hace falta desde `lib/` o `evals/lib/`)
- [x] 3.4 Informe resumen (Recall@1, Recall@4, Scope Gate) al final del run
- [x] 3.5 Verificar `npm run eval:retrieval` verde en &lt;2s tras `npm run build`

## 4. Faithfulness bajo demanda (KL-S-032)

- [x] 4.1 Script `scripts/eval-faithfulness.mjs` (o TS) que usa solo `MISTRAL_API_KEY`
- [x] 4.2 Heurística claims ⊆ evidencia + trato especial plan B / origen texto
- [x] 4.3 Baseline `evals/fixtures/baseline-responses.json` + diff en fallo
- [x] 4.4 Guardrail: fallar en seco si detecta uso de `NIM_API_KEY` o URL de producción del chat

## 5. CI (KL-S-036)

- [x] 5.1 `.github/workflows/evals.yml`: job retrieval en `pull_request` (build + eval:retrieval), sin secrets LLM
- [x] 5.2 Job faithfulness solo `workflow_dispatch` con secret `MISTRAL_API_KEY`
- [x] 5.3 Confirmar que no hay `schedule:` nightly

## 6. Verificación

- [x] 6.1 `npm run typecheck` limpio
- [x] 6.2 `npm run build` + `npm run eval:retrieval` verdes
- [x] 6.3 `npm run check:chat` sigue pasando (no regresiones)
- [x] 6.4 `openspec validate evals-chatbot-harness` (si aplica)
