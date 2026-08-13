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

export type ArtistEvent = {
  id: string;
  title: string;
  place: string;
  location: string;
  eventUrl: string | null;
  startAt: string;
};

const mockEvents: ArtistEvent[] = [
  {
    id: 'evt-mock-1',
    title: 'Album release show',
    place: 'Northern Lights Hall',
    location: 'Helsinki, Finland',
    eventUrl: null,
    startAt: '2026-09-05T18:00:00.000Z',
  },
];

export async function fetchMyEvents(): Promise<{
  data: ArtistEvent[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: [...mockEvents],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<ArtistEvent[]>('/api/me/events');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export type CreateArtistEventInput = {
  title: string;
  place: string;
  location: string;
  eventUrl?: string;
  startAt: string;
};

export async function createEvent(
  input: CreateArtistEventInput,
): Promise<{ ok: true; data: ArtistEvent } | { ok: false; error: string }> {
  if (forceMock()) {
    const row: ArtistEvent = {
      id: `evt-mock-${Date.now()}`,
      title: input.title,
      place: input.place,
      location: input.location,
      eventUrl: input.eventUrl ?? null,
      startAt: input.startAt,
    };
    mockEvents.push(row);
    mockEvents.sort((a, b) => a.startAt.localeCompare(b.startAt));
    return { ok: true, data: row };
  }
  try {
    const { data } = await requestJson<ArtistEvent>('/api/me/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not add event',
    };
  }
}

export async function deleteEvent(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    const idx = mockEvents.findIndex((e) => e.id === id);
    if (idx >= 0) {
      mockEvents.splice(idx, 1);
    }
    return { ok: true };
  }
  try {
    await requestJson(`/api/me/events/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not delete event',
    };
  }
}
