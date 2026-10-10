## Context

Ver proposal.md (Why). Medido sobre el árbol: la portada titula 26/27 en H1, `<title>`, meta/OG, lead e intro; las FIGURAS citan 26/27 con nota «derogado — no se aplica»; las páginas de análisis describen los derogados como objeto. Existen `okf/rdl28` y `okf/rdl29` ya verificados contra ambos BOE (leídos íntegros el 8-10). Gates: `typecheck`, `build` (auditoría 0), `check:chat` (P3/P5/P10 en rojo por ranking, decisión del piloto; no tocar scoring ni expectativas aquí).

## Goals / Non-Goals

- Goals: Fase 1 portada completa y verificada; Fase 2 planificada con base verificada.
- Non-Goals: cambiar URLs o anchors; tocar el scoring de búsqueda/chat; reabrir la aritmética de la Diputación (sigue pendiente de voto).

## Decisions

- **Título «RDL 29/2026 y 28/2026»** (grande primero, como «26 y 27»): el 29 es el paquete vigente y el que rige hoy; el 28 le sigue. Alternativa numérica (28 y 29, orden BOE) descartada por romper el patrón que el lector ya conoce.
- **FIGURAS re-etiquetadas, no reescritas.** Los 9 valores se mantienen porque están verificados en los nuevos BOE (70 %, 31-12-2030, 30 %, 2.000 M€, 280 M€, 0 %, 150 %, 1 M€, 12 rentas); solo cambian `norma`, `cita` y `nota`. Excepción: la multa de plataformas pasa de `lau 43.2 vía rdl26` a `lau 43.2 vía rdl29` (Título V reescrito como arts. 38-47 en el 29/2026, sanción en el 43.2); la indemnización pasa a `lau 10.1 vía rdl28` (artículo único).
- **Orden portada: callout → En 1 minuto → cifras → votación → cronología → tercer sector → FAQ.** El callout (7-10) ya es lo más nuevo; «Resultado de la votación» baja como historial pero conserva todo.
- **Fase 2 con `okf/rdl28|rdl29` como fuente.** Evita re-verificar desde cero; cada cifra migrada remite a su BOE.
- **Tono de citas:** los nuevos decretos usan tono neutro (solo 26/27 tienen color propio); la leyenda se amplía con una línea para 28/29.

## Risks / Trade-offs

- [Nueve FIGURAS con citas nuevas] → verificación figura a figura contra los PDF ya leídos; auditoría a 0 como red.
- [Reordenar secciones mueve anclas de posición, no sus ids] → deep links intactos; el índice se regenera solo.
- [Fase 2 grande] → queda planificada en tasks.md, no ejecutada aquí.

## Migration Plan

Rama corta, PR contra `main`, merge = despliegue; verificar `readySubstate`. Rollback: revert.

## Open Questions

Ninguna.
