'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { normalizePath } from '@/lib/nav';
import ThemeToggle from '@/components/ThemeToggle';

type Item = { href: string; label: string; icon: keyof typeof ICONS };

const PRIMARY: Item[] = [
  { href: '/', label: 'Resumen', icon: 'home' },
  { href: '/desahucios-y-alquiler', label: 'Desahucios', icon: 'home2' },
  { href: '/fiscal', label: 'Fiscal', icon: 'fiscal' },
  { href: '/financiacion', label: 'Financiación', icon: 'money' },
];

const SECONDARY: Item[] = [
  { href: '/estado', label: 'Estado y advertencias', icon: 'state' },
  { href: '/normas', label: 'Normas citadas', icon: 'norms' },
  { href: '/contacto', label: 'Contacto', icon: 'about' },
];

/**
 * Phone / tablet navigation: fixed bottom tab bar with the four main sections
 * plus a "Más" button that opens a bottom sheet (secondary pages, search,
 * theme, contact). Hidden on desktop via CSS — same pattern as ShiftCitizen.
 */
export default function MobileNav({
  onSearch,
}: {
  onSearch: () => void;
}) {
  const pathname = usePathname() || '/';
  const current = normalizePath(pathname);
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLButtonElement>(null);

  const isActive = (href: string) => {
    const target = normalizePath(href);
    return target === '/'
      ? current === '/'
      : current === target || current.startsWith(`${target}/`);
  };
  const moreActive = SECONDARY.some((s) => isActive(s.href));

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const behind = Array.from(
      document.querySelectorAll<HTMLElement>('nav.sidebar, main, footer.site-footer'),
    );
    behind.forEach((el) => el.setAttribute('inert', ''));
    const first = sheetRef.current?.querySelector<HTMLElement>('a, button');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || !sheetRef.current) return;
      const els = Array.from(
        sheetRef.current.querySelectorAll<HTMLElement>('a, button'),
      );
      if (!els.length) return;
      const [a, z] = [els[0], els[els.length - 1]];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      behind.forEach((el) => el.removeAttribute('inert'));
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
      moreRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <nav className="tabbar" aria-label="Navegación principal">
        {PRIMARY.map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="tabbar__item"
            aria-current={isActive(it.href) ? 'page' : undefined}
          >
            <Icon name={it.icon} />
            <span>{it.label}</span>
          </Link>
        ))}
        <button
          ref={moreRef}
          type="button"
          className="tabbar__item"
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls="more-sheet"
          data-active={moreActive || undefined}
          onClick={() => setOpen((o) => !o)}
        >
          <Icon name="more" />
          <span>Más</span>
        </button>
      </nav>

      <div
        className="sheet-backdrop"
        data-open={open || undefined}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <div
        id="more-sheet"
        ref={sheetRef}
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="more-sheet-title"
        data-open={open || undefined}
        hidden={!open}
      >
        <div className="sheet__grip" aria-hidden="true" />
        <div className="sheet__head">
          <h2 id="more-sheet-title">Más</h2>
          <button
            type="button"
            className="sheet__close"
            onClick={() => setOpen(false)}
            aria-label="Cerrar"
          >
            <Icon name="close" />
          </button>
        </div>

        <ul className="sheet__list">
          {SECONDARY.map((it) => (
            <li key={it.href}>
              <Link href={it.href} aria-current={isActive(it.href) ? 'page' : undefined}>
                <Icon name={it.icon} />
                <span>{it.label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sheet__row">
          <span className="sheet__label">Buscar</span>
          <button
            type="button"
            className="sheet__chip"
            onClick={() => {
              setOpen(false);
              onSearch();
            }}
          >
            <span aria-hidden="true">⌕</span>
            Buscar
            <kbd aria-hidden="true">⌘K</kbd>
          </button>
        </div>

        <div className="sheet__row">
          <span className="sheet__label">Tema</span>
          <ThemeToggle label="Cambiar entre tema claro y oscuro" />
        </div>

        <div className="sheet__contact">
          <span className="sheet__label">Contacto</span>
          <a href="mailto:contacto@shiftcitizen.com">contacto@shiftcitizen.com</a>
          <a
            href="https://www.linkedin.com/in/cmarchena/"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
            <span className="sr-only"> (se abre en una pestaña nueva)</span>
          </a>
        </div>
      </div>
    </>
  );
}

const ICONS = {
  home: <path d="M3.5 10.5 12 3.5l8.5 7M5.5 9v11h5v-6h3v6h5V9" />,
  home2: (
    <>
      <path d="M4 20V9.5L12 4l8 5.5V20" />
      <path d="M9.5 20v-6h5v6" />
    </>
  ),
  fiscal: (
    <>
      <rect x="4" y="3.5" width="16" height="17" rx="2" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </>
  ),
  money: (
    <>
      <rect x="3.5" y="6" width="17" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  state: (
    <>
      <path d="M12 3.5 4.5 7v5c0 4.5 3.2 7.8 7.5 8.5 4.3-.7 7.5-4 7.5-8.5V7z" />
      <path d="M9.5 12.2 11.2 14l3.5-4" />
    </>
  ),
  norms: (
    <>
      <path d="M5 3.5h10l4 4v13H5z" />
      <path d="M14.5 3.5v4.5h4.5M8.5 12.5h7M8.5 16h7" />
    </>
  ),
  about: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5a7.5 7.5 0 0 1 15 0" />
    </>
  ),
  more: (
    <>
      <circle cx="5.5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="18.5" cy="12" r="1.6" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
} as const;

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}
