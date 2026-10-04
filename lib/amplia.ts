/**
 * Respuestas a un pedido amplio: resumen del sitio, de una página, puntos
 * clave, temas imprescindibles, lista para un lienzo.
 *
 * `seleccionar()` y `buscar()` eligen el tema de una pregunta concreta. Un
 * «resume la web» no tiene un tema: con ese camino el modelo recibía una sola
 * sección cercana y, con el tope de 350 tokens, la cortaba a media frase.
 * Aquí el pedido se distingue antes, y la respuesta se arma con frases que las
 * páginas ya publican —una por página si el pedido es el sitio entero, una
 * lista corta de esa página si el pedido es un tema—. No pasa por el modelo:
 * así no puede añadir una cifra que la página no trae ni dejarse una palabra
 * a medias. La pregunta estrecha no entra y sigue el camino de siempre, con
 * su tope de 350 tokens.
 *
 * La frase de estado no está copiada de un párrafo: es la formulación que hay
 * que poner junto a cada medida. Las fechas que dice (entrada en vigor el 1 y
 * el 2 de octubre, derogación el 2) son las de la entradilla de `/estado`. No
 * se usa la redacción de la portada que dice «no entran en vigor», porque esa
 * frase se lee como si los decretos no hubieran llegado a regir.
 */
import { ALL_LINKS } from './nav';
import { normalizar } from './busqueda';
import { slugify } from './slug';

export type CitaAmplia = { titulo: string; href: string };

/**
 * Comprobado el 3 de octubre de 2026. Misma frase, en español, que
 * «As checked on 3 October 2026, RDL 26/2026 entered into force on 1 October
 * and RDL 27/2026 on 2 October. Congress agreed to repeal both on 2 October.
 * Neither decree is now in force.»
 */
export const FRASE_ESTADO =
  'Comprobado el 3 de octubre de 2026, el RDL 26/2026 entró en vigor el 1 de octubre y el RDL 27/2026 el 2 de octubre. El Congreso acordó derogar ambos el 2 de octubre. Ninguno de los dos decretos está ahora en vigor.';

const HREF_ESTADO = '/estado/';

type Ancla = { slug: string } | { id: string };

type Punto = {
  titulo: string;
  /** Trozo publicado en `archivo`, tal cual, espacios aparte. */
  texto: string;
  archivo: string;
  ancla?: Ancla;
  /** El punto habla de una medida de los decretos y lleva la frase de estado. */
  medida: boolean;
};

type PaginaAmplia = {
  href: string;
  titulo: string;
  pistas: RegExp;
  resumen: Punto;
  puntos: Punto[];
};

function ancla(slug: string): Ancla {
  return { slug };
}

const PORTADA = 'app/page.tsx';
const DESAHUCIOS = 'app/desahucios-y-alquiler/page.tsx';
const FISCAL = 'app/fiscal/page.tsx';
const FINANCIACION = 'app/financiacion/page.tsx';
const ESTADO = 'app/estado/page.tsx';
const NORMAS = 'app/normas/page.tsx';

