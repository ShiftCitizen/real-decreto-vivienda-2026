## Purpose

Definir cómo la portada narra la situación vigente (RDL 29/2026 y 28/2026 primero) manteniendo la derogación del 2-10-2026 como historial verificable.

## ADDED Requirements

### Requirement: Titular centrado en lo vigente
El H1, el `<title>` y la descripción (incluido OpenGraph) SHALL nombrar los RDL 29/2026 y 28/2026 y su estado, no los derogados.

#### Scenario: Lector abre la portada
- **WHEN** un visitante carga `/`
- **THEN** el H1 nombra los RDL 29/2026 y 28/2026 y el lead describe su estado (29 en vigor desde el 8-10, 28 pendiente).

#### Scenario: Compartir enlace
- **WHEN** se comparte la URL en una red social
- **THEN** la tarjeta muestra el título y la descripción vigentes, sin afirmar derogaciones que ya no describen lo que rige.

### Requirement: Orden inverso con historial intacto
Las secciones SHALL ir de nuevas a viejas (estado actual, En 1 minuto, cifras vigentes, votación 2-10, cronología, tercer sector, FAQ) y SHALL conservar íntegros votos, fechas y consecuencias de la derogación.

#### Scenario: Auditoría del diff
- **WHEN** se revisa el diff
- **THEN** ninguna línea eliminada contiene cifras de votación ni fechas de derogación, salvo bumps de «Última revisión».

### Requirement: Cifras vigentes verificadas
Cada FIGURA SHALL citar la norma vigente que la contiene (`rdl29`/`rdl28`) con el artículo verificado contra su BOE, y su `norma` SHALL ser el decreto vigente correspondiente.

#### Scenario: Auditoría de citas
- **WHEN** se ejecuta `npm run build`
- **THEN** la auditoría pasa a 0 y cada cifra enlaza a su ficha de norma.
