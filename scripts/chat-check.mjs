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
    return nextResolve(specifier, context);
  },
});

const { buscar } = await import('@/lib/busqueda');

const indice = JSON.parse(readFileSync(join(root, 'public/search-index.json'), 'utf8'));

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

console.log(`\n${total - fallos}/${total} comprobaciones`);
process.exit(fallos === 0 ? 0 : 1);