import { create } from 'zustand';

import type { QueueItem, RepeatMode } from '@nuclearplayer/model';

import type { TahtiPlayable } from '../api/types';
import { playableToTrack } from '../lib/playableToTrack';
import { useLibraryStore } from './libraryStore';

export type PlaybackStatus =
  | 'idle'
  | 'loading'
  | 'playing'
  | 'paused'
  | 'error';

type PlayerState = {
  queue: QueueItem[];
  currentId: string | null;
  status: PlaybackStatus;
  error: string | null;
  volume: number;
  muted: boolean;
  currentTime: number;
  duration: number;
  isLive: boolean;
  shuffle: boolean;
  repeatMode: RepeatMode;
  /** Set by UI; AudioEngine applies to the media element then clears. */
  seekTarget: number | null;
  play: (item: TahtiPlayable, opts?: { enqueueRest?: TahtiPlayable[] }) => void;
  enqueue: (item: TahtiPlayable) => void;
  playQueueIndex: (id: string) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  setStatus: (status: PlaybackStatus, error?: string | null) => void;
  setProgress: (currentTime: number, duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  /** Seek VOD/archive to absolute seconds (no-op while live/radio). */
  seekTo: (seconds: number) => void;
  clearSeekTarget: () => void;
  next: () => void;
  previous: () => void;
};

function toTrack(item: TahtiPlayable) {
  return playableToTrack(item);
}

function recordHistory(item: TahtiPlayable) {
  useLibraryStore.getState().pushHistory(item);
}

function toQueueItem(item: TahtiPlayable): QueueItem {
  return {
    id: item.id,
    track: toTrack(item),
    status: 'idle',
    addedAtIso: new Date().toISOString(),
  };
}

function streamUrlFromQueueItem(qi: QueueItem): string | null {
  return (
    qi.track.streamCandidates?.[0]?.stream?.url ?? qi.track.source.url ?? null
  );
}

export function playableFromQueueItem(qi: QueueItem): TahtiPlayable | null {
  const url = streamUrlFromQueueItem(qi);
  if (!url) {
    return null;
  }
  const protocol =
    qi.track.streamCandidates?.[0]?.stream?.protocol === 'hls'
      ? 'hls'
      : 'https';
  return {
    id: qi.id,
    kind: qi.id.startsWith('radio:')
      ? 'radio'
      : qi.id.startsWith('archive:')
        ? 'archive'
        : 'live',
    title: qi.track.title,
    artist: qi.track.artists.map((a) => a.name).join(', '),
    coverUrl: qi.track.artwork?.items[0]?.url,
    streamUrl: url,
    protocol,
    channelSlug: qi.id.includes(':') ? qi.id.split(':')[1] : undefined,
  };
}

const REPEAT_CYCLE: RepeatMode[] = ['off', 'all', 'one'];

export const usePlayerStore = create<PlayerState>((set, get) => ({
  queue: [],
  currentId: null,
  status: 'idle',
  error: null,
  volume: 0.85,
  muted: false,
  currentTime: 0,
  duration: 0,
  isLive: true,
  shuffle: false,
  repeatMode: 'off',
  seekTarget: null,

  play: (item, opts) => {
    const head = toQueueItem(item);
    const rest = (opts?.enqueueRest ?? []).map(toQueueItem);
    const queue = [head, ...rest.filter((r) => r.id !== head.id)];
    recordHistory(item);
    set({
      queue,
      currentId: head.id,
      status: 'loading',
      error: null,
      currentTime: 0,
      duration: 0,
      seekTarget: null,
      isLive: item.kind === 'live' || item.kind === 'radio',
    });
  },

  enqueue: (item) => {
    const qi = toQueueItem(item);
    set((s) => {
      if (s.queue.some((q) => q.id === qi.id)) {
        return s;
      }
      return { queue: [...s.queue, qi] };
    });
  },

  playQueueIndex: (id) => {
    const qi = get().queue.find((q) => q.id === id);
    if (!qi) {
      return;
    }
    const playable = playableFromQueueItem(qi);
    if (playable) {
      recordHistory(playable);
    }
    set({
      currentId: id,
      status: 'loading',
      error: null,
      currentTime: 0,
      seekTarget: null,
      isLive: playable?.kind === 'live' || playable?.kind === 'radio',
    });
  },

  removeFromQueue: (id) => {
    set((s) => {
      const queue = s.queue.filter((q) => q.id !== id);
      const currentId =
        s.currentId === id ? (queue[0]?.id ?? null) : s.currentId;
      return {
        queue,
        currentId,
        status: currentId ? s.status : 'idle',
      };
    });
  },

  clearQueue: () =>
    set({
      queue: [],
      currentId: null,
      status: 'idle',
      error: null,
      currentTime: 0,
      duration: 0,
    }),

  setStatus: (status, error = null) => set({ status, error }),

  setProgress: (currentTime, duration) => set({ currentTime, duration }),

  setVolume: (volume) => set({ volume, muted: volume === 0 ? true : false }),

  toggleMute: () => set((s) => ({ muted: !s.muted })),

  toggleShuffle: () => {
    const { isLive } = get();
    if (isLive) {
      return;
    }
    set((s) => ({ shuffle: !s.shuffle }));
  },

  cycleRepeat: () => {
    const { isLive, repeatMode } = get();
    if (isLive) {
      return;
    }
    const idx = REPEAT_CYCLE.indexOf(repeatMode);
    set({ repeatMode: REPEAT_CYCLE[(idx + 1) % REPEAT_CYCLE.length]! });
  },

  seekTo: (seconds) => {
    const { isLive, duration } = get();
    if (isLive) {
      return;
    }
    const max = duration > 0 ? duration : seconds;
    const clamped = Math.max(0, Math.min(max, seconds));
    set({ seekTarget: clamped, currentTime: clamped });
  },

  clearSeekTarget: () => set({ seekTarget: null }),

  next: () => {
    const { queue, currentId, shuffle, repeatMode, isLive } = get();
    if (!currentId || queue.length === 0) {
      return;
    }

    if (repeatMode === 'one' && !isLive) {
      get().playQueueIndex(currentId);
      return;
    }

    const idx = queue.findIndex((q) => q.id === currentId);

    if (shuffle && !isLive && queue.length > 1) {
      const others = queue.filter((q) => q.id !== currentId);
      const pick = others[Math.floor(Math.random() * others.length)];
      if (pick) {
        get().playQueueIndex(pick.id);
      }
      return;
    }

    const nextItem = queue[idx + 1];
    if (nextItem) {
      get().playQueueIndex(nextItem.id);
      return;
    }
    if (repeatMode === 'all' && !isLive && queue[0]) {
      get().playQueueIndex(queue[0].id);
    }
  },

  previous: () => {
    const { queue, currentId, currentTime, isLive } = get();
    if (!currentId || queue.length === 0) {
      return;
    }
    // Restart current VOD if >3s in (Nuclear-style), else go previous
    if (!isLive && currentTime > 3) {
      get().seekTo(0);
      return;
    }
    const idx = queue.findIndex((q) => q.id === currentId);
    const prev = queue[idx - 1];
    if (prev) {
      get().playQueueIndex(prev.id);
    }
  },
}));
