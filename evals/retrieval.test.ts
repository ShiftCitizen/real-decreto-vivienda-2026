import { join } from 'node:path';
import { describe, expect, it, beforeAll } from 'vitest';
import { ajustarCitas } from '@/lib/citas';
import { cargarCasos } from './lib/cargar-casos';
import {
  cargarIndices,
  comoBuscar,
  comoOkf,
  coincideTopic,
  esNegativaScope,
  hrefValido,
} from './lib/harness';
import type { CasoEval } from './lib/schema';
import type { EntradaIndice } from '@/lib/busqueda';
import type { TablaOkf } from '@/lib/okf';

const dirCasos = join(import.meta.dirname, 'cases');

let indice: EntradaIndice[];
let okf: TablaOkf;
let casos: CasoEval[];

const metricas = {
  single: { ok: 0, total: 0 },
  multi: { ok: 0, total: 0 },
  scope: { ok: 0, total: 0 },
};

beforeAll(() => {
  ({ indice, okf } = cargarIndices());
  casos = cargarCasos(dirCasos);
});

describe('eval corpus loader', () => {
  it('carga casos con id unico y categorias validas', () => {
    expect(casos.length).toBeGreaterThanOrEqual(10);
    const ids = new Set(casos.map((c) => c.id));
    expect(ids.size).toBe(casos.length);
  });
});

describe('retrieval evals', () => {
  it('scope gate 100% y recall metrics', () => {
    const scope = casos.filter((c) => c.categoria === 'scope_gate');
    for (const c of scope) {
      metricas.scope.total += 1;
      const niega = esNegativaScope(c.pregunta, okf);
      expect(niega, `caso ${c.id}: esperaba negativa`).toBe(true);
      metricas.scope.ok += 1;
    }

    const singles = casos.filter((c) => c.categoria === 'single_intent');
    for (const c of singles) {
      metricas.single.total += 1;
      const r = comoOkf(c.pregunta, okf);
      expect(r.niega, `caso ${c.id}: no debia negar`).toBe(false);
      const esperados = c.topics_esperados ?? [];
      expect(esperados.length, `caso ${c.id}: falta topics_esperados`).toBeGreaterThan(0);
      const primero = r.hrefs[0] ?? '';
      const primerTitulo = r.titulos[0] ?? '';
      expect(
        esperados.some((t) => coincideTopic([primero], t, [primerTitulo])),
        `caso ${c.id}: esperado uno de [${esperados.join(', ')}] en pos 1, got ${r.hrefs.join(' | ')} (${primerTitulo})`,
      ).toBe(true);
      for (const bad of c.must_not_mention ?? []) {
        expect(
          r.hrefs.some((h) => h.includes(bad)),
          `caso ${c.id}: no debia aparecer ${bad} en ${r.hrefs.join(' | ')}`,
        ).toBe(false);
      }
      metricas.single.ok += 1;
    }

    const multis = casos.filter((c) => c.categoria === 'multi_part');
    for (const c of multis) {
      metricas.multi.total += 1;
      const r = comoOkf(c.pregunta, okf);
      expect(r.niega, `caso ${c.id}: no debia negar`).toBe(false);
      const topics = c.topics_esperados ?? [];
      const hits = topics.filter((t) => coincideTopic(r.hrefs, t, r.titulos));
      const min = c.min_topics ?? Math.min(2, topics.length);
      expect(
        hits.length,
        `caso ${c.id}: esperaba >=${min} topics de [${topics.join(', ')}], got hrefs ${r.hrefs.join(' | ')}`,
      ).toBeGreaterThanOrEqual(min);
      for (const bad of c.must_not_mention ?? []) {
        expect(
          r.hrefs.some((h) => h.includes(bad)),
          `caso ${c.id}: no debia aparecer ${bad}`,
        ).toBe(false);
      }
      metricas.multi.ok += 1;
    }

    for (const c of casos.filter((x) => x.categoria === 'numeric_contamination')) {
      // Misma vía que chat-check midió: el índice (`buscar`), no solo OKF.
      const r = comoBuscar(c.pregunta, indice);
      expect(r.niega, `caso ${c.id}`).toBe(false);
      const t0 = c.topics_esperados?.[0];
      if (t0) {
        expect(coincideTopic(r.hrefs, t0, r.titulos), `caso ${c.id}: topic ${t0}`).toBe(true);
      }
      for (const m of c.must_mention ?? []) {
        expect(r.contexto.includes(m), `caso ${c.id}: must_mention ${m}`).toBe(true);
      }
    }

    for (const c of casos.filter((x) => x.categoria === 'state_inclusion')) {
      const r = comoOkf(c.pregunta, okf);
      expect(r.niega, `caso ${c.id}`).toBe(false);
      for (const t of c.topics_esperados ?? []) {
        expect(
          coincideTopic(r.hrefs, t, r.titulos),
          `caso ${c.id}: topic ${t} en ${r.hrefs.join(' | ')}`,
        ).toBe(true);
      }
      for (const m of c.must_mention ?? []) {
        expect(
          r.contexto.includes(m) || r.titulos.some((t) => t.includes(m)),
          `caso ${c.id}: must_mention ${m}`,
        ).toBe(true);
      }
    }

    for (const c of casos.filter((x) => x.categoria === 'citation_validity')) {
      const r = comoOkf(c.pregunta, okf);
      expect(r.niega, `caso ${c.id}`).toBe(false);
      for (const href of r.hrefs) {
        expect(hrefValido(href, indice), `caso ${c.id}: href invalido ${href}`).toBe(true);
      }
    }

    const recall1 = metricas.single.total
      ? metricas.single.ok / metricas.single.total
      : 1;
    const recall4 = metricas.multi.total ? metricas.multi.ok / metricas.multi.total : 1;
    const scopeAcc = metricas.scope.total ? metricas.scope.ok / metricas.scope.total : 1;

    // Informe legible en CI
    console.log(
      JSON.stringify(
        {
          RecallAt1: recall1,
          RecallAt4: recall4,
          ScopeGate: scopeAcc,
          single: metricas.single,
          multi: metricas.multi,
          scope: metricas.scope,
        },
        null,
        2,
      ),
    );

    expect(recall1).toBeGreaterThanOrEqual(0.9);
    expect(recall4).toBeGreaterThanOrEqual(0.85);
    expect(scopeAcc).toBe(1);
  });
});

describe('ajustarCitas (KL-S-034)', () => {
  it('renumera y deja solo las citadas', () => {
    const { texto, fuentes } = ajustarCitas('Ver [1] y luego [3] nada de [9].', 4);
    expect(fuentes).toEqual([1, 3]);
    expect(texto).toBe('Ver [1] y luego [2] nada de [9].');
  });
});
