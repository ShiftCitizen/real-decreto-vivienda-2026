## ADDED Requirements

### Requirement: Retrieval en CI sin secrets de LLM
El workflow de CI SHALL poder ejecutar los evals de retrieval sin `MISTRAL_API_KEY` ni `NIM_API_KEY`, tras generar (o reutilizar) `search-index.json` y `okf-index.json` vía `npm run build`.

#### Scenario: PR con retrieval rojo
- **WHEN** retrieval falla en el job de PR (si está cableado)
- **THEN** el merge queda bloqueado y el log lista los `id` de caso fallidos

### Requirement: Faithfulness solo bajo demanda en Actions
Si existe job de faithfulness en GitHub Actions, SHALL ser `workflow_dispatch` (u otro disparo manual), con `MISTRAL_API_KEY` en secrets del repo/org, y SHALL NOT ser un cron nightly obligatorio.

#### Scenario: Sin cron
- **WHEN** se inspecciona `.github/workflows/evals.yml`
- **THEN** no hay `schedule:` que ejecute faithfulness a diario

### Requirement: Informes de métricas
Cuando se recojan métricas, el harness SHALL emitir informe JSON y/o Markdown con Recall@1, Recall@4, Scope Gate, Citation Validity, Faithfulness (si se corrió), Latency y Cost (si aplica).

#### Scenario: Fin de retrieval
- **WHEN** termina `eval:retrieval`
- **THEN** el informe incluye al menos Recall@1, Recall@4 y Scope Gate
