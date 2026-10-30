import { describe, expect, it } from 'vitest';
import './setup';
import { casos, okf } from './setup';
import { esNegativaScope } from './lib/harness';

describe('KL-S-033 scope gate', () => {
  it('100% negativa sin LLM en casos scope_gate', () => {
    const scope = casos.filter((c) => c.categoria === 'scope_gate');
    expect(scope.length).toBeGreaterThanOrEqual(15);
    for (const c of scope) {
      expect(esNegativaScope(c.pregunta, okf), `caso ${c.id}`).toBe(true);
    }
  });
});
