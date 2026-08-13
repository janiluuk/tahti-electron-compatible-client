import {
  Archive,
  Link2,
  Radio,
  RadioTower,
  Upload,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';

import type { IntegrationId } from '../api/sources';

/** Brand mark colors — filled tile backgrounds under white/light glyphs. */
const TILE: Record<
  IntegrationId,
  {
    bg: string;
    fg: string;
    Icon?: LucideIcon;
    brand?: 'bc' | 'sc' | 'gd' | 'mc' | 'sp';
  }
> = {
  upload: { bg: 'var(--color-primary, #6d28d9)', fg: '#fff', Icon: Upload },
  stash: { bg: '#1e293b', fg: '#e2e8f0', Icon: Archive },
  bandcamp: { bg: '#1da0c3', fg: '#fff', brand: 'bc' },
  soundcloud: { bg: '#ff5500', fg: '#fff', brand: 'sc' },
  'google-drive': { bg: '#0f172a', fg: '#fff', brand: 'gd' },
  mixcloud: { bg: '#5000ff', fg: '#fff', brand: 'mc' },
  url: { bg: '#334155', fg: '#f8fafc', Icon: Link2 },
  spotify: { bg: '#1db954', fg: '#fff', brand: 'sp' },
  broadcast: { bg: '#0ea5e9', fg: '#fff', Icon: Radio },
  radio: { bg: '#7c3aed', fg: '#fff', Icon: RadioTower },
};

function BrandMark({
  kind,
}: {
  kind: NonNullable<(typeof TILE)[IntegrationId]['brand']>;
}) {
  if (kind === 'bc') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[55%] w-[55%]"
        aria-hidden
        fill="currentColor"
      >
        <path d="M0 18.75l1.05-5.25h2.1l1.05 5.25H0zm4.2 0l2.1-10.5h2.1L6.3 18.75H4.2zm5.25 0l1.05-5.25h2.1l1.05 5.25H9.45zm5.25 0V8.25h3.15v10.5h-3.15zm5.25 0l1.05-7.875h2.1L24 18.75h-4.05z" />
      </svg>
    );
  }
  if (kind === 'sc') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[58%] w-[58%]"
        aria-hidden
        fill="currentColor"
      >
        <path d="M1.175 12.2c-.085 0-.155.06-.17.14L.01 17.42c-.02.1.05.19.15.19h.91c.08 0 .15-.06.17-.14l1.05-5.08c.02-.1-.05-.19-.15-.19h-.97zm2.54-.55c-.09 0-.16.07-.17.16l-.9 5.61c-.01.1.06.18.16.18h.96c.09 0 .16-.07.17-.16l.9-5.61c.01-.1-.06-.18-.16-.18h-.96zm2.58-.7c-.09 0-.17.07-.18.16l-.78 6.31c-.01.1.06.19.17.19h1.01c.09 0 .17-.07.18-.16l.78-6.31c.01-.1-.06-.19-.17-.19H6.3zm2.64-2.35c-.1 0-.18.08-.18.18v8.84c0 .1.08.18.18.18h1.05c.1 0 .18-.08.18-.18V8.78c0-.1-.08-.18-.18-.18H8.94zm2.4-.9c-1.52 0-2.86.78-3.62 1.95-.3-.13-.63-.2-.98-.2-1.45 0-2.63 1.13-2.74 2.56C2.7 11.9 1.4 12.95.7 14.4c-.1.2.05.45.28.45h10.36c1.53 0 2.77-1.24 2.77-2.77 0-1.52-1.23-2.76-2.76-2.76z" />
      </svg>
    );
  }
  if (kind === 'gd') {
    return (
      <svg viewBox="0 0 24 24" className="h-[55%] w-[55%]" aria-hidden>
        <path fill="#4285F4" d="M4.5 20.25L8.25 13.5h7.5l-3.75 6.75H4.5z" />
        <path fill="#EA4335" d="M8.25 3.75h7.5L19.5 10.5H12L8.25 3.75z" />
        <path
          fill="#FBBC04"
          d="M4.5 20.25L8.25 13.5 12 10.5 8.25 3.75 1.5 15l3 5.25z"
        />
        <path
          fill="#34A853"
          d="M15.75 13.5H8.25l3.75-3 7.5 0-3.75 6.75-3.75-3.75z"
          opacity="0.9"
        />
        <path fill="#188038" d="M12 10.5l3.75 3 3.75-3L15.75 3.75 12 10.5z" />
      </svg>
    );
  }
  if (kind === 'mc') {
    return (
      <svg
        viewBox="0 0 24 24"
        className="h-[50%] w-[50%]"
        aria-hidden
        fill="currentColor"
      >
        <path d="M2 17.5c0-3.04 2.46-5.5 5.5-5.5.45 0 .89.05 1.3.16A5.49 5.49 0 0 1 14 7c2.9 0 5.27 2.24 5.48 5.08A4.5 4.5 0 0 1 22 16.5c0 2.49-2.01 4.5-4.5 4.5H6.5C4.01 21 2 18.99 2 16.5v1z" />
      </svg>
    );
  }
  // spotify
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-[55%] w-[55%]"
      aria-hidden
      fill="currentColor"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

type Props = {
  id: IntegrationId;
  /** Larger mark for Card tile faces */
  size?: 'tile' | 'detail';
};

export function SourceServiceIcon({ id, size = 'tile' }: Props): ReactNode {
  const cfg = TILE[id];
  const dim = size === 'tile' ? 'h-full w-full' : 'h-16 w-16';
  return (
    <div
      className={`${dim} flex items-center justify-center`}
      style={{ background: cfg.bg, color: cfg.fg }}
      aria-hidden
    >
      {cfg.brand ? (
        <BrandMark kind={cfg.brand} />
      ) : cfg.Icon ? (
        <cfg.Icon
          size={size === 'tile' ? 56 : 32}
          absoluteStrokeWidth
          strokeWidth={1.5}
          className="opacity-95"
        />
      ) : null}
    </div>
  );
}

export function sourceTileSubtitle(id: IntegrationId): string {
  switch (id) {
    case 'upload':
      return 'Local files → archive';
    case 'stash':
      return 'Private locker';
    case 'bandcamp':
      return 'Import albums';
    case 'soundcloud':
      return 'Import tracks';
    case 'google-drive':
      return 'Cloud import';
    case 'mixcloud':
      return 'Mix rescue';
    case 'url':
      return 'DSP paste';
    case 'spotify':
      return 'Search & queue';
    case 'broadcast':
      return 'Live captures';
    case 'radio':
      return 'M3U / stream URL';
    default:
      return '';
  }
}
