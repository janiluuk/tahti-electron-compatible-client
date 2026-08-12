import { Link } from '@tanstack/react-router';

import { cn } from '../lib/cn';

/** Compact Tahti mark: star + wordmark for the app chrome. */
export function TahtiLogo({
  className,
  markOnly = false,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <span
      className={cn(
        'font-display inline-flex items-center gap-1.5 tracking-tight',
        className,
      )}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden
        className="text-primary shrink-0"
      >
        <path
          fill="currentColor"
          d="M12 1.8l2.7 6.6 7.1.6-5.4 4.6 1.7 6.9L12 16.8l-6.1 3.7 1.7-6.9L2.2 9l7.1-.6L12 1.8z"
        />
      </svg>
      {!markOnly && (
        <span className="text-base leading-none font-extrabold tracking-[0.18em] uppercase">
          Tahti
        </span>
      )}
    </span>
  );
}

export function TahtiLogoLink({
  className,
  markOnly,
}: {
  className?: string;
  markOnly?: boolean;
}) {
  return (
    <Link
      to="/"
      className={cn('hover:opacity-90', className)}
      aria-label="Tahti home"
    >
      <TahtiLogo markOnly={markOnly} />
    </Link>
  );
}
