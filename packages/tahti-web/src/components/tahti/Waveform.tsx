/** Thin rounded bars — the tahti waveform motif. Used as ambient hero
 * texture, channel banners, and a live indicator, so it stays a single
 * lightweight primitive rather than three bespoke ones. Bar heights are a
 * deterministic pseudo-random sequence keyed by `seed`, so a given
 * (bars, seed) pair renders identically every time — stable for SSR and
 * screenshot tests, not actually audio-reactive here. Animation is
 * Tailwind's `motion-safe:` variant, inert under prefers-reduced-motion. */
export function Waveform({
  bars = 24,
  animated = true,
  color = 'primary',
  seed = 1,
  className,
}: {
  bars?: number;
  animated?: boolean;
  color?: 'primary' | 'accent-cyan';
  seed?: number;
  className?: string;
}) {
  const colorClass = color === 'accent-cyan' ? 'bg-accent-cyan' : 'bg-primary';
  const heights = Array.from({ length: bars }, (_, i) => {
    const v = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
    const frac = v - Math.floor(v);
    return 20 + frac * 80;
  });

  return (
    <div
      className={`flex h-10 items-end gap-[3px] ${className ?? ''}`}
      aria-hidden
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={`w-[3px] origin-bottom rounded-full ${colorClass} ${
            animated
              ? 'motion-safe:animate-[waveform-bar_1.2s_ease-in-out_infinite]'
              : ''
          }`}
          style={{
            height: `${h}%`,
            animationDelay: animated ? `${i * 0.05}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
