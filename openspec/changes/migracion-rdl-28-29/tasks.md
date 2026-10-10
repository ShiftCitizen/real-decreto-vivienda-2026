## 1. Portada (Fase 1, esta sesión)

- [x] 1.1 Retitular: H1, `<title>`, meta `description` y OG a «RDL 29/2026 y 28/2026», y verificar en el HTML construido que no queda «26/2026 y 27/2026» en ninguno de ellos.
- [x] 1.2 Reescribir lead e intro (99 páginas, veintiún artículos en seis títulos; artículo único del 28/2026) con citas a `rdl29`/`rdl28`, y verificar auditoría a 0.
- [x] 1.3 Re-etiquetar las 9 FIGURAS (`norma`, `cita`, `nota`) a los decretos vigentes verificados, y verificar figura a figura contra los BOE.
- [x] 1.4 Reordenar secciones (callout → En 1 minuto → cifras → votación → cronología → tercer sector → FAQ) y verificar el orden en el HTML construido.
- [x] 1.5 Pasar el gate (`typecheck`, `build`, `check:chat`) sin empeorar P3/P5/P10.

## 2. Análisis (Fase 2, siguiente)

- [x] 2.1 Migrar `desahucios-y-alquiler` (lead + secciones) a 28/2026 y 29/2026 vigentes con 26/2026 como histórico, y verificar auditoría a 0.
- [x] 2.2 Migrar `fiscal` y `financiacion` con el mismo criterio, y verificar auditoría a 0.
- [x] 2.3 Migrar FAQ (`lib/faq.ts` + espejos OKF) al régimen vigente con historial fechado, y verificar `check:chat` en verde.
- [ ] 2.4 Pasar el gate completo y abrir PR con el estado de gates en el cuerpo.
