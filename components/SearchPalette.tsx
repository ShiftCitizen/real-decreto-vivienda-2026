'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type EntryType = 'page' | 'section' | 'faq' | 'norma';

type Entry = {
  type: EntryType;
  title: string;
  href: string;
  section: string;
  keywords: string;
  excerpt?: string;
};

const TYPE_LABEL: Record<EntryType, string> = {
  page: 'Páginas',
  section: 'Secciones',
  faq: 'Preguntas',
  norma: 'Normas',
};

const GROUP_ORDER: EntryType[] = ['page', 'section', 'faq', 'norma'];

/**
 * Accent- and case-insensitive normalisation, applied once per entry at load so
 * every keystroke is a plain `includes`. This is why the site needs no search
 * library: a Spanish reader types "vivienda asequible" about as often with the
 * ñ as without it.
 */
function normalize(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

const MAX_RESULTS = 14;

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function SearchPalette({ open, onClose }: Props) {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [announcement, setAnnouncement] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Every close path goes through this, or keyboard users get dumped on <body>
  // when they dismiss the palette with Escape.
  const closeAndRestore = useCallback(() => {
    onClose();
    requestAnimationFrame(() => restoreFocusRef.current?.focus());
  }, [onClose]);

  useEffect(() => {
    if (open) restoreFocusRef.current = document.activeElement as HTMLElement | null;
  }, [open]);

  /**
   * The index is a separate static file rather than part of the layout bundle,
   * so pages stay as light as they were before search existed and only users who
   * open the palette pay for it.
   *
   * `fetchedRef` guards against a double fetch and deliberately does NOT depend
   * on `loading`: putting it in this dep list would re-run the effect when
   * loading flips to true, and the cleanup would set `cancelled` before the
   * response arrived, leaving the palette stuck on "Cargando".
   */
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!open || fetchedRef.current) return;
    fetchedRef.current = true;
    setLoading(true);
    fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Entry[]) => {
        setEntries(data.map((entry) => ({ ...entry, keywords: normalize(entry.keywords) })));
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [open]);

  const results = useMemo(() => {
    if (!entries) return [];
    const needle = normalize(query.trim());
    // Empty query is the browse screen, so show the page map rather than
    // truncating it — it is only a handful of links.
    if (!needle) return entries.filter((entry) => entry.type === 'page');

    const scored: { entry: Entry; score: number }[] = [];
    for (const entry of entries) {
      const title = normalize(entry.title);
      let score = 0;
      if (title === needle) score = 7;
      else if (title.startsWith(needle)) score = 6;
      else if (title.includes(needle)) score = 5;
      else if (entry.keywords.includes(needle)) score = 2;
      else continue;
      scored.push({ entry, score });
    }

    // Stable sort: equal scores keep index order (pages, sections, FAQ, normas).
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, MAX_RESULTS).map((s) => s.entry);
  }, [entries, query]);

  const grouped = useMemo(
    () =>
      GROUP_ORDER.map((type) => ({ type, items: results.filter((r) => r.type === type) })).filter(
        (group) => group.items.length > 0,
      ),
    [results],
  );

  // Flat order must match DOM order so arrow keys traverse groups seamlessly.
  const flat = useMemo(() => grouped.flatMap((group) => group.items), [grouped]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIndex(0);
      // Mounted only while open, so autoFocus fires (an element permanently
      // mounted behind `hidden` never gets it).
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.classList.remove('search-open');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.classList.add('search-open');
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        // Keep the sidebar drawer's own Escape handler from also firing.
        event.stopPropagation();
        closeAndRestore();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('search-open');
    };
  }, [open, closeAndRestore]);

  // Screen readers hear nothing otherwise: focus stays in the input.
  useEffect(() => {
    if (!open) return;
    if (loading) setAnnouncement('Cargando índice de búsqueda');
    else if (failed) setAnnouncement('No se pudo cargar el buscador');
    else if (!query.trim()) setAnnouncement('');
    else if (results.length === 0) setAnnouncement('Sin resultados');
    else setAnnouncement(`${results.length} resultado${results.length === 1 ? '' : 's'}`);
  }, [open, loading, failed, query, results.length]);

  const activeId = flat.length > 0 ? `search-opt-${activeIndex}` : undefined;

  // aria-activedescendant moves the reported focus, not DOM focus, so the caret
  // stays in the input and typing keeps filtering. Browsers do not scroll an
  // element into view for a descendant reference, so do it ourselves.
  useEffect(() => {
    const active = listRef.current?.querySelector<HTMLElement>('[data-active="true"]');
    active?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, flat]);

  const move = useCallback(
    (delta: number) => {
      if (flat.length === 0) return;
      setActiveIndex((prev) => (prev + delta + flat.length) % flat.length);
    },
    [flat.length],
  );

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        if (flat.length === 0) return;
        event.preventDefault();
        move(1);
        break;
      case 'ArrowUp':
        if (flat.length === 0) return;
        event.preventDefault();
        move(-1);
        break;
      case 'Home':
        if (flat.length === 0) return;
        event.preventDefault();
        setActiveIndex(0);
        break;
      case 'End':
        if (flat.length === 0) return;
        event.preventDefault();
        setActiveIndex(flat.length - 1);
        break;
      case 'Enter': {
        const target = flat[activeIndex];
        if (!target) return;
        event.preventDefault();
        window.location.href = target.href;
        break;
      }
      default:
        break;
    }
  };

  if (!open) return null;

  let flatIndex = -1;

  return (
    <div
      className="search-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="searchTitle"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeAndRestore();
      }}
    >
      <h2 id="searchTitle" className="sr-only">
        Buscar en el análisis
      </h2>

      <div className="search-panel">
        <div className="search-field">
          <span className="search-icon" aria-hidden="true">
            ⌕
          </span>
          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="Buscar en el análisis…"
            aria-label="Buscar en el análisis"
            role="combobox"
            aria-expanded={flat.length > 0}
            aria-controls="search-results"
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            autoComplete="off"
            spellCheck={false}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
            }}
            onKeyDown={onKeyDown}
          />
          <button
            type="button"
            className="search-close"
            onClick={closeAndRestore}
            aria-label="Cerrar buscador"
          >
            ✕
          </button>
        </div>

        <div className="search-status" role="status" aria-live="polite">
          {announcement}
        </div>

        {loading && <p className="search-hint">Cargando…</p>}
        {failed && (
          <p className="search-hint">
            No se pudo cargar el índice de búsqueda. Recarga la página e inténtalo de nuevo.
          </p>
        )}

        {!loading && !failed && (
          <ul
            className="search-results"
            id="search-results"
            ref={listRef}
            role="listbox"
            aria-label="Resultados de búsqueda"
          >
            {grouped.map((group) => (
              <li key={group.type} className="search-group">
                <p className="search-group-title">{TYPE_LABEL[group.type]}</p>
                <ul>
                  {group.items.map((item) => {
                    flatIndex += 1;
                    const index = flatIndex;
                    const isActive = index === activeIndex;
                    return (
                      <li key={`${item.type}-${item.href}`}>
                        <a
                          href={item.href}
                          id={`search-opt-${index}`}
                          role="option"
                          aria-selected={isActive}
                          className="search-result"
                          data-active={isActive}
                          onClick={closeAndRestore}
                          onMouseEnter={() => setActiveIndex(index)}
                        >
                          <span className="search-result-title">{item.title}</span>
                          <span className="search-result-meta">{item.section}</span>
                          {item.excerpt && (
                            <span className="search-result-excerpt">{item.excerpt}</span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            {flat.length === 0 && !query.trim() && (
              <li className="search-hint">Escribe para buscar en el análisis.</li>
            )}
            {flat.length === 0 && query.trim() && (
              <li className="search-hint">
                Sin resultados para «{query.trim()}».
              </li>
            )}
          </ul>
        )}

        <p className="search-footnote">
          <kbd>↑</kbd> <kbd>↓</kbd> navegar · <kbd>Enter</kbd> abrir · <kbd>Esc</kbd> cerrar
        </p>
      </div>
    </div>
  );
}
