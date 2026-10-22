import type { ReactNode } from 'react';
import { Fragment, createElement } from 'react';

/**
 * Formato ligero de la respuesta del asistente.
 *
 * El modelo (y a veces el plan B) escribe markdown: `**negrita**`, listas
 * numeradas y viñetas. El widget antes metía cada línea en un `<p>` y el
 * visitante veía los `**` literales. Aquí se convierte un subconjunto seguro
 * a nodos React —sin `dangerouslySetInnerHTML` y sin dependencia nueva—.
 *
 * Solo se aceptan: párrafos, `ol`/`ul`/`li`, `strong` y `em`. Nada de
 * enlaces, HTML crudo ni código: el modelo no debe inyectar markup.
 */

/** Negrita `**…**` y cursiva `*…*` / `_…_` en una línea de texto. */
export function enLinea(texto: string): ReactNode[] {
  const nodos: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\*(.+?)\*|_(.+?)_/g;
  let ultimo = 0;
  let m: RegExpExecArray | null;
  let clave = 0;
  while ((m = re.exec(texto)) !== null) {
    if (m.index > ultimo) {
      nodos.push(texto.slice(ultimo, m.index));
    }
    const fuerte = m[1];
    const cursiva = m[2] ?? m[3];
    if (fuerte !== undefined) {
      nodos.push(createElement('strong', { key: clave++ }, fuerte));
    } else if (cursiva !== undefined) {
      nodos.push(createElement('em', { key: clave++ }, cursiva));
    }
    ultimo = m.index + m[0].length;
  }
  if (ultimo < texto.length) nodos.push(texto.slice(ultimo));
  return nodos;
}

type Bloque =
  | { tipo: 'p'; texto: string }
  | { tipo: 'ol'; items: ItemLista[] }
  | { tipo: 'ul'; items: ItemLista[] };

type ItemLista = { texto: string; hijos?: ItemLista[] };

function esOl(linea: string): string | null {
  const m = /^(\d+)[.)]\s+(.+)$/.exec(linea);
  return m ? m[2] : null;
}

function esUl(linea: string): string | null {
  const m = /^[-*•]\s+(.+)$/.exec(linea);
  return m ? m[1] : null;
}

/**
 * Agrupa líneas en párrafos y listas. Una viñeta justo debajo de un ítem
 * numerado se anida dentro de ese ítem (el patrón que usa el modelo al
 * explicar dos procedimientos con subpasos).
 */
export function trocearBloques(texto: string): Bloque[] {
  const lineas = texto.replace(/\r\n/g, '\n').split('\n');
  const bloques: Bloque[] = [];
  let parrafo: string[] = [];
  let lista: { tipo: 'ol' | 'ul'; items: ItemLista[] } | null = null;

  const soltarParrafo = () => {
    if (parrafo.length === 0) return;
    const t = parrafo.join(' ').trim();
    parrafo = [];
    if (t) bloques.push({ tipo: 'p', texto: t });
  };

  const soltarLista = () => {
    if (!lista || lista.items.length === 0) {
      lista = null;
      return;
    }
    bloques.push({ tipo: lista.tipo, items: lista.items });
    lista = null;
  };

  for (const cruda of lineas) {
    const linea = cruda.trimEnd();
    const recortada = linea.trim();
    if (recortada.length === 0) {
      soltarParrafo();
      soltarLista();
      continue;
    }
    const ol = esOl(recortada);
    const ul = esUl(recortada);
    if (ol !== null) {
      soltarParrafo();
      if (!lista || lista.tipo !== 'ol') {
        soltarLista();
        lista = { tipo: 'ol', items: [] };
      }
      lista.items.push({ texto: ol });
      continue;
    }
    if (ul !== null) {
      soltarParrafo();
      if (lista?.tipo === 'ol' && lista.items.length > 0) {
        const ultimo = lista.items[lista.items.length - 1];
        if (!ultimo.hijos) ultimo.hijos = [];
        ultimo.hijos.push({ texto: ul });
        continue;
      }
      if (!lista || lista.tipo !== 'ul') {
        soltarLista();
        lista = { tipo: 'ul', items: [] };
      }
      lista.items.push({ texto: ul });
      continue;
    }
    soltarLista();
    parrafo.push(recortada);
  }
  soltarParrafo();
  soltarLista();
  return bloques;
}

function pintarItems(items: ItemLista[], clave: string): ReactNode[] {
  return items.map((item, i) =>
    createElement(
      'li',
      { key: `${clave}-${i}` },
      enLinea(item.texto),
      item.hijos && item.hijos.length > 0
        ? createElement('ul', { key: `${clave}-${i}-sub` }, pintarItems(item.hijos, `${clave}-${i}-h`))
        : null,
    ),
  );
}

/** Convierte la respuesta del asistente en nodos React seguros. */
export function formatearRespuesta(texto: string): ReactNode {
  const bloques = trocearBloques(texto);
  if (bloques.length === 0) return null;
  return createElement(
    Fragment,
    null,
    bloques.map((b, i) => {
      if (b.tipo === 'p') {
        return createElement('p', { key: `p-${i}` }, enLinea(b.texto));
      }
      return createElement(
        b.tipo,
        { key: `${b.tipo}-${i}` },
        pintarItems(b.items, `${b.tipo}-${i}`),
      );
    }),
  );
}
