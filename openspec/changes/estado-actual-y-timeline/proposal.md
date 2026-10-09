## Why

El chatbot y los bloques de estado responden con la foto del 2-10-2026 (RDL 26/2026 y 27/2026 derogados) y relegan los decretos que rigen hoy: el RDL 29/2026 está en vigor desde el 8-10-2026 y el RDL 28/2026 está publicado con vigencia prevista el 15-11-2026. El lector debe ver primero qué rige hoy, sin perder el rastro de cómo se llegó hasta aquí (derogación del 2-10, cronología, votaciones).

## What Changes

- Nuevo bloque **Estado actual** con prioridad visual: en el banner (`AvisoEstado`), al inicio de `/estado` y como primera evidencia del chatbot. Dice, en este orden: 29/2026 en vigor desde el 8-10 pendiente de convalidación; 28/2026 publicado, vigor 15-11 solo si se convalida; 26/2026 y 27/2026 derogados el 2-10 (historial).
- El historial se conserva intacto: cronología, sección de votación del 2-10, tablas de medidas, FAQ post-votación y fichas de normas. Nada de lo derogado se reescribe; solo se reordena la prioridad.
- Actualizar los textos que aún niegan vigencia en presente: lead de la FAQ «¿Está en vigor ya?» («No.» obsoleto), primer bloque de `okf/faq/esta-en-vigor.md`, `FRASE_ESTADO` en `lib/amplia.ts` y el system prompt de `POST /api/chat`.
- Añadir un gráfico de línea de tiempo en `/estado` generado desde `CRONOLOGIA` (`lib/cronologia.ts`): componente `Timeline`, estilos en `app/globals.css`, accesible (`ol` + `time`) y apto para impresión. Sin dependencias nuevas ni CDN.

## Capabilities

### New Capabilities

- `estado-actual`: reglas de qué estado se muestra primero y con qué textos en banner, página de estado, FAQ y chatbot.
- `timeline`: gráfico de línea de tiempo generado desde la cronología de datos.

### Modified Capabilities

(none — no hay specs previas; `openspec/specs/` está vacío.)

## Impact

- `app/page.tsx`, `app/estado/page.tsx`, `components/AvisoEstado.tsx`, `lib/estado-votacion.ts`, `lib/faq.ts`, `lib/amplia.ts`, `app/api/chat/route.ts`, `okf/estado/*.md`, `okf/faq/esta-en-vigor.md`.
- Nuevo: `components/Timeline.tsx`; estilos en `app/globals.css`; `lib/cronologia.ts` solo si falta algún hito.
- Sin cambios de arquitectura: todo sigue estático salvo `POST /api/chat`. Gates obligatorios: `typecheck`, `build` (auditoría 0), `check:chat` en verde.
