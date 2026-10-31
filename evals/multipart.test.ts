import { describe, expect, it } from 'vitest';
import './setup';
import { casos, indice, okf } from './setup';
import { coincideTopic, recuperar } from './lib/harness';

describe('KL-S-035 multi-part coverage', () => {
  it('cada caso alcanza min_topics de topics_esperados (Recall@4 suite >= 85%)', () => {
    const multis = casos.filter((c) => c.categoria === 'multi_part');
    expect(multis.length).toBeGreaterThanOrEqual(3);
    let ok = 0;
    for (const c of multis) {
      const r = recuperar(c, okf, indice);
      expect(r.niega, c.id).toBe(false);
      const topics = c.topics_esperados ?? [];
      const hits = topics.filter((t) => coincideTopic(r.hrefs, t, r.titulos));
      const min = c.min_topics ?? 2;
      const pass = hits.length >= min;
      if (pass) ok += 1;
      expect(
        pass,
        `caso ${c.id}: hits=${hits.length} min=${min} hrefs=${r.hrefs.join(' | ')}`,
      ).toBe(true);
      for (const bad of c.must_not_mention ?? []) {
        expect(r.hrefs.some((h) => h.includes(bad)), `${c.id} ${bad}`).toBe(false);
      }
    }
    expect(ok / multis.length).toBeGreaterThanOrEqual(0.85);
  });
});
