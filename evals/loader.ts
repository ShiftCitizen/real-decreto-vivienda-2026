import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { load as parseYaml } from 'js-yaml';
import { type CasoEval, esCategoria } from './types';

function asStringArray(v: unknown, id: string, campo: string): string[] | undefined {
  if (v === undefined || v === null) return undefined;
  if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) {
    throw new Error(`caso ${id}: ${campo} debe ser string[]`);
  }
  return v as string[];
}

function normalizarCaso(raw: unknown, fichero: string, indice: number): CasoEval {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`${fichero}[${indice}]: caso no es un objeto`);
  }
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === 'string' ? o.id : `${fichero}#${indice}`;
  if (typeof o.pregunta !== 'string' || !o.pregunta.trim()) {
    throw new Error(`caso ${id}: falta pregunta`);
  }
  if (!esCategoria(o.categoria)) {
    throw new Error(`caso ${id}: categoria invalida (${String(o.categoria)})`);
  }
  const via = o.via === 'buscar' || o.via === 'okf' ? o.via : undefined;
  return {
    id,
    pregunta: o.pregunta,
    categoria: o.categoria,
    topics_esperados: asStringArray(o.topics_esperados, id, 'topics_esperados'),
    must_mention: asStringArray(o.must_mention, id, 'must_mention'),
    must_not_mention: asStringArray(o.must_not_mention, id, 'must_not_mention'),
    respuesta_esperada: typeof o.respuesta_esperada === 'string' ? o.respuesta_esperada : undefined,
    min_topics: typeof o.min_topics === 'number' ? o.min_topics : undefined,
    niega: o.niega === true,
    via,
  };
}

/** Carga todos los YAML/JSON de `evals/cases/`. Falla con el id del caso. */
export function cargarCasos(dirCasos: string): CasoEval[] {
  const ficheros = readdirSync(dirCasos)
    .filter((f) => /\.(ya?ml|json)$/i.test(f))
    .sort();
  const casos: CasoEval[] = [];
  for (const f of ficheros) {
    const ruta = join(dirCasos, f);
    const texto = readFileSync(ruta, 'utf8');
    const parsed = f.endsWith('.json') ? JSON.parse(texto) : parseYaml(texto);
    const lista = Array.isArray(parsed) ? parsed : (parsed as { casos?: unknown })?.casos;
    if (!Array.isArray(lista)) {
      throw new Error(`${f}: se esperaba un array o { casos: [] }`);
    }
    lista.forEach((raw, i) => casos.push(normalizarCaso(raw, f, i)));
  }
  const ids = new Set<string>();
  for (const c of casos) {
    if (ids.has(c.id)) throw new Error(`id duplicado: ${c.id}`);
    ids.add(c.id);
  }
  return casos;
}
