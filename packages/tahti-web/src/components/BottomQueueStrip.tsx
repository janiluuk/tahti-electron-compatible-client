import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { formatArtistNames } from '@nuclearplayer/model';
import type { QueueItem } from '@nuclearplayer/model';
import { cn } from '@nuclearplayer/ui';

import { usePlayerStore } from '../stores/playerStore';

function QueueChip({
  item,
  side,
  onPlay,
}: {
  item: QueueItem;
  side: 'past' | 'upcoming' | 'current';
  onPlay: () => void;
}) {
  const title = item.track.title;
  const artist = formatArtistNames(item.track.artists);
  const cover = item.track.artwork?.items[0]?.url;

  return (
    <button
      type="button"
      onClick={onPlay}
      title={`${title} — ${artist}`}
      className={cn(
        'border-border bg-background-secondary hover:border-primary/50 flex max-w-[9.5rem] shrink-0 items-center gap-2 rounded-md border px-2 py-1.5 text-left transition-colors',
        side === 'current' && 'border-primary bg-primary/15',
        side === 'past' && 'opacity-70 hover:opacity-100',
      )}
    >
      <span className="bg-background size-8 shrink-0 overflow-hidden rounded">
        {cover ? (
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <span className="text-foreground-secondary flex size-full items-center justify-center text-[10px]">
            ♪
          </span>
        )}
      </span>
      <span className="min-w-0">
        <span className="block truncate text-xs font-semibold">{title}</span>
        <span className="text-foreground-secondary block truncate text-[10px]">
          {artist}
        </span>
      </span>
    </button>
  );
}

/** Past ← play → upcoming strip around the center controls. */
export function BottomQueueStrip({ controls }: { controls: ReactNode }) {
  const queue = usePlayerStore((s) => s.queue);
  const currentId = usePlayerStore((s) => s.currentId);
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex);

  const { past, current, upcoming } = useMemo(() => {
    const idx = currentId ? queue.findIndex((q) => q.id === currentId) : -1;
    if (idx < 0) {
      return {
        past: [] as QueueItem[],
        current: null as QueueItem | null,
        upcoming: queue,
      };
    }
    return {
      past: queue.slice(0, idx),
      current: queue[idx] ?? null,
      upcoming: queue.slice(idx + 1),
    };
  }, [queue, currentId]);

  return (
    <div
      className="flex w-full min-w-0 flex-col gap-1.5"
      data-testid="bottom-queue"
    >
      <div className="flex w-full min-w-0 items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5 overflow-x-auto py-0.5">
          {past.length === 0 ? (
            <span className="text-foreground-secondary px-2 text-[10px] tracking-wide uppercase opacity-50">
              Played
            </span>
          ) : (
            past.map((item) => (
              <QueueChip
                key={item.id}
                item={item}
                side="past"
                onPlay={() => playQueueIndex(item.id)}
              />
            ))
          )}
        </div>

        <div className="flex shrink-0 flex-col items-center gap-1 px-1">
          {current && (
            <QueueChip
              item={current}
              side="current"
              onPlay={() => playQueueIndex(current.id)}
            />
          )}
          {controls}
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-start gap-1.5 overflow-x-auto py-0.5">
          {upcoming.length === 0 ? (
            <span className="text-foreground-secondary px-2 text-[10px] tracking-wide uppercase opacity-50">
              Up next
            </span>
          ) : (
            upcoming.map((item) => (
              <QueueChip
                key={item.id}
                item={item}
                side="upcoming"
                onPlay={() => playQueueIndex(item.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
