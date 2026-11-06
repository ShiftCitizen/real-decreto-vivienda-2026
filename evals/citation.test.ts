import { describe, expect, it } from 'vitest';
import { ajustarCitas } from '@/lib/citas';
import './setup';
import { casos, indice, okf } from './setup';
import {
  citaSoportaPasaje,
  citasMarcadas,
  esReparacionFuente1,
  hrefAnclaExacta,
  hrefValido,
  recuperar,
} from './lib/harness';

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

/**
 * Soporte de pasaje (fechas, negación, actor, decreto). Un match de página
 * base o la reparación a fuente [1] no cuentan como evidencia de soporte.
 */
describe('KL-S-034 citation passage support', () => {
  const pasajesEstado = [
    {
      href: '/estado/#situacion-de-cada-medida',
      texto:
        'Prórroga indefinida de cinco y siete años e indemnización de doce mensualidades. No en vigor. Art. único del RDL 28/2026: no está en vigor —entrada prevista el 15-11-2026— y está pendiente de convalidación.',
    },
    {
      href: '/estado/#nuevos-decretos',
      texto:
        'RDL 29/2026 entró en vigor el 8 de octubre de 2026. RDL 28/2026 no está en vigor, prevista 15-11-2026.',
    },
    {
      href: '/#indemnizacion',
      texto:
        'Aún no: el artículo único del RDL 28/2026 no está en vigor (entrada prevista el 15-11-2026 si se convalida).',
    },
    {
      href: '/#desahucio',
      texto:
        'la administración tiene dos meses para ofrecer otra vivienda o pagar o consignar la deuda (art. 5.Dos RDL 29/2026).',
    },
  ];

  it('negación + fecha: ancla correcta soporta; ancla equivocada falla', () => {
    const ok = citaSoportaPasaje(
      '/estado/#situacion-de-cada-medida',
      ['no está en vigor', '15-11-2026', 'RDL 28/2026'],
      pasajesEstado,
    );
    expect(ok.ok, ok.reason).toBe(true);

    const wrongAnchor = citaSoportaPasaje(
      '/estado/#nuevos-decretos',
      ['indemnización de doce mensualidades'],
      pasajesEstado,
    );
    expect(wrongAnchor.ok).toBe(false);
    expect(wrongAnchor.reason).toMatch(/missing phrase|page-base/);
  });

  it('page-only match no basta para un claim de pasaje', () => {
    const r = citaSoportaPasaje(
      '/estado/#fila-que-no-existe',
      ['no está en vigor', '15-11-2026'],
      pasajesEstado,
    );
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('page-base match without required anchor/passage');
  });

  it('actor: administración paga; atribuir al tribunal no está soportado', () => {
    const admin = citaSoportaPasaje(
      '/#desahucio',
      ['administración tiene dos meses', 'pagar o consignar'],
      pasajesEstado,
    );
    expect(admin.ok, admin.reason).toBe(true);

    const tribunal = citaSoportaPasaje(
      '/#desahucio',
      ['el tribunal paga la deuda'],
      pasajesEstado,
    );
    expect(tribunal.ok).toBe(false);
  });

  it('decreto: indemnización apunta a RDL 28, no a RDL 29 como régimen vigente', () => {
    const r28 = citaSoportaPasaje(
      '/#indemnizacion',
      ['RDL 28/2026', 'no está en vigor', '15-11-2026'],
      pasajesEstado,
    );
    expect(r28.ok, r28.reason).toBe(true);

    const r29AsIfCurrent = citaSoportaPasaje(
      '/#indemnizacion',
      ['RDL 29/2026 está en vigor y trae la indemnización'],
      pasajesEstado,
    );
    expect(r29AsIfCurrent.ok).toBe(false);
  });

  it('hrefAnclaExacta rechaza match solo de página', () => {
    const conAncla = indice.find((e) => e.href.includes('#'));
    expect(conAncla).toBeTruthy();
    const base = conAncla!.href.split('#')[0] || '/';
    expect(hrefValido(base, indice)).toBe(true);
    // La página base puede existir como entrada propia; lo que importa es que
    // una ancla inventada sobre esa base no pase el check exacto.
    expect(hrefAnclaExacta(`${base}#ancla-inexistente-xyz`, indice)).toBe(false);
    expect(hrefAnclaExacta(conAncla!.href, indice)).toBe(true);
  });

  it('reparación a fuente [1] sin marcadores no cuenta como soporte citado', () => {
    const sinMarcas = 'El RDL 28/2026 no está en vigor todavía.';
    expect(citasMarcadas(sinMarcas)).toEqual([]);
    expect(esReparacionFuente1(sinMarcas, 3)).toBe(true);
    const reparado = ajustarCitas(sinMarcas, 3);
    expect(reparado.fuentes).toEqual([1]);
    // Distinguible: hubo reparación, no citas del autor de la respuesta.
    expect(esReparacionFuente1(sinMarcas, 3)).toBe(true);
    expect(esReparacionFuente1('Según [2] no está en vigor.', 3)).toBe(false);
  });
});
