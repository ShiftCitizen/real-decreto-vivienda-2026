import Cite from '@/components/Cite';
import { CRONOLOGIA } from '@/lib/cronologia';

/**
 * Visual timeline of the decrees, rendered from CRONOLOGIA — the same data
 * that feeds the homepage table and the search index, so the graphic can
 * never drift from them. Server component, no state: an ordered list with
 * real <time> elements, printable and screen-reader friendly.
 *
 * Order is the array order (most relevant first, as in the table), not
 * calendar order: some entries are relative dates ("6 meses") that cannot
 * be sorted reliably.
 */
export default function Timeline() {
  return (
    <ol className="timeline">
      {CRONOLOGIA.map((hito, i) => (
        <li key={`${hito.fecha}-${i}`} className="timeline-hito">
          <time dateTime={aISO(hito.fecha) ?? undefined}>{hito.fecha}</time>
          <p>
            {hito.que}{' '}
            {hito.citas.map((cita) => (
              <Cite key={`${cita.norma}-${cita.art}`} norma={cita.norma} art={cita.art} />
            ))}
          </p>
        </li>
      ))}
    </ol>
  );
}

/** "15-11-2026" -> "2026-11-15" for <time dateTime>; relative dates stay unmarked. */
function aISO(fecha: string): string | null {
  const m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(fecha);
  if (!m) return null;
  const [, d, mo, y] = m;
  return `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
