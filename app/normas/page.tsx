import type { Metadata } from 'next';
import Link from 'next/link';
import Cite from '@/components/Cite';
import ScrollTable from '@/components/ScrollTable';
import { NORMAS, NORMA_IDS } from '@/lib/normas';
import { slugify } from '@/lib/slug';

export const metadata: Metadata = {
  title: 'Normas citadas',
  description:
    'Registro de los reales decretos-ley, leyes y reglamentos que se citan en el análisis, con su identificador BOE y su enlace permanente ELI.',
};

export default function NormasPage() {
  return (
    <>
      <h1>Normas citadas</h1>
      <p className="lead">
        Cada referencia a un artículo de este sitio nombra su norma. Esta es la lista completa, con
        el título oficial y el enlace permanente en el «BOE».
      </p>

      <p>
        Las dos primeras tienen color propio porque son los dos reales decretos-ley del sitio: el{' '}
        <b className="tono-rdl26">RDL 26/2026</b> y el <b className="tono-rdl27">RDL 27/2026</b>. El resto se identifica por la abreviatura que usa el propio BOE.
      </p>

      <ScrollTable label="Normas citadas en el análisis">
        <table>
          <thead>
            <tr>
              <th scope="col">Etiqueta</th>
              <th scope="col">Título oficial</th>
              <th scope="col">Identificador</th>
            </tr>
          </thead>
          <tbody>
            {NORMA_IDS.map((id) => {
              const norma = NORMAS[id];
              return (
                <tr key={id} id={id}>
                  <td>
                    <span className={`cite-norma tono-${norma.tono}`}>{norma.etiqueta}</span>
                  </td>
                  <td>{norma.titulo}</td>
                  <td>
                    {norma.eli ? (
                      <a href={norma.eli} rel="noreferrer">
                        {norma.boe ?? 'ELI'}
                      </a>
                    ) : (
                      norma.boe
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </ScrollTable>

      <h2 id={slugify('Los dos reales decretos-ley')}>Los dos reales decretos-ley</h2>

      <p>
        Ambos fueron aprobados en el Consejo de Ministros de 29 de septiembre de 2026 y
        suscritos por el Rey el mismo día; se publicaron con un día de diferencia. Los dos tienen{' '}
        su propio <b>art. 1 RDL 26/2026</b> y <b>art. 1 RDL 27/2026</b>, y por eso el color de la
        etiqueta es la única manera rápida de saber cuál se está citando.
      </p>

      <ul>
        <li>
          <b className="tono-rdl26">RDL 26/2026</b> — «BOE» núm. 241, de 30 de septiembre de 2026,
          páginas 127818 a 127913 (<b>96 páginas</b>). Veinte artículos en seis títulos y una
          disposición adicional primera, una segunda, tres transitorias, derogatoria única y once
          disposiciones finales. Entra en vigor el <b>1 de octubre de 2026</b>.{' '}
          <Cite norma="rdl26" art="disposición final undécima.1" />
        </li>
        <li>
          <b className="tono-rdl27">RDL 27/2026</b> — «BOE» núm. 243, de 1 de octubre de 2026 (
          <b>8 páginas</b>). Un <b>artículo único</b> que modifica el artículo 10 de la LAU, más
          dos disposiciones adicionales, una transitoria y dos finales. Entra en vigor el{' '}
          <b>2 de octubre de 2026</b>. <Cite norma="rdl27" art="disposición final segunda" />
        </li>
      </ul>

      <h2 id={slugify('Por qué importa distinguirlos')}>Por qué importa distinguirlos</h2>

      <p>
        El RDL 26/2026 <b>reforma</b> la LAU en veinte puntos; el RDL 27/2026 <b>reescribe</b> su
        artículo 10 de la LAU y nada más. Consecuencias que se confunden con frecuencia:
      </p>

      <ul>
        <li>
          El artículo 10 de la LAU según el <span className="tono-rdl27">RDL 27/2026</span> es el
          que <b>sustituye</b> las prórrogas anuales de hasta tres años; el artículo 10, apartado{' '}
          <b>Ocho</b> del <span className="tono-rdl26">RDL 26/2026</span> es el que lo había
          modificado antes, con otro régimen.{' '}
          <Cite norma="rdl26" art="3.Ocho" />
        </li>
        <li>
          La prórroga extraordinaria de la DF 5.ª pertenece al{' '}
          <span className="tono-rdl26">RDL 26/2026</span> y es de <b>dos años</b>; las dos
          prórrogas extraordinarias nuevas —un año por vulnerabilidad y hasta tres años en zona
          tensionada— están en el <span className="tono-rdl27">RDL 27/2026</span>.{' '}
          <Cite norma="rdl26" art="disposición final quinta.1" />{' '}
          <Cite norma="lau" art="10.5 y 10.6" />
        </li>
        <li>
          La disposición adicional primera del{' '}
          <span className="tono-rdl27">RDL 27/2026</span> es la que desplaza la prórroga
          extraordinaria de la DF 5.ª «cuando proceda la prórroga prevista en el artículo 10.1 de la
          Ley 29/1994». Su orden de aplicabilidad está en la{' '}
          <a href="/desahucios-y-alquiler#coordinacion">página de desahucios</a>.
        </li>
      </ul>

      <div className="box">
        <strong>Un caso donde conviene no «corregir» la cita del decreto.</strong>
        <p>
          El artículo 7 del RDL 26/2026 modifica la Ley del IVA en cuatro apartados, y dos de
          ellos se parecen mucho: el <b>apartado Tres</b> modifica, en la LIVA, el{' '}
          <b>artículo 91.Uno.2, número 10.º</b> —las obras de renovación y reparación, que es el
          tipo reducido del 10 %— y el <b>apartado Cuatro</b> modifica, en la LIVA, el{' '}
          <b>artículo 91.Dos.1, número 6.º</b> —las viviendas protegidas y las del régimen
          especial de arrendamiento de vivienda—. Es fácil intercambiarlos al citarlos; este sitio
          los distingue porque el resultado fiscal es distinto.
        </p>
      </div>

      <p className="page-meta">
        Última revisión: 1 de octubre de 2026.{' '}
        <Link href="/">Volver al resumen</Link>
      </p>
    </>
  );
}
