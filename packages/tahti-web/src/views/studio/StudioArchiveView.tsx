import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import {
  AudioLinesIcon,
  FolderIcon,
  MoreHorizontalIcon,
  PinIcon,
  PinOffIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react';
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
import { StashFilesPanel } from '../../components/StashFilesPanel';
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

const FOLDERS = [
  { id: 'archive' as const, label: 'Archive', icon: AudioLinesIcon },
  { id: 'files' as const, label: 'Files', icon: FolderIcon },
];

export function StudioArchiveView() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { folder?: string };
  const folder = search.folder === 'files' ? 'files' : 'archive';
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
          title="Music"
          subtitle={`Your archive and other files, in one place.${meta?.source === 'mock' ? ' (demo data)' : ''}`}
          action={
            folder === 'archive' ? (
              <AddToMusicActions onUploaded={reload} />
            ) : undefined
          }
        />

        <nav className="flex flex-wrap gap-2" role="tablist">
          {FOLDERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={folder === f.id}
              onClick={() =>
                void navigate({
                  to: '/studio/archive',
                  search: f.id === 'archive' ? {} : { folder: f.id },
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                folder === f.id
                  ? 'bg-primary text-foreground shadow-sm'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              <f.icon size={14} aria-hidden />
              {f.label}
            </button>
          ))}
        </nav>

        {folder === 'files' ? (
          <StashFilesPanel />
        ) : (
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
              <p
                className="text-foreground-secondary mb-3 text-sm"
                role="status"
              >
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
                        {isPinned(item) ? ', pinned' : ''}
                        {item.durationSec != null
                          ? `, ${Math.round(item.durationSec / 60)} min`
                          : ''}
                        {item.genre ? `, ${item.genre}` : ''}
                        {item.isPublic === false ? ', private' : ''}
                      </p>
                    </div>
                    <Button
                      size="icon-sm"
                      disabled={busyId === item.id}
                      onClick={() => void playItem(item.id, item.title)}
                      aria-label={`Play ${item.title}`}
                      title="Play"
                    >
                      <PlayIcon size={16} aria-hidden />
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
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label={openMoreId === item.id ? 'Less' : 'More'}
                      title={openMoreId === item.id ? 'Less' : 'More'}
                      onClick={() =>
                        setOpenMoreId((id) => (id === item.id ? null : item.id))
                      }
                    >
                      <MoreHorizontalIcon size={16} aria-hidden />
                    </Button>
                    {openMoreId === item.id && (
                      <div className="flex w-full flex-wrap gap-2 pt-1">
                        <Button
                          size="icon-sm"
                          variant="text"
                          disabled={busyId === item.id}
                          aria-label={
                            isPinned(item) ? 'Unpin from page' : 'Pin to page'
                          }
                          title={
                            !isPinned(item) && pinnedCount >= MAX_PINNED_TRACKS
                              ? (pinBlockedMessage(pinnedCount) ??
                                (isPinned(item)
                                  ? 'Unpin from page'
                                  : 'Pin to page'))
                              : isPinned(item)
                                ? 'Unpin from page'
                                : 'Pin to page'
                          }
                          onClick={() => void togglePin(item)}
                        >
                          {isPinned(item) ? (
                            <PinOffIcon size={16} aria-hidden />
                          ) : (
                            <PinIcon size={16} aria-hidden />
                          )}
                        </Button>
                        <Link
                          to="/studio/archive/$id/editor"
                          params={{ id: item.id }}
                        >
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label="Audio editor"
                            title="Audio editor"
                          >
                            <AudioLinesIcon size={16} aria-hidden />
                          </Button>
                        </Link>
                        <Button
                          size="icon-sm"
                          variant="text"
                          aria-label={`Delete ${item.title}`}
                          title="Delete"
                          onClick={() => {
                            if (!confirm(`Delete “${item.title}”?`)) {
                              return;
                            }
                            void deleteStudioArchiveItem(item.id).then(() =>
                              reload(),
                            );
                          }}
                        >
                          <Trash2Icon size={16} aria-hidden />
                        </Button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </StudioPanel>
        )}
      </div>
    </StudioGate>
  );
}
