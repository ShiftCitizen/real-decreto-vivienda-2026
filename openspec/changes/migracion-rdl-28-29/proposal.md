## Why

Los RDL 26/2026 y 27/2026 son legacy: fueron derogados el 2-10-2026. El sitio, sin embargo, sigue titulado y narrado alrededor de ellos (H1, `<title>`, lead, intro, FIGURAS con «derogado — no se aplica»), mientras lo vigente (RDL 29/2026 en vigor desde el 8-10, RDL 28/2026 publicado) vive solo en un callout. Hay que invertir la narración: lo nuevo primero, lo derogado como historial.

## What Changes

- **Fase 1 (esta sesión): portada.** `<title>`, H1, meta/OG y lead hablan de los RDL 29/2026 y 28/2026; intro reescrita (96/99 páginas, seis títulos, artículo único); secciones reordenadas de nuevas a viejas; FIGURAS re-etiquetadas a 29/28 con citas verificadas contra ambos BOE; callout actualizado; 26/27 conservados como historial (votación, cronología, tablas).
- **Fase 2 (siguiente): análisis.** Migrar `desahucios-y-alquiler`, `fiscal`, `financiacion`, FAQ y resto de leads a los RDL 28/2026 y 29/2026 como normas vigentes, con los 26/27 como apéndice histórico, usando `okf/rdl28` y `okf/rdl29` como base ya verificada.
- URLs, anchors, citas existentes y datos de derogación: intactos.

## Capabilities

### New Capabilities

- `narrativa-portada`: titular, orden y textos de portada centrados en los decretos vigentes.
- `migracion-analisis`: páginas de análisis y FAQDescribiendo los RDL 28/2026 y 29/2026 como vigentes.

### Modified Capabilities

(none — no hay specs previas.)

## Impact

- Fase 1: `app/layout.tsx`, `app/page.tsx` (FIGURAS, H1, lead, intro, orden).
- Fase 2: `app/desahucios-y-alquiler/page.tsx`, `app/fiscal/page.tsx`, `app/financiacion/page.tsx`, `lib/faq.ts`, `app/estado/page.tsx`, espejos OKF.
- Gates obligatorios: `typecheck`, `build` (auditoría 0), `check:chat` en verde. Sin cambios de arquitectura.
