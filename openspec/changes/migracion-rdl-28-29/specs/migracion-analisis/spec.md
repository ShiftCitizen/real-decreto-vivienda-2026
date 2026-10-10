## Purpose

Migrar las páginas de análisis y la FAQ para que describan los RDL 28/2026 y 29/2026 como normas vigentes, conservando los RDL 26/2026 y 27/2026 como referencia histórica.

## ADDED Requirements

### Requirement: Análisis sobre normas vigentes
Cada página de análisis SHALL describir primero el régimen vigente (28/2026 o 29/2026) con citas a esos decretos, y relegar el contenido derogado a bloques históricos marcados.

#### Scenario: Lector en Desahucios y alquiler
- **WHEN** un visitante lee la página
- **THEN** el lead y la primera pantalla describen lo vigente, y lo derogado aparece etiquetado como historial con sus fechas.

### Requirement: Base verificada
Toda cifra migrada SHALL estar verificada contra el BOE del decreto vigente correspondiente (`okf/rdl28` y `okf/rdl29` sirven de base); lo no verificable SHALL eliminarse, no matizarse.

#### Scenario: Revisión de una cifra
- **WHEN** una cifra no se localiza en el BOE vigente
- **THEN** se elimina de la página en vez de conservarla con el decreto derogado como fuente.

### Requirement: FAQ vigente
La FAQ SHALL responder primero con el régimen vigente y conservar las respuestas post-votación del 2-10 como historial fechado.

#### Scenario: Chat sobre medidas
- **WHEN** se pregunta por una medida (renta, desahucio, indemnización)
- **THEN** la evidencia y la respuesta parten de lo vigente en 28/2026 y 29/2026.
