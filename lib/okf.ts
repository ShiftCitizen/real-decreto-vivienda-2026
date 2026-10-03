/**
 * Selección de evidencia a partir del bundle OKF (`okf/`).
 *
 * =====================================================
 *  POR QUÉ EXISTE ESTO Y NO ES OTRO BUSCADOR
 * =====================================================
 *  `lib/busqueda.ts` sigue siendo el buscador de la web y lo que decide si una
 *  pregunta es del temario. Esto es otra cosa: elige **los trozos de texto que
 *  se le pasan al modelo**, y lo hace por temas completos en lugar de por
 *  entradas sueltas.
 *
 *  El fallo que lo motiva está medido, no supuesto. `/api/chat` se quedaba con
 *  las tres primeras entradas de `buscar()` y las recortaba a 3 000 caracteres.
 *  Una pregunta con tres partes —prórroga, subida de renta y desahucio— solo
 *  puede recibir tres entradas, y si una es un FAQ entero se come el hueco: la
 *  pregunta de la prueba 2 recibió el FAQ del IRPF, el de los alquileres
 *  turísticos y la cronología, y ninguno era sobre la prórroga ni sobre la
 *  subida de renta ni sobre el desahucio. El modelo no inventó: dijo «no hay
 *  información en el contexto», que era verdad.
 *
 *  Aquí cada fichero del bundle es un **tema entero** —prórroga e indemnización
 *  en uno, tope de la renta en otro, suspensión de desahucios en otro— así que
 *  un fichero por parte cubre una pregunta de varias partes con cuatro fuentes,
 *  y cada fuente es un enlace real a la página del sitio que la escribió.
 *
 *  Y el cuerpo del bundle sí llega al modelo, al contrario que en el bundle del
 *  curso `curso-digitalizacion-2026`: allí los ficheros eran resúmenes con
 *  pérdidas y solo se usaban para elegir módulo. Aquí, de 606 párrafos, listas y
 *  celdas, 605 aparecen sin cambios en los cuerpos del bundle. Esa diferencia
 *  está medida por comparación fichero a fichero y es la razón de que una cosa
 *  sea aceptable y la otra no.
 */
import { normalizar, palabrasDeConsulta, raiz } from './busqueda';

export type FicheroOkf = {
  /** Ruta dentro de `okf/`. Nunca se cita: el usuario no puede abrirla. */
  ruta: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  /** Página del sitio de la que salió el fichero, sin ancla. */
  pagina: string;
  /** Enlace real que se cita: ancla de sección si existe, si no la página. */
  href: string;
  ancla: boolean;
  cuerpo: string;
};

export type TablaOkf = { ficheros: FicheroOkf[] };

/** Una fuente para el modelo y para la lista de citas. */
export type Evidencia = {
  titulo: string;
  href: string;
  /** Texto que ve el modelo. */
  texto: string;
  /** Los ficheros de estado van siempre al final y no se puntúan. */
  estado?: true;
};

/**
 * Cuántos ficheros de tema entran como mucho.
 *
 * Cuatro, no tres. La pregunta de tres partes necesita tres, y el cuarto es el
 * margen para el tema contiguo que siempre acaba faltando —quien pregunta por
 * el desahucio casi siempre pregunta también por la enervación—. Con más, el
 * modelo empieza a mezclar medidas de decretos distintos, que es justo lo que
 * este sitio no puede permitirse.
 */
const MAX_FICHERS = 4;

/**
 * Puntuación mínima para considerar que un fichero es el del tema.
 *
 * Con el factor de rareza de abajo, una raíz que solo aparece en un fichero vale
 * `log(1 + 39) ≈ 3,7` y otra que aparece en quince vale `1,0`. El suelo está por
 * debajo de una coincidencia fuerte y por encima de una suelta, porque una
 * suelta sola no basta: se llega con dos raíces, o con una que sea **nombre de
 * un tema del sitio** («Desahucio», «IBI», «IVA», «Enervación»).
 *
 * El valor 4 está medido: con 3,2 entraban ficheros que solo comparten palabras
 * genéricas —la FAQ de los alquileres turísticos ganaba a la de la subida de la
 * renta— y con 4 no. Subirlo más empieza a perder respuestas buenas, así que es
 * un suelo, no un óptimo bonito.
 */
