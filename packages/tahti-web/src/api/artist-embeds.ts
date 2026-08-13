import type { FetchMeta } from './client';

const forceMock = () => import.meta.env.VITE_FORCE_MOCK === '1';

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

function failMeta(err: unknown): FetchMeta {
  return {
    source: 'mock',
    reason: err instanceof Error ? err.message : 'fetch failed',
  };
}

export const MAX_ARTIST_EMBEDS = 20;

export type ArtistEmbed = {
  id: string;
  provider: 'soundcloud';
  url: string;
  title: string | null;
  authorName: string | null;
  thumbnailUrl: string | null;
  createdAt: string;
};

const mockEmbeds: ArtistEmbed[] = [
  {
    id: 'embed-mock-1',
    provider: 'soundcloud',
    url: 'https://soundcloud.com/northern-lights/aurora-drift',
    title: 'Aurora Drift',
    authorName: 'Northern Lights',
    thumbnailUrl: null,
    createdAt: '2026-07-10T12:00:00.000Z',
  },
];

export async function fetchMyEmbeds(): Promise<{
  data: ArtistEmbed[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: [...mockEmbeds],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<ArtistEmbed[]>('/api/me/embeds');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

const SOUNDCLOUD_URL_RE = /^https:\/\/(www\.)?soundcloud\.com\//i;

export async function addEmbed(
  url: string,
): Promise<{ ok: true; data: ArtistEmbed } | { ok: false; error: string }> {
  if (forceMock()) {
    if (!SOUNDCLOUD_URL_RE.test(url)) {
      return {
        ok: false,
        error: 'Only soundcloud.com track URLs are supported right now',
      };
    }
    if (mockEmbeds.length >= MAX_ARTIST_EMBEDS) {
      return { ok: false, error: `Maximum ${MAX_ARTIST_EMBEDS} embeds` };
    }
    const row: ArtistEmbed = {
      id: `embed-mock-${Date.now()}`,
      provider: 'soundcloud',
      url,
      title: 'Mock SoundCloud track',
      authorName: 'Mock Artist',
      thumbnailUrl: null,
      createdAt: new Date().toISOString(),
    };
    mockEmbeds.unshift(row);
    return { ok: true, data: row };
  }
  try {
    const { data } = await requestJson<ArtistEmbed>('/api/me/embeds', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not add embed',
    };
  }
}

export async function removeEmbed(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    const idx = mockEmbeds.findIndex((e) => e.id === id);
    if (idx >= 0) {
      mockEmbeds.splice(idx, 1);
    }
    return { ok: true };
  }
  try {
    await requestJson(`/api/me/embeds/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not remove embed',
    };
  }
}
