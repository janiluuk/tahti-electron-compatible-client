import type { ReactNode } from 'react';

/** Large display-face accent number — payout figures, "0%"-style stats. */
export function StatNumber({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`font-heading text-primary text-4xl font-bold tabular-nums ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
