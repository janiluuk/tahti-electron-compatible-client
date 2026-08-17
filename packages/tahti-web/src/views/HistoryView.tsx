import { useMemo, useState } from 'react';

import { Button, FilterChips, Input, SectionShell } from '@nuclearplayer/ui';

import {
  MediaIconActions,
  playQueueFavoriteActions,
} from '../components/MediaIconActions';
import { PageHeader } from '../components/PageHeader';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { useLibraryStore, type HistoryEntry } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

type KindFilter = 'all' | 'archive' | 'live' | 'radio';

export function HistoryView() {
  const history = useLibraryStore((s) => s.history);
  const clearHistory = useLibraryStore((s) => s.clearHistory);
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);

  const [kind, setKind] = useState<KindFilter>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return history.filter((h) => {
      if (kind !== 'all' && h.playable.kind !== kind) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        h.playable.title.toLowerCase().includes(q) ||
        h.playable.artist.toLowerCase().includes(q) ||
        (h.playable.channelSlug?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [history, kind, query]);

  const items = filtered.map((h) => h.playable);

  const replayAll = () => {
    if (items.length === 0) {
      return;
    }
    play(items[0]!, { enqueueRest: items.slice(1) });
  };

  const replayOne = (entry: HistoryEntry) => {
    play(entry.playable);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="History"
        actions={
          <>
            <Button size="sm" disabled={items.length === 0} onClick={replayAll}>
              Replay filtered
            </Button>
            <Button
              variant="text"
              size="sm"
              disabled={history.length === 0}
              onClick={clearHistory}
            >
              Clear all
            </Button>
          </>
        }
      />

      <div className="flex flex-col gap-3">
        <Input
          label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Title, artist, channel…"
          className="max-w-md"
        />
        <FilterChips
          items={[
            { id: 'all', label: 'All' },
            { id: 'archive', label: 'Archive' },
            { id: 'live', label: 'Live' },
            { id: 'radio', label: 'Radio' },
          ]}
          selected={kind}
          onChange={(id) => setKind(id as KindFilter)}
        />
      </div>

      <p className="text-foreground-secondary text-xs">
        Showing {filtered.length} of {history.length} plays
      </p>

      {filtered.length > 0 && (
        <SectionShell title="Recent">
          <ul className="border-border divide-border max-h-64 divide-y overflow-y-auto rounded-md border text-sm">
            {filtered.slice(0, 40).map((h) => (
              <li
                key={`${h.playable.id}-${h.playedAt}`}
                className="flex items-center gap-3 px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{h.playable.title}</p>
                  <p className="text-foreground-secondary truncate text-xs">
                    {h.playable.artist}, {h.playable.kind},{' '}
                    {new Date(h.playedAt).toLocaleString()}
                  </p>
                </div>
                <MediaIconActions
                  actions={playQueueFavoriteActions({
                    onPlay: () => replayOne(h),
                    onQueue: () => enqueue(h.playable),
                  })}
                />
              </li>
            ))}
          </ul>
        </SectionShell>
      )}

      <PlayableTrackTable
        items={items}
        emptyMessage={
          history.length === 0
            ? 'Play something — it will show up here.'
            : 'No history rows match this filter.'
        }
      />
    </div>
  );
}
