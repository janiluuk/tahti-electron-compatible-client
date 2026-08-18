import { useEffect, useRef } from 'react';

import type { EditList } from '../api/studio-types';

type Graph = { ctx: AudioContext; source: MediaElementAudioSourceNode };

function getAudioContextCtor() {
  return (
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext
  );
}

/**
 * Wires the pro editor's <audio> element through a live Web Audio graph
 * matching the current EditList's EQ/Compressor/Limiter/gain settings, so
 * preview playback is actually processed through the plugin chain -- not
 * just raw playback next to controls that only apply on render.
 *
 * The limiter here is a fast high-ratio DynamicsCompressorNode, not a true
 * brickwall limiter -- close enough for an audible preview; the real
 * ffmpeg render path is still the source of truth for the exported file.
 */
export function useAudioPreviewGraph(
  audioRef: React.RefObject<HTMLAudioElement | null>,
  editList: EditList | null,
) {
  const graphRef = useRef<Graph | null>(null);
  const chainNodesRef = useRef<AudioNode[]>([]);

  function ensureGraph(): Graph | null {
    const audio = audioRef.current;
    if (graphRef.current || !audio) {
      return graphRef.current;
    }
    const Ctx = getAudioContextCtor();
    if (!Ctx) {
      return null;
    }
    try {
      const ctx = new Ctx();
      const source = ctx.createMediaElementSource(audio);
      graphRef.current = { ctx, source };
    } catch {
      // createMediaElementSource can only run once per element -- a race
      // (e.g. StrictMode double-invoke) leaves graphRef already set.
    }
    return graphRef.current;
  }

  // Resume the context on every play — browsers create AudioContext
  // suspended until a user gesture, and the chain-rebuild effect below can
  // run before any gesture has happened (e.g. editList loading on mount).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    const onPlay = () => {
      const graph = ensureGraph();
      if (graph && graph.ctx.state === 'suspended') {
        void graph.ctx.resume().catch(() => undefined);
      }
    };
    audio.addEventListener('play', onPlay);
    return () => audio.removeEventListener('play', onPlay);
  }, [audioRef]);

  useEffect(() => {
    if (!editList) {
      return;
    }
    const graph = ensureGraph();
    if (!graph) {
      return;
    }
    const { ctx, source } = graph;

    source.disconnect();
    for (const node of chainNodesRef.current) {
      node.disconnect();
    }
    chainNodesRef.current = [];

    let last: AudioNode = source;
    const connect = (node: AudioNode) => {
      last.connect(node);
      last = node;
      chainNodesRef.current.push(node);
    };

    // Follows the user's own drag-ordered chain instead of a fixed
    // sequence -- reordering plugins in the UI actually changes what you
    // hear, not just their display order. loudnorm isn't representable
    // as a single real-time node (it needs a full-pass loudness
    // analysis), so it stays render/export-only, same as the doc note
    // on this hook already says for the limiter approximation.
    for (const id of editList.pluginChain ?? []) {
      if (id === 'eq' && editList.eq.enabled) {
        for (const band of editList.eq.bands) {
          const filter = ctx.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.value = band.freq;
          filter.Q.value = band.q;
          filter.gain.value = band.gainDb;
          connect(filter);
        }
      } else if (id === 'comp' && editList.comp.enabled) {
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = editList.comp.thresholdDb;
        comp.ratio.value = editList.comp.ratio;
        comp.attack.value = editList.comp.attackMs / 1000;
        comp.release.value = editList.comp.releaseMs / 1000;
        connect(comp);
        if (editList.comp.makeupDb !== 0) {
          const makeup = ctx.createGain();
          makeup.gain.value = Math.pow(10, editList.comp.makeupDb / 20);
          connect(makeup);
        }
      } else if (id === 'limiter' && editList.limiter.enabled) {
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = editList.limiter.ceilingDb;
        limiter.knee.value = 0;
        limiter.ratio.value = 20;
        limiter.attack.value = 0.001;
        limiter.release.value = editList.limiter.releaseMs / 1000;
        connect(limiter);
      } else if (id === 'filter' && editList.filter.enabled) {
        const filter = ctx.createBiquadFilter();
        filter.type = editList.filter.mode;
        filter.frequency.value = editList.filter.freq;
        connect(filter);
      }
    }

    const gain = ctx.createGain();
    gain.gain.value = Math.pow(10, editList.gainDb / 20);
    connect(gain);

    last.connect(ctx.destination);
  }, [editList]);
}
