/**
 * Logica de busqueda compartida por /api/chat y la herramienta WebMCP
 * search_site.
 *
 * Intencionadamente sin dependencias del DOM para poder probarse en Node.
 *
 * Difiere a proposito de la paleta (SearchPalette), que pide la frase literal:
 * el chat es de un solo disparo, asi que ante una parafrasis no hay
 * reformulacion posible, solo la negativa fija, y hace falta aqui una reserva
 * tolerante (ver `buscar`). La paleta es interactiva y conserva su copia
 * exacta para no tocar un componente ya verificado.
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
  /** Texto completo indexado (respuesta FAQ integra o cuerpo de seccion hasta MAX_BODY). */
  contexto: string;
  /**
   * Criterio de ordenacion, de mayor a menor: banda literal, luego el termino
   * mas raro que aparece en el titulo, luego el peso acumulado. Quien reordene
   * por aqui (lo hace /api/chat) respeta el mismo criterio.
   */
  puntos: number;
  /** Tipo de la entrada de indice de la que viene (page, section, faq, norma, autor). */
  tipo: string;
};

/** Minusculas sin tildes, igual que en la paleta de busqueda. */
export function normalizar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * Palabras que no distinguen un tema de otro.
 *
 * Antes eran veinte y dejaban pasar de todo. `me`, `por`, `con`, `en`, `es` o
 * `tengo` son tan cortas que aparecen en casi cualquier entrada, de modo que la
 * regla de "todas las palabras" se cumplia sola y el ranking seellia en si la
 * entrada decia o no "me". Medido: la pregunta "Que tiempo hace manana en
 * Madrid? recuperaba tres entradas de vivienda porque "hace" salia dentro de
 * "hacer" en un titulo.
 *
 * Solo palabras functionales, nunca de contenido: quitar "alquiler" o "renta"
 * seria cambiar el tema del sitio.
 */
const VACIAS = new Set([
  'es',
  'son',
  'esta',
  'estan',
  'estoy',
  'estar',
  'fue',
  'fueron',
  'ha',
  'han',
  'hay',
  'he',
  'puede',
  'pueden',
  'pueda',
  'puedo',
  'podria',
  'deberia',
  'tiene',
  'tienen',
  'tengo',
  'tenemos',
  // Copulas: no distinguen nada y en los titulos de las FAQ son casi la
  // mitad de la pregunta. En "¿Soy gran tenedor?" el indice veia una
  // coincidencia de titulo por "soy", un termino rarissimo en el sitio, y eso
  // solo bastaba para ganar: el titulo pesa mas que todo el cuerpo reunido.
  'soy',
  'eres',
  'somos',
  'sois',
  'sea',
  'ser',
  'sido',
  'fui',
  'haber',
  'hace',
  'hacer',
  'dime',
  'diganme',
  'explica',
  'explicame',
  'cuentame',
  'sabes',
  'que',
  'quien',
  'cual',
  'cuales',
  'cuando',
  'donde',
  'como',
  'pero',
  'para',
  'por',
  'con',
  'sin',
  'sobre',
  'entre',
  'hasta',
  'desde',
  'tras',
  'segun',
  'mediante',
  'respecto',
  'hacia',
  'cuyo',
  'cuya',
  'el',
  'la',
  'los',
  'las',
  'un',
  'una',
  'unos',
  'unas',
  'lo',
  'al',
  'del',
  'a',
  'y',
  'o',
  'u',
  'de',
  'su',
  'sus',
  'mi',
  'mis',
  'tu',
  'tus',
  'nuestro',
  'nuestra',
  'este',
  'esto',
  'estos',
  'estas',
  'ese',
  'esa',
  'eso',
  'esos',
  'esas',
  'aquel',
  'aquella',
  'cada',
  'otro',
  'otra',
  'otros',
  'otras',
  'mismo',
  'misma',
  'tan',
  'tales',
  'les',
  'nos',
]);

/**
 * Raiz aproximada de una palabra, para que "subida" y "subir", "alquileres" y
 * "alquiler", o "turistas" y "turisticos" se entiendan entre si.
 *
 * Es un recorte de sufijos, no un lemmatizador: el objetivo es que la pregunta
 * del visitante y el titulo de la entrada lleguen a la misma raiz, no producir
 * una raiz linguisticamente correcta. Un recorte de cuatro letras pega "medida"
 * con "medio"; por eso el prefijo solo cuenta para ordenar y la puerta se abre
 * con coincidencia fuerte.
 */
