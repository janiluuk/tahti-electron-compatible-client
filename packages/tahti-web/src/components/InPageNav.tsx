import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';

export type InPageNavItem = {
  id: string;
  label: ReactNode;
  /** Route path for Link mode */
  to?: string;
  params?: Record<string, string>;
  /** Button mode */
  onSelect?: () => void;
  active?: boolean;
};

/**
 * Sparse in-page tabs / chip nav — same chrome for Library, Studio, Channel, Sources detail.
 * Matches Nuclear filter/tab density (uppercase compact chips).
 */
export function InPageNav({
  items,
  'aria-label': ariaLabel = 'Section',
}: {
  items: InPageNavItem[];
  'aria-label'?: string;
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className="border-border flex flex-wrap gap-2 border-b pb-3"
    >
      {items.map((item) => {
        const className = `rounded-md px-3 py-1.5 text-xs font-medium uppercase tracking-wide ${
          item.active
            ? 'bg-primary text-foreground'
            : 'border-border text-foreground-secondary hover:text-foreground border'
        }`;

        if (item.to) {
          return (
            <Link
              key={item.id}
              to={item.to}
              params={item.params}
              className={className}
              aria-current={item.active ? 'page' : undefined}
            >
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={item.onSelect}
            className={className}
            aria-pressed={item.active}
          >
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
