'use client';

import { useEffect, useRef, useState } from 'react';
import { formatearRespuesta } from '@/lib/chat-formato';

type Cita = { titulo: string; href: string };

/**
 * De dónde sale la respuesta.
 *
 * La widget dice la verdad: `publicado` son frases ya escritas en las páginas,
 * `modelo` es la síntesis del modelo, y `texto` es el análisis tal cual, que
 * es lo que se devuelve cuando el proveedor no contesta. Antes el pie decía
 * siempre «Respuesta generada con IA», incluso en el camino `publicado`, que
 * no usa ningún modelo.
 */
type Origen = 'publicado' | 'modelo' | 'texto';

type Estado =
  | { tipo: 'vacio' }
  | { tipo: 'cargando' }
  | { tipo: 'ok'; respuesta: string; citas: Cita[]; origen?: Origen }
  | { tipo: 'error'; mensaje: string };

const NOTA: Record<Origen, string> = {
  publicado: 'Frases publicadas en el sitio; no es asesoramiento jurídico.',
  modelo: 'Respuesta generada con IA a partir del análisis; no es asesoramiento jurídico.',
  texto: 'El asistente no ha podido generar una respuesta. Mientras tanto, aquí tienes los pasajes relevantes del análisis. No es asesoramiento jurídico.',
};

/**
 * Asistente del sitio: una pregunta suelta por vez, respondida por el
 * modelo solo a partir del análisis (vía POST /api/chat). Sin historial,
 * sin atajos de teclado que choquen con el buscador (⌘K).
 *
 * Disciplina de diálogo como la paleta: el panel solo existe montado
 * mientras está abierto (por eso autoFocus funciona), al cerrar se devuelve
 * el foco al botón, y Escape no llega a los componentes de detrás.
 */
export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false);
  const [pregunta, setPregunta] = useState('');
  const [estado, setEstado] = useState<Estado>({ tipo: 'vacio' });
  const fabRef = useRef<HTMLButtonElement>(null);

  const cerrar = () => {
    setAbierto(false);
    requestAnimationFrame(() => fabRef.current?.focus());
  };

  // Escape a nivel de documento: si el botón queda deshabilitado durante la
  // carga pierde el foco y el Escape no burbujearía desde dentro del panel.
  useEffect(() => {
    if (!abierto) return;
    const alTeclar = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        cerrar();
      }
    };
    document.addEventListener('keydown', alTeclar);
    return () => document.removeEventListener('keydown', alTeclar);
  }, [abierto]);

  const preguntar = async () => {
    const texto = pregunta.trim();
    if (!texto || estado.tipo === 'cargando') return;
    setEstado({ tipo: 'cargando' });
    try {
      // Con barra final: el sitio usa trailingSlash y así se evita la
      // redirección 307 del POST, que algunos clientes no reintenten.
      const res = await fetch('/api/chat/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta: texto }),
      });
      // El cuerpo se lee como texto y se convierte después, con un plan B.
      // Antes era `await res.json()` a pelo: un 500 con cuerpo vacío —que es
      // lo que devolvía un fallo del proveedor— producía un `SyntaxError`
      // que el `catch` traducía como «No hay conexión con el asistente». El
      // diagnóstico era falso: la red estaba bien.
      const crudo = await res.text();
      let datos: {
        respuesta?: string;
        citas?: Cita[];
        error?: string;
        origen?: Origen;
      } = {};
      try {
        datos = crudo ? (JSON.parse(crudo) as typeof datos) : {};
      } catch {
        datos = {};
      }
      if (!res.ok) {
        setEstado({
          tipo: 'error',
          mensaje: datos.error ?? `El asistente devolvió un error (${res.status}).`,
        });
        return;
      }
      setEstado({
        tipo: 'ok',
        respuesta: datos.respuesta ?? '',
        citas: datos.citas ?? [],
        origen: datos.origen,
      });
    } catch {
      // Aquí sí: la petición no llegó al servidor.
      setEstado({ tipo: 'error', mensaje: 'No hay conexión con el asistente.' });
    }
  };

  return (
    <>
      <button
        type="button"
        ref={fabRef}
        className="chat-fab"
        aria-expanded={abierto}
        aria-controls="asistente"
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <span aria-hidden="true">💬</span>
        <span className="chat-fab-label">Pregunta a los decretos</span>
      </button>

      {abierto && (
        <section className="chat-panel" id="asistente" role="dialog" aria-label="Asistente del análisis">
          <p className="chat-intro">
            Pregunta sobre el análisis. Solo responde a partir de su contenido.
            Comentarios o correcciones:{' '}
            <a href="mailto:contacto@shiftcitizen.com">contacto@shiftcitizen.com</a>.
          </p>
          <form
            className="chat-form"
            onSubmit={(event) => {
              event.preventDefault();
              void preguntar();
            }}
          >
            <input
              className="chat-input"
              type="text"
              value={pregunta}
              maxLength={500}
              autoFocus
              aria-label="Tu pregunta"
              placeholder="¿Cuánto me deben si no me renuevan?"
              onChange={(event) => setPregunta(event.target.value)}
            />
            <button type="submit" disabled={estado.tipo === 'cargando'}>
              {estado.tipo === 'cargando' ? '…' : 'Preguntar'}
            </button>
          </form>

          {estado.tipo === 'cargando' && (
            <div className="chat-estado" role="status">
              <span>Buscando en los decretos…</span>
              <span className="chat-loader" aria-hidden="true" />
            </div>
          )}
          {estado.tipo === 'error' && (
            <div className="chat-error-bloque">
              <p className="chat-error">{estado.mensaje}</p>
              <button type="button" className="chat-reintentar" onClick={() => void preguntar()}>
                Reintentar
              </button>
            </div>
          )}
          {estado.tipo === 'ok' && (
            <div className="chat-respuesta">
              {formatearRespuesta(estado.respuesta)}
              {estado.citas.length > 0 && (
                <ul className="chat-citas">
                  {estado.citas.map((cita, i) => (
                    <li key={`${cita.href}-${i}`}>
                      <a href={cita.href}>{cita.titulo}</a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="chat-aviso">
                {estado.origen ? NOTA[estado.origen] : 'No es asesoramiento jurídico.'}
              </p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
