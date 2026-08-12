import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import type { FetchMeta } from '../../api/client';
import {
  deleteStudioArchiveItem,
  fetchEditorSource,
  fetchStudioArchive,
} from '../../api/studio';
import type { StudioArchiveItem } from '../../api/studio-types';
import { AddToPlaylistButton } from '../../components/AddToPlaylistButton';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { usePlayerStore } from '../../stores/playerStore';

export function StudioArchiveView() {
  const [items, setItems] = useState<StudioArchiveItem[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);
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
    if (!q) {
      return items;
    }
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.genre?.toLowerCase().includes(q) ?? false) ||
        i.status.toLowerCase().includes(q),
    );
  }, [items, query]);

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

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/archive" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Music
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Your archive — play, edit metadata, or open the audio editor.
              {meta?.source === 'mock' ? ' (demo data)' : ''}
            </p>
          </div>
          <Link to="/studio/upload">
            <Button size="sm">Upload</Button>
          </Link>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search…"
          className="border-border bg-background focus:border-primary max-w-md rounded-md border px-3 py-2 text-sm outline-none"
        />

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : filtered.length === 0 ? (
          <div className="border-border flex flex-col gap-3 rounded-lg border px-4 py-8 text-center">
            <p className="text-foreground-secondary text-sm">
              No tracks yet. Upload audio to get started.
            </p>
            <div>
              <Link to="/studio/upload">
                <Button size="sm">Upload</Button>
              </Link>
            </div>
          </div>
        ) : (
          <ul className="border-border divide-border divide-y rounded-lg border">
            {filtered.map((item) => (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm"
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
                    <AddToPlaylistButton
                      archiveItemId={item.id}
                      trackTitle={item.title}
                    />
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
      </div>
    </StudioGate>
  );
}
