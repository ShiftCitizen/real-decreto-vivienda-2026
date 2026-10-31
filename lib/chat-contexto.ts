/**
 * Montaje de contexto para el asistente y para el experimento de baseline.
 *
 * Producción usa siempre `ContextMode = 'retrieval'` (vía `armarEvidencia` con
 * ese modo, o `seleccionar` + `montarContexto` con `PRESUPUESTO_DEFECTO`).
 * Los modos `retrieval-large` y `full` son **solo para evals** — la ruta
 * `/api/chat` no lee `CONTEXT_MODE`.
 */
import {
  MAX_FICHERS_DEFECTO,
  SIEMPRE_RUTAS,
  TOPE_FICHERO_DEFECTO,
  seleccionar,
  type Evidencia,
  type TablaOkf,
} from '@/lib/okf';

/** Presupuesto de caracteres del contexto en producción. */
export const PRESUPUESTO_DEFECTO = 7000;

/**
 * Arm C: presupuesto ampliado (~×2.86).
 * TOPE y MAX escalan en la misma proporción (2400→6857, 4→11).
 */
export const PRESUPUESTO_LARGE = 20_000;
export const TOPE_FICHERO_LARGE = Math.round(
  (TOPE_FICHERO_DEFECTO * PRESUPUESTO_LARGE) / PRESUPUESTO_DEFECTO,
); // 6857
export const MAX_FICHERS_LARGE = Math.round(
  (MAX_FICHERS_DEFECTO * PRESUPUESTO_LARGE) / PRESUPUESTO_DEFECTO,
); // 11

export type ContextMode = 'retrieval' | 'retrieval-large' | 'full';

export type Fuente = { titulo: string; href: string };

export type EvidenciaRuta = Fuente & { texto: string; estado?: boolean };

/**
 * Monta el contexto que ve el modelo, y las fuentes que lo sostienen.
 *
 * El número del bloque (`### [n]`) es el mismo que el de la fuente, y ambos
 * cuentan desde 1: es lo que permite que `ajustarCitas()` renumere a la vez
 * el texto y la lista. `ajustarCitas` acepta `[1]`…`[99]`, así que 46 fuentes
 * del modo `full` caben sin cambiar el patrón.
 */
export function montarContexto(
  evidencia: EvidenciaRuta[],
  presupuesto: number,
): { contexto: string; fuentes: Fuente[] } {
  const bloque: string[] = [];
  const fuentes: Fuente[] = [];
  let gastado = 0;
  for (const [i, e] of evidencia.entries()) {
    if (gastado >= presupuesto) break;
    const texto = `### [${i + 1}] ${e.titulo}\n${e.texto}`.slice(0, presupuesto - gastado);
    bloque.push(texto);
    gastado += texto.length;
    fuentes.push({ titulo: e.titulo, href: e.href });
  }
  return { contexto: bloque.join('\n\n'), fuentes };
}

/**
 * Todo el bundle: un bloque por fichero (cuerpo completo), SIEMPRE al final
 * si aún no estaban (ya suelen estar en la tabla).
 */
export function evidenciaCompleta(tabla: TablaOkf): Evidencia[] {
  const temas: Evidencia[] = [];
  const estados: Evidencia[] = [];
  for (const f of tabla.ficheros) {
    const e: Evidencia = {
      titulo: f.titulo,
      href: f.href,
      texto: f.cuerpo.trim(),
      ...((SIEMPRE_RUTAS as readonly string[]).includes(f.ruta)
        ? { estado: true as const }
        : {}),
    };
    if (!e.texto) continue;
    if (e.estado) estados.push(e);
    else temas.push(e);
  }
  return [...temas, ...estados];
}

export function presupuestoDeModo(mode: ContextMode): number {
  if (mode === 'full') return Number.POSITIVE_INFINITY;
  if (mode === 'retrieval-large') return PRESUPUESTO_LARGE;
  return PRESUPUESTO_DEFECTO;
}

/**
 * Arma evidencia según el brazo del experimento.
 * `null` = fuera de ámbito (misma puerta que producción).
 */
export function armarEvidencia(
  pregunta: string,
  tabla: TablaOkf,
  mode: ContextMode = 'retrieval',
): Evidencia[] | null {
  if (mode === 'full') {
    // Scope gate: si seleccionar rechaza, no contestamos con el bundle entero.
    const puerta = seleccionar(pregunta, tabla);
    if (puerta === null) return null;
    return evidenciaCompleta(tabla);
  }
  if (mode === 'retrieval-large') {
    return seleccionar(pregunta, tabla, {
      maxFicheros: MAX_FICHERS_LARGE,
      topeFichero: TOPE_FICHERO_LARGE,
    });
  }
  return seleccionar(pregunta, tabla);
}

export function aEvidenciaRuta(ev: Evidencia[]): EvidenciaRuta[] {
  return ev.map((e) => ({
    titulo: e.titulo,
    href: e.href,
    texto: e.texto,
    estado: e.estado === true,
  }));
}
