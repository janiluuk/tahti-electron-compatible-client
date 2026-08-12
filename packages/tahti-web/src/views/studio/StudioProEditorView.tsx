import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchArchiveStems,
  fetchEditorDraft,
  fetchEditorSource,
  renderEditorDraft,
  requestArchiveStems,
  saveEditorDraft,
  type StemJob,
} from '../../api/studio';
import type { EditList } from '../../api/studio-types';
import { createDefaultEditList } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { WaveformCanvas } from '../../components/WaveformCanvas';

function formatTime(sec: number): string {
  if (!Number.isFinite(sec)) {
    return '0:00';
  }
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
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
  const [metaSource, setMetaSource] = useState('');
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
      setMetaSource(`${src.meta.source}/${draft.meta.source}`);
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
    audio.src = sourceUrl;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
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
    if (audio.paused) {
      void audio.play().catch(() => undefined);
    } else {
      audio.pause();
    }
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
    setMessage('Draft saved (PATCH …/editor/draft).');
  };

  const render = async () => {
    if (!editList) {
      return;
    }
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
    );
    setBusy(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setMessage(
      `Render queued — version ${result.versionId} (${result.status}).`,
    );
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-5">
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

        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {title || 'Pro editor'}
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Waveform, cut/trim, EQ/comp/limiter knobs (EditList), stems, draft +
            render. Source: {metaSource || '…'}.
          </p>
        </div>

        {loading || !editList ? (
          <p className="text-foreground-secondary text-sm">Loading editor…</p>
        ) : (
          <>
            <WaveformCanvas
              peaks={peaks}
              durationSec={duration}
              currentTime={currentTime}
              cuts={editList.cuts}
              selection={selection}
              onSeek={seek}
              onSelectRange={(start, end) => setSelection({ start, end })}
            />

            <div className="text-foreground-secondary flex flex-wrap items-center gap-3 text-xs">
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

            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={togglePlay}>
                {playing ? 'Pause' : 'Play'}
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
                Add marker @ playhead
              </Button>
            </div>

            {markers.length > 0 && (
              <div className="text-foreground-secondary flex flex-wrap gap-2 text-xs">
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

            <div className="border-border grid gap-4 rounded-lg border p-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editList.eq.enabled}
                    onChange={(e) =>
                      setEditList({
                        ...editList,
                        eq: { ...editList.eq, enabled: e.target.checked },
                      })
                    }
                  />
                  EQ enabled
                </label>
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
                        const bands = editList.eq.bands.map((b, idx) =>
                          idx === i
                            ? { ...b, gainDb: Number(e.target.value) }
                            : b,
                        );
                        setEditList({
                          ...editList,
                          eq: { ...editList.eq, enabled: true, bands },
                        });
                      }}
                    />
                  </label>
                ))}
                <label className="text-foreground-secondary text-xs">
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
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editList.comp.enabled}
                    onChange={(e) =>
                      setEditList({
                        ...editList,
                        comp: { ...editList.comp, enabled: e.target.checked },
                      })
                    }
                  />
                  Compressor
                </label>
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
                          enabled: true,
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
                          enabled: true,
                          ratio: Number(e.target.value),
                        },
                      })
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={editList.limiter.enabled}
                    onChange={(e) =>
                      setEditList({
                        ...editList,
                        limiter: {
                          ...editList.limiter,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                  Limiter (ceiling {editList.limiter.ceilingDb} dB)
                </label>
              </div>
            </div>

            <div className="border-border flex flex-col gap-2 rounded-lg border p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-foreground-secondary text-xs uppercase">
                  Stems
                </p>
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
              </div>
              {stems.length === 0 ? (
                <p className="text-foreground-secondary text-xs">
                  No stem jobs yet.
                </p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {stems.map((job) => (
                    <li key={job.stemSet}>
                      {job.stemSet}: {job.status}
                      <div className="mt-1 flex flex-wrap gap-2">
                        {job.files?.map((f) => (
                          <a
                            key={f.label}
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs underline"
                          >
                            {f.label}
                          </a>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-border flex flex-col gap-3 rounded-lg border p-4">
              <p className="text-foreground-secondary text-xs uppercase">
                Export / render
              </p>
              <Input
                label="Version label"
                value={versionLabel}
                onChange={(e) => setVersionLabel(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button size="sm" disabled={busy} onClick={() => void save()}>
                  Save draft
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void render()}
                >
                  Render version
                </Button>
              </div>
              <p className="text-foreground-secondary text-xs">
                Real: PATCH draft + POST render (ffmpeg job). Mock: local draft
                store + fake version id. UpdatedAt: {updatedAt ?? 'null'}
              </p>
            </div>

            {message && <p className="text-sm">{message}</p>}

            <details className="text-foreground-secondary text-xs">
              <summary className="cursor-pointer">EditList JSON</summary>
              <pre className="bg-background-secondary mt-2 max-h-48 overflow-auto rounded p-2">
                {JSON.stringify(editList, null, 2)}
              </pre>
            </details>
          </>
        )}

        <audio ref={audioRef} preload="metadata" className="hidden" />
      </div>
    </StudioGate>
  );
}