const PUNTUACION_MINIMA = 4;

/** Cuántas raíces distintas hay que acertar, salvo que una sea nombre de tema. */
const MIN_RAICES = 2;

/**
 * Peso de una raíz que aparece en el título del fichero.
 *
 * Es el peso más alto porque el título es lo que el fichero **es**. Y no vale
 * más que eso: el título es corto y nombra un solo tema, así que nunca empata
 * con un fichero que cubre más partes de la pregunta.
 */
const PESO_TITULO = 3;
/**
 * Peso de una raíz que solo aparece en la descripción.
 *
 * La descripción es un resumen de autor y menciona de pasada casi todo lo que
 * toca el fichero, así que es mucho más débil que el título. Medido con la
 * prueba 3 —«soy propietario y alquilo un piso a una asociación sin ánimo de
 * lucro para personas vulnerables»—: agrupar título y descripción en un único
 * «fuerte» daba 13,5 puntos al art. 2 de suspensión de desahucios, que solo
 * habla de «vulnerable» en su descripción, frente a 10,8 de «Lo que afecta al
 * tercer sector», que es el fichero que de verdad responde. Separados, el
 * primero baja a 11,1 y el segundo sube: gana el que cubre más de la
 * pregunta.
 */
const PESO_DESCRIPCION = 2;
/** Peso de una raíz que solo aparece en el cuerpo. */
const PESO_CUERPO = 1;

/**
 * Tope de caracteres por fichero.
 *
 * Los cuerpos van de 1 KB a 12 KB y no caben todos. Recortar a ciegas por el
 * principio es lo que ya falla en el índice: la cifra del 2 % está al final de
 * `df-5-y-df-6.md`, a 3 400 caracteres, y se perdía siempre. Aquí se eligen
 * **bloques** y luego se recorta, que es otra cosa.
 */
const TOPE_FICHERO = 1500;

/**
 * Los dos ficheros que viajan siempre con cualquier respuesta sustantiva.
 *
 * No por decoración: el requisito es que la respuesta lleve el estado de la
 * medida y no diga que los decretos nunca entraron en vigor. Solo estos dos
 * sitios del sitio lo dicen con precisión —«RDL 26/2026 entró en vigor el
 * 1-10-2026 y RDL 27/2026 el 2-10-2026, pero ambos quedaron derogados ese mismo
 * 2-10-2026» y «Rigen la LAU y las demás normas anteriores a los decretos»—, y
 * medido, sin ellos la respuesta de la prueba 8 no llegaba a decir que la LAU
 * sigue vigente.
 */
const SIEMPRE = ['estado/situacion-de-cada-medida.md', 'faq/esta-en-vigor.md'];

// --- Índice de un solo vistazo ------------------------------------------------

type Bloque = { texto: string; raices: Set<string> };
type FicheroIndexado = {
  fichero: FicheroOkf;
  /** Raíces del título: lo que el fichero es. */
  deTitulo: Set<string>;
  /** Raíces de la descripción: de qué va, resumido. */
  deDescripcion: Set<string>;
  /** Raíces de contenido del título, sin las de menos de cuatro letras. */
  tituloRaices: string[];
  /** Título sin puntuación ni tildes, para compararlo con la pregunta entera. */
  tituloPlano: string;
  bloques: Bloque[];
  /** Bloque que dice el estado, para que viaje siempre con la medida. */
  estado: Bloque | null;
};

type IndiceOkf = {
  indexados: FicheroIndexado[];
  /** Ficheros que contienen cada raíz, tal cual aparece en el cuerpo. */
  dfExacto: Map<string, number>;
  /** Pesos de rareza ya calculados, para no repetirlos por pregunta. */
  pesos: Map<string, number>;
  claves: Set<string>;
};

const cache = new WeakMap<TablaOkf, IndiceOkf>();

