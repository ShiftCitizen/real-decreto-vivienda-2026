/**
 * Deja solo las fuentes citadas y renumera para que `[n]` siga apuntando a la
 * correcta. Extraído de la ruta del chat para poder evalarlo sin arrancar Next.
 */
export function ajustarCitas(
  respuesta: string,
  total: number,
): { texto: string; fuentes: number[] } {
  const citadas = [
    ...new Set(
      [...respuesta.matchAll(/\[(\d{1,2})\]/g)]
        .map((m) => Number(m[1]))
        .filter((n) => n >= 1 && n <= total),
    ),
  ].sort((a, b) => a - b);
  const usadas = citadas.length > 0 ? citadas : [1];
  const mapa = new Map(usadas.map((viejo, i) => [viejo, i + 1]));
  const texto = respuesta.replace(/\[(\d{1,2})\]/g, (marca, n) => {
    const viejo = Number(n);
    return mapa.has(viejo) ? `[${mapa.get(viejo)}]` : marca;
  });
  return { texto, fuentes: usadas };
}
