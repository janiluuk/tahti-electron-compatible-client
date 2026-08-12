import type { FetchMeta } from './client';
import { DEMO_MP3 } from './mock';
import { allowMockFallback, apiErrorMeta, failMeta, isForceMock } from './mode';
import type { TahtiPlayable } from './types';

const forceMock = isForceMock;

const apiBase = () => {
  if (import.meta.env.VITE_TAHTI_API_URL?.startsWith('http')) {
    return import.meta.env.VITE_TAHTI_API_URL.replace(/\/$/, '');
  }
  return '/tahti-api';
};

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; status: number }> {
  const { headers: initHeaders, ...rest } = init ?? {};
  const res = await fetch(`${apiBase()}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...initHeaders,
    },
  });
  if (!res.ok) {
    let detail = `${path} → ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      if (body.error || body.message) {
        detail = body.error ?? body.message ?? detail;
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  if (res.status === 204) {
    return { data: undefined as T, status: res.status };
  }
  return { data: (await res.json()) as T, status: res.status };
}

export type StreamSettings = {
  rtmp: { server: string; streamKey: string; fallbackServers?: string[] };
  icecast: {
    server: string;
    mount: string;
    password: string;
    hint?: string;
    fallbackServers?: string[];
  };
  hlsUrl: string;
};

export type SignalStatus = {
  connected: boolean;
  codec: string | null;
  bitrateKbps: number | null;
  listeners: number | null;
};

export type BroadcastUsage = {
  unlimited: boolean;
  secondsUsed: number;
  secondsRemaining: number | null;
  weeklyCapSeconds: number;
  warningLevel?: string;
  atCap?: boolean;
  blocked?: boolean;
};

export type RtmpTarget = {
  id: string;
  provider: string;
  label: string | null;
  rtmpUrl: string;
  alwaysMirror: boolean;
  enabled: boolean;
  keyLast4?: string;
  createdAt?: string;
};

export type LiveChannelState = 'OFFLINE' | 'PREVIEW' | 'LIVE' | string;

// ── Mock session state ──────────────────────────────────────────────────────

let mockSignalConnected = false;
let mockChannelState: LiveChannelState = 'OFFLINE';
let mockTargets: RtmpTarget[] = [
  {
    id: 'rtmp-mock-yt',
    provider: 'YOUTUBE',
    label: 'YouTube (mock)',
    rtmpUrl: 'rtmp://a.rtmp.youtube.com/live2',
    alwaysMirror: false,
    enabled: false,
    keyLast4: 'demo',
  },
];

export function mockSimulateSignal(connected = true) {
  mockSignalConnected = connected;
  if (connected && mockChannelState === 'OFFLINE') {
    mockChannelState = 'PREVIEW';
  }
}

export function getMockChannelState(): LiveChannelState {
  return mockChannelState;
}

const MOCK_SETTINGS: StreamSettings = {
  rtmp: {
    server: 'rtmp://ingest.mock.tahti.live/live',
    streamKey: 'demo-slug__mock-stream-key-do-not-share',
  },
  icecast: {
    server: 'https://icecast.mock.tahti.live',
    mount: '/demo-slug',
    password: 'mock-icecast-pass',
    hint: 'Audio-only DJ apps (Mixxx, Traktor, butt) — not OBS.',
  },
  hlsUrl: DEMO_MP3,
};

export async function fetchStreamSettings(): Promise<{
  data: StreamSettings | null;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: MOCK_SETTINGS,
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<StreamSettings>(
      '/api/me/stream-settings',
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: MOCK_SETTINGS, meta: failMeta(err) };
    }
    return { data: null, meta: apiErrorMeta(err) };
  }
}

export async function fetchSignalStatus(): Promise<{
  data: SignalStatus;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: {
        connected: mockSignalConnected,
        codec: mockSignalConnected ? 'aac' : null,
        bitrateKbps: mockSignalConnected ? 160 : null,
        listeners: mockSignalConnected ? 1 : null,
      },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<SignalStatus>(
      '/api/me/stream-settings/status',
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return {
      data: {
        connected: false,
        codec: null,
        bitrateKbps: null,
        listeners: null,
      },
      meta: apiErrorMeta(err),
    };
  }
}

