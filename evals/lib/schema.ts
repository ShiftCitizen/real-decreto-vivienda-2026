export const CATEGORIAS = [
  'scope_gate',
  'single_intent',
  'multi_part',
  'broad',
  'numeric_contamination',
  'citation_validity',
  'state_inclusion',
] as const;

export type Categoria = (typeof CATEGORIAS)[number];

export type CasoEval = {
  id: string;
  pregunta: string;
  categoria: Categoria;
  topics_esperados?: string[];
  must_mention?: string[];
  must_not_mention?: string[];
  respuesta_esperada?: string;
  /** Mínimo de topics distintos esperados en top-4 (multi_part). */
  min_topics?: number;
  /** Si true, se espera negativa / sin evidencia. */
  niega?: boolean;
};

export function esCategoria(v: unknown): v is Categoria {
  return typeof v === 'string' && (CATEGORIAS as readonly string[]).includes(v);
}
