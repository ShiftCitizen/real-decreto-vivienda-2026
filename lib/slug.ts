/**
 * Shared slug function for heading anchors.
 *
 * Accent-insensitive on purpose: a deep link should be writable by hand
 * ("/desahucios-y-alquiler#df-5"), and nobody types a tilde into a URL bar.
 *
 * Lives in lib/ rather than scripts/ because both the TSX pages and the
 * postbuild index script need it. A second copy in scripts/ would be duplicated
 * logic, and duplicated slug logic silently breaks every deep link the day the
 * two disagree.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-{2,}/g, '-');
}
