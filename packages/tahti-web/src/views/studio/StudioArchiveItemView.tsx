import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  activateArchiveVersion,
  fetchArchiveVersions,
  fetchVersionDownloadUrl,
  type ArchiveVersion,
} from '../../api/archive-versions';
import {
  fetchEditorDraft,
  fetchStudioArchive,
  fetchStudioArchiveItem,
  patchStudioArchiveItem,
  renderEditorDraft,
} from '../../api/studio';
import {
  createDefaultEditList,
  type EditList,
  type StudioArchiveItem,
} from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { WaveformCanvas } from '../../components/WaveformCanvas';
import {
  countPinnedTracks,
  isPinned,
  MAX_PINNED_TRACKS,
  pinBlockedMessage,
} from '../../lib/pinnedTracks';

const SILENCE_THRESHOLD = 0.06;
const MIN_TRIM_SEC = 0.5;

/** Finds leading/trailing near-silent regions from downsampled peaks and
 * returns cut regions to remove them — a client-side heuristic, not true
 * silence detection, since only bucketed peaks (not raw audio) are available. */
function autoTrimCuts(peaks: number[], durationSec: number): EditList['cuts'] {
  if (peaks.length === 0 || durationSec <= 0) {
    return [];
  }
  let lead = 0;
  while (lead < peaks.length && peaks[lead]! < SILENCE_THRESHOLD) {
    lead++;
  }
  let trail = peaks.length - 1;
  while (trail >= 0 && peaks[trail]! < SILENCE_THRESHOLD) {
    trail--;
  }
  const cuts: EditList['cuts'] = [];
  const leadSec = (lead / peaks.length) * durationSec;
  const trailSec = ((trail + 1) / peaks.length) * durationSec;
  if (leadSec >= MIN_TRIM_SEC) {
    cuts.push({ start: 0, end: leadSec });
  }
  if (durationSec - trailSec >= MIN_TRIM_SEC) {
    cuts.push({ start: trailSec, end: durationSec });
  }
  return cuts;
}