/**
 * Trocea un cuerpo en bloques.
 *
 * Un bloque es un párrafo, **o una fila de tabla**, **o un elemento de lista**.
 * La fila de tabla importa: las tablas del sitio llegan al bundle aplanadas a
 * texto, y «Alquiler social, o a una administración pública o entidad sin fines
 * lucrativos para alquiler asequible | 70 %» tiene que ser una unidad sola, no
 * una línea de supuesto y otra de reducción. Separarlas era el modo más fácil
 * de que el modelo dijera «70 %» sin la condición que lo acompaña.
 */
function trocear(cuerpo: string): string[] {
  const bloques: string[] = [];
  let actual = '';
  const cerrar = () => {
    if (actual.trim()) bloques.push(actual.trim());
    actual = '';
  };
  for (const linea of cuerpo.split('\n')) {
    const vacia = linea.trim() === '';
    const propia = /^#{2,4}\s/.test(linea) || /^\|\s/.test(linea) || /^[-*]\s/.test(linea);
    if (vacia || propia) cerrar();
    if (!vacia) actual += (actual ? ' ' : '') + linea.trim();
  }
  cerrar();
  return bloques;
}

function raicesDe(texto: string): Set<string> {
  const salida = new Set<string>();
  for (const palabra of normalizar(texto).split(/[^a-z0-9]+/)) {
    if (palabra.length >= 3) salida.add(raiz(palabra));
  }
  return salida;
}

/**
 * Dos raíces son la misma palabra, aquí.
 *
 * =====================================================
 *  POR QUÉ NO `mismaRaiz()` DE `busqueda.ts`
 * =====================================================
 *  `mismaRaiz()` acepta un prefijo de tres letras, y para el buscador de la web
 *  eso está bien: el visitante escribe «subir» y el FAQ «subida», y hace falta
 *  ese margen. Para **elegir fichero** es un desastre, y medido con las pruebas
 *  de aceptación:
 *
 *  · «¿Me pueden subir la renta un 5 % en enero?» arrastraba la enervación
 *    extraordinaria porque `raiz("enero")` es «ener» y «ener» es prefijo de
 *    «enervación». Un mes del año endianctaba un régimen de Procedimiento.
 *  · «¿Puedo dejar de pagar el alquiler este mes?» hacía lo mismo con la
 *    descripción de la enervación, que dice «dos meses»: `raiz("mes")` es «mes»
 *    y es prefijo de «mese».
 *
 *  Dos reglas más estrechas, y ninguna es una lista de palabras:
 *
 *  · el prefijo más corto tiene que medir **cuatro** letras o más, y
 *  · la diferencia de longitud no puede pasar de cuatro.
 *
 *  El mínimo es cuatro y no cinco porque con cinco se pierde el par que decide
 *  la prueba 3: `raiz("lucro")` es «lucr» y el sitio escribe «fines lucrativos»,
 *  cuya raíz es «lucrativ», de modo que «Lo que afecta al tercer sector» —que
 *  es el fichero que responde— no se comunicaba con la palabra «lucro» de la
 *  pregunta. Bajado a cuatro, el par entra. Con tres también entraría, pero
 *  entonces «enero» volvería a arrastrar la enervación, así que cuatro es el
 *  valor medido: con tres y con cuatro salen exactamente los mismos ficheros,
 *  y cuatro no reintroduce el fallo de «enero».
 *
 *  Sigue siendo más estrecho que `mismaRaiz()`, que acepta tres.
 *
 * Con eso, «mes»/«mese» deja de casar —«mes» solo mide tres— y siguen casando
 * las parejas que de verdad son la misma palabra: «renta»/«rent» —que son
 * iguales—, «vulnerable»/«vulnerabilidad», «alquilo»/«alquila» y
 * «lucro»/«lucrativos».
 *
 * Se pierde «suban»/«subida», que no son ni una cosa ni otra: tras `raiz()` son
 * «suban» y «subid», que solo comparten tres letras. Es el par de la FAQ de la
 * renta, y la FAQ entra igual en su pregunta corta por la banda literal. En una
 * pregunta larga y encadenada, en cambio, la parte «me preocupa que me suban la
 * renta un 5 % en enero» la gana «En 1 minuto», que dice «casero» y «nada» y
 * suma más. Es un fallo raro y medido; taparlo exigiría una lista de sinónimos
 * del temario, que es justo lo que este trabajo no quiere.
 */
