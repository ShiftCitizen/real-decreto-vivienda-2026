import { describe, expect, it } from 'vitest';
import {
  MAX_FICHERS_LARGE,
  PRESUPUESTO_DEFECTO,
  PRESUPUESTO_LARGE,
  TOPE_FICHERO_LARGE,
  armarEvidencia,
  aEvidenciaRuta,
  montarContexto,
  presupuestoDeModo,
} from '@/lib/chat-contexto';
import { MAX_FICHERS_DEFECTO, TOPE_FICHERO_DEFECTO } from '@/lib/okf';
import { casos, okf } from './setup';

/**
 * Smoke del experimento de contexto (sin LLM).
 * La corrida completa con modelo: `npm run eval:context` (requiere MISTRAL_API_KEY).
 * No forma parte del workflow de PR.
 */
describe('context baseline plumbing', () => {
  it('arm C escala presupuesto/tope/max proporcionalmente', () => {
    expect(PRESUPUESTO_DEFECTO).toBe(7000);
    expect(PRESUPUESTO_LARGE).toBe(20_000);
    expect(TOPE_FICHERO_LARGE).toBe(
      Math.round((TOPE_FICHERO_DEFECTO * PRESUPUESTO_LARGE) / PRESUPUESTO_DEFECTO),
    );
    expect(MAX_FICHERS_LARGE).toBe(
      Math.round((MAX_FICHERS_DEFECTO * PRESUPUESTO_LARGE) / PRESUPUESTO_DEFECTO),
    );
  });

  it('retrieval y full montan fuentes numerables para ajustarCitas ([1]..[99])', () => {
    const sample =
      casos.find((c) => c.categoria === 'multi_part') ??
      casos.find((c) => c.categoria === 'single_intent');
    expect(sample).toBeTruthy();
    const pregunta = sample!.pregunta;

    const a = armarEvidencia(pregunta, okf, 'retrieval');
    expect(a).not.toBeNull();
    const ca = montarContexto(aEvidenciaRuta(a!), presupuestoDeModo('retrieval'));
    expect(ca.fuentes.length).toBeGreaterThan(0);
    expect(ca.fuentes.length).toBeLessThanOrEqual(99);
    expect(ca.contexto).toContain('### [1]');

    const b = armarEvidencia(pregunta, okf, 'full');
    expect(b).not.toBeNull();
    expect(b!.length).toBeGreaterThan(a!.length);
    const cb = montarContexto(aEvidenciaRuta(b!), presupuestoDeModo('full'));
    expect(cb.fuentes.length).toBe(b!.length);
    expect(cb.fuentes.length).toBeLessThanOrEqual(99);

    const c = armarEvidencia(pregunta, okf, 'retrieval-large');
    expect(c).not.toBeNull();
  });

  it('documenta que eval:context es manual (skip sin clave en CI de PR)', () => {
    if (!process.env.MISTRAL_API_KEY) {
      console.log('SKIP full context-baseline: sin MISTRAL_API_KEY (manual only)');
      return;
    }
    expect(process.env.MISTRAL_API_KEY.length).toBeGreaterThan(0);
  });
});
