import { NORMAS, type NormaId } from '@/lib/normas';

type Props = {
  /**
   * Which norm the article belongs to. Required and typed as a `NormaId`, so
   * writing "art. 1" without saying which decree or law is a compile error rather
   * than a review comment someone can miss.
   */
  norma: NormaId;
  /**
   * The article reference itself, e.g. "10.1", "disposición final quinta.1".
   * Optional only together with `soloNorma`, which renders the norm tag alone.
   */
  art?: string;
  /**
   * Label override for refs that are not articles, e.g. "artículo único",
   * "DA 1.ª". Defaults to "art.".
   */
  label?: string;
  /** Renders only the coloured norm tag, with no article reference. */
  soloNorma?: boolean;
};

/**
 * An article reference that always names its norm.
 *
 * Two decrees with an "artículo 1" each, plus the LAU, the LEC, the LIRPF and
 * five more, make a bare "art. 1" actively misleading. The tag is coloured by
 * tone so the two decrees are distinguishable at a glance: burgundy for the
 * RDL 26/2026, teal for the RDL 27/2026, neutral grey for everything else.
 */
export default function Cite({ norma, art, label = 'art.', soloNorma = false }: Props) {
  const norm = NORMAS[norma];
  // A real <cite>, not a <span>: the postbuild citation audit removes <cite>
  // elements before searching for bare "art. N", so the tag has to be semantic.
  // A span would make the audit fail on this site's own correct citations.
  //
  // A reference that starts with a digit is a bare article number and takes the
  // label; one that already spells itself out ("disposición final quinta.1")
  // does not, or it would render "art. disposición final quinta.1". Callers
  // therefore pass `art: '1.2'` or `art: 'disposición final quinta.1'`.
  const ref = art && /^\d/.test(art) ? `${label} ${art}` : art;

  return (
    <cite className="cite" data-norma={norma}>
      {!soloNorma && (
        <span className="cite-art">{ref}</span>
      )}
      <span className={`cite-norma tono-${norm.tono}`}>{norm.etiqueta}</span>
    </cite>
  );
}