export function StudioArchiveItemView({ id }: { id: string }) {
  const [item, setItem] = useState<StudioArchiveItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [pinBusy, setPinBusy] = useState(false);
  const [pinnedCount, setPinnedCount] = useState(0);

  const [editList, setEditList] = useState<EditList | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [quickBusy, setQuickBusy] = useState<'normalize' | 'trim' | null>(null);
  const [quickMsg, setQuickMsg] = useState<string | null>(null);
  const [versions, setVersions] = useState<ArchiveVersion[]>([]);
  const [versionBusy, setVersionBusy] = useState<string | null>(null);

  const reloadVersions = () => {
    void fetchArchiveVersions(id).then((r) => setVersions(r.data));
  };

  useEffect(() => {
    void fetchStudioArchiveItem(id).then((res) => {
      setItem(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description ?? '');
      setGenre(res.data.genre ?? '');
      setIsPublic(res.data.isPublic !== false);
    });
    void fetchStudioArchive().then((res) => {
      setPinnedCount(countPinnedTracks(res.data));
    });
    void fetchEditorDraft(id).then((res) => {
      setEditList(res.data.editList);
      const level = res.data.editorPeaks?.levels?.[0];
      setPeaks(level && level.length > 0 ? level : []);
    });
    reloadVersions();
  }, [id]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const result = await patchStudioArchiveItem(id, {
      title,
      description,
      genre: genre || null,
      isPublic,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setItem(result.data);
    setMessage('Saved.');
  };

  const togglePin = async () => {
    if (!item) {
      return;
    }
    const next = !isPinned(item);
    setMessage(null);
    if (next) {
      const blocked = pinBlockedMessage(pinnedCount);
      if (blocked) {
        setMessage(blocked);
        return;
      }
    }
    setPinBusy(true);
    const result = await patchStudioArchiveItem(id, { pinned: next });
    setPinBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setItem(result.data);
    setPinnedCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    setMessage(next ? 'Pinned to your public page.' : 'Unpinned.');
  };

  const runQuickRender = async (
    kind: 'normalize' | 'trim',
    next: EditList,
    label: string,
  ) => {
    setQuickBusy(kind);
    setQuickMsg(null);
    const result = await renderEditorDraft(id, next, label);
    setQuickBusy(null);
    if (!result.ok) {
      setQuickMsg(result.error);
      return;
    }
    setEditList(next);
    setQuickMsg(
      `Queued as version — the previous version stays available below.`,
    );
    reloadVersions();
  };

  const onNormalize = () => {
    const base = editList ?? createDefaultEditList(item?.durationSec ?? 180);
    void runQuickRender(
      'normalize',
      { ...base, loudnorm: { ...base.loudnorm, enabled: true } },
      'Quick normalize',
    );
  };

  const onAutoTrim = () => {
    const base = editList ?? createDefaultEditList(item?.durationSec ?? 180);
    const cuts = autoTrimCuts(peaks, base.sourceDuration);
    if (cuts.length === 0) {
      setQuickMsg('No leading/trailing silence detected.');
      return;
    }
    void runQuickRender(
      'trim',
      { ...base, cuts: [...base.cuts, ...cuts] },
      'Quick auto-trim',
    );
  };

  const onActivateVersion = (versionId: string) => {
    setVersionBusy(versionId);
    void activateArchiveVersion(id, versionId).then((r) => {
      setVersionBusy(null);
      if (!r.ok) {
        setQuickMsg(r.error);
        return;
      }
      setVersions(r.data);
    });
  };

  const onDownloadVersion = (versionId: string) => {
    void fetchVersionDownloadUrl(id, versionId).then((r) => {
      if (!r.ok) {
        setQuickMsg(r.error);
        return;
      }
      window.open(r.url, '_blank', 'noopener,noreferrer');
    });
  };

  const visibility = item
    ? item.isPublic === false
      ? 'Private'
      : 'Public'
    : '';
  const pinned = item ? isPinned(item) : false;
  const pinBlocked = !pinned && pinnedCount >= MAX_PINNED_TRACKS;

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <StudioNav current="/studio/archive" />
        <Link
          to="/studio/archive"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Music
        </Link>
        {!item ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : (
          <>
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight">
                  {item.title}
                </h1>
                <p className="text-foreground-secondary mt-1 text-sm">
                  Edit title, description, and visibility.
                  <span className="ml-2 text-xs tracking-wide uppercase opacity-70">
                    {item.status}, {visibility}
                    {pinned ? ', Pinned' : ''}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={pinBusy || pinBlocked}
                  title={
                    pinBlocked
                      ? (pinBlockedMessage(pinnedCount) ?? undefined)
                      : undefined
                  }
                  onClick={() => void togglePin()}
                >
                  {pinBusy
                    ? '…'
                    : pinned
                      ? 'Unpin from page'
                      : `Pin to page (${pinnedCount}/${MAX_PINNED_TRACKS})`}
                </Button>
                <Link
                  to="/studio/insights/$kind/$id"
                  params={{ kind: 'archive', id }}
                >
                  <Button size="sm" variant="secondary">
                    Insights
                  </Button>
                </Link>
                <Button
                  disabled={saving || !title.trim()}
                  onClick={() => void save()}
                >
                  {saving ? 'Saving…' : 'Save'}
                </Button>
              </div>
            </header>

            {pinBlocked && (
              <p className="text-foreground-secondary text-sm" role="status">
                {pinBlockedMessage(pinnedCount)}
              </p>
            )}

            <div className="flex flex-col gap-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border-border bg-background focus:border-primary rounded-md border px-3 py-2 outline-none"
                />
              </label>
              <Input
                label="Genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Public on channel
              </label>
            </div>

            {message && (
              <p className="text-foreground-secondary text-sm">{message}</p>
            )}

            <section className="flex flex-col gap-3">
              <h2>
                <Eyebrow>Waveform preview</Eyebrow>
              </h2>
              <WaveformCanvas
                peaks={peaks}
                durationSec={editList?.sourceDuration ?? item.durationSec ?? 0}
                currentTime={0}
                cuts={editList?.cuts ?? []}
                selection={null}
                onSeek={() => {}}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={quickBusy !== null}
                  onClick={onNormalize}
                >
                  {quickBusy === 'normalize' ? 'Normalizing…' : 'Normalize'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={quickBusy !== null}
                  onClick={onAutoTrim}
                >
                  {quickBusy === 'trim' ? 'Trimming…' : 'Auto-trim silence'}
                </Button>
                <Link to="/studio/archive/$id/editor" params={{ id }}>
                  <Button size="sm" variant="text">
                    Open full editor
                  </Button>
                </Link>
              </div>
              {quickMsg && (
                <p className="text-foreground-secondary text-xs">{quickMsg}</p>
              )}
            </section>

            {versions.length > 0 && (
              <section className="flex flex-col gap-2">
                <h2>
                  <Eyebrow>Revision history</Eyebrow>
                </h2>
                <p className="text-foreground-secondary text-xs">
                  Every save or quick fix creates a new version — older ones
                  stay here until they're cleaned up server-side.
                </p>
                <ul className="flex flex-col gap-1.5">
                  {versions
                    .slice()
                    .reverse()
                    .map((v) => (
                      <li
                        key={v.id}
                        className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                      >
                        <div>
                          <div className="font-medium">
                            v{v.versionNumber} — {v.versionLabel}
                            {v.isActive && (
                              <span className="text-primary ml-2 text-xs uppercase">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="text-foreground-secondary text-xs">
                            {v.status}
                            {v.durationSec
                              ? ` · ${Math.round(v.durationSec)}s`
                              : ''}
                            {v.sourceBitrateKbps
                              ? ` · ${v.sourceBitrateKbps}kbps`
                              : ''}
                            {' · '}
                            {new Date(v.createdAt).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {v.status === 'READY' && (
                            <Button
                              size="sm"
                              variant="text"
                              onClick={() => onDownloadVersion(v.id)}
                            >
                              Download
                            </Button>
                          )}
                          {!v.isActive && v.status === 'READY' && (
                            <Button
                              size="sm"
                              variant="secondary"
                              disabled={versionBusy === v.id}
                              onClick={() => onActivateVersion(v.id)}
                            >
                              {versionBusy === v.id
                                ? 'Switching…'
                                : 'Use this version'}
                            </Button>
                          )}
                        </div>
                      </li>
                    ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </StudioGate>
  );
}
