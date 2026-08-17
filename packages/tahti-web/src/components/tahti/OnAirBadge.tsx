/** Amber-bordered pill with a pulsing dot for a live/on-air state.
 * Pulse is Tailwind's `motion-safe:` variant, so it's automatically
 * inert under prefers-reduced-motion — no extra JS needed. */
export function OnAirBadge({
  label = 'ON AIR',
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={`bg-background-input text-primary border-primary rounded-pill inline-flex items-center gap-2 border px-3 py-1 font-mono text-xs font-semibold tracking-wide uppercase ${className ?? ''}`}
    >
      <span
        className="bg-primary h-2 w-2 rounded-full motion-safe:animate-pulse"
        aria-hidden
      />
      {label}
    </span>
  );
}
