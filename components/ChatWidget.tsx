'use client';

import { useEffect, useRef, useState } from 'react';

type Cita = { titulo: string; href: string };

type Estado = { tipo: 'vacio' } | { tipo: 'cargando' } | { tipo: 'ok'; respuesta: string; citas: Cita[] } | { tipo: 'error'; mensaje: string };

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
  // Mismo patrón que el cajón móvil de SiteNav.
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
      const datos = (await res.json()) as { respuesta?: string; citas?: Cita[]; error?: string };
      if (!res.ok) {
        setEstado({ tipo: 'error', mensaje: datos.error ?? 'No se pudo responder.' });
        return;
      }
      setEstado({ tipo: 'ok', respuesta: datos.respuesta ?? '', citas: datos.citas ?? [] });
    } catch {
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
        aria-label="Preguntar al asistente del análisis"
        onClick={() => (abierto ? cerrar() : setAbierto(true))}
      >
        <span aria-hidden="true">?</span>
      </button>

      {abierto && (
        <section className="chat-panel" id="asistente" role="dialog" aria-label="Asistente del análisis">
          <p className="chat-intro">
            Pregunta sobre el análisis. Solo responde a partir de su contenido.
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

          {estado.tipo === 'cargando' && <p className="chat-estado">Buscando en el análisis…</p>}
          {estado.tipo === 'error' && <p className="chat-error">{estado.mensaje}</p>}
          {estado.tipo === 'ok' && (
            <div className="chat-respuesta">
              <p>{estado.respuesta}</p>
              {estado.citas.length > 0 && (
                <ul className="chat-citas">
                  {estado.citas.map((cita) => (
                    <li key={cita.href}>
                      <a href={cita.href}>{cita.titulo}</a>
                    </li>
                  ))}
                </ul>
              )}
              <p className="chat-aviso">
                Respuesta generada con IA a partir del análisis; no es asesoramiento jurídico.
              </p>
            </div>
          )}
        </section>
      )}
    </>
  );
}
