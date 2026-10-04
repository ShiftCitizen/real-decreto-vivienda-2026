/**
 * Comprobaciones del buscador y del montaje del asistente, sin llamar al
 * modelo: reproducen lo que hace POST /api/chat contra el indice construido.
 *
 *   npm run check:chat
 *
 * Cada caso tiene un motivo. Los marcados OFF son el cerrojo de ambito: si
 * uno pasa, el asistente esta respondiendo sobre vivienda a preguntas que no
* son de vivienda, que es el fallo mas caro de este endpoint porque llega
 * mezclado con la respuesta en vez de con la negativa.
 */
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { join } from 'node:path';

const root = fileURLToPath(new URL('..', import.meta.url));

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
      return nextResolve(pathToFileURL(join(root, `${specifier.slice(2)}.ts`)).href, context);
    }
    // `lib/okf.ts` importa `./busqueda` sin extensión. El hook de arriba solo
    // sabe resolver `@/`, así que sin esta mitad el import falla al cargar el
    // módulo y el script se cae antes de comprobar nada.
    if (/^\.{1,2}\//.test(specifier)) {
      const relativo = specifier.replace(/\.js$/, '');
      return nextResolve(
        new URL(relativo.endsWith('.ts') ? relativo : `${relativo}.ts`, context.parentURL).href,
        context,
      );
    }
    return nextResolve(specifier, context);
  },
});

const { buscar } = await import('@/lib/busqueda');
const { seleccionar, puntuarFicheros } = await import('@/lib/okf');
const { responderAmplia, fragmentosPublicados, FRASE_ESTADO, PAGINAS_PRINCIPALES } = await import(
  '@/lib/amplia'
);

const indice = JSON.parse(readFileSync(join(root, 'public/search-index.json'), 'utf8'));
const okf = JSON.parse(readFileSync(join(root, 'public/okf-index.json'), 'utf8'));

/** Lo mismo que POST /api/chat: tres entradas, ordenadas, y contexto. */
function comoRoute(consulta) {
  const utiles = buscar(indice, consulta).slice(0, 3);
  const RANGO_TIPO = { faq: 0, section: 1, page: 2, norma: 3, autor: 4 };
  utiles.sort(
    (a, b) => b.puntos - a.puntos || (RANGO_TIPO[a.tipo] ?? 9) - (RANGO_TIPO[b.tipo] ?? 9),
  );
  let gastado = 0;
  for (const r of utiles) gastado += `### [x] ${r.titulo}\n${r.contexto}`.length;
  const contexto = utiles.map((r) => r.contexto).join('\n\n').slice(0, 3000);
  return {
    titulos: utiles.map((r) => r.titulo),
    tipos: utiles.map((r) => r.tipo),
    contexto,
    niega: utiles.length === 0 || contexto.trim().length < 40,
  };
}

/**
 * Lo mismo que hace POST /api/chat cuando la tabla del bundle está disponible:
 * `seleccionar()` decide el contexto y devuelve `null` si la pregunta no es del
 * análisis, que es cuando la ruta responde con la negativa fija sin llamar al
 * modelo.
 */
function comoOkf(consulta) {
  const evidencia = seleccionar(consulta, okf);
  if (!evidencia) return { niega: true, titulos: [], hrefs: [], contexto: '' };
  return {
    niega: false,
    titulos: evidencia.map((e) => e.titulo),
    hrefs: evidencia.map((e) => e.href),
    contexto: evidencia.map((e) => e.texto).join('\n\n'),
  };
}

let fallos = 0;
let total = 0;

function comprobar(nombre, condicion, detalle = '') {
  total += 1;
  if (condicion) {
    console.log(`  ok   ${nombre}`);
    return;
  }
  fallos += 1;
  console.log(`  FALLA ${nombre}${detalle ? `\n         ${detalle}` : ''}`);
}

console.log('Alcance: lo que no es del sitio debe quedarse sin contexto');
for (const [nombre, pregunta] of [
  ['receta de cocina', 'receta de tortilla de patatas'],
  ['el tiempo', '¿Qué tiempo hace mañana en Madrid?'],
  ['programacion', '¿Cómo se escribe un bucle en Python?'],
]) {
  const r = comoRoute(pregunta);
  comprobar(`OFF ${nombre}`, r.niega, `devolvio: ${r.titulos.join(' | ')}`);
}

