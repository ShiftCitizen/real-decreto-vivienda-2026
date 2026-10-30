# ADR 0001 — Evals del chatbot sin quemar tokens del sitio

- **Estado:** Accepted
- **Fecha:** 2026-10-30
- **Epic:** KL-E-017 (evals real-decreto-vivienda-2026)
- **Specs:** KL-S-030 … KL-S-036
- **Notion:** [Decisions — ADR evals](https://app.notion.com/p/40974db0a06281069fbed91f2d601576)

## Contexto

El asistente público (`POST /api/chat`) usa NVIDIA NIM en Vercel
(`NIM_API_KEY`). El harness de evaluación no debe consumir esa cuota ni
pegar al endpoint de producción.

Las specs iniciales hablaban de faithfulness «nightly» con Mistral. Con
~20 golden questions eso no hace falta a diario: el free tier de Mistral
cubre corridas ocasionales.

## Decisión

1. **Retrieval, scope gate y citas estructurales** no llaman a ningún
   LLM. Importan `lib/okf`, `lib/busqueda`, etc. contra
   `public/search-index.json` y `public/okf-index.json`, igual que
   `npm run check:chat`. Son gratis. Pueden vivir en CI de PR como
   cinturón; no exigen cron.

2. **Faithfulness** usa la API de Mistral con clave aparte
   (`MISTRAL_API_KEY`), free tier y un modelo pequeño. Se lanza **solo
   bajo demanda** (ver tabla abajo). No hay cron diario obligatorio.
   No corre en cada PR.

3. **Prohibido** para evals: `NIM_API_KEY` de Vercel, `POST /api/chat`
   de producción o preview, y cualquier uso que queme la cuota del
   asistente público.

4. **Ollama** queda como opción local opcional, no como path por
   defecto ni de CI (sin GPU estable; no mide el modelo de producción).

### Faithfulness: cuándo sí / cuándo no

| Cuándo **sí** | Cuándo **no** |
| --- | --- |
| Cambias el system prompt del asistente | PR que solo toca contenido OKF / FAQ / páginas |
| Cambias la cadena de modelos o `NIM_MODEL_ID` | Cada push a `main` «por si acaso» |
| Cambias el montaje de contexto (`montarContexto`, topes, plan B) | Cron diario / nightly |
| Cambias `ajustarCitas()` | Retrieval / scope / citas estructurales (esos van sin LLM) |
| Quieres regenerar el baseline de respuestas | Para «medir prod NIM» sin una corrida explícita aparte |

Quién lo lanza: a mano (`npm` / `workflow_dispatch`), no un bot diario.

## Consecuencias

- Un workflow de PR, si existe, no necesita secrets de LLM.
- Faithfulness con Mistral valida el pipeline + ese modelo; **no**
  afirma por sí sola la fidelidad de Nemotron/Gemma en producción. Una
  medición contra NIM es una corrida puntual y explícita, aparte.
- KL-S-032 y KL-S-036 se interpretan como «bajo demanda», no «nightly».

## Alternativas descartadas

| Alternativa | Por qué no |
| --- | --- |
| Pegar al chatbot de producción / NIM | Quema la cuota del sitio |
| Faithfulness en cada PR | Gasto y rate-limit innecesarios |
| Cron nightly obligatorio | No aporta frente a bajo demanda |
| Ollama como default de CI | Frágil en Actions; mide otro modelo |
