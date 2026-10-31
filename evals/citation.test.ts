import { describe, expect, it } from 'vitest';
import { ajustarCitas } from '@/lib/citas';
import './setup';
import { casos, indice, okf } from './setup';
import { hrefValido, recuperar } from './lib/harness';

describe('KL-S-034 citation accuracy', () => {
  it('hrefs de citation_validity empiezan por / y no son .md', () => {
    const lista = casos.filter((c) => c.categoria === 'citation_validity');
    expect(lista.length).toBeGreaterThanOrEqual(5);
    for (const c of lista) {
      const r = recuperar(c, okf, indice);
      expect(r.niega, c.id).toBe(false);
      for (const href of r.hrefs) {
        expect(hrefValido(href, indice), `${c.id} ${href}`).toBe(true);
      }
    }
  });

  it('ajustarCitas renumera y alinea fuentes', () => {
    const { texto, fuentes } = ajustarCitas('Ver [1] y luego [3] nada de [9].', 4);
    expect(fuentes).toEqual([1, 3]);
    expect(texto).toBe('Ver [1] y luego [2] nada de [9].');
  });
});