const PAGINAS: PaginaAmplia[] = [
  {
    href: '/',
    titulo: 'Resumen',
    pistas: /\b(portada|pagina de inicio|en 1 minuto|en un minuto)\b/,
    resumen: {
      titulo: 'Resumen',
      archivo: PORTADA,
      medida: true,
      texto:
        'Dos reales decretos-ley publicados con un día de diferencia y aprobados en el mismo Consejo de Ministros. El primero, de 96 páginas y veinte artículos en seis títulos, actuaba en cuatro frentes: alquiler y desahucios, fiscalidad, parque público y financiación de vivienda asequible, y cerraba con la Cuenta de Ahorro e Inversión Financia Europa. El segundo era un texto breve de ocho páginas con un único artículo, y se ocupaba de una sola cosa: el futuro de los contratos de arrendamiento de vivienda habitual.',
    },
    puntos: [
      {
        titulo: 'Los dos decretos',
        archivo: PORTADA,
        medida: true,
        texto:
          'Dos reales decretos-ley publicados con un día de diferencia y aprobados en el mismo Consejo de Ministros. El primero, de 96 páginas y veinte artículos en seis títulos, actuaba en cuatro frentes: alquiler y desahucios, fiscalidad, parque público y financiación de vivienda asequible, y cerraba con la Cuenta de Ahorro e Inversión Financia Europa. El segundo era un texto breve de ocho páginas con un único artículo, y se ocupaba de una sola cosa: el futuro de los contratos de arrendamiento de vivienda habitual.',
      },
      {
        titulo: 'Qué ha pasado',
        archivo: PORTADA,
        ancla: ancla('En 1 minuto'),
        medida: true,
        texto:
          'Qué ha pasado: el Congreso ha rechazado los dos decretos de vivienda; ambos quedan derogados.',
      },
    ],
  },
  {
    href: '/desahucios-y-alquiler',
    titulo: 'Desahucios y alquiler',
    pistas:
      /\b(alquiler|alquileres|desahucio|desahucios|enervacion|lanzamiento|lanzamientos|inquilino|inquilinos|arrendamiento|arrendamientos|prorroga|prorrogas|lau)\b/,
    resumen: {
      titulo: 'Desahucios y alquiler',
      archivo: DESAHUCIOS,
      medida: true,
      texto:
        'El RDL 26/2026 preveía freno a la compra especulativa, suspensión de lanzamientos hasta 2030, enervación extraordinaria y reforma de la LAU. El RDL 27/2026 establecía una prórroga indefinida de cinco y siete años. Ambos decretos fueron derogados el 2-10-2026: ninguna de estas medidas se aplica.',
    },
    puntos: [
      {
        titulo: 'Freno a la compra especulativa',
        archivo: DESAHUCIOS,
        ancla: ancla('Art. 1 (RDL 26/2026). Freno a la compra especulativa'),
        medida: true,
        texto: 'El RDL 26/2026 preveía freno a la compra especulativa',
      },
      {
        titulo: 'Suspensión de lanzamientos',
        archivo: DESAHUCIOS,
        ancla: ancla('Art. 2 (RDL 26/2026). Suspensión de desahucios hasta el 31-12-2030'),
        medida: true,
        texto: 'suspensión de lanzamientos hasta 2030',
      },
      {
        titulo: 'Enervación extraordinaria',
        archivo: DESAHUCIOS,
        ancla: ancla('Enervación extraordinaria (art. 5 RDL 26/2026; nuevo art. 22.6 LEC)'),
        medida: true,
        texto:
          'Acreditada la vulnerabilidad, se comunica a la administración, que dispone de un plazo máximo e improrrogable de dos meses desde la notificación para ofrecer una alternativa habitacional adecuada o, en su defecto, pagar o consignar la totalidad de lo reclamado.',
      },
      {
        titulo: 'Reforma de la LAU',
        archivo: DESAHUCIOS,
        ancla: ancla('Art. 3 (RDL 26/2026). Reforma de la LAU'),
        medida: true,
        texto: 'El artículo 3 modifica veintidós apartados de la Ley de Arrendamientos Urbanos.',
      },
      {
        titulo: 'Prórroga indefinida',
        archivo: DESAHUCIOS,
        ancla: { id: 'coordinacion' },
        medida: true,
        texto: 'El RDL 27/2026 establecía una prórroga indefinida de cinco y siete años.',
      },
    ],
  },
  {
    href: '/fiscal',
    titulo: 'Fiscalidad',
    pistas: /\b(fiscal|fiscalidad|irpf|iva|ibi|socimi|impuesto|impuestos|tributario|tributarios)\b/,
    resumen: {
      titulo: 'Fiscalidad',
      archivo: FISCAL,
      medida: true,
      texto:
        'El RDL 26/2026 preveía nuevas reducciones en el IRPF por alquiler, IVA sobre estancias cortas, recargos de IBI por vivienda desocupada y alojamientos turísticos, y el gravamen especial de las SOCIMI (Título II). El decreto fue derogado el 2-10-2026: ninguna de estas medidas se aplica.',
    },
    puntos: [
      {
        titulo: 'IRPF',
        archivo: FISCAL,
        ancla: ancla('Art. 6 (RDL 26/2026). IRPF'),
        medida: true,
        texto: 'nuevas reducciones en el IRPF por alquiler',
      },
      {
        titulo: 'IVA',
        archivo: FISCAL,
        ancla: ancla('Art. 7 (RDL 26/2026). IVA'),
        medida: true,
        texto: 'IVA sobre estancias cortas',
      },
      {
        titulo: 'IBI',
        archivo: FISCAL,
        ancla: ancla('Art. 8 (RDL 26/2026). IBI'),
        medida: true,
        texto: 'recargos de IBI por vivienda desocupada y alojamientos turísticos',
      },
      {
        titulo: 'SOCIMI',
        archivo: FISCAL,
        ancla: ancla('Arts. 9 y 10'),
        medida: true,
        texto: 'el gravamen especial de las SOCIMI (Título II)',
      },
    ],
  },
  {
    href: '/financiacion',
    titulo: 'Financiación y cuenta',
    pistas:
      /\b(financiacion|aval|avales|tu casa|financia europa|parque publico|cuenta de ahorro)\b/,
    resumen: {
      titulo: 'Financiación y cuenta',
      archivo: FINANCIACION,
      medida: true,
      texto:
        'El RDL 26/2026 preveía movilización de parque público, dos líneas de avales por 2.000 M€ y 280 M€, el préstamo TU CASA al 0 % y la nueva Cuenta de Ahorro e Inversión Financia Europa (Títulos III a VI). El decreto fue derogado el 2-10-2026: ninguna de estas medidas se aplica.',
    },
    puntos: [
      {
        titulo: 'Parque público',
        archivo: FINANCIACION,
        ancla: ancla('Parque público (arts. 11 a 14)'),
        medida: true,
        texto: 'movilización de parque público',
      },
      {
        titulo: 'Avales y TU CASA',
        archivo: FINANCIACION,
        ancla: ancla('Avales y TU CASA (arts. 15 a 19)'),
        medida: true,
        texto: 'dos líneas de avales por 2.000 M€ y 280 M€, el préstamo TU CASA al 0 %',
      },
      {
        titulo: 'Cuenta Financia Europa',
        archivo: FINANCIACION,
        ancla: ancla('Cuenta de Ahorro e Inversión Financia Europa (art. 20 RDL 26/2026)'),
        medida: true,
        texto: 'la nueva Cuenta de Ahorro e Inversión Financia Europa (Títulos III a VI)',
      },
    ],
  },
  {
    href: '/estado',
    titulo: 'Estado y advertencias',
    pistas: /\b(pagina de estado|estado y advertencias|el estado|advertencias|convalidacion)\b/,
    resumen: {
      titulo: 'Estado y advertencias',
      archivo: ESTADO,
      medida: true,
      texto:
        'RDL 26/2026 entró en vigor el 1-10-2026 y RDL 27/2026 el 2-10-2026, pero ambos quedaron derogados ese mismo 2-10-2026 al rechazar el Congreso su convalidación. Qué medidas contenían, cuáles dependían todavía de un acuerdo ministerial u ordenanza, y las cuatro advertencias que conviene leer antes de fiarse de una cifra.',
    },
    puntos: [
      {
        titulo: 'Entrada en vigor y derogación',
        archivo: ESTADO,
        medida: true,
        texto:
          'RDL 26/2026 entró en vigor el 1-10-2026 y RDL 27/2026 el 2-10-2026, pero ambos quedaron derogados ese mismo 2-10-2026 al rechazar el Congreso su convalidación.',
      },
      {
        titulo: 'Situación de cada medida',
        archivo: ESTADO,
        ancla: ancla('Situación de cada medida'),
        medida: true,
        texto:
          'La tabla resume lo que contenían los decretos; desde el 2-10-2026, tras el rechazo de la convalidación, ninguna medida se aplica: todas figuran como Derogada.',
      },
    ],
  },
  {
    href: '/normas',
    titulo: 'Normas citadas',
    pistas: /\b(normas citadas|pagina de normas|las normas)\b/,
    resumen: {
      titulo: 'Normas citadas',
      archivo: NORMAS,
      medida: false,
      texto:
        'Cada referencia a un artículo de este sitio nombra su norma. Estas son las normas citadas, con el título oficial y el enlace permanente en el «BOE».',
    },
    puntos: [
      {
        titulo: 'Normas citadas',
        archivo: NORMAS,
        medida: false,
        texto:
          'Cada referencia a un artículo de este sitio nombra su norma. Estas son las normas citadas, con el título oficial y el enlace permanente en el «BOE».',
      },
      {
        titulo: 'Los dos reales decretos-ley',
        archivo: NORMAS,
        ancla: ancla('Los dos reales decretos-ley'),
        medida: false,
        texto:
          'Las dos primeras tienen color propio porque son los dos reales decretos-ley del sitio: el RDL 26/2026 y el RDL 27/2026.',
      },
    ],
  },
];

