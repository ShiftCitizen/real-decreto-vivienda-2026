import type { ReactNode } from 'react';

type Props = {
  /**
   * Describes the table for screen readers. The wrapper is focusable, so it needs
   * a name — an unlabelled focusable region is announced only as "group", which
   * tells the user nothing about what they just scrolled into.
   */
  label: string;
  children: ReactNode;
};

/**
 * Wraps a wide table in a horizontally scrollable region.
 *
 * A table cannot shrink below its content, and letting it overflow pushes the
 * whole document sideways — far worse than scrolling the table alone. The region
 * is keyboard-scrollable (hence tabIndex) because a scroll container with no
 * focusable child is unreachable by keyboard.
 *
 * The table keeps its own `display`, so its semantics and its header association
 * are untouched — unlike `display: block` on the table itself, which would drop
 * the implicit table role.
 */
export default function ScrollTable({ label, children }: Props) {
  return (
    <div className="table-scroll" role="region" aria-label={label} tabIndex={0}>
      {children}
    </div>
  );
}