export async function fetchBroadcastUsage(): Promise<{
  data: BroadcastUsage | null;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: {
        unlimited: false,
        secondsUsed: 12 * 60,
        secondsRemaining: 48 * 60,
        weeklyCapSeconds: 60 * 60,
        warningLevel: 'none',
        atCap: false,
        blocked: false,
      },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<BroadcastUsage>(
      '/api/me/broadcast-usage',
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return {
        data: {
          unlimited: false,
          secondsUsed: 12 * 60,
          secondsRemaining: 48 * 60,
          weeklyCapSeconds: 60 * 60,
          warningLevel: 'none',
          atCap: false,
          blocked: false,
        },
        meta: failMeta(err),
      };
    }
    return { data: null, meta: apiErrorMeta(err) };
  }
}

export async function postGoLive(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (forceMock()) {
    if (!mockSignalConnected && mockChannelState === 'OFFLINE') {
      mockSignalConnected = true;
      mockChannelState = 'PREVIEW';
    }
    mockChannelState = 'LIVE';
    return { ok: true };
  }
  try {
    await requestJson<{ ok: true }>('/api/me/channel/go-live', {
      method: 'POST',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Go live failed',
    };
  }
}

export async function postEndBroadcast(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (forceMock()) {
    mockChannelState = 'OFFLINE';
    mockSignalConnected = false;
    return { ok: true };
  }
  try {
    await requestJson<{ ok: true }>('/api/me/channel/end-broadcast', {
      method: 'POST',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'End broadcast failed',
    };
  }
}

export async function fetchRtmpTargets(): Promise<{
  data: RtmpTarget[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: [...mockTargets],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<RtmpTarget[]>('/api/me/rtmp-targets');
    return { data: Array.isArray(data) ? data : [], meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: [...mockTargets], meta: failMeta(err) };
    }
    return { data: [], meta: apiErrorMeta(err) };
  }
}

export async function createRtmpTarget(input: {
  provider: string;
  streamKey: string;
  label?: string;
  rtmpUrl?: string;
  enabled?: boolean;
}): Promise<{ ok: true; target: RtmpTarget } | { ok: false; error: string }> {
  if (forceMock()) {
    const target: RtmpTarget = {
      id: `rtmp-mock-${Date.now()}`,
      provider: input.provider,
      label: input.label ?? input.provider,
      rtmpUrl: input.rtmpUrl ?? 'rtmp://custom.example/live',
      alwaysMirror: false,
      enabled: input.enabled ?? true,
      keyLast4: input.streamKey.slice(-4),
    };
    mockTargets = [...mockTargets, target];
    return { ok: true, target };
  }
  try {
    const { data } = await requestJson<RtmpTarget>('/api/me/rtmp-targets', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return { ok: true, target: data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Create failed',
    };
  }
}

export async function patchRtmpTarget(
  id: string,
  patch: { enabled?: boolean; alwaysMirror?: boolean; label?: string },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    mockTargets = mockTargets.map((t) =>
      t.id === id ? { ...t, ...patch } : t,
    );
    return { ok: true };
  }
  try {
    await requestJson(`/api/me/rtmp-targets/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Update failed',
    };
  }
}

export async function deleteRtmpTarget(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    mockTargets = mockTargets.filter((t) => t.id !== id);
    return { ok: true };
  }
  try {
    await requestJson(`/api/me/rtmp-targets/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Delete failed',
    };
  }
}

/** Build a TahtiPlayable for the artist's own live channel after go-live. */
export function liveChannelPlayable(
  slug: string,
  displayName: string,
  hlsUrl: string,
): TahtiPlayable {
  const isHls = hlsUrl.includes('.m3u8');
  return {
    id: `live:${slug}`,
    kind: 'live',
    title: `${displayName} (Live)`,
    artist: displayName,
    streamUrl: hlsUrl || DEMO_MP3,
    protocol: isHls ? 'hls' : 'https',
    channelSlug: slug,
    sourceProvider: 'tahti',
  };
}

export function formatUsageMinutes(usage: BroadcastUsage): string {
  if (usage.unlimited) {
    return 'Unlimited this week';
  }
  const used = Math.floor(usage.secondsUsed / 60);
  const rem =
    usage.secondsRemaining == null
      ? null
      : Math.floor(usage.secondsRemaining / 60);
  const cap = Math.floor(usage.weeklyCapSeconds / 60);
  if (rem == null) {
    return `${used} / ${cap} min used`;
  }
  return `${used} min used, ${rem} min left (cap ${cap})`;
}
