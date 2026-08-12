import type { ReactNode } from 'react';

/** Elevated studio panel — consistent padding, border, subtle depth. */
export function StudioPanel({
  title,
  description,
  action,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`border-border bg-background-secondary/40 rounded-xl border p-5 shadow-sm sm:p-6 ${className}`}
    >
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {title ? (
              <h2 className="font-display text-lg font-bold tracking-tight">
                {title}
              </h2>
            ) : null}
            {description ? (
              <p className="text-foreground-secondary mt-1 text-sm">
                {description}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}

/** Page title block with consistent top spacing. */
export function StudioPageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-4 py-1">
      <div className="min-w-0 flex-1">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {title}
        </h1>
        {subtitle ? (
          <p className="text-foreground-secondary mt-2 text-sm leading-relaxed">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0 pb-0.5">{action}</div> : null}
    </header>
  );
}
