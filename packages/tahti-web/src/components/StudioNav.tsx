import { useState } from 'react';

import { InPageNav } from './InPageNav';

const PRIMARY = [
  { to: '/studio', label: 'Overview' },
  { to: '/studio/go-live', label: 'Go Live' },
  { to: '/studio/archive', label: 'Library' },
  { to: '/studio/releases', label: 'Releases' },
  { to: '/studio/shows', label: 'Shows' },
] as const;

const MORE = [
  { to: '/studio/playlists', label: 'Playlists' },
  { to: '/studio/channel', label: 'Channel designer' },
  { to: '/studio/upload', label: 'Upload' },
  { to: '/studio/collections', label: 'Albums' },
  { to: '/studio/editor', label: 'Editor' },
  { to: '/studio/schedule', label: 'Schedule' },
  { to: '/studio/stats', label: 'Stats' },
  { to: '/studio/revenue', label: 'Revenue' },
  { to: '/studio/updates', label: 'Updates' },
  { to: '/studio/stash', label: 'Stash' },
  { to: '/studio/moderation', label: 'Moderation' },
  { to: '/studio/venues', label: 'Venues' },
  { to: '/studio/events', label: 'Events' },
  { to: '/studio/setup-channel', label: 'Setup' },
] as const;

function isActive(current: string | undefined, to: string) {
  return (
    current === to || (to !== '/studio' && Boolean(current?.startsWith(to)))
  );
}

export function StudioNav({ current }: { current?: string }) {
  const [moreOpen, setMoreOpen] = useState(() =>
    MORE.some((l) => isActive(current, l.to)),
  );

  return (
    <div className="flex flex-col gap-2">
      <InPageNav
        aria-label="Studio"
        items={PRIMARY.map((link) => ({
          id: link.to,
          label: link.label,
          to: link.to,
          active: isActive(current, link.to),
        }))}
      />
      <div>
        <button
          type="button"
          className="text-foreground-secondary hover:text-foreground text-xs tracking-wide uppercase"
          onClick={() => setMoreOpen((v) => !v)}
        >
          {moreOpen ? 'Hide more' : 'More studio tools'}
        </button>
        {moreOpen && (
          <div className="mt-2">
            <InPageNav
              aria-label="More studio"
              items={MORE.map((link) => ({
                id: link.to,
                label: link.label,
                to: link.to,
                active: isActive(current, link.to),
              }))}
            />
          </div>
        )}
      </div>
    </div>
  );
}
