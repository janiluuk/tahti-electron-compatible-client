import { useEffect, useRef } from 'react';

type Props = {
  peaks: number[];
  viewStart: number;
  viewEnd: number;
  onSeek: (frac: number) => void;
};

/** Full-track overview strip below the zoomed waveform — shows the
 * current zoom window and click/drag to pan or seek. */
export function WaveformMinimap({ peaks, viewStart, viewEnd, onSeek }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    function draw() {
      if (!canvas) {
        return;
      }
      const dpr = window.devicePixelRatio || 1;
      const cssW = canvas.clientWidth || 640;
      const cssH = canvas.clientHeight || 28;
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

      const data = peaks.length > 0 ? peaks : [];
      const mid = h / 2;
      const barColor =
        getComputedStyle(canvas)
          .getPropertyValue('--color-accent-cyan')
          .trim() || 'rgba(120, 220, 200, 0.5)';
      ctx.fillStyle = barColor;
      ctx.globalAlpha = 0.5;
      const barW = w / Math.max(1, data.length);
      for (let i = 0; i < data.length; i++) {
        const amp = Math.max(0.05, Math.min(1, data[i]!));
        const bh = amp * (h - 4);
        ctx.fillRect(i * barW, mid - bh / 2, Math.max(1, barW - 0.5), bh);
      }
      ctx.globalAlpha = 1;

      const primary =
        getComputedStyle(canvas).getPropertyValue('--color-primary').trim() ||
        'rgba(255, 200, 60, 0.9)';
      const x0 = viewStart * w;
      const x1 = viewEnd * w;
      ctx.strokeStyle = primary;
      ctx.lineWidth = 2;
      ctx.strokeRect(x0 + 1, 1, Math.max(2, x1 - x0 - 2), h - 2);
    }
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, [peaks, viewStart, viewEnd]);

  return (
    <canvas
      ref={canvasRef}
      aria-label="Waveform overview — click to seek"
      className="border-border bg-background-secondary h-7 w-full cursor-pointer rounded-md border"
      onClick={(e) => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }
        const rect = canvas.getBoundingClientRect();
        const frac = (e.clientX - rect.left) / rect.width;
        onSeek(Math.max(0, Math.min(1, frac)));
      }}
    />
  );
}
