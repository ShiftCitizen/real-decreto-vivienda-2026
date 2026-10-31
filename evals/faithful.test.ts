import { describe, expect, it } from 'vitest';

/**
 * KL-S-032 — faithfulness on-demand (ADR 0001).
 * En CI de PR este test se salta sin MISTRAL_API_KEY.
 * Corrida completa: `npm run eval:faithfulness`.
 */
describe('KL-S-032 faithfulness', () => {
  it('no usa NIM; requiere Mistral bajo demanda', () => {
    expect(process.env.NIM_API_KEY, 'NIM_API_KEY no debe estar definida en evals').toBeFalsy();
    if (!process.env.MISTRAL_API_KEY) {
      console.log('SKIP faithfulness: sin MISTRAL_API_KEY (on-demand)');
      return;
    }
    expect(process.env.MISTRAL_API_KEY.length).toBeGreaterThan(0);
  });
});
