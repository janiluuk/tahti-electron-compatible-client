import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import type { FetchMeta } from '../../api/client';
import {
  deleteStudioArchiveItem,
  fetchEditorSource,
  fetchStudioArchive,
  patchStudioArchiveItem,
} from '../../api/studio';
import type { StudioArchiveItem } from '../../api/studio-types';
import { AddToMusicActions } from '../../components/AddToMusicActions';
import { AddToPlaylistButton } from '../../components/AddToPlaylistButton';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import {
  countPinnedTracks,
  isPinned,
  MAX_PINNED_TRACKS,
  pinBlockedMessage,
  sortPinnedFirst,
} from '../../lib/pinnedTracks';
import { usePlayerStore } from '../../stores/playerStore';

export function StudioArchiveView() {
  const [items, setItems] = useState<StudioArchiveItem[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);
  const [pinMessage, setPinMessage] = useState<string | null>(null);
  const play = usePlayerStore((s) => s.play);

  const reload = () => {
    setLoading(true);
    void fetchStudioArchive().then((res) => {
      setItems(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? items
      : items.filter(
          (i) =>
            i.title.toLowerCase().includes(q) ||
            (i.genre?.toLowerCase().includes(q) ?? false) ||
            i.status.toLowerCase().includes(q),
        );
    return sortPinnedFirst(base);
  }, [items, query]);

  const pinnedCount = countPinnedTracks(items);

  const playItem = async (id: string, title: string) => {
    setBusyId(id);
    const { data } = await fetchEditorSource(id);
    play({
      id: `archive:${id}`,
      kind: 'archive',
      title: data.title || title,
      artist: 'You',
      streamUrl: data.url,
      protocol: data.url.includes('.m3u8') ? 'hls' : 'https',
    });
    setBusyId(null);
  };

  const togglePin = async (item: StudioArchiveItem) => {
    const next = !isPinned(item);
    setPinMessage(null);
    if (next) {
      const blocked = pinBlockedMessage(pinnedCount);
      if (blocked) {
        setPinMessage(blocked);
        return;
      }
    }
    setBusyId(item.id);
    const result = await patchStudioArchiveItem(item.id, { pinned: next });
    setBusyId(null);
    if (!result.ok) {
      setPinMessage(result.error);
      return;
    }
    setItems((prev) =>
      prev.map((row) => (row.id === item.id ? result.data : row)),
    );
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/archive" />
        <StudioPageHeader
          title="Library"
          subtitle={`Your archive — play, pin up to ${MAX_PINNED_TRACKS} tracks to your public page, or open the editor.${meta?.source === 'mock' ? ' (demo data)' : ''}`}
          action={<AddToMusicActions onUploaded={reload} />}
        />

        <StudioPanel>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="border-border bg-background focus:border-primary max-w-md flex-1 rounded-md border px-3 py-2 text-sm outline-none"
            />
            <span className="text-foreground-secondary text-xs">
              Pinned {pinnedCount}/{MAX_PINNED_TRACKS}
            </span>
          </div>

          {pinMessage && (
            <p className="text-foreground-secondary mb-3 text-sm" role="status">
              {pinMessage}
            </p>
          )}

          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No tracks yet. Upload a file or import from Sources.
              </p>
              <AddToMusicActions align="center" onUploaded={reload} />
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {filtered.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/studio/archive/$id"
                      params={{ id: item.id }}
                      className="font-medium hover:underline"
                    >
                      {item.title}
                    </Link>
                    <p className="text-foreground-secondary text-xs">
                      {item.status}
                      {isPinned(item) ? ' · Pinned' : ''}
                      {item.durationSec != null
                        ? `, ${Math.round(item.durationSec / 60)} min`
                        : ''}
                      {item.genre ? `, ${item.genre}` : ''}
                      {item.isPublic === false ? ', private' : ''}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={busyId === item.id}
                    onClick={() => void playItem(item.id, item.title)}
                  >
                    Play
                  </Button>
                  <Link to="/studio/archive/$id" params={{ id: item.id }}>
                    <Button size="sm" variant="secondary">
                      Edit
                    </Button>
                  </Link>
                  <AddToPlaylistButton
                    archiveItemId={item.id}
                    trackTitle={item.title}
                  />
                  <button
                    type="button"
                    className="text-foreground-secondary hover:text-foreground px-2 text-xs"
                    onClick={() =>
                      setOpenMoreId((id) => (id === item.id ? null : item.id))
                    }
                  >
                    {openMoreId === item.id ? 'Less' : 'More'}
                  </button>
                  {openMoreId === item.id && (
                    <div className="flex w-full flex-wrap gap-2 pt-1">
                      <Button
                        size="sm"
                        variant="text"
                        disabled={busyId === item.id}
                        title={
                          !isPinned(item) && pinnedCount >= MAX_PINNED_TRACKS
                            ? (pinBlockedMessage(pinnedCount) ?? undefined)
                            : undefined
                        }
                        onClick={() => void togglePin(item)}
                      >
                        {isPinned(item) ? 'Unpin from page' : 'Pin to page'}
                      </Button>
                      <Link
                        to="/studio/archive/$id/editor"
                        params={{ id: item.id }}
                      >
                        <Button size="sm" variant="text">
                          Audio editor
                        </Button>
                      </Link>
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          if (!confirm(`Delete “${item.title}”?`)) {
                            return;
                          }
                          void deleteStudioArchiveItem(item.id).then(() =>
                            reload(),
                          );
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
