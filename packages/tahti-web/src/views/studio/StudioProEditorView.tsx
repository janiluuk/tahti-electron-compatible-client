import { Link } from '@tanstack/react-router';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  GripVerticalIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  SaveIcon,
  ScissorsIcon,
  UploadIcon,
  Wand2Icon,
  XIcon,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Card, CardGrid, Dialog, Input } from '@nuclearplayer/ui';

import {
  fetchArchiveStems,
  fetchEditorDraft,
  fetchEditorSource,
  renderEditorDraft,
  requestArchiveStems,
  saveEditorDraft,
  type StemJob,
} from '../../api/studio';
import type { EditList, ProEditorPluginId } from '../../api/studio-types';
import { createDefaultEditList } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { ClientCapabilityNotice } from '../../components/ClientCapabilityNotice';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { WaveformCanvas } from '../../components/WaveformCanvas';
import { WaveformMinimap } from '../../components/WaveformMinimap';
import { useAudioPreviewGraph } from '../../lib/audioPreviewGraph';
import { ALL_PLUGIN_IDS, PLUGIN_META } from '../../lib/proEditorPlugins';

function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) {
    return '0:00';
  }
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** Big brand-tile icon for a plugin — same idiom as SourceServiceIcon,
 * used both in the "add plugin" picker and each active panel's badge. */
function PluginIcon({
  id,
  size = 56,
}: {
  id: ProEditorPluginId;
  size?: number;
}) {
  const meta = PLUGIN_META[id];
  return (
    <div
      className="flex h-full w-full items-center justify-center"
      style={{ background: meta.bg }}
      aria-hidden
    >
      <meta.icon
        size={size}
        absoluteStrokeWidth
        strokeWidth={1.5}
        className="text-white opacity-95"
      />
    </div>
  );
}

