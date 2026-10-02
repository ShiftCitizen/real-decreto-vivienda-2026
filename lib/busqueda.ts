/**
 * Lógica de búsqueda compartida con las herramientas WebMCP.
 *
 * Intencionadamente sin dependencias del DOM para poder probarse en Node.
 * La puntuación replica la de la paleta de búsqueda (SearchPalette): el
 * título manda y las palabras clave deciden el resto, todo sin tildes ni
 * mayúsculas. SearchPalette conserva su propia copia para no tocar un
 * componente ya verificado; si cambia el algoritmo, hay que cambiar ambos.
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
};

/** Minúsculas sin tildes, igual que en la paleta de búsqueda. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Devuelve hasta `max` coincidencias ordenadas por relevancia. No lanza si
 * la consulta viene vacía: devuelve las páginas, como la paleta.
 *
 * Una frase completa solo coincide si aparece tal cual; si no, se exige que
 * *todas* las palabras (de dos o más letras) aparezcan entre título y
 * palabras clave, con bonus por las que estén en el título. Así una pregunta
 * larga en lenguaje natural devuelve algo útil en vez de vacío.
 */
export function buscar(
  entradas: EntradaIndice[],
  consulta: string,
  max = 8,
): ResultadoBusqueda[] {
  const aguja = normalizar(consulta.trim());
  const palabras = aguja.split(/\s+/).filter((w) => w.length >= 2);
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
      if (palabras.length === 0 || !palabras.every((w) => texto.includes(w))) continue;
      const enTitulo = palabras.filter((w) => titulo.includes(w)).length;
      puntos = 2 + Math.min(enTitulo, 2);
    }
    candidatas.push({ entrada, puntos });
  }
  candidatas.sort((a, b) => b.puntos - a.puntos);
  return candidatas.slice(0, max).map(({ entrada }) => ({
    titulo: entrada.title,
    href: entrada.href,
    seccion: entrada.section,
    extracto: (entrada.excerpt ?? '').slice(0, 160),
  }));
}
