# Evals del chatbot Vivienda 2026

Harness local (ADR 0001). Retrieval / scope / citas estructurales van en CI
sin LLM. Faithfulness es **bajo demanda** y usa solo `MISTRAL_API_KEY` —
nunca `NIM_API_KEY` ni `POST /api/chat`.

## Comandos

```bash
npm run build                 # índices search + OKF
npm run eval:retrieval        # vitest (retrieval, scope, citas)
MISTRAL_API_KEY=… npm run eval:faithfulness
MISTRAL_API_KEY=… npm run eval:faithfulness -- --update-baseline
```

El experimento retrieval vs full OKF vs retrieval-large vive en la rama
`evals/context-baseline-experiment` (PR aparte); no forma parte de este
árbol de producción.

## Baseline de respuestas (`fixtures/baseline-responses.json`)

- **kind: `extractive-corpus`** (committed): respuestas armadas desde el FAQ /
  estado publicados tras alinear el lenguaje de vigencia del RDL 28/2026.
  Procedencia documentada en el propio JSON. **No** son salidas de modelo.
- **kind: `model-mistral`**: se escribe solo con `--update-baseline` cuando hay
  clave. Sustituye el extractivo; no afirmar fiabilidad de producción.

## Faithfulness vs producción

| Dimensión | Eval | Producción |
| --- | --- | --- |
| System prompt | `lib/chat-sistema.ts` `SISTEMA` | el mismo |
| Modelo por defecto | `ministral-8b-latest` | brazo Mistral: igual; luego NIM / OpenRouter |
| max_tokens | `MAX_TOKENS_SALIDA` (550) | igual |
| temperature | 0.2 (reproducibilidad) | 0.6 en brazo Mistral |
| Heurística | solape léxico ≥0.7 / ratio ≥0.95 | n/a |

Límites: el solape no prueba verdad jurídica; una paráfrasis fiel puede fallar
y un solape alto no implica que el claim esté bien anclado. Tener el harness
no demuestra fiabilidad de producción.

## Citas de pasaje

`hrefValido` sigue aceptando página base (compat). Para claims de fecha,
negación, actor o decreto, los tests usan `hrefAnclaExacta` /
`citaSoportaPasaje`. La reparación de `ajustarCitas` a fuente `[1]` se marca
con `esReparacionFuente1` y **no** cuenta como soporte evidencial.

## Paráfrasis de ciudadano

`evals/cases/paraphrase.yaml` — casero/echar, indemnización informal, vigor,
prórroga. Fallos de recall léxico son evidencia para un candidato semántico
futuro; **no** autorizan embeddings en esta tarea.

Informe committed: `docs/evals/paraphrase-lexical-2026-11-06.md`
(`node scripts/report-paraphrase.mjs`).
