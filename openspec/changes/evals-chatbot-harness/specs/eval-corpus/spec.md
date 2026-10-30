## ADDED Requirements

### Requirement: Dataset estructurado de preguntas
El harness SHALL cargar casos de prueba desde YAML o JSON con al menos los campos: `id`, `pregunta`, `categoria`, `topics_esperados[]`, `must_mention[]`, `must_not_mention[]`, y opcionalmente `respuesta_esperada` (golden).

#### Scenario: Carga válida
- **WHEN** el harness lee `evals/cases/*.yaml` (o JSON equivalente)
- **THEN** parsea cada caso con los campos anteriores y falla con el `id` del caso si falta un campo obligatorio

### Requirement: Categorías de caso
Cada caso SHALL declarar una `categoria` entre: `scope_gate`, `single_intent`, `multi_part`, `broad`, `numeric_contamination`, `citation_validity`, `state_inclusion`.

#### Scenario: Categoría scope_gate
- **WHEN** un caso tiene `categoria: scope_gate`
- **THEN** el harness espera negativa fija sin llamada a LLM (`esSaludo` / sin palabras de contenido / fuera de ámbito)

#### Scenario: Categoría single_intent
- **WHEN** un caso tiene `categoria: single_intent`
- **THEN** el harness espera que `seleccionar()` coloque un fichero de `topics_esperados[0]` en posición 1

#### Scenario: Categoría multi_part
- **WHEN** un caso tiene `categoria: multi_part`
- **THEN** el harness espera al menos dos topics distintos de `topics_esperados` en el top-4

### Requirement: Fallos con diagnóstico
Cada aserción fallida SHALL reportar `id` del caso, valor esperado y valor actual.

#### Scenario: Fallo de topic
- **WHEN** el topic recuperado no coincide con `topics_esperados`
- **THEN** el mensaje de error incluye el `id`, los topics esperados y los topics obtenidos con posiciones