function coincide(a: string, b: string): boolean {
  if (a === b) return true;
  const corto = a.length <= b.length ? a : b;
  const largo = a.length <= b.length ? b : a;
  if (corto.length < 4) return false;
  if (largo.length - corto.length > 4) return false;
  return largo.startsWith(corto);
}

/**
 * Cualquiera de las raíces de una entrada está en el conjunto dado.
 */
function alguna(raizEntrada: string, conjunto: Set<string>): boolean {
  if (conjunto.has(raizEntrada)) return true;
  for (const r of conjunto) if (coincide(raizEntrada, r)) return true;
  return false;
}

/**
 * Texto sin puntuación ni tildes, para comparar contra la pregunta entera.
 *
 * Sirve para el caso del FAQ literal: el visitante escribe «¿Me pueden subir la
 * renta un 5 % en enero?» y el título del fichero es «¿Me pueden subir la
 * renta?». No son iguales, pero el título **está dentro** de la pregunta, y eso
 * es una coincidencia mucho más fuerte que cualquier suma de raíces sueltas. Es
 * la misma idea que la banda literal de `buscar()`, y sin ella el fichero del
 * FAQ perdía contra uno que compensa con palabras genéricas.
 */
function plano(texto: string): string {
  return normalizar(texto)
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function construir(tabla: TablaOkf): IndiceOkf {
  const guardado = cache.get(tabla);
  if (guardado) return guardado;

  const indexados: FicheroIndexado[] = tabla.ficheros.map((fichero) => {
    const bloques = trocear(fichero.cuerpo).map((texto) => ({ texto, raices: raicesDe(texto) }));
    // Las raíces de título de menos de cuatro letras son las preposiciones y los
    // artículos de un título como «DF 5.ª y DF 6.ª del RDL 26/2026», y no sirven
    // para medir cobertura: cualquier pregunta las tiene.
    const tituloRaices = [...raicesDe(fichero.titulo)].filter((r) => r.length >= 4);
    return {
      fichero,
      deTitulo: raicesDe(fichero.titulo),
      deDescripcion: raicesDe(fichero.descripcion),
      tituloRaices,
      tituloPlano: plano(fichero.titulo),
      bloques,
      estado: bloques.find((b) => /^Estado:/i.test(b.texto)) ?? null,
    };
  });

  /**
   * Las raíces que el sitio nombra como tema.
   *
   * Solo palabras de una en uno o encabezados de tres palabras o menos, que es
   * donde un visitante escribiría el nombre del tema. Es lo que permite que
   * «¿Me pueden subir la renta?» llegue a un solo fichero con una sola raíz
   * acertada, sin abrir la puerta a que cualquier palabra suelta vale.
   */
  const claves = new Set<string>();
  const anadirClave = (texto: string) => {
    const palabras = normalizar(texto).split(/[^a-z0-9]+/).filter(Boolean);
    if (palabras.length === 1 && palabras[0].length >= 3) claves.add(raiz(palabras[0]));
  };
  for (const f of tabla.ficheros) {
    anadirClave(f.titulo.replace(/^\d+[.)]\s*/, ''));
  }
  // Los encabezados son bloques que empiezan por «##», y en la tabla llegan
  // dentro del cuerpo porque el script los conserva.
  for (const i of indexados) {
    for (const b of i.bloques) {
      const m = b.texto.match(/^#{2,4}\s+(.{2,40})$/);
      if (m && normalizar(m[1]).split(/[^a-z0-9]+/).filter(Boolean).length <= 3) anadirClave(m[1]);
    }
  }

  /**
   * Cuántos ficheros usan cada raíz, **tal cual aparece escrita**.
   *
   * Se cuenta por raíz exacta a propósito: `dfExacto` es la materia prima, y el
   * peso de rareza de una raíz de la pregunta se calcula después sumando las
   * entradas que casan con ella. Ver `peso()`: si se contara ya con `coincide()`
   * el resultado sería el mismo, y el paso intermedio es lo que permite que la
   * rareza se mida una vez por pregunta y se guarde.
   */
  const dfExacto = new Map<string, number>();
  for (const i of indexados) {
    for (const r of new Set([...i.deTitulo, ...i.deDescripcion, ...i.bloques.flatMap((b) => [...b.raices])])) {
      dfExacto.set(r, (dfExacto.get(r) ?? 0) + 1);
    }
  }

  const valor = { indexados, dfExacto, pesos: new Map<string, number>(), claves };
  cache.set(tabla, valor);
  return valor;
}

/**
 * Cuánto dice de la pregunta una raíz, por lo rara que es en el bundle.
 *
 * =====================================================
 *  POR QUÉ SE SUMAN LAS FRECUENCIAS Y NO SE MIRA UNA
 *  =====================================================
 *  La rareza se busca con la raíz **exacta** de la pregunta, pero la coincidencia
 *  se hace con `coincide()`, que es un prefijo. Pedir la rareza de la raíz
 *  exacta y luego buscar por prefijo mezcla dos cosas distintas y se nota mucho:
 *
 *  · `raiz("alquiler")` es «alquil», y **«alquil» casi no existe escrito en el
 *    bundle**: el sitio dice «alquiler», «alquileres» y «alquilo», cuyas raíces
 *    son otras. Su `df` era 1, así que pesaba `log(1 + 39) ≈ 3,7`, la máxima
 *    posible, y «¿Puedo dejar de pagar el alquiler este mes?» daba por ganadora
 *    a la FAQ de los alquileres turísticos y a la del IRPF. Medido: eran las
 *    dos primeras, con 10,3 y 9,0 puntos, por encima del art. 3 LAU —que es el
 *    fichero que de verdad trata el impago— con 7,3.
 *  · Lo mismo con «aplicar» en la pregunta de cuatro partes, y con «total»,
 *    «solo» o «seguro» en la del sí o no.
 *
 *  El arreglo no es quitar palabras de la pregunta ni bajar pesos: es medir la
 *  rareza de **la palabra**, no la de su raíz sin suffijos. La raíz de la
 *  pregunta representa un conjunto de formas, así que su frecuencia es la suma
 *  de las de todas las raíces con las que casa. «alquiler» pasa de 3,7 a lo que
 *  le tocaría por aparecer en media docena de ficheros, y «deducción» —que sí
 *  se escribe siempre igual— conserva su rareza alta.
 *
 *  Es la misma idea que `frecuencia()` en `busqueda.ts`, que cuenta con
 *  `mismaRaiz()` justamente por esto.
 */
function peso(indice: IndiceOkf, raizPregunta: string): number {
  const guardado = indice.pesos.get(raizPregunta);
  if (guardado !== undefined) return guardado;
  let ficheros = 0;
  for (const [r, df] of indice.dfExacto) if (coincide(raizPregunta, r)) ficheros += df;
  const valor = ficheros === 0 ? 0 : Math.log(1 + indice.indexados.length / ficheros);
  indice.pesos.set(raizPregunta, valor);
  return valor;
}

/**
 * Los bloques de un fichero que se le pasan al modelo.
 *
 * Tres reglas, y las tres están medidas:
 *
 * 1. **El bloque de estado entra siempre**, aunque la pregunta no lo mencione.
 *    Es lo que hace que la respuesta diga qué ha pasado con la medida sin
 *    depender de que el modelo se acuerde.
 * 2. **Los bloques que encajan, con su vecino de arriba.** Una medida y su
 *    condición suelen estar en párrafos contiguos; quedarse con la frase suelta
 *    es cómo se pierde «con renta inferior a la del programa estatal».
 * 3. **Se ordena por puntación dentro del tope**, y se vuelve al orden del
 *    documento para leer. Puntuado y reordenado, un bloque de 900 caracteres
 *    come el hueco y el resto no llega nunca.
 */
function bloquesDeFichero(
  i: FicheroIndexado,
  raicesPregunta: string[],
  indice: IndiceOkf,
): string {
  const puntua = (b: Bloque): number => {
    let p = 0;
    for (const r of raicesPregunta) if (alguna(r, b.raices)) p += peso(indice, r);
    return p;
  };
  const candidatos = i.bloques
    .map((b, n) => ({ n, b, p: puntua(b) }))
    .filter((c) => c.p > 0);

  const elegidos = new Set<number>();
  if (i.estado) elegidos.add(i.bloques.indexOf(i.estado));
  // El primer bloque es casi siempre el resumen de qué preveía la medida.
  if (i.bloques.length > 0) elegidos.add(0);
  for (const c of candidatos) {
    if (elegidos.size >= 6) break;
    elegidos.add(c.n);
    if (elegidos.has(c.n + 1)) elegidos.add(c.n + 1);
  }

  let texto = '';
  for (const n of [...elegidos].sort((a, b) => a - b)) {
    const b = i.bloques[n];
    if (!b) continue;
    if (texto.length + b.texto.length > TOPE_FICHERO) continue;
    texto += (texto ? '\n' : '') + b.texto;
  }
  // Si el estado se ha quedado fuera por el tope, entra igualmente: es corto y
  // es la parte que no puede faltar.
  if (i.estado && !texto.includes(i.estado.texto)) {
    texto = `${i.estado.texto}\n${texto}`.slice(0, TOPE_FICHERO);
  }
  return texto.trim();
}

/** Un fichero puntuado, con la traza de por qué ha puntuado lo que ha puntuado. */
export type Candidato = {
  ruta: string;
  titulo: string;
  href: string;
  puntos: number;
  /** Raíces de la pregunta que el fichero acierta. */
  raices: string[];
  /** Fracción de las raíces de contenido del título que la pregunta trae. */
  cobertura: number;
  /** El título del fichero está dentro de la pregunta, o al revés. */
  literal: boolean;
};

/**
 * Los ficheros de la pregunta, en orden, con su puntuación y su traza.
 *
 * Se exporta porque `scripts/chat-check.mjs` tiene que poder afirmar sobre **el
 * orden**, no solo sobre qué entra: el fallo medido no era que faltara contexto,
 * sino que entraba el fichero equivocado en primer lugar. Con la traza a la
 * vista el motivo se puede comprobar sin reconstruir la puntuación a mano.
 */
export function puntuarFicheros(pregunta: string, tabla: TablaOkf): Candidato[] {
  const indice = construir(tabla);
  const { indexados, claves } = indice;

  const tokens = palabrasDeConsulta(pregunta).map(raiz);
  if (tokens.length === 0) return [];
  const preguntaPlana = plano(pregunta);
  const unicas = [...new Set(tokens)];

  return indexados
    .map((i) => {
      let puntos = 0;
      let raices = 0;
      let esClave = false;
      let acertadasTitulo = 0;
      const acertadas: string[] = [];
      for (const t of unicas) {
        const enTitulo = alguna(t, i.deTitulo);
        const enDescripcion = !enTitulo && alguna(t, i.deDescripcion);
        const enCuerpo =
          enTitulo || enDescripcion ? false : i.bloques.some((b) => alguna(t, b.raices));
        const pesoRaiz = peso(indice, t);
        if (pesoRaiz === 0) continue;
        const factor = enTitulo ? PESO_TITULO : enDescripcion ? PESO_DESCRIPCION : enCuerpo ? PESO_CUERPO : 0;
        if (factor === 0) continue;
        puntos += pesoRaiz * factor;
        raices += 1;
        acertadas.push(t);
        if (i.tituloRaices.some((r) => coincide(t, r))) acertadasTitulo += 1;
        if (claves.has(t)) esClave = true;
      }

      /**
       * La cobertura de título **no multiplica**. Se midió y estorba.
       *
       * Durante un tiempo el título se premió por cobertura —«cuántas de las
       * palabras de tu nombre están en la pregunta»— con un multiplicador de
       * hasta ×4, igual que el `mejorTitulo` que `busqueda.ts` ya tuvo que
       * deconstructar por el mismo motivo. Y falla igual: un fichero con un
       * título de tres palabras que acierta **una** se multiplicaba por dos, y
       * eso bastaba para que la FAQ de los alquileres turísticos —cuyo título
       * es «¿Qué pasa con los alquileres turísticos?»— ganara a la FAQ de la
       * subida de la renta en «¿Me pueden subir la renta un 5 % en enero?» con
       * 11,7 puntos contra 7,1. Un acierto de una palabra de tres no dice nada
       * del tema; el peso por título y por descripción ya está en la suma.
       *
       * Se conserva el dato en la traza de `puntuarFicheros()`, donde sirve
       * para entender un resultado, pero no puntúa.
       */
      const cobertura =
        i.tituloRaices.length > 0 ? acertadasTitulo / i.tituloRaices.length : 0;
      const literal =
        i.tituloPlano.length >= 12 &&
        (preguntaPlana.includes(i.tituloPlano) || i.tituloPlano.includes(preguntaPlana));

      return { i, puntos, raices, esClave, literal, cobertura, acertadas };
    })
    .filter((c) => c.puntos >= PUNTUACION_MINIMA && (c.raices >= MIN_RAICES || c.esClave || c.literal))
    .sort((a, b) => Number(b.literal) - Number(a.literal) || b.puntos - a.puntos)
    .map((c) => ({
      ruta: c.i.fichero.ruta,
      titulo: c.i.fichero.titulo,
      href: c.i.fichero.href,
      puntos: c.puntos,
      raices: c.acertadas,
      cobertura: c.cobertura,
      literal: c.literal,
    }));
}

/**
 * Las partes en que se puede partir una pregunta.
 *
 * =====================================================
 *  POR QUÉ UNA PREGUNTA NO SE BUSCA COMO UN SOLO TEXTO
 *  =====================================================
 *  Una pregunta de cuatro partes —«me renuevan el contrato, me suben la renta,
 *  mi hermana podría ser desahuciada, y qué pasa con la deducción del IRPF»—
 *  tiene cuatro respuestas en cuatro sitios distintos del sitio. Puntuada como
 *  un bloque único, gana el fichero que más palabras genéricas comparte con
 *  «toda la pregunta» —medido: la FAQ de la deducción del IRPF con 123,9 puntos
 *  frente a 18,8 de la sección que trata el desahucio— y las otras tres partes
 *  se quedan sin contexto. Es la causa raíz del «no hay información en el
 *  contexto» que Respondía la prueba 2, y no se arregla subiendo el tope de
 *  caracteres: el problema no es de espacio, es de qué entra.
 *
 *  El corte es estructural —puntuación, comas, punto y coma y las conjunciones
 *  que unen preguntas distintas— y no una lista de palabras del temario, así
 *  que funciona con cualquier redacción mientras que una lista de sinónimos no
 *  escalaría. «Además» y «también» son las que de verdad anuncian «y ahora otra
 *  cosa»: se puntúan con `y`, no con `además`, porque quien escribe «mi hermano
 *  está en situación vulnerable y podría ser desahuciado» no está cambiando de
 *  tema, solo encadenando.
 *
 *  Una parte que no llega al mínimo no es un fallo: significa que el bundle no
 *  cubre ese punto, y es exactamente el hueco que el prompt manda decir en
 *  voz alta en vez de inventarlo.
 */
function partesDe(pregunta: string): string[] {
  const crudas = pregunta
    .split(/[?!.;]+\s+|\s*,\s*(?=y\s|además\b|también\b)|(?<=\s)(?:además|también|por otra parte|aparte)\b[,\s]+/iu)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return crudas.length > 0 ? crudas : [pregunta];
}

/**
 * La evidencia de la pregunta, o `null` si no es del análisis.
 *
 * `null` —y no una lista vacía— es lo que permite a `/api/chat` devolver la
 * negativa fija sin llamar al modelo: una pregunta fuera de temario no debe
 * gastar nada. La negativa es la parte que hay que conservar y por eso el tipo
 * de retorno no admite «nada pero algo».
 *
 * La selección es **por partes**, no global: entra primero el fichero que mejor
 * responde a la pregunta entera —que es quien puede acertar la banda literal y
 * el tema dominante— y luego, para cada parte que aún no tenga fichero propio,
 * el que mejor la cubre. Así una pregunta de cuatro partes recibe cuatro
 * ficheros temáticos distintos en lugar de cuatro facetas del mismo, y una
 * pregunta de una parte se comporta exactamente igual que antes.
 */
export function seleccionar(pregunta: string, tabla: TablaOkf): Evidencia[] | null {
  const indice = construir(tabla);
  const { indexados } = indice;

  const unicas = [...new Set(palabrasDeConsulta(pregunta).map(raiz))];
  if (unicas.length === 0) return null;

  const porRuta = new Map(indexados.map((i) => [i.fichero.ruta, i] as const));
  const global = puntuarFicheros(pregunta, tabla);
  if (global.length === 0) return null;

  /**
   * Un fichero por parte, de la parte mejor puntuada a la peor, y **la parte
   * manda sobre la pregunta entera**.
   *
   * Dos decisiones medidas aquí:
   *
   * 1. Se recorre por puntuación de parte y no en el orden en que están
   *    escritas, porque si no el hueco de `MAX_FICHERS` se lo lleva la primera
   *    frase —que en la prueba 2 es «tengo un piso alquilado desde 2022 a una
   *    persona física», contexto y no pregunta— y el desahucio se queda fuera.
   * 2. Las partes van **antes** que el mejor fichero de la pregunta entera. Al
   *    revés, la prueba 3 la ganaba el art. 2 de suspensión de desahucios, que
   *    comparte con «Lo que afecta al tercer sector» la palabra «vulnerable»
   *    y poco más, mientras que la parte que de verdad la pregunta —«soy
   *    propietario y alquilo a una asociación sin ánimo de lucro»— es la que
   *    sitúa al fichero del tercer sector. Puntuada por partes, gana quien
   *    responde a lo que se ha escrito.
   *
   * La pregunta entera se conserva como segunda: es la que puede acertar la
   * banda literal, que la parte suelta no ve.
   */
  const porParte = partesDe(pregunta)
    .map((texto) => ({ texto, candidatos: puntuarFicheros(texto, tabla) }))
    .filter((p) => p.candidatos.length > 0)
    .map((p) => ({ texto: p.texto, mejor: p.candidatos[0] }))
    .sort((a, b) => Number(b.mejor.literal) - Number(a.mejor.literal) || b.mejor.puntos - a.mejor.puntos);

  const elegido = new Map<string, Candidato>();
  const anadir = (c: Candidato): void => {
    if (!elegido.has(c.ruta) && elegido.size < MAX_FICHERS) elegido.set(c.ruta, c);
  };

  for (const parte of porParte) anadir(parte.mejor);
  anadir(global[0]);

  const fuentes: Evidencia[] = [];
  for (const c of elegido.values()) {
    const i = porRuta.get(c.ruta);
    if (!i) continue;
    const texto = bloquesDeFichero(i, unicas, indice);
    if (texto.length === 0) continue;
    fuentes.push({ titulo: c.titulo, href: c.href, texto });
  }

  if (fuentes.length === 0) return null;

  for (const ruta of SIEMPRE) {
    const f = tabla.ficheros.find((x) => x.ruta === ruta);
    if (!f) continue;
    const i = indexados.find((x) => x.fichero.ruta === ruta);
    if (!i) continue;
    // Un recorte corto a propósito: son ficheros de estado, no de fondo, y
    // cargarlos enteros dejaría sin hueco a los temas.
    fuentes.push({
      titulo: f.titulo,
      href: f.href,
      texto: i.bloques
        .filter((b) => /^Estado:|^Al no ser convalidados|Rigen la LAU|^RDL 26\/2026 entró/i.test(b.texto))
        .map((b) => b.texto)
        .join('\n')
        .slice(0, 700),
      estado: true,
    });
  }

  return fuentes;
}