const POR_HREF = new Map(PAGINAS.map((p) => [p.href, p]));

/** Lo que el redactor puede llegar a citar, para comprobar que sigue publicado. */
export function fragmentosPublicados(): { archivo: string; texto: string }[] {
  const vistos = new Set<string>();
  const salida: { archivo: string; texto: string }[] = [];
  for (const pagina of PAGINAS) {
    for (const punto of [pagina.resumen, ...pagina.puntos]) {
      const clave = `${punto.archivo}\n${punto.texto}`;
      if (vistos.has(clave)) continue;
      vistos.add(clave);
      salida.push({ archivo: punto.archivo, texto: punto.texto });
    }
  }
  return salida;
}

const RELLENO = new Set([
  'resume',
  'resumir',
  'resumeme',
  'resumen',
  'sintetiza',
  'sintesis',
  'sintetizar',
  'puntos',
  'punto',
  'clave',
  'claves',
  'esencial',
  'esenciales',
  'principal',
  'principales',
  'imprescindible',
  'imprescindibles',
  'temas',
  'tema',
  'ideas',
  'idea',
  'lienzo',
  'pizarra',
  'tablero',
  'diapositiva',
  'diapositivas',
  'slide',
  'slides',
  'canvas',
  'grandes',
  'rasgos',
  'vision',
  'general',
  'vistazo',
  'overview',
  'summary',
  'summarize',
  'summarise',
  'takeaway',
  'takeaways',
  'key',
  'points',
  'essential',
  'topics',
  'main',
  'board',
  'dame',
  'quiero',
  'haz',
  'hacer',
  'pon',
  'ponme',
  'lista',
  'listame',
  'prepara',
  'preparame',
  'cuales',
  'cual',
  'son',
  'sobre',
  'parte',
  'pagina',
  'web',
  'sitio',
  'todo',
  'toda',
  'todos',
  'todas',
  'este',
  'esta',
  'del',
  'las',
  'los',
  'una',
  'uno',
  'por',
  'favor',
  'breve',
  'corto',
  'cortos',
  'corta',
  'para',
  'con',
  'como',
  'que',
  'hay',
  'mas',
  'muy',
  'sus',
  'the',
  'and',
  'for',
  'with',
  'into',
  'from',
]);