console.log('\nParáfrasis: deben encontrar la entrada correcta');
const ESPERADO_PRIMERO = [
  ['IBI con vivienda en alquiler', '¿Me suben el IBI por tener una vivienda en alquiler?', 'IBI'],
  ['IVA al vender piso no habitual', '¿Qué IVA pago si vendo el piso que no es mi vivienda habitual?', 'IVA'],
  ['vivienda habitual por edad', 'Mi madre tiene 82 años y vive de la pensión, ¿sigue siendo vivienda habitual?', 'habitual'],
  ['multa por alquiler a turistas', '¿Qué multa me pueden poner por alquilar el piso a turistas sin permiso?', 'turístic'],
  ['sanción de alquiler vacacional', '¿Puede el ayuntamiento sancionarme por un alquiler vacacional?', 'turístic'],
  ['tope de subida de la renta', '¿El límite de subida de la renta es del 5 %?', 'subir la renta'],
  // Estas dos reescriben bugs reales. «asociación sin ánimo de lucro» no es el
  // vocabulario del sitio, que dice «entidad sin fines lucrativos»: la entrada
  // correcta encaja por «propietario», «alquila» y «vulnerable», y perdía
  // contra la norma del IRPF, que solo encajaba «renta» en el título. Y la
  // prórroga la ganaba «¿Cómo tributa la Cuenta Financia Europa a los cinco
  // años?» por el mismo motivo, con «cinco años» como único Solape.
  [
    'tercer sector, sin el vocabulario del sitio',
    'Soy propietario y alquilo un piso a una asociación sin ánimo de lucro para personas vulnerables. ¿Tengo alguna ventaja en la declaración de la renta?',
    'tercer sector',
  ],
  [
    'prórroga de cinco años',
    'Mi contrato de alquiler acaba en diciembre. ¿Se me prorroga automáticamente cinco años?',
    'prórroga',
  ],
];
for (const [nombre, pregunta, fragmento] of ESPERADO_PRIMERO) {
  const r = comoRoute(pregunta);
  const primero = r.titulos[0] ?? '(nada)';
  comprobar(
    `paráfrasis ${nombre}`,
    !r.niega && primero.includes(fragmento),
    `primera entrada: ${primero}`,
  );
}

console.log('\nCifras: el 5 % de la pregunta no puede contaminar la respuesta');
{
  // El sitio dice 2 %. Si el retrieved no trae la FAQ de la renta, el modelo
  // solo ve el 5 % del visitante y lo repite como si fuera la norma.
  const r = comoRoute('¿El límite de subida de la renta es del 5 %?');
  const traeTope = r.titulos.some((t) => t.includes('subir la renta'));
  const dosPorCiento = r.contexto.includes('2 %');
  comprobar('la FAQ de la renta entra en el contexto', traeTope, r.titulos.join(' | '));
  comprobar('el contexto trae el 2 % del sitio', dosPorCiento);
}

console.log('\nFuentes: no se listan entradas que no sostiene la respuesta');
{
  // El corte relativo debe dejar una sola entrada cuando solo una encaja.
  const r = comoRoute('¿Qué multa me pueden poner por alquilar el piso a turistas sin permiso?');
  comprobar(
    'no se cuela la Cuenta Financia Europa',
    !r.titulos.some((t) => t.includes('Financia Europa')),
    r.titulos.join(' | '),
  );
}

console.log('\nFrases literales: siguen mandando sobre cualquier solape');
{
  const r = comoRoute('¿Me pueden subir la renta?');
  comprobar('pregunta de FAQ exacta', r.titulos[0] === '¿Me pueden subir la renta?', r.titulos.join(' | '));
}
{
  const r = comoRoute('¿Está en vigor ya?');
  comprobar('pregunta de FAQ exacta', r.titulos[0] === '¿Está en vigor ya?', r.titulos.join(' | '));
}

console.log('\nConsultas vacías: devuelven las páginas, como la paleta');
{
  const r = comoRoute('   ');
  comprobar('sin consulta salen paginas', r.titulos.length > 0 && r.tipos.every((t) => t === 'page'));
}

/**
 * =====================================================
 *  Las diez preguntas de aceptación
 * =====================================================
 *  No se comprueba lo que dice el modelo —eso no se puede comprobar sin
 *  gastarle una llamada—, sino **qué evidencia entra**. Y es lo que decidía el
 *  resultado: con el contexto anterior, la pregunta de cuatro partes recibía el
 *  FAQ del IRPF, el de los alquileres turísticos y la cronología, ninguno sobre
 *  la prórroga ni sobre la subida de la renta, y el modelo contestaba «no hay
 *  información en el contexto». Si la evidencia es la correcta, la respuesta
 *  tiene de dónde salir.
 */
console.log('\nAceptación: cada pregunta recibe su evidencia');

