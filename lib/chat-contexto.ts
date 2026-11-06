/**
 * Montaje de contexto del asistente.
 *
 * Extraído de `app/api/chat/route.ts` para que el harness de evals
 * (faithfulness) reutilice el mismo presupuesto y el mismo `montarContexto`
 * sin arrancar Next. Producción y evals de retrieval usan solo este módulo;
 * los brazos retrieval-large / full del experimento de contexto viven en
 * otra rama (`evals/context-baseline-experiment`), no aquí.
 */
import type { Evidencia } from '@/lib/okf';

/** Presupuesto de caracteres del contexto en producción. */
export const PRESUPUESTO_DEFECTO = 7000;

export type Fuente = { titulo: string; href: string };

/** Una evidencia con su texto: lo que ve el modelo, o lo que ve el plan B. */
export type EvidenciaRuta = Fuente & { texto: string; estado?: boolean };

/**
 * Monta el contexto que ve el modelo, y las fuentes que lo sostienen.
 *
 * El número del bloque (`### [n]`) es el mismo que el de la fuente, y ambos
 * cuentan desde 1: es lo que permite que `ajustarCitas()` renumere a la vez
 * el texto y la lista.
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

export function aEvidenciaRuta(ev: Evidencia[]): EvidenciaRuta[] {
  return ev.map((e) => ({
    titulo: e.titulo,
    href: e.href,
    texto: e.texto,
    estado: e.estado === true,
  }));
}
