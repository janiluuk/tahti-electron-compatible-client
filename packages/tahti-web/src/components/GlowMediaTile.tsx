import type { CSSProperties } from 'react';

import { Card, cn } from '@nuclearplayer/ui';

type GlowMediaTileProps = {
  title: string;
  subtitle?: string;
  src?: string;
  onClick?: () => void;
  onPlay?: () => void;
  onQueue?: () => void;
  onFavorite?: () => void;
  favorited?: boolean;
  /** CSS color for the hover glow — defaults to the theme's primary accent. */
  glowColor?: string;
  className?: string;
};

/** A large album-art tile with a soft color glow and lift on hover — used
 * for visual showcases (artist releases, pinned tracks). */
export function GlowMediaTile({
  title,
  subtitle,
  src,
  onClick,
  onPlay,
  onQueue,
  onFavorite,
  favorited,
  glowColor,
  className,
}: GlowMediaTileProps) {
  return (
    <div
      className="group/glow relative transition-transform duration-300 ease-out hover:-translate-y-1"
      style={
        { '--glow-color': glowColor ?? 'var(--color-primary)' } as CSSProperties
      }
    >
      <div
        className="pointer-events-none absolute -inset-4 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover/glow:opacity-70"
        style={{ background: 'var(--glow-color)' }}
        aria-hidden
      />
      <Card
        className={cn('relative w-full max-w-none', className)}
        title={title}
        subtitle={subtitle}
        src={src}
        onClick={onClick}
        onPlay={onPlay}
        onQueue={onQueue}
        onFavorite={onFavorite}
        favorited={favorited}
      />
    </div>
  );
}