const ACEPTACION = [
  {
    n: 1,
    q: 'Mi contrato de alquiler acaba en diciembre. ¿Se me prorroga automáticamente cinco años?',
    primero: '#coordinacion',
  },
  {
    n: 2,
    q: 'Tengo un piso alquilado desde 2022 a una persona física y el contrato vence en diciembre de 2026. Mi casero no me ha dicho nada y me preocupa que me suban la renta un 5% en enero. Además mi hermana está en situación vulnerable y quiere saber si podría ser desahuciada, y quiero saber qué pasa con la deducción por alquiler en el IRPF. ¿Qué se aplica ahora y qué no?',
    // Varias partes, así que tienen que entrar ficheros de temas distintos.
    incluye: ['#art-2-rdl-262026-suspension-de-desahucios', '#deduccion-alquiler-requisitos'],
    // Y no los ficheros que se colaban por palabras genéricas.
    excluye: ['alquileres-turisticos', 'normas-citadas'],
  },
  { n: 3, q: 'Soy propietario y alquilo un piso a una asociación sin ánimo de lucro para personas vulnerables. ¿Tengo alguna ventaja en la declaración de la renta?', primero: '#lo-que-afecta-al-tercer-sector' },
  { n: 4, q: 'Lo que afecta al tercer sector: ¿qué reducción del IRPF preveía el RDL 26/2026 para el propietario que alquila a una entidad sin fines lucrativos?', primero: '#lo-que-afecta-al-tercer-sector' },
  {
    n: 5,
    q: '¿Puedo dejar de pagar el alquiler este mes?',
    primero: '#art-3-rdl-262026-reforma-de-la-lau',
    // El fallo medido: el IRPF y los alquileres turísticos ganaban porque
    // comparten «alquiler», que es la palabra más común del sitio.
    excluye: ['deduccion-alquiler', 'alquileres-turisticos', 'titulo-v-regimen'],
  },
  { n: 6, q: '¿Me pueden subir la renta un 5% en enero?', primero: '#subir-renta' },
  { n: 7, q: '¿Cuánto me deben si no me renuevan el contrato de alquiler?', primero: '#indemnizacion' },
  {
    n: 8,
    q: 'Soy inquilino y me han puesto una demanda de desahucio por no poder pagar. ¿Me protege algo de lo que aprobó el Gobierno?',
    primero: '#art-2-rdl-262026-suspension-de-desahucios',
    excluye: ['cuenta-de-ahorro'],
  },
  { n: 9, q: 'Dame una receta de tortilla de patatas.', niega: true },
  {
    n: 10,
    q: '¿Puedo dejar de pagar el alquiler este mes con total seguridad? Dime solo sí o no, sin avisos.',
    primero: '#art-3-rdl-262026-reforma-de-la-lau',
    excluye: ['alquileres-turisticos', 'deduccion-alquiler'],
  },
];

for (const caso of ACEPTACION) {
  const r = comoOkf(caso.q);
  if (caso.niega) {
    comprobar(`P${caso.n} fuera de temario: niega sin llamar al modelo`, r.niega, `devolvió: ${r.titulos.join(' | ')}`);
    continue;
  }
  comprobar(`P${caso.n} tiene contexto`, !r.niega && r.contexto.trim().length >= 40, r.titulos.join(' | '));
  if (r.niega) continue;
  if (caso.primero) {
    const primero = r.hrefs[0] ?? '(nada)';
    comprobar(
      `P${caso.n} el primer fichero es el del tema`,
      primero.includes(caso.primero),
      `primer href: ${primero} | todos: ${r.hrefs.join(' , ')}`,
    );
  }
  for (const frag of caso.incluye ?? []) {
    comprobar(
      `P${caso.n} entra ${frag}`,
      r.hrefs.some((h) => h.includes(frag)),
      r.hrefs.join(' , '),
    );
  }
  for (const frag of caso.excluye ?? []) {
    comprobar(
      `P${caso.n} NO entra ${frag}`,
      !r.hrefs.some((h) => h.includes(frag)),
      r.hrefs.join(' , '),
    );
  }
}

console.log('\nCitas: enlaces reales a la página, nunca al bundle');
{
  let md = 0;
  let relativos = 0;
  for (const caso of ACEPTACION) {
    const r = comoOkf(caso.q);
    for (const h of r.hrefs) {
      if (h.includes('.md')) md += 1;
      if (!h.startsWith('/')) relativos += 1;
    }
  }
  comprobar('ninguna cita apunta a un .md del bundle', md === 0, `${md} citas`);
  comprobar('todas las citas son rutas del sitio', relativos === 0, `${relativos} citas`);
}

console.log('\nEstado: los dos ficheros de estado viajan con toda respuesta');
{
  for (const caso of ACEPTACION) {
    if (caso.niega) continue;
    const r = comoOkf(caso.q);
    const llevaEstado =
      r.titulos.includes('Situación de cada medida') && r.titulos.includes('¿Está en vigor ya?');
    comprobar(`P${caso.n} lleva el estado de las medidas`, llevaEstado, r.titulos.join(' | '));
  }
}