export function raiz(palabra: string): string {
  let p = palabra;
  const quitar = (sufijos: string[], minimo: number): void => {
    for (const s of sufijos) {
      if (p.endsWith(s) && p.length - s.length >= minimo) {
        p = p.slice(0, -s.length);
        return;
      }
    }
  };
  quitar(['es', 's'], 4);
  quitar(['as', 'os', 'a', 'o'], 5);
  quitar(
    ['amiento', 'imiento', 'aciones', 'acion', 'iciones', 'icion', 'idades', 'idad', 'mente'],
    4,
  );
  // Minimo 3 y no 4: "subido" mide 6, y recortar "ido" deja 3. Con el minimo
  // en 4 el recorte no se aplicaba y "subido" y "subir" quedaban como raices
  // distintas, que es justo el par que la pregunta y el titulo del FAQ usan.
  quitar(
    ['adoras', 'adores', 'adora', 'ador', 'antes', 'ante', 'idos', 'idas', 'ido', 'ida', 'ando', 'iendo'],
    3,
  );
  quitar(['ar', 'er', 'ir'], 3);
  quitar(['as', 'os', 'a', 'o', 'e'], 4);
  return p;
}

/**
 * Formas que cuentan como la MISMA palabra al comparar.
 *
 * La tolerancia al plural ya existia ("socimis" valia con "socimi"), pero se
 * comprobaba con `includes` sobre el texto entero, de modo que "alquiler"
 * encontraba "alquileres" por azar y no por regla. Aqui se comparan palabras
 * enteras, y la raiz amplia el margen a las variantes morfologicas.
 */
function formas(palabra: string): string[] {
  const v = new Set<string>([palabra, raiz(palabra)]);
  if (palabra.length >= 5) {
    if (palabra.endsWith('es')) v.add(palabra.slice(0, -2));
    if (palabra.endsWith('s')) v.add(palabra.slice(0, -1));
  }
  return [...v].filter(Boolean);
}

/**
 * Dos palabras son la misma si sus raices coinciden o una contiene a la otra.
 *
 * El recorte deja parejas desiguales: "subir" queda en "sub" y "subido" en
 * "subid". Compararlas con igualdad las separaria, que es justo el caso que
 * mas importa -la pregunta dice "subida" y el FAQ dice "subir"-, asi que se
 * acepta que una raiz sea prefijo de la otra a partir de tres letras.
 */
export function mismaRaiz(a: string, b: string): boolean {
  if (a === b) return true;
  if (a.length < 3 || b.length < 3) return false;
  return a.startsWith(b) || b.startsWith(a);
}

function tokenizar(texto: string): string[] {
  return normalizar(texto).split(/[^a-z0-9]+/).filter(Boolean);
}

/** Cuantas entradas del indice contienen esta raiz. */
function frecuencia(entradas: EntradaIndice[], raizBuscada: string): number {
  let n = 0;
  for (const entrada of entradas) {
    const palabras = tokenizar(`${entrada.title} ${entrada.keywords}`);
    if (palabras.some((w) => mismaRaiz(raiz(w), raizBuscada))) n += 1;
  }
  return n;
}

/**
 * Palabras que de verdad situan la pregunta: sin vacias, sin numeros sueltos y
 * de tres letras o mas.
 *
 * Los numeros se descartan a proposito. Cuando alguien escribe "el limite es
 * del 5 %" el 5 es una afirmacion suya que el sitio puede contradecir, no un
 * termino de busqueda: contarlo como palabra de contenido rebajaba la
 * cobertura de la entrada correcta -el FAQ de la renta, que dice 2 %- y la
 * dejaba fuera justo en el caso en que mas falta hacia.
 */
export function palabrasDeConsulta(consulta: string): string[] {
  return tokenizar(consulta).filter((w) => w.length >= 3 && !VACIAS.has(w) && !/^\d+$/.test(w));
}

const PESO_TITULO = 4;
const PESO_CUERPO = 2;
/** Peso cuando solo coincide la raiz y no la forma literal ni su plural. */
const PESO_TITULO_DEBIL = 1;
const PESO_CUERPO_DEBIL = 1;
/** Peso minimo para devolver algo: por debajo, es ruido y se niega. */
const PESO_MINIMO = 4;
/** Una entrada entra si conserva al menos esta fraccion del peso de la mejor. */
const CORTE_RELATIVO = 0.45;

/**
 * Banda de la frase literal, por encima de cualquier solape.
 *
 * Los valores son grandes a proposito: `puntos` es la clave por la que
 * /api/chat reordena antes de cortar a tres, asi que tiene que preservar el
 * orden que ya dio `buscar`. Con numeros pequenos, quien reordena por `puntos`
 * deshacia el criterio de `mejorTitulo` y devolvia la FAQ de los alquileres
 * turisticos delante de la seccion que se titula "Art. 8. IBI".
 */
