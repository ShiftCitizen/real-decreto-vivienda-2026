## ADDED Requirements

### Requirement: Sin llamadas a LLM en retrieval
La suite de retrieval SHALL completarse en menos de 2 segundos y SHALL NOT llamar a ningún proveedor LLM ni a `POST /api/chat`.

#### Scenario: Ejecución local o CI
- **WHEN** se ejecuta `npm run eval:retrieval` (o el job de CI equivalente)
- **THEN** solo se importan libs locales y se leen índices construidos; no hay requests a NIM, Mistral ni al origen del sitio

### Requirement: Recall@1 en single-intent
Para casos `single_intent`, el harness SHALL exigir que al menos un fichero que coincida con `topics_esperados[0]` quede en posición 1 (Recall@1 >= 90% sobre el conjunto).

#### Scenario: Match de título literal
- **WHEN** la consulta coincide exactamente con un título del bundle
- **THEN** esa entrada queda en posición 1 (banda literal)

### Requirement: Recall@4 en multi-part
Para casos `multi_part`, el harness SHALL exigir al menos N topics distintos de `topics_esperados` en el top-4, donde N es el número de partes (2, 3 o 4), con Recall@4 >= 85% sobre el conjunto.

#### Scenario: Pregunta de cuatro partes
- **WHEN** se evalúa una pregunta de 4 partes con cuatro topics esperados
- **THEN** `seleccionar()` / `partesDe()` recupera al menos cuatro topics distintos entre los esperados en el top-4

### Requirement: Scope gate al 100%
Para casos `scope_gate`, el harness SHALL exigir negativa sin LLM (saludo, solo stopwords, o fuera de ámbito legal-adyacente) con 100% de acierto.

#### Scenario: Saludo
- **WHEN** la consulta es «hola, buenos días»
- **THEN** se detecta como saludo / sin contenido útil y no se llama al modelo

#### Scenario: Fuera de ámbito
- **WHEN** la consulta es legal-adyacente pero no del análisis del sitio
- **THEN** el resultado es negativa (sin evidencia) sin llamada a LLM

### Requirement: Validez estructural de citas
Para respuestas o fixtures con marcadores `[n]`, el harness SHALL verificar que cada `href` empieza por `/`, no termina en `.md`, y existe en `search-index.json` (o en las fuentes del montaje OKF). Tras `ajustarCitas()`, los marcadores SHALL apuntar al orden correcto del array `fuentes`.

#### Scenario: Href de fuente OKF
- **WHEN** una fuente del eval tiene `href` de página anclada
- **THEN** el `href` es válido según las reglas anteriores

### Requirement: Sin falsos positivos vacíos
Cuando no hay topic que coincida, `seleccionar()` SHALL devolver vacío / null y el harness SHALL tratarlo como negativa, no como acierto.

#### Scenario: Consulta sin solape
- **WHEN** la consulta no tiene raíces de contenido del bundle
- **THEN** el resultado es vacío y el caso de scope/out-of-scope pasa
