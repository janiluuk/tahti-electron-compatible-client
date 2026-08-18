import { useEffect, useState } from 'react';

const SAMPLE_SIZE = 24;

/**
 * Average RGB of an image, sampled via a small offscreen canvas -- used
 * to tint the full-screen player's backdrop from the current track's
 * cover art when the channel hasn't set its own colour scheme. Returns
 * null while loading, on a missing url, or if the image can't actually
 * be read into a canvas (CORS-tainted sources throw on getImageData,
 * same restriction the live plugin-preview graph runs into).
 */
export function useDominantColor(
  url: string | null | undefined,
): [number, number, number] | null {
  const [color, setColor] = useState<[number, number, number] | null>(null);

  useEffect(() => {
    if (!url) {
      setColor(null);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      if (cancelled) {
        return;
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = SAMPLE_SIZE;
        canvas.height = SAMPLE_SIZE;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return;
        }
        ctx.drawImage(img, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        const { data } = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
        let r = 0;
        let g = 0;
        let b = 0;
        let n = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i]!;
          g += data[i + 1]!;
          b += data[i + 2]!;
          n++;
        }
        if (n > 0 && !cancelled) {
          setColor([Math.round(r / n), Math.round(g / n), Math.round(b / n)]);
        }
      } catch {
        // CORS-tainted canvas -- keep null, caller falls back to tokens.
        if (!cancelled) {
          setColor(null);
        }
      }
    };
    img.onerror = () => {
      if (!cancelled) {
        setColor(null);
      }
    };
    img.src = url;
    return () => {
      cancelled = true;
    };
  }, [url]);

  return color;
}
