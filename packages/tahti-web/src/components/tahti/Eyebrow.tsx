import type { ReactNode } from 'react';

/** Mono, uppercase, wide-tracked label in the accent colour — section
 * labels and technical fields (RTMP keys, timestamps), never body copy.
 * Token-driven: font-mono / text-primary resolve from the active theme. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`text-primary font-mono text-[11px] font-semibold tracking-[0.2em] uppercase ${className ?? ''}`}
    >
      {children}
    </span>
  );
}
