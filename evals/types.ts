export const CATEGORIAS = [
  'scope_gate',
  'single_intent',
  'multi_part',
  'broad',
  'numeric_contamination',
  'citation_validity',
  'state_inclusion',
  /** Paráfrasis informales: se reportan aparte; no diluyen Recall@1 de single_intent. */
  'paraphrase',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export type ViaRetrieval = 'okf' | 'buscar';

export type CasoEval = {
  id: string;
  pregunta: string;
  categoria: Categoria;
  topics_esperados?: string[];
  must_mention?: string[];
  must_not_mention?: string[];
  respuesta_esperada?: string;
  min_topics?: number;
  niega?: boolean;
  /** Por defecto okf; `buscar` para paráfrasis medidas en chat-check. */
  via?: ViaRetrieval;
};

export function esCategoria(v: unknown): v is Categoria {
  return typeof v === 'string' && (CATEGORIAS as readonly string[]).includes(v);
}