const DEL_SITIO = new Set([
  'alquiler',
  'alquileres',
  'desahucio',
  'desahucios',
  'fiscal',
  'fiscalidad',
  'irpf',
  'iva',
  'ibi',
  'socimi',
  'financiacion',
  'aval',
  'avales',
  'vivienda',
  'decreto',
  'decretos',
  'norma',
  'normas',
  'estado',
  'convalidacion',
  'inquilino',
  'inquilinos',
  'casero',
  'renta',
  'lau',
  'impuesto',
  'impuestos',
  'prorroga',
  'prorrogas',
  'enervacion',
  'lanzamiento',
  'lanzamientos',
  'turistico',
  'turisticos',
  'europa',
  'parque',
  'advertencia',
  'advertencias',
  'boe',
  'rdl',
  'medida',
  'medidas',
  'analisis',
  'portada',
  'minuto',
  'arrendamiento',
  'arrendamientos',
  'tributario',
  'tributarios',
  'cuenta',
  'ahorro',
  'socimis',
]);

function pideAmplitud(q: string): boolean {
  return (
    /\bresume\b/.test(q) ||
    /\bresumir\b/.test(q) ||
    /\bresumeme\b/.test(q) ||
    /\bsinteti[zc]/.test(q) ||
    /\bun resumen\b/.test(q) ||
    /\bpuntos?\s+(clave|esencial\w*|principal\w*|imprescindible\w*)\b/.test(q) ||
    /\btemas?\s+(clave|esencial\w*|imprescindible\w*|principal\w*)\b/.test(q) ||
    /\bideas?\s+clave\b/.test(q) ||
    /\blo\s+(esencial|imprescindible)\b/.test(q) ||
    /\b(lienzo|pizarra|tablero|diapositivas?|slides?|canvas|board)\b/.test(q) ||
    /\ba\s+grandes\s+rasgos\b/.test(q) ||
    /\bvision\s+general\b/.test(q) ||
    /\bde\s+un\s+vistazo\b/.test(q) ||
    /\b(overview|summar(?:y|ize|ise)|takeaways?|key\s+points|essential\s+topics|main\s+points)\b/.test(
      q,
    )
  );
}

/** Una pregunta concreta que solo usa «resume» de pasada sigue el camino estrecho. */
function esEstrecha(q: string): boolean {
  const fuerte =
    /\b(la web|el sitio|este sitio|the site|the website|puntos?\s+clave|puntos?\s+esencial|temas?\s+imprescindible|temas?\s+esencial|lienzo|pizarra|tablero|diapositiva|canvas|parte fiscal|parte de)\b/.test(
      q,
    );
  if (fuerte) return false;
  if (/\b(art\.?|articulo)\s*\d/.test(q)) return true;
  if (/\b(puedo|debo|me pueden|mi contrato|mi casero|cuanto|que porcentaje|si o no)\b/.test(q)) {
    return true;
  }
  return false;
}

