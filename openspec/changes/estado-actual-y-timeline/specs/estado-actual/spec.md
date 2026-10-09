## Purpose

Garantizar que cualquier superficie del sitio y del chatbot presenta primero el estado normativo vigente (qué rige hoy) y relega el historial de derogación a su lugar, sin borrarlo.

## ADDED Requirements

### Requirement: Prioridad del estado vigente
El sitio SHALL mostrar primero el estado vigente con este orden: RDL 29/2026 en vigor desde el 8-10-2026 pendiente de convalidación; RDL 28/2026 publicado, con entrada en vigor prevista el 15-11-2026 solo si se convalida; RDL 26/2026 y 27/2026 derogados el 2-10-2026 como historial.

#### Scenario: Lector abre la portada
- **WHEN** un visitante carga la portada
- **THEN** el primer bloque de estado que ve describe los RDL 29/2026 y 28/2026 vigentes/publicados, y la derogación del 2-10 aparece después como historial.

#### Scenario: Pregunta de estado al chatbot
- **WHEN** un visitante pregunta «¿Cuál es el estado actual de los decretos?» o «¿Está en vigor ya?»
- **THEN** la respuesta menciona primero el RDL 29/2026 en vigor desde el 8-10 y el RDL 28/2026 pendiente, y después la derogación de los RDL 26/2026 y 27/2026.

### Requirement: Historial intacto
El sitio SHALL conservar sin reescribir la derogación del 2-10-2026 (votos, fechas, consecuencias), la cronología, las tablas de medidas y las fichas de normas de los decretos derogados.

#### Scenario: Auditoría del historial
- **WHEN** se revisa el diff de un flash de estado
- **THEN** ninguna línea eliminada contiene cifras de votación ni fechas de derogación, salvo bumps de «Última revisión» ordenados.

### Requirement: Sin negaciones de vigencia en presente
Ningún texto del sitio ni del chatbot SHALL afirmar en presente que «nada está en vigor» o que «los decretos no están en vigor» mientras el RDL 29/2026 esté vigente.

#### Scenario: Gate del chat
- **WHEN** se ejecuta `npm run check:chat`
- **THEN** la comprobación «ninguna página publicada niega la entrada en vigor» pasa y `FRASE_ESTADO` describe el estado vigente fechado.
