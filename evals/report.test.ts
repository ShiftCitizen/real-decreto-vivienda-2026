import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import './setup';
import { casos, indice, okf } from './setup';
import {
  ampliaOk,
  coincideTopic,
  esNegativaScope,
  hrefValido,
  recuperar,
} from './lib/harness';
import { escribirInforme, ratio, type Contador, type InformeEvals } from './metrics';

describe('eval report', () => {
  it('escribe JSON y Markdown con métricas umbral', () => {
    const t0 = Date.now();
    const single: Contador = { ok: 0, total: 0 };
    const multi: Contador = { ok: 0, total: 0 };
    const scope: Contador = { ok: 0, total: 0 };
    const citation: Contador = { ok: 0, total: 0 };

    for (const c of casos.filter((x) => x.categoria === 'scope_gate')) {
      scope.total += 1;
      if (esNegativaScope(c.pregunta, okf)) scope.ok += 1;
    }
    for (const c of casos.filter((x) => x.categoria === 'single_intent')) {
      single.total += 1;
      const r = recuperar(c, okf, indice);
      const hit =
        !r.niega &&
        (c.topics_esperados ?? []).some((t) =>
          coincideTopic([r.hrefs[0] ?? ''], t, [r.titulos[0] ?? '']),
        );
      if (hit) single.ok += 1;
    }
    for (const c of casos.filter((x) => x.categoria === 'multi_part')) {
      multi.total += 1;
      const r = recuperar(c, okf, indice);
      const hits = (c.topics_esperados ?? []).filter((t) =>
        coincideTopic(r.hrefs, t, r.titulos),
      );
      if (!r.niega && hits.length >= (c.min_topics ?? 2)) multi.ok += 1;
    }
    for (const c of casos.filter((x) => x.categoria === 'citation_validity')) {
      citation.total += 1;
      const r = recuperar(c, okf, indice);
      if (!r.niega && r.hrefs.every((h) => hrefValido(h, indice))) citation.ok += 1;
    }
    for (const c of casos.filter((x) => x.categoria === 'broad')) {
      expect(ampliaOk(c.pregunta), c.id).toBe(true);
    }

    const informe: InformeEvals = {
      RecallAt1: ratio(single),
      RecallAt4: ratio(multi),
      ScopeGate: ratio(scope),
      CitationValidity: ratio(citation),
      Faithfulness: null,
      LatencyMs: Date.now() - t0,
      Cost: null,
      corpusSize: casos.length,
      single,
      multi,
      scope,
      citation,
    };

    const outDir = join(fileURLToPath(new URL('.', import.meta.url)), 'reports');
    escribirInforme(informe, outDir);

    expect(informe.corpusSize).toBeGreaterThanOrEqual(80);
    expect(informe.RecallAt1).toBeGreaterThanOrEqual(0.9);
    expect(informe.RecallAt4).toBeGreaterThanOrEqual(0.85);
    expect(informe.ScopeGate).toBe(1);
    expect(informe.CitationValidity).toBe(1);
    // El umbral <2s de la spec aplica al job de retrieval en CI aislado;
    // este test agrega todo el corpus y escribe informes.
    expect(informe.LatencyMs).toBeLessThan(15_000);
  });
});
