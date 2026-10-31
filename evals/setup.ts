import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll } from 'vitest';
import { cargarCasos } from './loader';
import { cargarIndices } from './lib/harness';
import type { CasoEval } from './types';
import type { EntradaIndice } from '@/lib/busqueda';
import type { TablaOkf } from '@/lib/okf';

const root = join(fileURLToPath(new URL('.', import.meta.url)));

export let indice: EntradaIndice[];
export let okf: TablaOkf;
export let casos: CasoEval[];

beforeAll(() => {
  ({ indice, okf } = cargarIndices());
  casos = cargarCasos(join(root, 'cases'));
});