const LITERAL_EXACTA = 1e9;
const LITERAL_PREFIJO = 1e9 - 1;
const LITERAL_INCLUYE = 1e9 - 2;

type Candidata = {
  entrada: EntradaIndice;
  puntos: number;
  peso: number;
  mejorTitulo: number;
};

/** Un indice de palabras con sus raices, para no recalcularlo por entrada. */
type IndiceEntradas = {
  mapa: Map<
    string,
    Map<EntradaIndice, { peso: number; raros: number; topRaros: number; enTitulo: boolean }>
  >;
};

function indexarTodo(entradas: EntradaIndice[], consultaPalabras: string[]): IndiceEntradas {
  const mapa: IndiceEntradas['mapa'] = new Map();
  for (const palabra of consultaPalabras) {
    const r = raiz(palabra);
    const df = frecuencia(entradas, r);
    if (df === 0) continue;
    // Cuanto menos aparece una raiz en el sitio, mas dice de la pregunta.
    // "ibi" esta en 7 entradas y "vivienda" en 28: sin esto, la FAQ de los
    // alquileres turisticos se llevaba una pregunta de IBI solo porque su
    // titulo lleva "alquileres".
    // El tope importa: sin el, una sola raiz muy rara pesa mas que todo lo
    // demas y el orden lo decide un unico termino en vez del conjunto.
    const sinTope = (Math.log(entradas.length / df) + 1) ** 2;
    const raros = Math.min(4, sinTope);
    const propias = new Set(formas(palabra));
    const porEntrada = new Map<
      EntradaIndice,
      { peso: number; raros: number; topRaros: number; enTitulo: boolean }
    >();
    for (const entrada of entradas) {
      // Solo cuenta igual la forma literal, su plural o su genero. Coincidir
      // unicamente por raiz es mas debilisimo: `raiz("casero")` es "caser", que
      // empieza como "casa", y asi el mecanismo TU CASA puntuaba como si
      // respondiera a "mi casero me ha subido la renta".
      // Simetrica: no basta con que la palabra de la consulta acepte plural,
      // tambien tiene que aceptarlo la del indice. Sin la segunda mitad,
      // "alquiler" no encontraba fuerte a "alquileres" y una pagina que se
      // llamaba "Desahucios y alquiler" ganaba a la FAQ de los alquileres
      // turisticos en una pregunta sobre sanciones.
      const fuerteEn = (texto: string): boolean =>
        tokenizar(texto).some((w) => propias.has(w) || formas(w).some((f) => propias.has(f)));
      const raizEn = (texto: string): boolean =>
        tokenizar(texto).some((w) => mismaRaiz(raiz(w), r));
      const enTitulo = fuerteEn(entrada.title);
      const enCuerpo = fuerteEn(entrada.keywords);
      const raizTitulo = enTitulo || raizEn(entrada.title);
      const raizCuerpo = enCuerpo || raizEn(entrada.keywords);
      if (!raizTitulo && !raizCuerpo) continue;
      const peso = enTitulo
        ? PESO_TITULO
        : enCuerpo
          ? PESO_CUERPO
          : raizTitulo
            ? PESO_TITULO_DEBIL
            : PESO_CUERPO_DEBIL;
      porEntrada.set(entrada, { peso, raros, topRaros: sinTope, enTitulo });
    }
    if (porEntrada.size > 0) mapa.set(palabra, porEntrada);
  }
  return { mapa };
}

/**
 * Devuelve hasta `max` coincidencias ordenadas por relevancia. No lanza si la
 * consulta viene vacia: devuelve las paginas, como la paleta.
 *
 * Una frase completa solo coincide si aparece tal cual y manda sobre todo lo
 * demas. Si no, cada palabra de contenido puntua segun donde caiga (mas en el
 * titulo que en el cuerpo) y segun lo rara que sea en el sitio. Una entrada
 * entra solo si alcanza un peso minimo absoluto y conserva una parte
 * razonable del peso de la mejor.
 *
 * La parte absoluta es el cerrojo de ambito: sin ella, una sola coincidencia
 * aproximada devolveria contexto de vivienda a cualquier pregunta fuera de
 * tema, que es justo lo que la negativa fija de /api/chat debe cerrar. La parte
 * relativa es lo que evita el otro defecto, el de las listas de fuentes sin
 * relacion: si una entrada vale la mitad de la mejor, es ruido de relleno y no
 * aparece, aunque las dos contendran "vivienda" y "alquiler".
 */
