## 1. Estado vigente primero

- [x] 1.1 Reordenar el banner `AvisoEstado` (vía `lib/estado-votacion.ts` si basta): el estado vigente (29/2026 en vigor, 28/2026 pendiente) antes que la derogación del 2-10, y verificar en el HTML construido que el orden es ese.
- [x] 1.2 Reescribir el lead de la FAQ «¿Está en vigor ya?» en `lib/faq.ts` y el primer bloque de `okf/faq/esta-en-vigor.md` para que respondan primero lo vigente, y verificar con `npm run check:chat` que la pregunta recupera el fichero con el texto nuevo.
- [x] 1.3 Actualizar `FRASE_ESTADO` en `lib/amplia.ts` (fechada, tres estados) y el system prompt de `app/api/chat/route.ts`, y verificar que `check:chat` sigue exigiendo la frase exacta una vez por respuesta amplia.
- [x] 1.4 Añadir el bloque de estado vigente al inicio de `okf/estado/situacion-de-cada-medida.md` sin borrar el histórico, y verificar que el filtro SIEMPRE de `seleccionar()` lo incluye.

## 2. Timeline

- [x] 2.1 Crear `components/Timeline.tsx` (servidor, sin estado) que mapea `CRONOLOGIA` a `ol` con `time`, y verificar que renderiza todos los hitos en el HTML construido.
- [x] 2.2 Añadir estilos mínimos en `app/globals.css` (rail + punto, dark-mode, print) y verificar a 390px/320px que no hay scroll horizontal (`scrollWidth - clientWidth` por ruta).
- [x] 2.3 Insertar la sección con ancla en `app/estado/page.tsx` y verificar que `postbuild` genera la entrada de sección sin duplicar anclas y con auditoría a 0.

## 3. Verificación y entrega

- [x] 3.1 Pasar el gate completo (`typecheck`, `build`, `check:chat`) sin empeorar P3/P5/P10 y verificar greps (`en funciones` vacío, `Última revisión` donde toque).
- [x] 3.2 Commitear en rama corta, pushear y abrir PR contra `main` con el estado de gates en el cuerpo.
