## Context

`scripts/chat-check.mjs` ya ejercita `buscar` / `seleccionar` / scope sin LLM contra índices generados. KL-E-017 pide un harness más formal (corpus, métricas, faithfulness, CI). El ADR 0001 (Accepted) fija: no quemar NIM del sitio; faithfulness con Mistral free tier bajo demanda; sin nightly obligatorio.

Constraints: híbrido Next 16, Node 22.6+, sin DB; índices en `public/` son artefacto de build; `NIM_API_KEY` solo en Vercel para el widget.

## Goals / Non-Goals

**Goals:**

- Corpus YAML + runner de retrieval (Vitest o script Node) que cubra KL-S-030/031/033/034/035.
- Faithfulness on-demand con Mistral (~20 golden) + baseline.
- CI de retrieval sin secrets; faithfulness solo `workflow_dispatch`.
- Convivir con `check:chat` (no borrarlo en v1).

**Non-Goals:**

- Sustituir NIM de producción por Mistral.
- Ollama como path por defecto de CI.
- Cron nightly.
- Cambiar scoring OKF «para que pasen los evals» salvo bugs claros; los umbrales pueden partir de casos ya verdes en `chat-check`.
- UI del sitio.

## Decisions

1. **Reuse de libs, no HTTP al sitio.** Igual que `chat-check`: `registerHooks` + import de `@/lib/okf` y `@/lib/busqueda` sobre índices en disco. Alternativa (pegar a preview) descartada: cuota, auth, flakiness.

2. **Vitest para retrieval.** Specs KL-S-036 lo nombran; da reportes claros por caso. Alternativa: ampliar solo `chat-check.mjs` — más simple pero peor DX/CI. Decisión: Vitest + casos YAML; `chat-check` sigue como gate legacy hasta migrar casos.

3. **Corpus en `evals/cases/*.yaml`.** Un fichero por categoría o por tema; schema validado al cargar. Semilla inicial: casos OFF/ON ya presentes en `chat-check` + multi-part conocidos del AGENTS.md.

4. **Faithfulness = script separado `npm run eval:faithfulness`.** Requiere `MISTRAL_API_KEY`; modelo pequeño free-tier. Heurística substring/overlap + citas (KL-S-032). Baseline en `evals/fixtures/baseline-responses.json` (commiteado).

5. **CI:** un workflow `evals.yml` con job `retrieval` en `pull_request` (build + vitest); job `faithfulness` solo `workflow_dispatch`. Sin `schedule`.

6. **Export mínimo para testear la ruta.** Extraer o reexportar `ajustarCitas` (y si hace falta helpers puros) desde módulos importables sin arrancar Next — no invocar el route handler.

## Risks / Trade-offs

- [Faithfulness mide Mistral ≠ NIM prod] → documentado en ADR; corrida NIM solo explícita y rara.
- [Free tier rate-limit] → pocas preguntas; backoff; no en PR.
- [Umbrales 90%/85%/95% demasiado altos al día 1] → sembrar con casos que `chat-check` ya pasa; marcar known-fail documentados si hace falta, sin bajar el contrato de la spec sin decisión.
- [Duplicar lógica con `chat-check`] → v1 convive; migración gradual de casos a YAML.

## Migration Plan

1. Añadir ADR + OpenSpec (esta change) y deps Vitest.
2. Corpus mínimo + `eval:retrieval` verde local.
3. Workflow PR retrieval.
4. Script faithfulness + baseline vacío/seed; documentar disparadores del ADR.
5. No desplegar nada al sitio: solo CI/dev.

Rollback: borrar workflow / no ejecutar scripts; el sitio no depende del harness.

## Open Questions

- ¿Vitest en root con `vitest.eval.config.ts` o paquete aparte? Preferencia: root, config dedicada.
- ¿Migrar `check:chat` a Vitest en esta change o dejarlo? Preferencia: dejarlo; sembrar YAML desde él.
