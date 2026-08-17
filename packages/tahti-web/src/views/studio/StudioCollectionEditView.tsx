import { Link } from '@tanstack/react-router';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  PlayIcon,
  Trash2Icon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  addStudioCollectionItem,
  fetchEditorSource,
  fetchStudioArchive,
  fetchStudioCollection,
  patchStudioCollection,
  removeStudioCollectionItem,
  reorderStudioCollectionItems,
  uploadCollectionCover,
} from '../../api/studio';
import type {
  StudioArchiveItem,
  StudioCollection,
} from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { usePlayerStore } from '../../stores/playerStore';

const STYLE_OPTIONS = [
  'ALBUM',
  'EP',
  'SINGLE',
  'PLAYLIST',
  'COMPILATION',
  'DJ_SET_SERIES',
  'LIVE_ARCHIVE',
  'MIX_SERIES',
] as const;

function formatDuration(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) {
    return '';
  }
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function StudioCollectionEditView({ slug }: { slug: string }) {
  const [col, setCol] = useState<StudioCollection | null>(null);
  const [archive, setArchive] = useState<StudioArchiveItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [addId, setAddId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [style, setStyle] = useState('ALBUM');
  const [isPublic, setIsPublic] = useState(true);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const play = usePlayerStore((s) => s.play);

  const reload = () => {
    void Promise.all([fetchStudioCollection(slug), fetchStudioArchive()]).then(
      ([c, a]) => {
        setCol(c.data);
        setArchive(a.data);
        setName(c.data.name);
        setDescription(c.data.description ?? '');
        setStyle(c.data.style ?? 'ALBUM');
        setIsPublic(c.data.isPublic !== false);
        setCoverUrl(c.data.coverUrl ?? null);
      },
    );
  };

  useEffect(() => {
    reload();
  }, [slug]);

  const items = col?.items ?? [];
  const isAlbumLike = useMemo(
    () => ['ALBUM', 'EP', 'SINGLE', 'COMPILATION'].includes(style),
    [style],
  );

  const playArchiveItem = async (id: string, title: string) => {
    setPlayingId(id);
    const { data } = await fetchEditorSource(id);
    play({
      id: `archive:${id}`,
      kind: 'archive',
      title: data.title || title,
      artist: 'You',
      streamUrl: data.url,
      protocol: data.url.includes('.m3u8') ? 'hls' : 'https',
    });
    setPlayingId(null);
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) {
      return;
    }
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    setCol((c) => (c ? { ...c, items: next } : c));
    const result = await reorderStudioCollectionItems(
      slug,
      next.map((i) => i.id),
    );
    setMessage(result.ok ? 'Tracklist reordered.' : result.error);
  };

  const saveMeta = async () => {
    setSaving(true);
    setMessage(null);
    const result = await patchStudioCollection(slug, {
      name: name.trim() || slug,
      description: description.trim() || null,
      style,
      isPublic,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setCol((c) =>
      c
        ? {
            ...c,
            ...result.data,
            items: c.items,
            coverUrl: coverUrl ?? result.data.coverUrl,
          }
        : result.data,
    );
    setMessage('Album details saved.');
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/collections" />
        <Link
          to="/studio/collections"
          className="text-foreground-secondary -mt-2 text-xs hover:underline"
        >
          ← Albums
        </Link>
        {!col ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : (
          <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="border-border bg-background relative h-44 w-44 shrink-0 overflow-hidden rounded-xl border shadow-sm">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-foreground-secondary flex h-full items-center justify-center p-4 text-center text-xs">
                    {isAlbumLike ? 'Album cover' : 'Cover art'}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <StudioPageHeader
                  title={name || col.name}
                  subtitle={`/${col.slug}${style ? `, ${style}` : ''}${isPublic ? '' : ', private'}`}
                  action={
                    <Button
                      size="sm"
                      disabled={saving}
                      onClick={() => void saveMeta()}
                    >
                      {saving ? 'Saving…' : 'Save'}
                    </Button>
                  }
                />
                <label className="text-foreground-secondary mt-2 block text-xs">
                  Cover image
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="mt-1 block w-full text-sm"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) {
                        return;
                      }
                      void uploadCollectionCover(slug, file).then((r) => {
                        if (!r.ok) {
                          setMessage(r.error);
                          return;
                        }
                        setCoverUrl(r.coverUrl);
                        setCol((c) => (c ? { ...c, coverUrl: r.coverUrl } : c));
                        setMessage('Cover uploaded.');
                      });
                    }}
                  />
                </label>
              </div>
            </div>

            <StudioPanel title="Details">
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Title"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label className="flex flex-col gap-1 text-sm">
                  <span className="text-foreground-secondary text-xs uppercase">
                    Style
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {STYLE_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`rounded-md border px-3 py-1 text-xs ${
                          style === s
                            ? 'border-primary bg-primary/15 text-primary'
                            : 'border-border text-foreground-secondary'
                        }`}
                        onClick={() => setStyle(s)}
                      >
                        {s.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>
                </label>
                <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                  <span className="text-foreground-secondary text-xs uppercase">
                    Description
                  </span>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="border-border bg-background focus:border-primary rounded-md border px-3 py-2 outline-none"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  Public on profile
                </label>
              </div>
            </StudioPanel>

            <StudioPanel
              title={isAlbumLike ? 'Tracklist' : 'Items'}
              description={`${items.length} track${items.length === 1 ? '' : 's'}`}
            >
              <ul className="divide-border divide-y">
                {items.length === 0 && (
                  <li className="text-foreground-secondary py-3 text-sm">
                    No tracks yet — add archive items below.
                  </li>
                )}
                {items.map((item, idx) => (
                  <li
                    key={item.id}
                    className="flex flex-wrap items-center gap-2 py-2 text-sm first:pt-0 last:pb-0"
                  >
                    <span className="text-foreground-secondary w-6 tabular-nums">
                      {idx + 1}.
                    </span>
                    <span className="min-w-0 flex-1 truncate font-medium">
                      {item.archiveItem?.title ??
                        item.release?.title ??
                        item.id}
                    </span>
                    <span className="text-foreground-secondary text-xs tabular-nums">
                      {formatDuration(item.archiveItem?.durationSec)}
                    </span>
                    {item.archiveItem && (
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label={`Play ${item.archiveItem.title}`}
                        title="Play"
                        disabled={playingId === item.archiveItem.id}
                        onClick={() =>
                          void playArchiveItem(
                            item.archiveItem!.id,
                            item.archiveItem!.title,
                          )
                        }
                      >
                        <PlayIcon size={16} aria-hidden />
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label="Move up"
                      title="Move up"
                      onClick={() => void move(idx, -1)}
                    >
                      <ChevronUpIcon size={16} aria-hidden />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label="Move down"
                      title="Move down"
                      onClick={() => void move(idx, 1)}
                    >
                      <ChevronDownIcon size={16} aria-hidden />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label="Remove track"
                      title="Remove"
                      onClick={() => {
                        void removeStudioCollectionItem(slug, item.id).then(
                          () => reload(),
                        );
                      }}
                    >
                      <Trash2Icon size={16} aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-end gap-2">
                <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
                  <span className="text-foreground-secondary text-xs uppercase">
                    Add archive track
                  </span>
                  <select
                    value={addId}
                    onChange={(e) => setAddId(e.target.value)}
                    className="border-border bg-background rounded-md border px-3 py-2"
                  >
                    <option value="">Select…</option>
                    {archive.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </label>
                <Button
                  size="sm"
                  disabled={!addId}
                  onClick={() => {
                    void addStudioCollectionItem(slug, addId).then((r) => {
                      setMessage(r.ok ? 'Track added.' : r.error);
                      if (r.ok) {
                        setAddId('');
                        reload();
                      }
                    });
                  }}
                >
                  Add to {isAlbumLike ? 'album' : 'collection'}
                </Button>
              </div>
            </StudioPanel>

            {message && (
              <p className="text-foreground-secondary text-sm">{message}</p>
            )}
          </>
        )}
      </div>
    </StudioGate>
  );
}
