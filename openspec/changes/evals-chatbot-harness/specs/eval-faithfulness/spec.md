## ADDED Requirements

### Requirement: Proveedor Mistral aparte del sitio
El eval de faithfulness SHALL llamar a la API de Mistral con `MISTRAL_API_KEY` y SHALL NOT usar `NIM_API_KEY` ni `POST /api/chat` de producción o preview.

#### Scenario: Arranque sin clave NIM
- **WHEN** se ejecuta el eval de faithfulness con `MISTRAL_API_KEY` definida y sin `NIM_API_KEY`
- **THEN** el eval corre normalmente

#### Scenario: Intento de usar el sitio
- **WHEN** el código del harness se audita
- **THEN** no hay fetch al origen de producción ni lectura de `NIM_API_KEY` en la ruta de faithfulness

### Requirement: Cadencia bajo demanda
El eval de faithfulness SHALL ejecutarse solo bajo demanda según ADR 0001: cambio de prompt, cadena de modelos / `NIM_MODEL_ID`, montaje de contexto, `ajustarCitas()`, o regeneración de baseline. SHALL NOT ser cron diario obligatorio ni parte del gate por defecto de cada PR.

#### Scenario: workflow_dispatch
- **WHEN** un operador lanza faithfulness a mano o vía `workflow_dispatch`
- **THEN** se evalúan ~20 golden questions y se compara con el baseline

#### Scenario: PR de solo contenido
- **WHEN** un PR solo toca OKF / FAQ / páginas
- **THEN** el job por defecto de PR no ejecuta faithfulness

### Requirement: Claims soportados por evidencia
Para cada respuesta del modelo, el harness SHALL comprobar que los claims están soportados por la evidencia recuperada (heurística: solape / substring / citas; umbral faithfulness >= 95% sobre el conjunto). Un claim no soportado SHALL marcarse con el texto concreto.

#### Scenario: Plan B verbatim
- **WHEN** la respuesta tiene origen texto (plan B, pasajes recuperados)
- **THEN** se considera fiel automáticamente

#### Scenario: Claim inventado
- **WHEN** la respuesta afirma una cifra o sanción ausente de la evidencia
- **THEN** el caso falla y el informe nombra el claim

### Requirement: Baseline versionado
El harness SHALL guardar respuestas (o hashes/resúmenes acordados) en `evals/fixtures/baseline-responses.json` y, ante regresión frente al baseline, SHALL fallar y reportar el diff.

#### Scenario: Regresión detectada
- **WHEN** una golden diverge del baseline más allá del umbral
- **THEN** el job falla con el diff del caso
