import { useEffect, useMemo, useRef, useState } from 'react';

import { usePlayerStore } from '../stores/playerStore';

/** Keys match the backend's ColorSchemeSchema (bg/accent/text/muted/
 * highlight) so a scheme round-trips through save/fetch unchanged. */
export type VisualColorScheme = {
  accent?: string;
  highlight?: string;
  bg?: string;
  text?: string;
  muted?: string;
};

type Props = {
  preset?: string | null;
  colorScheme?: VisualColorScheme | null;
  colorSchemeJson?: string | null;
  className?: string;
  /** Cover art for water-ripple-ish tint */
  artworkUrl?: string | null;
};

function parseScheme(
  scheme: VisualColorScheme | null | undefined,
  json: string | null | undefined,
): Required<VisualColorScheme> {
  const fallback = {
    accent: '#22D3EE',
    highlight: '#A78BFA',
    bg: '#0B1220',
    text: '#F8FAFC',
    muted: '#64748B',
  };
  let parsed: VisualColorScheme = {};
  if (json) {
    try {
      parsed = JSON.parse(json) as VisualColorScheme;
    } catch {
      parsed = {};
    }
  }
  return {
    accent: scheme?.accent ?? parsed.accent ?? fallback.accent,
    highlight: scheme?.highlight ?? parsed.highlight ?? fallback.highlight,
    bg: scheme?.bg ?? parsed.bg ?? fallback.bg,
    text: scheme?.text ?? parsed.text ?? fallback.text,
    muted: scheme?.muted ?? parsed.muted ?? fallback.muted,
  };
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h.padEnd(6, '0').slice(0, 6);
  const n = Number.parseInt(full, 16);
  if (!Number.isFinite(n)) {
    return [34, 211, 238];
  }
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'));
  } catch {
    return false;
  }
}

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FRAG_AURORA = `
precision mediump float;
uniform float uTime;
uniform float uLevel;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;
varying vec2 vUv;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}
void main() {
  vec2 uv = vUv;
  float t = uTime * 0.18;
  float intensity = 0.75 + uLevel * 0.9;
  float n1 = noise(uv * 2.5 + vec2(t, t * 0.5));
  float n2 = noise(uv * 4.0 - vec2(t * 0.7, t * 0.3));
  float band = smoothstep(0.25, 0.75, uv.y + n1 * 0.35 * intensity - n2 * 0.15);
  float edge = smoothstep(0.0, 0.12, uv.y) * smoothstep(1.0, 0.82, uv.y);
  vec3 col = mix(uC1, uC2, band);
  col = mix(col, uC3, n2 * 0.45 * intensity);
  float alpha = edge * (0.35 + n1 * 0.4 * intensity);
  gl_FragColor = vec4(col, alpha);
}
`;

const FRAG_GRID = `
precision mediump float;
uniform float uTime;
uniform float uLevel;
uniform vec3 uC1;
uniform vec3 uC2;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  float g = 18.0;
  vec2 gv = abs(fract(uv * g) - 0.5);
  float line = smoothstep(0.48, 0.5, max(gv.x, gv.y));
  float pulse = 0.25 + uLevel * 0.75;
  float wave = sin(uv.y * 12.0 - uTime * 2.0) * 0.5 + 0.5;
  vec3 col = mix(uC1, uC2, wave);
  float alpha = (1.0 - line) * (0.2 + pulse * 0.55);
  gl_FragColor = vec4(col, alpha);
}
`;

function readLevel(analyser: AnalyserNode | null, buf: Uint8Array): number {
  if (!analyser) {
    return 0.35;
  }
  analyser.getByteFrequencyData(buf as Uint8Array<ArrayBuffer>);
  let sum = 0;
  const n = Math.min(buf.length, 64);
  for (let i = 0; i < n; i++) {
    sum += buf[i]!;
  }
  return Math.min(1, (sum / (n * 255)) * 1.8);
}

/**
 * Lightweight WebGL / canvas visualizer — POC parity with prod presets
 * (aurora / grid / bars) without shipping the full Three.js preset tree.
 */
