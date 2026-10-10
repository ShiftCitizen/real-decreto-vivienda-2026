# timeline Specification

## Purpose
Ofrecer en la página de estado un gráfico de línea de tiempo legible que ordene cómo se ha llegado al estado vigente, generado desde los datos existentes.

## Requirements

### Requirement: Timeline generado desde datos
La página de estado SHALL incluir un gráfico de línea de tiempo generado desde `CRONOLOGIA` (`lib/cronologia.ts`), sin duplicar fechas en otro fichero de datos.

#### Scenario: Nuevo hito
- **WHEN** se añade una entrada a `CRONOLOGIA` y se reconstruye
- **THEN** el gráfico muestra el nuevo hito sin ningún otro cambio.

### Requirement: Accesibilidad e impresión
El gráfico SHALL ser una lista ordenada con fechas `time`, legible con lector de pantalla, con contraste suficiente en modo claro y oscuro, e imprimible con el CSS de impresión existente.

#### Scenario: Lector de pantalla
- **WHEN** un lector recorre la línea de tiempo
- **THEN** anuncia cada hito como elemento de lista con su fecha.

#### Scenario: Impresión
- **WHEN** se imprime la página de estado
- **THEN** la línea de tiempo aparece completa sin recortes ni scroll.

### Requirement: Sin dependencias nuevas
El gráfico SHALL implementarse con HTML/CSS del proyecto (ampliación mínima de `app/globals.css`); no SHALL añadir dependencias, frameworks ni scripts CDN.

#### Scenario: Build
- **WHEN** se ejecuta `npm run build`
- **THEN** termina con exit 0 sin paquetes nuevos en `package.json`.
