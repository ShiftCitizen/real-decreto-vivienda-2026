'use client';

/* Tipos mínimos del subconjunto de la WebMCP Imperative API que usa este
   sitio (https://developer.chrome.com/docs/ai/webmcp/imperative-api):
   registro con esquema JSON, anotaciones de solo lectura y baja mediante
   AbortSignal. Se declaran aquí porque el paquete `webmcp-types` solo trae
   tipos sin JS y su aumento de Document no tiene efecto global. */
declare global {
  namespace WebMCP {
    interface ToolAnnotations {
      readOnlyHint?: boolean;
      untrustedContentHint?: boolean;
      consequentialHint?: boolean;
    }
    type ToolExecute = (
      input?: Record<string, unknown>,
      options?: { signal?: AbortSignal },
    ) => Promise<unknown>;
    interface ModelContextTool {
      name: string;
      description: string;
      inputSchema?: object;
      execute: ToolExecute;
      annotations?: ToolAnnotations;
    }
    interface ModelContext {
      registerTool(
        tool: ModelContextTool,
        options?: { signal?: AbortSignal },
      ): Promise<void>;
    }
  }
  interface Document {
    readonly modelContext?: WebMCP.ModelContext;
  }
}

import { useEffect } from 'react';
import { buscar } from '@/lib/busqueda';
import type { EntradaIndice } from '@/lib/busqueda';

/**
 * Herramientas WebMCP del sitio (solo lectura).
 *
 * Registra, únicamente cuando el navegador expone `document.modelContext`
 * (Chrome con WebMCP habilitado), dos herramientas para que un agente con
 * la página abierta pregunte por el contenido en vez de adivinar el DOM:
 * `buscar_en_el_sitio` (sobre el índice de búsqueda generado) y
 * `leer_pagina` (texto limpio de una de las seis rutas, sin salir del
 * mismo origen). Sin la API no hace nada: devuelve null y no toca el DOM.
 *
 * No hay backend ni claves: ambas leen ficheros estáticos ya públicos.
 * El índice que consumen lo genera `postbuild`, así que no puede
 * desfasarse del contenido publicado.
 */

const RUTAS_PERMITIDAS = [
  '/',
  '/desahucios-y-alquiler/',
  '/fiscal/',
  '/financiacion/',
  '/estado/',
  '/normas/',
];

const esquemaBusqueda = {
  type: 'object',
  properties: {
    consulta: {
      type: 'string',
      description:
        'Lo que se quiere encontrar: una medida, una cifra, una pregunta o un tema del sitio.',
    },
  },
  required: ['consulta'],
} as const;

const esquemaLectura = {
  type: 'object',
  properties: {
    ruta: {
      type: 'string',
      description:
        'Ruta de la página a leer, una de: /, /desahucios-y-alquiler/, /fiscal/, /financiacion/, /estado/, /normas/.',
    },
  },
  required: ['ruta'],
} as const;

let indiceCache: EntradaIndice[] | null = null;

async function cargarIndice(signal?: AbortSignal): Promise<EntradaIndice[]> {
  if (indiceCache) return indiceCache;
  const respuesta = await fetch('/search-index.json', { signal });
  if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
  indiceCache = (await respuesta.json()) as EntradaIndice[];
  return indiceCache;
}

export default function WebMcpTools() {
  useEffect(() => {
    const contexto = document.modelContext;
    if (!contexto) return;
    const controlador = new AbortController();
    const registrar = async () => {
      try {
        await contexto.registerTool(
          {
            name: 'buscar_en_el_sitio',
            description:
              'Busca en el análisis de los reales decretos-ley 26/2026 y 27/2026 de vivienda. Devuelve título, enlace, sección y extracto de las coincidencias.',
            inputSchema: esquemaBusqueda,
            annotations: { readOnlyHint: true },
            execute: async (
              { consulta }: Record<string, unknown> = {},
              { signal }: { signal?: AbortSignal } = {},
            ) => {
              const texto = typeof consulta === 'string' ? consulta : '';
              const resultados = buscar(await cargarIndice(signal), texto);
              const origen = window.location.origin;
              return resultados.map((r) => ({ ...r, href: `${origen}${r.href}` }));
            },
          },
          { signal: controlador.signal },
        );
        await contexto.registerTool(
          {
            name: 'leer_pagina',
            description:
              'Devuelve el texto principal de una página del análisis, sin navegación ni menús. Solo acepta las seis rutas del sitio.',
            inputSchema: esquemaLectura,
            annotations: { readOnlyHint: true },
            execute: async (
              { ruta }: Record<string, unknown> = {},
              { signal }: { signal?: AbortSignal } = {},
            ) => {
              const limpia = `/${String(ruta).split('#')[0].split('?')[0].replace(/^\/+/, '')}`;
              const normalizada = limpia === '/' ? '/' : `${limpia.replace(/\/+$/, '')}/`;
              if (!RUTAS_PERMITIDAS.includes(normalizada)) {
                throw new Error(`Ruta no permitida: ${String(ruta)}`);
              }
              const respuesta = await fetch(normalizada, { signal });
              if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
              const texto = await respuesta.text();
              const documento = new DOMParser().parseFromString(texto, 'text/html');
              const titulo =
                documento.querySelector('h1')?.textContent?.trim() ?? normalizada;
              const cuerpo =
                documento.querySelector('main')?.textContent?.replace(/\s+/g, ' ').trim() ??
                '';
              return { titulo, texto: cuerpo.slice(0, 4000) };
            },
          },
          { signal: controlador.signal },
        );
      } catch {
        // Sin WebMCP real (bandera desactivada, otro navegador) no hay nada
        // que hacer: la página sigue funcionando igual sin herramientas.
      }
    };
    void registrar();
    return () => controlador.abort();
  }, []);

  return null;
}