export function ChannelVisualizer({
  preset,
  colorScheme,
  colorSchemeJson,
  className,
  artworkUrl,
}: Props) {
  const analyser = usePlayerStore((s) => s.analyser);
  const status = usePlayerStore((s) => s.status);
  const playing = status === 'playing' || status === 'loading';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [enabled, setEnabled] = useState(false);
  const scheme = useMemo(
    () => parseScheme(colorScheme, colorSchemeJson),
    [colorScheme, colorSchemeJson],
  );
  const mode = (preset ?? 'AURORA').toUpperCase();

  useEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    setEnabled(!reduced && mode !== 'MINIMAL' && supportsWebGL());
  }, [mode]);

  useEffect(() => {
    if (!enabled) {
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const useBars =
      mode === 'WAVEFORM_BARS' ||
      mode === 'PARTICLE_FIELD' ||
      mode === 'LINE_TANGLE';

    if (useBars) {
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return;
      }
      const buf = new Uint8Array(
        new ArrayBuffer(analyser?.frequencyBinCount ?? 128),
      );
      let raf = 0;
      const draw = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = canvas.clientWidth || 1;
        const h = canvas.clientHeight || 1;
        if (
          canvas.width !== Math.floor(w * dpr) ||
          canvas.height !== Math.floor(h * dpr)
        ) {
          canvas.width = Math.floor(w * dpr);
          canvas.height = Math.floor(h * dpr);
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, w, h);
        const accent = scheme.accent;
        const highlight = scheme.highlight;
        const level = playing ? readLevel(analyser, buf) : 0.2;
        const bars = 48;
        const gap = 2;
        const bw = (w - gap * (bars - 1)) / bars;
        for (let i = 0; i < bars; i++) {
          const sample =
            analyser && playing
              ? (buf[Math.floor((i / bars) * buf.length)] ?? 0) / 255
              : 0.15 + Math.sin(Date.now() / 400 + i * 0.3) * 0.08;
          const bh = Math.max(4, sample * h * (0.55 + level * 0.45));
          ctx.fillStyle = i % 2 === 0 ? accent : highlight;
          ctx.globalAlpha = 0.55 + sample * 0.4;
          ctx.fillRect(i * (bw + gap), h - bh, bw, bh);
        }
        ctx.globalAlpha = 1;
        raf = requestAnimationFrame(draw);
      };
      raf = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(raf);
    }

    const gl =
      (canvas.getContext('webgl', {
        alpha: true,
        antialias: true,
      }) as WebGLRenderingContext | null) ?? null;
    if (!gl) {
      return;
    }

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const fragSrc =
      mode === 'REACTIVE_GRID' ||
      mode === 'BACKDROP_BOX' ||
      mode === 'CLOUDSCAPE'
        ? FRAG_GRID
        : FRAG_AURORA;
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'uTime');
    const uLevel = gl.getUniformLocation(prog, 'uLevel');
    const uC1 = gl.getUniformLocation(prog, 'uC1');
    const uC2 = gl.getUniformLocation(prog, 'uC2');
    const uC3 = gl.getUniformLocation(prog, 'uC3');

    const [r1, g1, b1] = hexToRgb(scheme.accent);
    const [r2, g2, b2] = hexToRgb(scheme.highlight);
    const [r3, g3, b3] = hexToRgb(scheme.muted);
    gl.uniform3f(uC1, r1 / 255, g1 / 255, b1 / 255);
    gl.uniform3f(uC2, r2 / 255, g2 / 255, b2 / 255);
    if (uC3) {
      gl.uniform3f(uC3, r3 / 255, g3 / 255, b3 / 255);
    }

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const freq = new Uint8Array(
      new ArrayBuffer(analyser?.frequencyBinCount ?? 128),
    );
    let raf = 0;
    const t0 = performance.now();
    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      const tw = Math.floor(w * dpr);
      const th = Math.floor(h * dpr);
      if (canvas.width !== tw || canvas.height !== th) {
        canvas.width = tw;
        canvas.height = th;
        gl.viewport(0, 0, tw, th);
      }
      const level = playing ? readLevel(analyser, freq) : 0.25;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, (performance.now() - t0) / 1000);
      gl.uniform1f(uLevel, level);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    };
  }, [enabled, mode, scheme, analyser, playing]);

  if (!enabled) {
    return (
      <div
        className={className}
        aria-hidden
        style={{
          background: `radial-gradient(ellipse at 30% 20%, ${scheme.highlight}33, transparent 55%), radial-gradient(ellipse at 70% 80%, ${scheme.accent}22, ${scheme.bg})`,
        }}
      />
    );
  }

  return (
    <div
      className={className}
      aria-hidden
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: scheme.bg,
      }}
    >
      {artworkUrl && (
        <img
          src={artworkUrl}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
      )}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