export function buscar(
  entradas: EntradaIndice[],
  consulta: string,
  max = 8,
): ResultadoBusqueda[] {
  const aguja = normalizar(consulta.trim());
  if (!aguja) {
    return entradas
      .filter((entrada) => entrada.type === 'page')
      .slice(0, max)
      .map((entrada) => ({
        titulo: entrada.title,
        href: entrada.href,
        seccion: entrada.section,
        extracto: (entrada.excerpt ?? '').slice(0, 160),
        contexto: entrada.keywords,
        puntos: 1,
        tipo: entrada.type,
      }));
  }

  const consultaPalabras = palabrasDeConsulta(consulta);
  const candidatas: Candidata[] = [];

  for (const entrada of entradas) {
    const titulo = normalizar(entrada.title);
    if (titulo === aguja) {
      candidatas.push({ entrada, puntos: LITERAL_EXACTA, peso: 0, mejorTitulo: Infinity });
      continue;
    }
    if (titulo.startsWith(aguja)) {
      candidatas.push({ entrada, puntos: LITERAL_PREFIJO, peso: 0, mejorTitulo: Infinity });
      continue;
    }
    if (titulo.includes(aguja)) {
      candidatas.push({ entrada, puntos: LITERAL_INCLUYE, peso: 0, mejorTitulo: Infinity });
      continue;
    }
  }

  if (consultaPalabras.length > 0) {
    const indicePalabras = indexarTodo(entradas, consultaPalabras);
    for (const entrada of entradas) {
      if (candidatas.some((c) => c.entrada === entrada)) continue;
      let peso = 0;
      let fuertes = 0;
      let mejorTitulo = 0;
      for (const palabra of consultaPalabras) {
        const golpe = indicePalabras.mapa.get(palabra)?.get(entrada);
        if (!golpe) continue;
        peso += golpe.peso * golpe.raros;
        fuertes += 1;
        if (golpe.enTitulo) mejorTitulo = Math.max(mejorTitulo, golpe.topRaros);
      }
      // El peso absoluto filtra el ruido. Ademas, una pregunta con dos o mas
      // palabras de contenido necesita al menos dos: con una sola, "¿Que
      // tiempo hace manana en Madrid?" se colaba en el FAQ del IRPF porque
      // "manana" aparece por casualidad en algun texto.
      const minimos = consultaPalabras.length >= 2 ? 2 : 1;
      if (peso < PESO_MINIMO || fuertes < minimos) continue;
      candidatas.push({ entrada, puntos: 0, peso, mejorTitulo });
    }

    const mejor = Math.max(0, ...candidatas.map((c) => c.peso));
    if (mejor >= PESO_MINIMO) {
      for (const c of candidatas) {
        if (c.puntos === 0 && c.peso < mejor * CORTE_RELATIVO) c.peso = 0;
      }
      for (let i = candidatas.length - 1; i >= 0; i -= 1) {
        if (candidatas[i].puntos === 0 && candidatas[i].peso === 0) candidatas.splice(i, 1);
      }
    }
  }

  // El criterio completo se codifica en `puntos` para que sobreviva al
  // reordenamiento por tipo que hace /api/chat. Sin redondear: redondear
  // creaba empates falsos y el desempate por tipo terminaba decidiendo.
  //
  // El termino raro del titulo suma, pero **suma**: antes era `mejorTitulo *
  // 1e6`, de modo que cualquier coincidencia de titulo -aunque el resto de la
  // pregunta no encajara nada- ganaba a una entrada que encajaba muchisimo
  // mejor. "Soy propietario y alquilo a una asociacion sin animo de lucro"
  // llegaba al cuerpo de "Lo que afecta al tercer sector" por tres palabras
  // (peso 44) y perdia frente a la norma del IRPF, que solo encajaba "renta"
  // en el titulo (peso 32). Y al revés: "el limite de subida de la renta es
  // del 5 %" debe ganar la FAQ de la renta y no "En 1 minuto".
  //
  // El peso del titulo se mide en la MISMA escala que el cuerpo, y el cuerpo
  // manda cuando claramente tiene mas. 1.3 sale de medir los dos casos
  // Ribera: por debajo de 1.17 la seccion "Art. 8. IBI" pierde contra la FAQ
  // de los alquileres turisticos; por encima de 1.46 el IRPF vuelve a ganarle
  // al tercer sector.
  const PESO_TITULO_EN_PUNTOS = 1.3;
  for (const c of candidatas) {
    if (c.puntos === 0) c.puntos = c.peso + c.mejorTitulo * PESO_TITULO_EN_PUNTOS;
  }

  // Las frases literales llevan `mejorTitulo` infinito y un `puntos` de 1e9,
  // muy por encima de cualquier suma, asi que siguen mandando sobre todo lo
  // demas sin necesitar un desempate aparte.
  candidatas.sort((a, b) => b.puntos - a.puntos || b.peso - a.peso);

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
