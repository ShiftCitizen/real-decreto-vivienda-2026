/**
 * Lógica de búsqueda compartida por /api/chat y la herramienta WebMCP
 * search_site.
 *
 * Intencionadamente sin dependencias del DOM para poder probarse en Node.
 *
 * Difiere a propósito de la paleta (SearchPalette), que pide la frase literal:
 * el chat es de un solo disparo — ante una paráfrasis no hay reformulación
 * posible, solo la negativa fija — así que aquí hay una reserva tolerante
 * (ver `buscar`). La paleta es interactiva y conserva su copia exacta para no
 * tocar un componente ya verificado.
 */

export type EntradaIndice = {
  type: string;
  title: string;
  href: string;
  section: string;
  keywords: string;
  excerpt?: string;
};

export type ResultadoBusqueda = {
  titulo: string;
  href: string;
  seccion: string;
  extracto: string;
  /** Texto completo indexado (respuesta FAQ íntegra o cuerpo de sección hasta MAX_BODY). */
  contexto: string;
  /** Puntuación interna (7 exacta … 1 solape parcial): sirve para desempatar. */
  puntos: number;
  /** Tipo de la entrada de índice de la que viene (page, section, faq, norma, autor). */
  tipo: string;
};

/** Minúsculas sin tildes, igual que en la paleta de búsqueda. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

// Palabras que no discriminan nada en preguntas en lenguaje natural
// («qué pueden esperar las SOCIMIs?» solo pregunta por «socimis»).
const VACIAS = new Set([
  'que',
  'qué',
  'puede',
  'pueden',
  'espera',
  'esperar',
  'esperan',
  'las',
  'los',
  'una',
  'para',
  'como',
  'cómo',
  'este',
  'esta',
  'estos',
  'estas',
  'ese',
  'esa',
  'del',
  'les',
]);

/**
 * Coincidencia tolerante con el plural: «socimis» vale si el texto trae
 * «socimi». Solo se prueba la forma sin -s final para palabras de cinco o
 * más letras, así «tres» nunca se convierte en «tre».
 */
function contiene(haystack: string, palabra: string): boolean {
  if (haystack.includes(palabra)) return true;
  if (palabra.length >= 5 && palabra.endsWith('s')) {
    return haystack.includes(palabra.slice(0, -1));
  }
  return false;
}

/**
 * Devuelve hasta `max` coincidencias ordenadas por relevancia. No lanza si
 * la consulta viene vacía: devuelve las páginas, como la paleta.
 *
 * Una frase completa solo coincide si aparece tal cual; si no, se exige que
 * *todas* las palabras (de dos o más letras) aparezcan entre título y
 * palabras clave, con bonus por las que estén en el título. Así una pregunta
 * larga en lenguaje natural devuelve algo útil en vez de vacío.
 *
 * Reserva tolerante: si la regla estricta no devuelve nada (una paráfrasis
 * con palabras que el texto no trae tal cual), se puntúa por solape parcial
 * y se devuelven las mejores, siempre que compartan al menos una palabra
 * sustancial (4+ letras) con la entrada. Las cortas (de, la, en…) coinciden
 * por subcadena en casi todo el índice, así que no cuentan para el listón:
 * sin eso, cualquier pregunta fuera de tema recuperaría contexto aleatorio
 * y la negativa fija de /api/chat —el cerrojo de ámbito— dejaría de
 * funcionar. Con cero solape sustancial se devuelve vacío, como antes.
 */
export function buscar(
  entradas: EntradaIndice[],
  consulta: string,
  max = 8,
): ResultadoBusqueda[] {
  const aguja = normalizar(consulta.trim());
  const palabras = aguja
    .split(/\s+/)
    .map((w) => w.replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, ''))
    .filter((w) => w.length >= 2 && !VACIAS.has(w));
  const candidatas: { entrada: EntradaIndice; puntos: number }[] = [];
  for (const entrada of entradas) {
    if (!aguja) {
      if (entrada.type === 'page') candidatas.push({ entrada, puntos: 1 });
      continue;
    }
    const titulo = normalizar(entrada.title);
    let puntos = 0;
    if (titulo === aguja) puntos = 7;
    else if (titulo.startsWith(aguja)) puntos = 6;
    else if (titulo.includes(aguja)) puntos = 5;
    else {
      const texto = `${titulo} ${normalizar(entrada.keywords)}`;
      if (palabras.length === 0 || !palabras.every((w) => contiene(texto, w))) continue;
      const enTitulo = palabras.filter((w) => contiene(titulo, w)).length;
      puntos = 2 + Math.min(enTitulo, 2);
    }
    candidatas.push({ entrada, puntos });
  }
  if (candidatas.length === 0 && palabras.length > 0) {
    const sustanciales = palabras.filter((w) => w.length >= 4);
    for (const entrada of entradas) {
      const titulo = normalizar(entrada.title);
      const texto = `${titulo} ${normalizar(entrada.keywords)}`;
      const aciertos = sustanciales.filter((w) => contiene(texto, w)).length;
      if (aciertos === 0) continue;
      const enTitulo = sustanciales.filter((w) => contiene(titulo, w)).length;
      candidatas.push({ entrada, puntos: 1 + Math.min(enTitulo, 1) });
    }
  }
  candidatas.sort((a, b) => b.puntos - a.puntos);
  return candidatas.slice(0, max).map(({ entrada, puntos }) => ({
    titulo: entrada.title,
    href: entrada.href,
    seccion: entrada.section,
    extracto: (entrada.excerpt ?? '').slice(0, 160),
    contexto: entrada.keywords,
    puntos,
    tipo: entrada.type,
  }));
}
