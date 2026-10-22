'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { NAV_SECTIONS, normalizePath } from '@/lib/nav';
import SearchPalette from '@/components/SearchPalette';
import MobileNav from '@/components/MobileNav';
import ThemeToggle from '@/components/ThemeToggle';

type PageSection = { id: string; label: string };

/**
 * Desktop sidebar (with ⌘K search) plus the ShiftCitizen-style mobile tab bar.
 * No burger menu: on narrow viewports the tab bar and "Más" sheet replace it.
 */
export default function SiteNav() {
  const pathname = usePathname();
  const current = normalizePath(pathname);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sections, setSections] = useState<PageSection[]>([]);

  const onShortcut = useCallback((event: KeyboardEvent) => {
    if ((event.metaKey || event.ctrlKey) && (event.key === 'k' || event.key === 'K')) {
      event.preventDefault();
      setSearchOpen(true);
    }
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
      .filter((heading) => heading.level === 2)
      .map(({ id, label }) => ({ id, label }));
    setSections(found);
  }, [current]);

  return (
    <>
      <nav className="sidebar" id="sidebar" aria-label="Site">
        <div className="sidebar-header">
          <div className="sidebar-header-row">
            <Link className="sidebar-brand" href="/">
              Vivienda 2026
            </Link>
            <ThemeToggle label="Cambiar entre tema claro y oscuro" />
          </div>
          <div className="sidebar-subtitle">
            RDL 29/2026 y 28/2026 · 26/27 derogados · función social de la vivienda
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

      <MobileNav onSearch={() => setSearchOpen(true)} />
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