export function StudioProEditorView({
  archiveItemId,
}: {
  archiveItemId: string;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [editList, setEditList] = useState<EditList | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [peaks, setPeaks] = useState<number[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [selection, setSelection] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [versionLabel, setVersionLabel] = useState('Edited mix');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stems, setStems] = useState<StemJob[]>([]);
  const [markers, setMarkers] = useState<number[]>([]);
  const [viewStart, setViewStart] = useState(0);
  const [viewEnd, setViewEnd] = useState(1);
  const [previewingSelection, setPreviewingSelection] = useState(false);
  const [masteringCollapsed, setMasteringCollapsed] = useState(false);
  const [pluginPickerOpen, setPluginPickerOpen] = useState(false);
  const [renderPromptOpen, setRenderPromptOpen] = useState(false);
  const selectionRef = useRef(selection);
  const previewingSelectionRef = useRef(previewingSelection);
  const dragPluginRef = useRef<ProEditorPluginId | null>(null);

  useAudioPreviewGraph(audioRef, editList);

  useEffect(() => {
    selectionRef.current = selection;
  }, [selection]);

  useEffect(() => {
    previewingSelectionRef.current = previewingSelection;
  }, [previewingSelection]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      fetchEditorSource(archiveItemId),
      fetchEditorDraft(archiveItemId),
    ]).then(([src, draft]) => {
      if (cancelled) {
        return;
      }
      setSourceUrl(src.data.url);
      setTitle(src.data.title);
      const fromDraft = draft.data.editList;
      const durationHint =
        src.data.durationSec ?? fromDraft?.sourceDuration ?? 180;
      const list = fromDraft ?? createDefaultEditList(durationHint);
      if (src.data.durationSec && list.sourceDuration < 1) {
        list.sourceDuration = src.data.durationSec;
      }
      setEditList(list);
      setUpdatedAt(draft.data.updatedAt);
      const level = draft.data.editorPeaks?.levels?.[0];
      setPeaks(level && level.length > 0 ? level : []);
      setLoading(false);
    });
    void fetchArchiveStems(archiveItemId).then((r) => {
      if (!cancelled) {
        setStems(r.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [archiveItemId]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !sourceUrl) {
      return;
    }
    // crossOrigin is required for the live plugin-preview graph (see
    // useAudioPreviewGraph) -- without it, connecting a
    // MediaElementAudioSourceNode to a cross-origin source silently
    // zeroes all audio output, playback included, once anything touches
    // the Web Audio graph. If the source doesn't actually serve CORS
    // headers, setting crossOrigin instead makes the browser refuse to
    // load it at all -- fall back to a plain, non-CORS load so playback
    // at least still works (live preview just won't be audible for that
    // source), same "attempt then degrade" discipline as the peaks
    // fallback below.
    audio.crossOrigin = 'anonymous';
    audio.src = sourceUrl;
    const onTime = () => {
      setCurrentTime(audio.currentTime);
      if (
        previewingSelectionRef.current &&
        selectionRef.current &&
        audio.currentTime >= selectionRef.current.end
      ) {
        audio.pause();
        setPreviewingSelection(false);
      }
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onError = () => {
      if (audio.crossOrigin) {
        audio.crossOrigin = null;
        audio.src = sourceUrl;
        audio.load();
      }
    };
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('error', onError);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('error', onError);
    };
  }, [sourceUrl]);

  // When server peaks are missing, decode audio in-browser for a usable waveform.
  useEffect(() => {
    if (!sourceUrl || peaks.length > 0) {
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch(sourceUrl);
        if (!res.ok) {
          return;
        }
        const buf = await res.arrayBuffer();
        const ctx = new AudioContext();
        const decoded = await ctx.decodeAudioData(buf.slice(0));
        await ctx.close();
        if (cancelled) {
          return;
        }
        const channel = decoded.getChannelData(0);
        const buckets = 256;
        const block = Math.floor(channel.length / buckets) || 1;
        const next: number[] = [];
        for (let i = 0; i < buckets; i++) {
          let peak = 0;
          const start = i * block;
          for (let j = 0; j < block && start + j < channel.length; j++) {
            peak = Math.max(peak, Math.abs(channel[start + j]!));
          }
          next.push(peak);
        }
        const max = Math.max(...next, 0.001);
        setPeaks(next.map((v) => v / max));
        setEditList((prev) => {
          if (!prev) {
            return prev;
          }
          if (prev.sourceDuration >= 1) {
            return prev;
          }
          return { ...prev, sourceDuration: decoded.duration };
        });
      } catch {
        // Keep synthetic waveform fallback in WaveformCanvas.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sourceUrl, peaks.length]);

  const duration = editList?.sourceDuration ?? 0;

  const keptDuration = useMemo(() => {
    if (!editList) {
      return 0;
    }
    let removed = 0;
    for (const c of editList.cuts) {
      removed += Math.max(0, c.end - c.start);
    }
    return Math.max(0, editList.sourceDuration - removed);
  }, [editList]);

  const seek = (sec: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.currentTime = sec;
    setCurrentTime(sec);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    setPreviewingSelection(false);
    if (audio.paused) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
  };

  const previewSelection = () => {
    const audio = audioRef.current;
    if (!audio || !selection) {
      return;
    }
    setPreviewingSelection(true);
    audio.currentTime = selection.start;
    setCurrentTime(selection.start);
    void audio.play().catch(() => undefined);
  };

  const addCutFromSelection = () => {
    if (!editList || !selection) {
      return;
    }
    if (selection.end - selection.start < 0.05) {
      return;
    }
    setEditList({
      ...editList,
      cuts: [
        ...editList.cuts,
        { start: selection.start, end: selection.end },
      ].sort((a, b) => a.start - b.start),
    });
    setSelection(null);
    setMessage('Cut region marked (removed on render).');
  };

  const trimToSelection = () => {
    if (!editList || !selection) {
      return;
    }
    const cuts = [
      ...(selection.start > 0.05 ? [{ start: 0, end: selection.start }] : []),
      ...(selection.end < editList.sourceDuration - 0.05
        ? [{ start: selection.end, end: editList.sourceDuration }]
        : []),
    ];
    setEditList({ ...editList, cuts });
    setMessage('Trimmed to selection (head/tail marked as cuts).');
  };

  const clearCuts = () => {
    if (!editList) {
      return;
    }
    setEditList({ ...editList, cuts: [] });
    setMessage('Cuts cleared.');
  };

  const pluginChain = editList?.pluginChain ?? [];

  const addPlugin = (id: ProEditorPluginId) => {
    if (!editList || pluginChain.includes(id)) {
      return;
    }
    setEditList({
      ...editList,
      pluginChain: [...pluginChain, id],
      [id]: { ...editList[id], enabled: true },
    });
    setPluginPickerOpen(false);
  };

  const removePlugin = (id: ProEditorPluginId) => {
    if (!editList) {
      return;
    }
    setEditList({
      ...editList,
      pluginChain: pluginChain.filter((p) => p !== id),
      [id]: { ...editList[id], enabled: false },
    });
  };

  const reorderPlugin = (
    dragId: ProEditorPluginId,
    dropId: ProEditorPluginId,
  ) => {
    if (!editList || dragId === dropId) {
      return;
    }
    const next = [...pluginChain];
    const from = next.indexOf(dragId);
    const to = next.indexOf(dropId);
    if (from === -1 || to === -1) {
      return;
    }
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    setEditList({ ...editList, pluginChain: next });
  };

  const normalize = () => {
    if (!editList) {
      return;
    }
    setEditList({
      ...editList,
      loudnorm: { ...editList.loudnorm, enabled: !editList.loudnorm.enabled },
    });
    setMessage(
      editList.loudnorm.enabled
        ? 'Normalization turned off.'
        : `Normalizing to ${editList.loudnorm.targetLufs} LUFS on render.`,
    );
  };

  /** Cuts leading/trailing near-silence off the current peaks -- a quick
   * approximation (peaks are already-bucketed amplitude, not raw PCM, so
   * this can't be as precise as a real silence-region detector) rather
   * than requiring the user to find and select the edges by hand. */
  const trimSilence = () => {
    if (!editList || peaks.length === 0 || editList.sourceDuration <= 0) {
      setMessage('No waveform loaded yet to trim.');
      return;
    }
    const threshold = 0.06;
    let start = 0;
    while (start < peaks.length && peaks[start]! < threshold) {
      start++;
    }
    let end = peaks.length - 1;
    while (end > start && peaks[end]! < threshold) {
      end--;
    }
    const secPerBucket = editList.sourceDuration / peaks.length;
    const startSec = start * secPerBucket;
    const endSec = (end + 1) * secPerBucket;
    const newCuts = [...editList.cuts];
    let trimmed = false;
    if (startSec > 0.3) {
      newCuts.push({ start: 0, end: startSec });
      trimmed = true;
    }
    if (editList.sourceDuration - endSec > 0.3) {
      newCuts.push({ start: endSec, end: editList.sourceDuration });
      trimmed = true;
    }
    if (!trimmed) {
      setMessage('No leading/trailing silence found.');
      return;
    }
    setEditList({
      ...editList,
      cuts: newCuts.sort((a, b) => a.start - b.start),
    });
    setMessage('Trimmed leading/trailing silence.');
  };

  const save = async () => {
    if (!editList) {
      return;
    }
    setBusy(true);
    setMessage(null);
    const result = await saveEditorDraft(archiveItemId, editList, updatedAt);
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setUpdatedAt(result.updatedAt);
    setMessage('Draft saved.');
  };

  const render = async (activate: boolean) => {
    if (!editList) {
      return;
    }
    setRenderPromptOpen(false);
    setBusy(true);
    setMessage(null);
    const saveFirst = await saveEditorDraft(archiveItemId, editList, updatedAt);
    if (saveFirst.ok) {
      setUpdatedAt(saveFirst.updatedAt);
    }
    const result = await renderEditorDraft(
      archiveItemId,
      editList,
      versionLabel.trim() || 'Edited mix',
      activate,
    );
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      activate
        ? `Render started — version ${result.versionId} will go live, ${result.status.toLowerCase()}.`
        : `Saved as a new revision — version ${result.versionId}, ${result.status.toLowerCase()}. The current live version is untouched; activate it from Revision history when you're ready.`,
    );
  };

  return (
    <StudioGate>
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/editor" />
        <div className="flex flex-wrap gap-3 text-xs">
          <Link
            to="/studio/archive"
            className="text-foreground-secondary hover:underline"
          >
            ← Music
          </Link>
          <Link
            to="/studio/archive/$id"
            params={{ id: archiveItemId }}
            className="text-foreground-secondary hover:underline"
          >
            Metadata
          </Link>
          <Link
            to="/studio/editor"
            className="text-foreground-secondary hover:underline"
          >
            Projects
          </Link>
        </div>

        <StudioPageHeader
          title={title || 'Pro editor'}
          subtitle="Waveform, cuts, EQ, and mastering — save a draft or render a new version."
        />

        <ClientCapabilityNotice kind="partial" title="Editor scope">
          This is the lite pro editor (cut/trim, FX knobs, stems request). Full
          multitrack timeline parity with production stays on the backlog — see{' '}
          <Link to="/more" className="underline-offset-2 hover:underline">
            Tahti map
          </Link>
          .
        </ClientCapabilityNotice>

        {loading || !editList ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading editor…</p>
          </StudioPanel>
        ) : (
          <>
            <StudioPanel>
              <WaveformCanvas
                peaks={peaks}
                durationSec={duration}
                currentTime={currentTime}
                cuts={editList.cuts}
                selection={selection}
                viewStart={viewStart}
                viewEnd={viewEnd}
                onViewChange={(start, end) => {
                  setViewStart(start);
                  setViewEnd(end);
                }}
                onSeek={seek}
                onSelectRange={(start, end) => setSelection({ start, end })}
              />

              <div className="mt-2 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <WaveformMinimap
                    peaks={peaks}
                    viewStart={viewStart}
                    viewEnd={viewEnd}
                    onSeek={(frac) => seek(frac * duration)}
                  />
                </div>
                {(viewStart > 0 || viewEnd < 1) && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setViewStart(0);
                      setViewEnd(1);
                    }}
                  >
                    Reset zoom
                  </Button>
                )}
              </div>

              <div className="text-foreground-secondary mt-3 flex flex-wrap items-center gap-3 text-xs">
                <span>
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <span>Kept after cuts: {formatTime(keptDuration)}</span>
                <span>{editList.cuts.length} cut(s)</span>
                {selection && (
                  <span>
                    Selection {formatTime(selection.start)}–
                    {formatTime(selection.end)}
                  </span>
                )}
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={togglePlay}>
                  {playing ? (
                    <PauseIcon size={16} aria-hidden className="mr-1.5" />
                  ) : (
                    <PlayIcon size={16} aria-hidden className="mr-1.5" />
                  )}
                  {playing ? 'Pause' : 'Play'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!selection}
                  onClick={previewSelection}
                  title="Play just the selection, through the enabled EQ/Compressor/Limiter"
                >
                  <PlayIcon size={16} aria-hidden className="mr-1.5" />
                  {previewingSelection ? 'Previewing…' : 'Preview selection'}
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!selection}
                  onClick={addCutFromSelection}
                >
                  Cut selection
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={!selection}
                  onClick={trimToSelection}
                >
                  Trim to selection
                </Button>
                <Button
                  size="sm"
                  variant="text"
                  disabled={editList.cuts.length === 0}
                  onClick={clearCuts}
                >
                  Clear cuts
                </Button>
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => setSelection(null)}
                >
                  Clear selection
                </Button>
                <Button
                  size="sm"
                  variant="text"
                  onClick={() =>
                    setMarkers((m) => [...m, currentTime].sort((a, b) => a - b))
                  }
                >
                  Add marker
                </Button>
              </div>

              {markers.length > 0 && (
                <div className="text-foreground-secondary mt-3 flex flex-wrap items-center gap-2 text-xs">
                  Markers:{' '}
                  {markers.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className="border-border rounded border px-1.5 py-0.5 hover:underline"
                      onClick={() => seek(m)}
                    >
                      {formatTime(m)}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="underline"
                    onClick={() => setMarkers([])}
                  >
                    clear
                  </button>
                </div>
              )}
            </StudioPanel>

            <StudioPanel
              title="Mastering"
              description={
                masteringCollapsed
                  ? undefined
                  : 'Enabled effects are audible live in Play and Preview selection — this is a real-time approximation for monitoring, not the final render.'
              }
              action={
                <Button
                  size="icon-sm"
                  variant="text"
                  aria-label={
                    masteringCollapsed
                      ? 'Expand mastering'
                      : 'Minimize mastering'
                  }
                  title={masteringCollapsed ? 'Expand' : 'Minimize'}
                  onClick={() => setMasteringCollapsed((v) => !v)}
                >
                  {masteringCollapsed ? (
                    <ChevronRightIcon size={16} aria-hidden />
                  ) : (
                    <ChevronDownIcon size={16} aria-hidden />
                  )}
                </Button>
              }
            >
              {!masteringCollapsed && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant={
                        editList.loudnorm.enabled ? 'default' : 'secondary'
                      }
                      onClick={normalize}
                    >
                      <Wand2Icon size={14} aria-hidden className="mr-1.5" />
                      {editList.loudnorm.enabled
                        ? `Normalizing (${editList.loudnorm.targetLufs} LUFS)`
                        : 'Normalize'}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={trimSilence}>
                      <ScissorsIcon size={14} aria-hidden className="mr-1.5" />
                      Trim silence
                    </Button>
                  </div>

                  <label className="text-foreground-secondary max-w-xs text-xs">
                    Master gain ({editList.gainDb} dB)
                    <input
                      type="range"
                      min={-24}
                      max={12}
                      step={0.5}
                      value={editList.gainDb}
                      className="w-full"
                      onChange={(e) =>
                        setEditList({
                          ...editList,
                          gainDb: Number(e.target.value),
                        })
                      }
                    />
                  </label>

                  <div className="flex flex-col gap-3">
                    {pluginChain.length === 0 ? (
                      <p className="text-foreground-secondary text-sm">
                        No plugins in the chain yet.
                      </p>
                    ) : (
                      pluginChain.map((id) => {
                        const meta = PLUGIN_META[id];
                        return (
                          <div
                            key={id}
                            draggable
                            onDragStart={() => {
                              dragPluginRef.current = id;
                            }}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={(e) => {
                              e.preventDefault();
                              if (dragPluginRef.current) {
                                reorderPlugin(dragPluginRef.current, id);
                              }
                              dragPluginRef.current = null;
                            }}
                            className="border-border bg-background-secondary/40 rounded-lg border p-3"
                          >
                            <div className="mb-3 flex items-center gap-2">
                              <span
                                className="cursor-grab touch-none"
                                aria-hidden
                              >
                                <GripVerticalIcon
                                  size={16}
                                  className="text-foreground-secondary"
                                />
                              </span>
                              <div className="size-7 shrink-0 overflow-hidden rounded">
                                <PluginIcon id={id} size={16} />
                              </div>
                              <span className="text-sm font-semibold">
                                {meta.label}
                              </span>
                              <span className="text-foreground-secondary flex-1 truncate text-xs">
                                {meta.description}
                              </span>
                              <Button
                                size="icon-sm"
                                variant="text"
                                aria-label={`Remove ${meta.label}`}
                                title="Remove"
                                onClick={() => removePlugin(id)}
                              >
                                <XIcon size={14} aria-hidden />
                              </Button>
                            </div>

                            {id === 'eq' && (
                              <div className="grid gap-2 sm:grid-cols-3">
                                {editList.eq.bands.map((band, i) => (
                                  <label
                                    key={band.freq}
                                    className="text-foreground-secondary text-xs"
                                  >
                                    {band.freq} Hz gain ({band.gainDb} dB)
                                    <input
                                      type="range"
                                      min={-12}
                                      max={12}
                                      step={0.5}
                                      value={band.gainDb}
                                      className="w-full"
                                      onChange={(e) => {
                                        const bands = editList.eq.bands.map(
                                          (b, idx) =>
                                            idx === i
                                              ? {
                                                  ...b,
                                                  gainDb: Number(
                                                    e.target.value,
                                                  ),
                                                }
                                              : b,
                                        );
                                        setEditList({
                                          ...editList,
                                          eq: { ...editList.eq, bands },
                                        });
                                      }}
                                    />
                                  </label>
                                ))}
                              </div>
                            )}

                            {id === 'comp' && (
                              <div className="grid gap-2 sm:grid-cols-2">
                                <label className="text-foreground-secondary text-xs">
                                  Threshold ({editList.comp.thresholdDb} dB)
                                  <input
                                    type="range"
                                    min={-40}
                                    max={0}
                                    step={1}
                                    value={editList.comp.thresholdDb}
                                    className="w-full"
                                    onChange={(e) =>
                                      setEditList({
                                        ...editList,
                                        comp: {
                                          ...editList.comp,
                                          thresholdDb: Number(e.target.value),
                                        },
                                      })
                                    }
                                  />
                                </label>
                                <label className="text-foreground-secondary text-xs">
                                  Ratio ({editList.comp.ratio}:1)
                                  <input
                                    type="range"
                                    min={1}
                                    max={20}
                                    step={0.5}
                                    value={editList.comp.ratio}
                                    className="w-full"
                                    onChange={(e) =>
                                      setEditList({
                                        ...editList,
                                        comp: {
                                          ...editList.comp,
                                          ratio: Number(e.target.value),
                                        },
                                      })
                                    }
                                  />
                                </label>
                              </div>
                            )}

                            {id === 'limiter' && (
                              <label className="text-foreground-secondary max-w-xs text-xs">
                                Ceiling ({editList.limiter.ceilingDb} dB)
                                <input
                                  type="range"
                                  min={-6}
                                  max={0}
                                  step={0.1}
                                  value={editList.limiter.ceilingDb}
                                  className="w-full"
                                  onChange={(e) =>
                                    setEditList({
                                      ...editList,
                                      limiter: {
                                        ...editList.limiter,
                                        ceilingDb: Number(e.target.value),
                                      },
                                    })
                                  }
                                />
                              </label>
                            )}

                            {id === 'filter' && (
                              <div className="grid gap-2 sm:grid-cols-3">
                                <label className="text-foreground-secondary text-xs">
                                  Mode
                                  <select
                                    value={editList.filter.mode}
                                    className="border-border bg-background-input w-full rounded border px-2 py-1"
                                    onChange={(e) =>
                                      setEditList({
                                        ...editList,
                                        filter: {
                                          ...editList.filter,
                                          mode: e.target
                                            .value as EditList['filter']['mode'],
                                        },
                                      })
                                    }
                                  >
                                    <option value="highpass">High-pass</option>
                                    <option value="lowpass">Low-pass</option>
                                    <option value="highshelf">
                                      High shelf
                                    </option>
                                    <option value="lowshelf">Low shelf</option>
                                  </select>
                                </label>
                                <label className="text-foreground-secondary text-xs">
                                  Freq ({editList.filter.freq} Hz)
                                  <input
                                    type="range"
                                    min={20}
                                    max={20000}
                                    step={10}
                                    value={editList.filter.freq}
                                    className="w-full"
                                    onChange={(e) =>
                                      setEditList({
                                        ...editList,
                                        filter: {
                                          ...editList.filter,
                                          freq: Number(e.target.value),
                                        },
                                      })
                                    }
                                  />
                                </label>
                                <label className="text-foreground-secondary text-xs">
                                  Slope
                                  <select
                                    value={editList.filter.slope}
                                    className="border-border bg-background-input w-full rounded border px-2 py-1"
                                    onChange={(e) =>
                                      setEditList({
                                        ...editList,
                                        filter: {
                                          ...editList.filter,
                                          slope: e.target
                                            .value as EditList['filter']['slope'],
                                        },
                                      })
                                    }
                                  >
                                    <option value="12db">12 dB/oct</option>
                                    <option value="24db">24 dB/oct</option>
                                    <option value="brickwall">Brickwall</option>
                                  </select>
                                </label>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}

                    {ALL_PLUGIN_IDS.some((id) => !pluginChain.includes(id)) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPluginPickerOpen(true)}
                        className="self-start"
                      >
                        <PlusIcon size={14} aria-hidden className="mr-1.5" />
                        Add plugin
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </StudioPanel>

            <Dialog.Root
              isOpen={pluginPickerOpen}
              onClose={() => setPluginPickerOpen(false)}
            >
              <Dialog.Title>Add a plugin</Dialog.Title>
              <CardGrid className="grid-cols-[repeat(auto-fit,minmax(8rem,1fr))]">
                {ALL_PLUGIN_IDS.filter((id) => !pluginChain.includes(id)).map(
                  (id) => (
                    <Card
                      key={id}
                      title={PLUGIN_META[id].label}
                      subtitle={PLUGIN_META[id].description}
                      image={<PluginIcon id={id} />}
                      onClick={() => addPlugin(id)}
                    />
                  ),
                )}
              </CardGrid>
              <Dialog.Actions>
                <Dialog.Close>Close</Dialog.Close>
              </Dialog.Actions>
            </Dialog.Root>

            <div className="grid gap-4 md:grid-cols-2">
              <StudioPanel
                title="Stems"
                action={
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void requestArchiveStems(archiveItemId).then((r) => {
                        if (!r.ok) {
                          setMessage(r.error);
                        } else {
                          setMessage(`Stem job: ${r.status}`);
                          void fetchArchiveStems(archiveItemId).then((s) =>
                            setStems(s.data),
                          );
                        }
                      });
                    }}
                  >
                    Request 2-stem split
                  </Button>
                }
              >
                {stems.length === 0 ? (
                  <p className="text-foreground-secondary text-sm">
                    No stem jobs yet.
                  </p>
                ) : (
                  <ul className="divide-border divide-y">
                    {stems.map((job) => (
                      <li
                        key={job.stemSet}
                        className="py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between">
                          <span>{job.stemSet}</span>
                          <span className="text-foreground-secondary font-mono text-xs uppercase">
                            {job.status}
                          </span>
                        </div>
                        {job.files && job.files.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-2">
                            {job.files.map((f) => (
                              <a
                                key={f.label}
                                href={f.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-xs underline-offset-2 hover:underline"
                              >
                                {f.label}
                              </a>
                            ))}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </StudioPanel>

              <StudioPanel title="Export">
                <div className="flex flex-col gap-3">
                  <Input
                    label="Version label"
                    value={versionLabel}
                    onChange={(e) => setVersionLabel(e.target.value)}
                  />
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={busy}
                      onClick={() => void save()}
                    >
                      <SaveIcon size={16} aria-hidden className="mr-1.5" />
                      Save draft
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busy}
                      onClick={() => setRenderPromptOpen(true)}
                    >
                      <UploadIcon size={16} aria-hidden className="mr-1.5" />
                      Render version
                    </Button>
                  </div>
                  {message && (
                    <p
                      className="text-foreground-secondary text-sm"
                      role="status"
                    >
                      {message}
                    </p>
                  )}
                </div>
              </StudioPanel>
            </div>
          </>
        )}

        <Dialog.Root
          isOpen={renderPromptOpen}
          onClose={() => setRenderPromptOpen(false)}
        >
          <Dialog.Title>
            Render “{versionLabel.trim() || 'Edited mix'}”
          </Dialog.Title>
          <Dialog.Description>
            Overwrite replaces what&apos;s live right now. Save as a new
            revision renders and adds it to Revision history without touching
            the current live version — activate it there whenever you&apos;re
            ready.
          </Dialog.Description>
          <Dialog.Actions>
            <Dialog.Close>Cancel</Dialog.Close>
            <Button variant="secondary" onClick={() => void render(false)}>
              Save as new revision
            </Button>
            <Button onClick={() => void render(true)}>
              Overwrite live version
            </Button>
          </Dialog.Actions>
        </Dialog.Root>

        <audio ref={audioRef} preload="metadata" className="hidden" />
      </div>
    </StudioGate>
  );
}
