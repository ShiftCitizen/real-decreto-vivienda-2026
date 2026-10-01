'use client';

import { useEffect } from 'react';
import Cite from '@/components/Cite';
import { FAQ } from '@/lib/faq';

function openFromHash() {
  const id = window.location.hash.slice(1);
  if (!id) return;
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement && !target.open) {
    target.open = true;
  }
}

/**
 * Las entradas de tipo "faq" del índice de búsqueda enlazan a `/#<id>`, es decir
 * al id de un <details> cerrado. Sin esto el usuario pulsa un resultado y ve la
 * pregunta sin la respuesta.
 *
 * Hay que cubrir los dos caminos: montar (llegada desde otra ruta, o carga
 * directa con #id en la URL) y `hashchange` (el buscador navega por el router
 * del cliente y el componente no se remonta al cambiar sólo el hash).
 */
export default function FaqList() {
  useEffect(() => {
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, []);

  return (
    <div className="faq">
      {FAQ.map((item) => (
        <details className="faq-item" key={item.id} id={item.id}>
          <summary>{item.pregunta}</summary>
          <div className="faq-answer">
            {item.respuesta.map((parrafo, i) => (
              <p key={i}>{parrafo}</p>
            ))}
            <span className="cite-block">
              {item.citas.map((cita) => (
                <Cite key={`${cita.norma}-${cita.art}`} norma={cita.norma} art={cita.art} />
              ))}{' '}
            </span>
          </div>
        </details>
      ))}
    </div>
  );
}