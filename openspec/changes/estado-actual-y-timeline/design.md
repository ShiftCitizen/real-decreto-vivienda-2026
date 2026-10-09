## Context

Ver propuesta (Why) y specs `estado-actual` y `timeline`. Estado medido el 8-10-2026: el banner ya menciona los nuevos decretos en un cuarto párrafo, pero el lead de la FAQ «¿Está en vigor ya?» empieza por «No.», `FRASE_ESTADO` dice que ningún decreto está en vigor y el system prompt de `POST /api/chat` ordena presentar la derogación como regla de primer orden. `CRONOLOGIA` (`lib/cronologia.ts`) ya trae los hitos del 6/7/8-10 y futuros. Gates: `typecheck`, `build` (auditoría 0), `check:chat` (fallan P3/P5/P10 por ranking, pendiente de decisión del piloto; este change no los toca).

## Goals / Non-Goals

- Goals: reordenar la prioridad al estado vigente en las 6 superficies (banner, `/estado`, FAQ, SIEMPRE, `FRASE_ESTADO`, prompt); timeline desde datos.
- Non-Goals: reescribir el análisis de medidas para los RDL 28/2026 y 29/2026 (ya existe en `okf/rdl28` y `okf/rdl29`); cambiar el scoring de `buscar()`/`seleccionar()`; tocar `vercel.json` o CI.

## Decisions

- **Reordenar, no reescribir.** El historial conserva redacción y cifras; solo cambian leads, primeros párrafos y el orden de presentación. Alternativa (reescribir páginas para los nuevos decretos) descartada: duplicaría el análisis y rompería deep links y citas.
- **`FRASE_ESTADO` fechada y vigente.** Nueva formulación con fecha de comprobación y los tres estados (29 en vigor, 28 pendiente, 26/27 derogados). Los tests la importan, así que siguen valiendo sin cambios.
- **Timeline como componente servidor sin estado.** `components/Timeline.tsx` mapea `CRONOLOGIA` a `ol > li > time + p`; reutiliza `.box`/tipografía existentes más ~20 líneas CSS (rail + punto burdeos, variables dark-mode). Alternativa Mermaid descartada: exige dependencia npm y no aporta nada a una lista fechada.
- **Entradas de cronología sin tocar salvo hito ausente.** Si falta el hito del voto cuando ocurra, se añade a `CRONOLOGIA` y el gráfico lo hereda.

## Risks / Trade-offs

- [Editar SIEMPRE y descripciones OKF mueve pesos de rareza] → `check:chat` tras cada cambio; si P3/P5/P10 empeoran, parar y reportar en vez de tocar constantes.
- [Nueva sección indexada altera `buscar()`] → el gate de paráfrasis y OFF lo cubre; verificar.
- [`FRASE_ESTADO` se desactualiza con cada flash] → aceptado: el workflow de flash ya bumpea fechas; el test lo exige exacto a propósito.

## Migration Plan

Rama corta desde `flash/rdl-28-29-2026-7-oct`, PR contra `main`, merge = despliegue; verificar `readySubstate`. Rollback: revert del merge (contenido fechado, sin migraciones).

## Open Questions

Ninguna que cambie specs o tareas.
