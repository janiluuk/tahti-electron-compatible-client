import type { ReactNode } from 'react';

type Max = 'md' | 'lg' | '2xl' | '3xl' | '5xl' | 'full';

const MAX: Record<Max, string> = {
  md: 'max-w-md',
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
  '3xl': 'max-w-3xl',
  '5xl': 'max-w-5xl',
  full: 'max-w-none',
};

/** Consistent page width + vertical rhythm (Nuclear content panes). */
export function PageFrame({
  children,
  maxWidth = '5xl',
  className = '',
}: {
  children: ReactNode;
  maxWidth?: Max;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto flex w-full ${MAX[maxWidth]} flex-col gap-6 ${className}`}
    >
      {children}
    </div>
  );
}

/** Shared page header — title + short subtitle + optional meta/actions. */
export function PageHeader({
  title,
  subtitle,
  meta,
  actions,
  back,
}: {
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3">
      {back}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            className="font-display text-3xl font-extrabold tracking-tight"
            data-testid="page-title"
          >
            {title}
          </h1>
          {subtitle && (
            <p className="text-foreground-secondary mt-1 max-w-2xl text-sm">
              {subtitle}
            </p>
          )}
          {meta && (
            <div className="text-foreground-secondary mt-2 text-xs">{meta}</div>
          )}
        </div>
        {actions && (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        )}
      </div>
    </header>
  );
}
