/**
 * Fecha de «Última revisión» por ruta. Solo se sube cuando el contenido de esa
 * página se ha contrastado de nuevo; no se copia una fecha global a páginas
 * sin revisar.
 */
export const REVISIONES: Record<string, string> = {
  '/': '22 de octubre de 2026',
  '/desahucios-y-alquiler': '22 de octubre de 2026',
  '/fiscal': '22 de octubre de 2026',
  '/financiacion': '22 de octubre de 2026',
  '/estado': '22 de octubre de 2026',
  '/normas': '22 de octubre de 2026',
  '/contacto': '22 de octubre de 2026',
};

export function revisionDe(href: string): string {
  return REVISIONES[href] ?? REVISIONES['/'];
}
