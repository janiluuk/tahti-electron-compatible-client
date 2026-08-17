import { SparklesIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn, ViewShell } from '@nuclearplayer/ui';

import { fetchAnnouncements, type FetchMeta } from '../api/client';
import type { Announcement } from '../api/types';

function TimelineNode({ isLatest }: { isLatest?: boolean }) {
  return isLatest ? (
    <div className="bg-accent-green border-foreground flex size-7 shrink-0 items-center justify-center rounded-full border-(length:--border-width)">
      <SparklesIcon className="text-foreground size-4" strokeWidth={2.5} />
    </div>
  ) : (
    <div className="bg-foreground border-foreground size-5 shrink-0 rounded-full border-(length:--border-width)">
      <div className="bg-background-secondary border-background-secondary size-full rounded-full border-(length:--border-width)">
        <div className="bg-foreground size-full rounded-full" />
      </div>
    </div>
  );
}

function TimelineEntry({
  entry,
  isFirst,
  isLast,
}: {
  entry: Announcement;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div data-testid="announcement-entry" className="flex gap-4">
      <div className="flex w-4 flex-col items-center gap-1">
        <div
          className={cn(
            'w-1 flex-1 rounded-b-full',
            isFirst ? 'bg-transparent' : 'bg-border',
          )}
        />
        <TimelineNode isLatest={isFirst} />
        <div
          className={cn(
            'w-1 flex-1 rounded-t-full',
            isLast ? 'bg-transparent' : 'bg-border',
          )}
        />
      </div>
      <div className="my-4 flex flex-1 flex-col gap-1">
        <div className="flex items-center justify-between px-1">
          <span className="text-foreground-secondary text-xs font-medium">
            {entry.authorName}
          </span>
          <span className="text-foreground-secondary text-xs">
            {new Date(entry.publishedAt).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
        <div className="border-border bg-background-secondary shadow-shadow flex-1 rounded-md border-(length:--border-width) p-4">
          <p className="text-sm font-semibold">{entry.headline}</p>
          <p className="text-foreground-secondary mt-1 text-sm whitespace-pre-wrap">
            {entry.summary}
          </p>
        </div>
      </div>
    </div>
  );
}

const INITIAL_COUNT = 5;

/** Announcements timeline — embeddable under Settings. */
export function WhatsNewPanel() {
  const [entries, setEntries] = useState<Announcement[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchAnnouncements().then((res) => {
      if (cancelled) {
        return;
      }
      setEntries(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleEntries = showAll ? entries : entries.slice(0, INITIAL_COUNT);
  const hiddenCount = entries.length - INITIAL_COUNT;

  return (
    <div className="flex w-full flex-col">
      <p className="text-foreground-secondary mb-4 text-sm">
        Announcements published from the Tahti admin panel.
        {meta?.source === 'mock' && ' (showing offline sample data)'}
      </p>

      {loading && <p className="text-foreground-secondary text-sm">Loading…</p>}

      {!loading && entries.length === 0 && (
        <p className="text-foreground-secondary text-sm">
          No announcements yet.
        </p>
      )}

      {visibleEntries.map((entry, index) => (
        <TimelineEntry
          key={entry.id}
          entry={entry}
          isFirst={index === 0}
          isLast={index === visibleEntries.length - 1}
        />
      ))}

      {!showAll && hiddenCount > 0 && (
        <button
          type="button"
          className="hover:text-foreground cursor-pointer py-4 text-sm transition-colors"
          onClick={() => setShowAll(true)}
        >
          Show {hiddenCount} more
        </button>
      )}
    </div>
  );
}

export function WhatsNewView() {
  return (
    <ViewShell title="What's New" classes={{ scrollableArea: 'px-4' }}>
      <div className="mx-auto flex w-full max-w-2xl flex-col pr-4 pl-2">
        <WhatsNewPanel />
      </div>
    </ViewShell>
  );
}