function fueraDeSitio(q: string): boolean {
  if (/\b(la web|el sitio|este sitio|este analisis|the site|the website|whole site)\b/.test(q)) {
    return false;
  }
  const palabras = q.split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !RELLENO.has(w));
  if (palabras.length === 0) return false;
  return !palabras.some((w) => DEL_SITIO.has(w));
}

function paginasDe(pregunta: string): PaginaAmplia[] | null {
  const q = normalizar(pregunta);
  if (!pideAmplitud(q) || esEstrecha(q) || fueraDeSitio(q)) return null;
  if (/\b(la web|el sitio|este sitio|este analisis|toda la web|todo el sitio|todo el analisis|the site|the website|whole site)\b/.test(q)) {
    return PAGINAS;
  }
  const elegidas = PAGINAS.filter((p) => p.pistas.test(q));
  return elegidas.length === 0 ? PAGINAS : elegidas;
}

function hrefDe(pagina: PaginaAmplia, punto: Punto): string {
  if (!punto.ancla) return pagina.href === '/' ? '/' : `${pagina.href}/`;
  const id = 'id' in punto.ancla ? punto.ancla.id : slugify(punto.ancla.slug);
  return pagina.href === '/' ? `/#${id}` : `${pagina.href}#${id}`;
}

function cierra(texto: string): string {
  const limpio = texto.replace(/\s+/g, ' ').trim();
  const cap = /^[a-záéíóúüñ]/.test(limpio) ? limpio.charAt(0).toUpperCase() + limpio.slice(1) : limpio;
  return /[.!?]$/.test(cap) ? cap : `${cap}.`;
}

type Item = { titulo: string; href: string; texto: string; medida: boolean };

function redactar(items: Item[]): { respuesta: string; citas: CitaAmplia[] } {
  const citas: CitaAmplia[] = items.map((item) => ({ titulo: item.titulo, href: item.href }));
  const hayMedida = items.some((item) => item.medida);
  let nEstado = citas.findIndex((c) => c.href === HREF_ESTADO) + 1;
  if (hayMedida && nEstado === 0) {
    citas.push({ titulo: 'Estado y advertencias', href: HREF_ESTADO });
    nEstado = citas.length;
  }
  const lineas = items.map((item, i) => {
    const n = i + 1;
    const estado =
      item.medida && nEstado > 0
        ? nEstado === n
          ? ` ${FRASE_ESTADO}`
          : ` ${FRASE_ESTADO} [${nEstado}]`
        : '';
    return `${item.titulo} [${n}]. ${cierra(item.texto)}${estado}`;
  });
  return { respuesta: lineas.join('\n\n'), citas };
}

/**
 * Respuesta cerrada para un pedido amplio, o `null` si la pregunta no lo es.
 * `null` devuelve el camino estrecho: búsqueda, y la negativa fija si no hay
 * nada del análisis.
 */
export function responderAmplia(
  pregunta: string,
): { respuesta: string; citas: CitaAmplia[] } | null {
  const paginas = paginasDe(pregunta);
  if (!paginas || paginas.length === 0) return null;
  const items: Item[] =
    paginas.length === 1
      ? paginas[0].puntos.map((punto) => ({
          titulo: punto.titulo,
          href: hrefDe(paginas[0], punto),
          texto: punto.texto,
          medida: punto.medida,
        }))
      : paginas.map((pagina) => ({
          titulo: pagina.titulo,
          href: hrefDe(pagina, pagina.resumen),
          texto: pagina.resumen.texto,
          medida: pagina.resumen.medida,
        }));
  if (items.length === 0) return null;
  return redactar(items);
}

/** Las seis rutas del análisis, en el orden de la navegación. */
export const PAGINAS_PRINCIPALES: string[] = ALL_LINKS.map((link) => link.href);

// La etiqueta de cada página sale del mismo sitio que la navegación. Si el
// rótulo del enlace cambia, el título que se cita cambia con él.
for (const link of ALL_LINKS) {
  const pagina = POR_HREF.get(link.href);
  if (!pagina) throw new Error(`falta la página ${link.href} en el resumen amplio`);
  pagina.titulo = link.label;
  pagina.resumen.titulo = link.label;
}