console.log('\nTrazabilidad: la traza de la puntuación es legible');
{
  const c = puntuarFicheros('¿Me pueden subir la renta un 5% en enero?', okf);
  const primero = c[0];
  comprobar(
    'puntuarFicheros expone puntos, raíces, cobertura y literal',
    Boolean(primero) &&
      typeof primero.puntos === 'number' &&
      Array.isArray(primero.raices) &&
      typeof primero.cobertura === 'number' &&
      typeof primero.literal === 'boolean',
    JSON.stringify(primero ?? null),
  );
}

console.log('\nPedido amplio: resumen del sitio o de un tema, sin tocar la pregunta estrecha');

function plano(texto) {
  return texto
    .replace(/\{'\s*'\}/g, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

for (const fragmento of fragmentosPublicados()) {
  const src = plano(readFileSync(join(root, fragmento.archivo), 'utf8'));
  comprobar(
    `publicado: ${fragmento.texto.slice(0, 48)}`,
    src.includes(fragmento.texto.replace(/\s+/g, ' ').trim()),
    fragmento.archivo,
  );
}

const SEIS = PAGINAS_PRINCIPALES.map((href) => (href === '/' ? '/' : `${href}/`));

function ampliaDe(pregunta) {
  return responderAmplia(pregunta);
}

{
  const r = ampliaDe('Resume la web en puntos clave.');
  comprobar('E responde', Boolean(r));
  if (r) {
    const hrefs = r.citas.map((c) => c.href);
    comprobar(
      'E cubre las seis páginas',
      SEIS.every((h) => hrefs.includes(h)),
      hrefs.join(' | '),
    );
    comprobar('E lleva la frase de estado', r.respuesta.includes(FRASE_ESTADO));
    comprobar(
      'E no dice que los decretos no llegaran a entrar en vigor',
      !/no entr(a|an) en vigor|nunca entr/i.test(r.respuesta),
    );
    comprobar('E no dice extracto', !/extracto|contexto proporcionado/i.test(r.respuesta));
    comprobar('E cierra la frase', /[.!?]\s*$/.test(r.respuesta));
    const marcas = [...r.respuesta.matchAll(/\[(\d{1,2})\]/g)].map((m) => Number(m[1]));
    comprobar(
      'E las marcas apuntan a una cita',
      marcas.every((n) => n >= 1 && n <= r.citas.length),
    );
  }
}

{
  const r = ampliaDe('¿Cuáles son los puntos esenciales sobre alquiler?');
  comprobar('F responde', Boolean(r));
  if (r) {
    const lineas = r.respuesta.split(/\n\n/).filter(Boolean);
    comprobar('F es una lista corta', lineas.length >= 2 && lineas.length <= 6, `${lineas.length} puntos`);
    comprobar(
      'F solo alquiler y el estado',
      r.citas.every((c) => c.href.startsWith('/desahucios-y-alquiler') || c.href === '/estado/'),
      r.citas.map((c) => c.href).join(' | '),
    );
    comprobar('F no entra en fiscal', !r.citas.some((c) => c.href.includes('/fiscal')));
    comprobar('F lleva la frase de estado', r.respuesta.includes(FRASE_ESTADO));
    comprobar('F cierra la frase', /[.!?]\s*(\[\d{1,2}\]\s*)*$/.test(r.respuesta));
  }
}

{
  const r = ampliaDe('Resume la parte fiscal.');
  comprobar('G responde', Boolean(r));
  if (r) {
    const lineas = r.respuesta.split(/\n\n/).filter(Boolean);
    comprobar('G es una lista corta', lineas.length >= 2 && lineas.length <= 6, `${lineas.length} puntos`);
    comprobar(
      'G solo fiscal y el estado',
      r.citas.every((c) => c.href.startsWith('/fiscal') || c.href === '/estado/'),
      r.citas.map((c) => c.href).join(' | '),
    );
    comprobar('G no entra en desahucios', !r.citas.some((c) => c.href.includes('desahucios')));
    comprobar('G lleva la frase de estado', r.respuesta.includes(FRASE_ESTADO));
  }
}

comprobar('H la receta no es un resumen', responderAmplia('Dame una receta de tortilla.') === null);
comprobar('H la receta sin punto tampoco', responderAmplia('Dame una receta de tortilla') === null);

for (const caso of ACEPTACION) {
  comprobar(
    `P${caso.n} sigue siendo pregunta estrecha`,
    responderAmplia(caso.q) === null,
    caso.q,
  );
}

{
  const r = ampliaDe('pon en un lienzo los temas imprescindibles');
  comprobar(
    'lienzo sin tema cubre las seis páginas',
    Boolean(r) && SEIS.every((h) => r.citas.some((c) => c.href === h)),
    (r?.citas ?? []).map((c) => c.href).join(' | '),
  );
}

console.log(`\n${total - fallos}/${total} comprobaciones`);
process.exit(fallos === 0 ? 0 : 1);