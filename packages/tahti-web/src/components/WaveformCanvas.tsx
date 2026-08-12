import { useEffect, useRef } from 'react';

import type { EditCut } from '../api/studio-types';

type Props = {
  peaks: number[];
  durationSec: number;
  currentTime: number;
  cuts: EditCut[];
  selection: { start: number; end: number } | null;
  onSeek: (sec: number) => void;
  onSelectRange?: (start: number, end: number) => void;
};

/** Simple peaks waveform with playhead, cut regions, and click/drag selection. */
export function WaveformCanvas({
  peaks,
  durationSec,
  currentTime,
  cuts,
  selection,
  onSeek,
  onSelectRange,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ startX: number; startSec: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.clientWidth || 640;
    const cssH = 96;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const w = cssW;
    const h = cssH;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.04)';
    ctx.fillRect(0, 0, w, h);

    const data =
      peaks.length > 0 ? peaks : Array.from({ length: 128 }, () => 0.3);
    const barW = w / data.length;
    for (let i = 0; i < data.length; i++) {
      const amp = Math.max(0.05, Math.min(1, data[i]!));
      const bh = amp * (h - 8);
      const x = i * barW;
      const y = (h - bh) / 2;
      ctx.fillStyle = 'rgba(120, 220, 200, 0.75)';
      ctx.fillRect(x, y, Math.max(1, barW - 0.5), bh);
    }

    for (const cut of cuts) {
      if (durationSec <= 0) {
        continue;
      }
      const x0 = (cut.start / durationSec) * w;
      const x1 = (cut.end / durationSec) * w;
      ctx.fillStyle = 'rgba(220, 80, 80, 0.35)';
      ctx.fillRect(x0, 0, Math.max(2, x1 - x0), h);
    }

    if (selection && durationSec > 0) {
      const x0 = (selection.start / durationSec) * w;
      const x1 = (selection.end / durationSec) * w;
      ctx.fillStyle = 'rgba(255, 220, 80, 0.25)';
      ctx.fillRect(x0, 0, Math.max(2, x1 - x0), h);
      ctx.strokeStyle = 'rgba(255, 220, 80, 0.9)';
      ctx.strokeRect(x0, 1, Math.max(2, x1 - x0), h - 2);
    }

    if (durationSec > 0) {
      const px = (currentTime / durationSec) * w;
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    }
  }, [peaks, durationSec, currentTime, cuts, selection]);

  const secFromEvent = (clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas || durationSec <= 0) {
      return 0;
    }
    const rect = canvas.getBoundingClientRect();
    const t = (clientX - rect.left) / rect.width;
    return Math.max(0, Math.min(durationSec, t * durationSec));
  };

  return (
    <canvas
      ref={canvasRef}
      className="border-border bg-background-secondary h-24 w-full cursor-crosshair rounded-md border"
      onMouseDown={(e) => {
        const sec = secFromEvent(e.clientX);
        dragRef.current = { startX: e.clientX, startSec: sec };
        onSeek(sec);
      }}
      onMouseMove={(e) => {
        if (!dragRef.current || !onSelectRange) {
          return;
        }
        const end = secFromEvent(e.clientX);
        const start = dragRef.current.startSec;
        onSelectRange(Math.min(start, end), Math.max(start, end));
      }}
      onMouseUp={(e) => {
        if (!dragRef.current) {
          return;
        }
        const end = secFromEvent(e.clientX);
        const start = dragRef.current.startSec;
        dragRef.current = null;
        if (onSelectRange && Math.abs(end - start) > 0.05) {
          onSelectRange(Math.min(start, end), Math.max(start, end));
        } else {
          onSeek(end);
        }
      }}
      onMouseLeave={() => {
        dragRef.current = null;
      }}
    />
  );
}
