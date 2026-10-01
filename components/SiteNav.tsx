'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { NAV_SECTIONS, normalizePath } from '@/lib/nav';
import SearchPalette from '@/components/SearchPalette';

type PageSection = { id: string; label: string };

/**
 * Sidebar navigation, mobile drawer and the ⌘K trigger.
 *
 * The nav itself is rendered as part of the React tree, so it is present in the
 * initial HTML: no fetch, no flash of missing navigation. Only the active-link
 * highlighting, the drawer and the per-page section list need the client.
 */
export default function SiteNav() {
  const pathname = usePathname();
  const current = normalizePath(pathname);
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sections, setSections] = useState<PageSection[]>([]);

  // Close the drawer on navigation and on Escape.
  useEffect(() => {
    setOpen(false);
  }, [current]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const onShortcut = useCallback((event: KeyboardEvent) => {
    if (event.key === 'k' || event.key === 'K') setSearchOpen(true);
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', onShortcut);
    return () => document.removeEventListener('keydown', onShortcut);
  }, [onShortcut]);

  /**
   * "On this page" is read out of the rendered headings rather than kept in a
   * second list in lib/nav.ts. A hand-maintained copy of the heading tree is
   * exactly the kind of thing that drifts: it went stale in the previous site
   * and nothing would have reported it. Anchors exist in the server HTML, so
   * this works on first paint with no flash of an empty list.
   */
  useEffect(() => {
    const found = Array.from(
      document.querySelectorAll<HTMLHeadingElement>('main :is(h2,h3)[id]'),
    )
      .filter((heading) => heading.dataset.side !== 'off')
      .map((heading) => ({
        id: heading.id,
        label: (heading.textContent ?? '').trim(),
        level: Number(heading.tagName.slice(1)),
      }))
      // Only h2 in the outline; h3 rows are noise at this length.
      .filter((heading) => heading.level === 2)
      .map(({ id, label }) => ({ id, label }));
    setSections(found);
  }, [current]);

  return (
    <>
      <div className="mobile-bar">
        <button
          type="button"
          className="menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={open}
          aria-controls="sidebar"
          onClick={() => setOpen((value) => !value)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <div className="mobile-title">Vivienda 2026</div>
      </div>

      <div
        className={`sidebar-overlay${open ? ' visible' : ''}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <nav className={`sidebar${open ? ' open' : ''}`} id="sidebar" aria-label="Site">
        <div className="sidebar-header">
          <Link className="sidebar-brand" href="/">
            Vivienda 2026
          </Link>
          <div className="sidebar-subtitle">
            RDL 26/2026 y 27/2026 · función social de la vivienda
          </div>
        </div>

        <button
          type="button"
          className="search-trigger"
          onClick={() => setSearchOpen(true)}
          aria-label="Buscar en el análisis"
          aria-haspopup="dialog"
        >
          <span aria-hidden="true">⌕</span>
          <span>Buscar</span>
          <kbd aria-hidden="true">⌘K</kbd>
        </button>

        <div className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div className="nav-section" key={section.title}>
              <div className="nav-section-title">{section.title}</div>
              {section.links.map((link) => (
                <Link
                  key={link.href}
                  className={`nav-link${current === link.href ? ' active' : ''}`}
                  href={link.href}
                  aria-current={current === link.href ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}

          {sections.length > 1 && (
            <div className="nav-section nav-section-toc">
              <div className="nav-section-title">En esta página</div>
              {sections.map((section) => (
                <a key={section.id} className="nav-link nav-link-toc" href={`#${section.id}`}>
                  {section.label}
                </a>
              ))}
            </div>
          )}

          <div className="sidebar-legend">
            <p>
              Cada referencia a un artículo nombra su norma. El color distingue los dos
              reales decretos-ley: <b className="tono-rdl26">RDL 26/2026</b> frente a{' '}
              <b className="tono-rdl27">RDL 27/2026</b>.
            </p>
          </div>
        </div>
      </nav>

      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
