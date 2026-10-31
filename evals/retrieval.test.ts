import { describe, expect, it } from 'vitest';
import './setup';
import { casos, indice, okf } from './setup';
import { coincideTopic, recuperar } from './lib/harness';

describe('KL-S-030 corpus', () => {
  it('carga >=80 casos con id unico', () => {
    expect(casos.length).toBeGreaterThanOrEqual(80);
    expect(new Set(casos.map((c) => c.id)).size).toBe(casos.length);
  });
});

describe('KL-S-031 recall@k', () => {
  it('Recall@1 >= 90% en single_intent', () => {
    const singles = casos.filter((c) => c.categoria === 'single_intent');
    const fallos: string[] = [];
    let ok = 0;
    for (const c of singles) {
      const r = recuperar(c, okf, indice);
      const esperados = c.topics_esperados ?? [];
      const hit =
        !r.niega &&
        esperados.some((t) => coincideTopic([r.hrefs[0] ?? ''], t, [r.titulos[0] ?? '']));
      if (hit) ok += 1;
      else fallos.push(`${c.id} → ${r.hrefs[0] ?? '(niega)'} (${r.titulos[0] ?? ''})`);
    }
    const recall = ok / singles.length;
    expect(recall, `Recall@1=${recall.toFixed(3)}; fallos: ${fallos.slice(0, 8).join(' | ')}`).toBeGreaterThanOrEqual(0.9);
  });

  it('sin evidencia cuando no hay topic (scope ya cubre; OKF null)', () => {
    const r = recuperar(
      { id: 'x', pregunta: 'receta de tortilla de patatas', categoria: 'scope_gate' },
      okf,
      indice,
    );
    expect(r.niega).toBe(true);
  });
});

describe('KL-S-030 numeric + state', () => {
  it('numeric_contamination no se sesga solo por el número', () => {
    for (const c of casos.filter((x) => x.categoria === 'numeric_contamination')) {
      const r = recuperar(c, okf, indice);
      expect(r.niega, c.id).toBe(false);
      const esperados = c.topics_esperados ?? [];
      expect(
        esperados.some((t) => coincideTopic(r.hrefs, t, r.titulos)),
        `${c.id}: ${r.hrefs.join(' | ')}`,
      ).toBe(true);
      for (const m of c.must_mention ?? []) {
        expect(r.contexto.includes(m), `${c.id} must_mention ${m}`).toBe(true);
      }
    }
  });

  it('state_inclusion lleva los ficheros SIEMPRE', () => {
    for (const c of casos.filter((x) => x.categoria === 'state_inclusion')) {
      const r = recuperar(c, okf, indice);
      expect(r.niega, c.id).toBe(false);
      for (const t of c.topics_esperados ?? []) {
        expect(coincideTopic(r.hrefs, t, r.titulos), `${c.id} ${t}`).toBe(true);
      }
    }
  });
});

describe('KL-S-030 broad', () => {
  it('responderAmplia devuelve texto con citas', async () => {
    const { ampliaOk } = await import('./lib/harness');
    const broads = casos.filter((c) => c.categoria === 'broad');
    expect(broads.length).toBeGreaterThanOrEqual(3);
    for (const c of broads) {
      expect(ampliaOk(c.pregunta), c.id).toBe(true);
    }
  });
});
