import { Link } from '@tanstack/react-router';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  Maximize2Icon,
  Minimize2Icon,
  PauseIcon,
  PencilIcon,
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
  StudioCollectionItem,
} from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { WaveformCanvas } from '../../components/WaveformCanvas';
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

const PEAK_BUCKETS = 200;

function formatDuration(sec: number | null | undefined): string {
  if (sec == null || !Number.isFinite(sec)) {
    return '';
  }
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}

function trackTitle(item: StudioCollectionItem): string {
  return item.archiveItem?.title ?? item.release?.title ?? item.id;
}

/** Decodes a track's audio in-browser into a bucketed peaks array the
 * first time its row expands — same "attempt then degrade" approach as
 * the pro editor's own waveform decode, just scoped to one track. */
function useTrackPeaks(archiveItemId: string | undefined, enabled: boolean) {
  const [peaks, setPeaks] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled || !archiveItemId || peaks.length > 0) {
      return;
    }
    let cancelled = false;
    setLoading(true);
    void (async () => {
      try {
        const { data } = await fetchEditorSource(archiveItemId);
        const res = await fetch(data.url);
        const buf = await res.arrayBuffer();
        const ctx = new AudioContext();
        const decoded = await ctx.decodeAudioData(buf.slice(0));
        await ctx.close();
        if (cancelled) {
          return;
        }
        const channel = decoded.getChannelData(0);
        const block = Math.floor(channel.length / PEAK_BUCKETS) || 1;
        const next: number[] = [];
        for (let i = 0; i < PEAK_BUCKETS; i++) {
          let peak = 0;
          const start = i * block;
          for (let j = 0; j < block && start + j < channel.length; j++) {
            peak = Math.max(peak, Math.abs(channel[start + j]!));
          }
          next.push(peak);
        }
        const max = Math.max(...next, 0.001);
        setPeaks(next.map((v) => v / max));
      } catch {
        // Row falls back to a plain progress bar when decode fails.
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [enabled, archiveItemId, peaks.length]);

  return { peaks, loading };
}

function TrackRow({
  item,
  idx,
  isExpanded,
  isCurrent,
  isPlaying,
  currentTime,
  onToggleExpand,
  onPlay,
  onSeek,
  onMoveUp,
  onMoveDown,
  onRemove,
}: {
  item: StudioCollectionItem;
  idx: number;
  isExpanded: boolean;
  isCurrent: boolean;
  isPlaying: boolean;
  currentTime: number;
  onToggleExpand: () => void;
  onPlay: () => void;
  onSeek: (sec: number) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}) {
  const { peaks } = useTrackPeaks(item.archiveItem?.id, isExpanded);
  const durationSec = item.archiveItem?.durationSec ?? 0;

  return (
    <li
      className={`${idx % 2 === 1 ? 'bg-background-secondary/40' : ''} ${
        isCurrent ? 'bg-accent-green/10' : ''
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 px-2 py-2 text-sm">
        <span className="text-foreground-secondary w-6 shrink-0 tabular-nums">
          {idx + 1}.
        </span>
        <span
          className={`min-w-0 flex-1 truncate font-medium ${
            isCurrent ? 'text-accent-green' : ''
          }`}
        >
          {trackTitle(item)}
        </span>
        <span className="text-foreground-secondary text-xs tabular-nums">
          {formatDuration(durationSec)}
        </span>
        {item.archiveItem && (
          <Button
            size="icon-sm"
            variant="text"
            aria-label={
              isCurrent && isPlaying ? 'Pause' : `Play ${trackTitle(item)}`
            }
            title={isCurrent && isPlaying ? 'Pause' : 'Play'}
            onClick={onPlay}
          >
            {isCurrent && isPlaying ? (
              <PauseIcon size={16} aria-hidden />
            ) : (
              <PlayIcon size={16} aria-hidden />
            )}
          </Button>
        )}
        {item.archiveItem && (
          <Button
            size="icon-sm"
            variant="text"
            aria-label={isExpanded ? 'Collapse waveform' : 'Expand waveform'}
            title={isExpanded ? 'Collapse' : 'Expand'}
            onClick={onToggleExpand}
          >
            {isExpanded ? (
              <Minimize2Icon size={14} aria-hidden />
            ) : (
              <Maximize2Icon size={14} aria-hidden />
            )}
          </Button>
        )}
        <Button
          size="icon-sm"
          variant="text"
          aria-label="Move up"
          title="Move up"
          onClick={onMoveUp}
        >
          <ChevronUpIcon size={16} aria-hidden />
        </Button>
        <Button
          size="icon-sm"
          variant="text"
          aria-label="Move down"
          title="Move down"
          onClick={onMoveDown}
        >
          <ChevronDownIcon size={16} aria-hidden />
        </Button>
        <Button
          size="icon-sm"
          variant="text"
          aria-label="Remove track"
          title="Remove"
          onClick={onRemove}
        >
          <Trash2Icon size={16} aria-hidden />
        </Button>
      </div>

      {isExpanded && item.archiveItem && (
        <div className="px-2 pb-3">
          {durationSec > 0 && peaks.length > 0 ? (
            <div className="border-border bg-background h-24 overflow-hidden rounded-lg border">
              <WaveformCanvas
                peaks={peaks}
                durationSec={durationSec}
                currentTime={isCurrent ? currentTime : 0}
                cuts={[]}
                selection={null}
                onSeek={onSeek}
              />
            </div>
          ) : (
            <div className="border-border bg-background text-foreground-secondary flex h-24 items-center justify-center rounded-lg border text-xs">
              Decoding waveform…
            </div>
          )}
        </div>
      )}
    </li>
  );
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
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const play = usePlayerStore((s) => s.play);
  const currentId = usePlayerStore((s) => s.currentId);
  const status = usePlayerStore((s) => s.status);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const duration = usePlayerStore((s) => s.duration);
  const setStatus = usePlayerStore((s) => s.setStatus);
  const seekTo = usePlayerStore((s) => s.seekTo);
  const isPlaying = status === 'playing' || status === 'loading';

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

  const filteredItems = useMemo(() => {
    const q = trackQuery.trim().toLowerCase();
    if (!q) {
      return items;
    }
    return items.filter((item) => trackTitle(item).toLowerCase().includes(q));
  }, [items, trackQuery]);

  const nowPlayingItem = items.find(
    (i) => i.archiveItem && currentId === `archive:${i.archiveItem.id}`,
  );

  const playArchiveItem = async (id: string, title: string) => {
    const { data } = await fetchEditorSource(id);
    play({
      id: `archive:${id}`,
      kind: 'archive',
      title: data.title || title,
      artist: 'You',
      streamUrl: data.url,
      protocol: data.url.includes('.m3u8') ? 'hls' : 'https',
    });
  };

  const togglePlayItem = (item: StudioCollectionItem) => {
    if (!item.archiveItem) {
      return;
    }
    const isThisCurrent = currentId === `archive:${item.archiveItem.id}`;
    if (isThisCurrent) {
      setStatus(isPlaying ? 'paused' : 'playing');
      return;
    }
    void playArchiveItem(item.archiveItem.id, item.archiveItem.title);
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

            <StudioPanel
              title="Details"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setDetailsExpanded((v) => !v)}
                >
                  <PencilIcon size={14} aria-hidden />
                  {detailsExpanded ? 'Done' : 'Edit details'}
                </Button>
              }
            >
              {detailsExpanded ? (
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
              ) : (
                <p className="text-foreground-secondary text-sm whitespace-pre-wrap">
                  {description.trim() || 'No description yet.'}
                </p>
              )}
            </StudioPanel>

            <StudioPanel
              title={isAlbumLike ? 'Tracklist' : 'Items'}
              description={`${items.length} track${items.length === 1 ? '' : 's'}`}
            >
              <div className="mb-3 flex flex-col gap-3">
                <Input
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Search tracks…"
                  className="max-w-xs"
                  aria-label="Search tracks"
                />

                {nowPlayingItem?.archiveItem && (
                  <div className="border-border bg-background-input flex items-center gap-3 rounded-lg border px-3 py-2">
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label={isPlaying ? 'Pause' : 'Play'}
                      onClick={() =>
                        setStatus(isPlaying ? 'paused' : 'playing')
                      }
                    >
                      {isPlaying ? (
                        <PauseIcon size={16} aria-hidden />
                      ) : (
                        <PlayIcon size={16} aria-hidden />
                      )}
                    </Button>
                    <span className="truncate text-sm font-medium">
                      {nowPlayingItem.archiveItem.title}
                    </span>
                    <div
                      className="border-border bg-background relative h-1.5 flex-1 cursor-pointer overflow-hidden rounded-full border"
                      onClick={(e) => {
                        if (duration <= 0) {
                          return;
                        }
                        const rect = e.currentTarget.getBoundingClientRect();
                        const frac = (e.clientX - rect.left) / rect.width;
                        seekTo(Math.max(0, Math.min(1, frac)) * duration);
                      }}
                    >
                      <div
                        className="bg-accent-green absolute inset-y-0 left-0"
                        style={{
                          width: `${duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0}%`,
                        }}
                      />
                    </div>
                    <span className="text-foreground-secondary shrink-0 text-xs tabular-nums">
                      {formatDuration(currentTime)} / {formatDuration(duration)}
                    </span>
                  </div>
                )}
              </div>

              <ul className="divide-border divide-y">
                {items.length === 0 && (
                  <li className="text-foreground-secondary py-3 text-sm">
                    No tracks yet — add archive items below.
                  </li>
                )}
                {items.length > 0 && filteredItems.length === 0 && (
                  <li className="text-foreground-secondary py-3 text-sm">
                    No tracks match “{trackQuery}”.
                  </li>
                )}
                {filteredItems.map((item) => {
                  const idx = items.indexOf(item);
                  const isCurrent = Boolean(
                    item.archiveItem &&
                    currentId === `archive:${item.archiveItem.id}`,
                  );
                  return (
                    <TrackRow
                      key={item.id}
                      item={item}
                      idx={idx}
                      isExpanded={expandedItemId === item.id}
                      isCurrent={isCurrent}
                      isPlaying={isCurrent && isPlaying}
                      currentTime={currentTime}
                      onToggleExpand={() =>
                        setExpandedItemId((cur) =>
                          cur === item.id ? null : item.id,
                        )
                      }
                      onPlay={() => togglePlayItem(item)}
                      onSeek={(sec) => {
                        if (isCurrent) {
                          seekTo(sec);
                        } else if (item.archiveItem) {
                          void playArchiveItem(
                            item.archiveItem.id,
                            item.archiveItem.title,
                          );
                        }
                      }}
                      onMoveUp={() => void move(idx, -1)}
                      onMoveDown={() => void move(idx, 1)}
                      onRemove={() => {
                        void removeStudioCollectionItem(slug, item.id).then(
                          () => reload(),
                        );
                      }}
                    />
                  );
                })}
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
