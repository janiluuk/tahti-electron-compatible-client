import type { FetchMeta } from './client';
import { allowMockFallback, apiErrorMeta, failMeta, isForceMock } from './mode';

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

export const SHOW_SLOT_MAX_HOURS = 2;

export type ShowType = 'LIVE_SET' | 'TALK';

/** Parent show series — Nuclear studio model (local + mock; slots use live API). */
export type StudioShowSeries = {
  id: string;
  title: string;
  description: string;
  coverUrl: string | null;
  showType: ShowType;
  /** Next sequential episode number to assign (1-based). */
  nextEpisodeNumber: number;
  /** Preferred slot length in hours (1–2). */
  intervalHours: 1 | 2;
  /** Optional recurring note / weekday hint for booking. */
  scheduleNote: string | null;
  createdAt: string;
};

export type EpisodeSource = 'upload' | 'broadcast';
export type EpisodeStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'LIVE';

export type StudioEpisode = {
  id: string;
  showId: string;
  /** Sequential episode # on the parent show (not a track/catalog number). */
  episodeNumber: number;
  title: string;
  description: string;
  coverUrl: string | null;
  status: EpisodeStatus;
  source: EpisodeSource;
  archiveItemId: string | null;
  slotStartAt: string | null;
  slotEndAt: string | null;
  bookingId: string | null;
  createdAt: string;
};

export type StudioShowBooking = {
  id: string;
  startAt: string;
  endAt: string;
  note: string | null;
  showType: ShowType;
  channelSlug: string;
  displayName: string;
  isMine: boolean;
};

const SERIES_KEY = 'tahti-studio-show-series-v1';
const EPISODES_KEY = 'tahti-studio-episodes-v1';

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota
  }
}

function seedSeries(): StudioShowSeries[] {
  const existing = readJson<StudioShowSeries[]>(SERIES_KEY, []);
  if (existing.length > 0) {
    return existing;
  }
  const seeded: StudioShowSeries[] = [
    {
      id: 'show-series-demo',
      title: 'Friday Frequency',
      description: 'Weekly deep electronic set — live on Tahti Radio.',
      coverUrl: null,
      showType: 'LIVE_SET',
      nextEpisodeNumber: 4,
      intervalHours: 2,
      scheduleNote: 'Fridays',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'show-series-cartography',
      title: 'Route 550 Live',
      description:
        'Weekly late-night dub session recorded riding the actual bus route — mixed live from a portable rig, broadcast the same night.',
      coverUrl: null,
      showType: 'LIVE_SET',
      nextEpisodeNumber: 3,
      intervalHours: 1,
      scheduleNote: 'Thursdays, after midnight',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'show-series-cypher',
      title: 'Kaiku Cypher Sessions',
      description:
        'Rotating slot for the six Kaiku Collective producers — one new beat and a closing freestyle every week.',
      coverUrl: null,
      showType: 'LIVE_SET',
      nextEpisodeNumber: 2,
      intervalHours: 1,
      scheduleNote: 'Sundays',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'show-series-studio-talk',
      title: 'Boathouse Talk',
      description:
        'Monthly interview show — a working artist joins for an unscripted conversation about process, gear, and the Finnish scene.',
      coverUrl: null,
      showType: 'TALK',
      nextEpisodeNumber: 2,
      intervalHours: 1,
      scheduleNote: 'First Tuesday of the month',
      createdAt: new Date().toISOString(),
    },
  ];
  writeJson(SERIES_KEY, seeded);
  return seeded;
}

function seedEpisodes(): StudioEpisode[] {
  const existing = readJson<StudioEpisode[]>(EPISODES_KEY, []);
  if (existing.length > 0) {
    return existing;
  }
  const seeded: StudioEpisode[] = [
    {
      id: 'ep-demo-1',
      showId: 'show-series-demo',
      episodeNumber: 1,
      title: 'Friday Frequency — Episode 1',
      description: 'Weekly deep electronic set — live on Tahti Radio.',
      coverUrl: null,
      status: 'APPROVED',
      source: 'upload',
      archiveItemId: 'arch-mock-1',
      slotStartAt: null,
      slotEndAt: null,
      bookingId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ep-demo-2',
      showId: 'show-series-demo',
      episodeNumber: 2,
      title: 'Friday Frequency — Episode 2',
      description: 'Weekly deep electronic set — live on Tahti Radio.',
      coverUrl: null,
      status: 'PENDING_APPROVAL',
      source: 'broadcast',
      archiveItemId: 'arch-mock-1',
      slotStartAt: null,
      slotEndAt: null,
      bookingId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ep-demo-3',
      showId: 'show-series-demo',
      episodeNumber: 3,
      title: 'Friday Frequency — Episode 3',
      description: 'Weekly deep electronic set — live on Tahti Radio.',
      coverUrl: null,
      status: 'APPROVED',
      source: 'upload',
      archiveItemId: 'arch-mock-2',
      slotStartAt: null,
      slotEndAt: null,
      bookingId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ep-cartography-1',
      showId: 'show-series-cartography',
      episodeNumber: 1,
      title: 'Route 550 Live — Episode 1',
      description:
        'First edition — Kamppi to Tapiola, recorded live on a Thursday night run.',
      coverUrl: null,
      status: 'APPROVED',
      source: 'broadcast',
      archiveItemId: 'arch-mock-3',
      slotStartAt: null,
      slotEndAt: null,
      bookingId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ep-cartography-2',
      showId: 'show-series-cartography',
      episodeNumber: 2,
      title: 'Route 550 Live — Episode 2',
      description: 'Ring Rail loop special — full 68-minute circuit, unedited.',
      coverUrl: null,
      status: 'PENDING_APPROVAL',
      source: 'broadcast',
      archiveItemId: null,
      slotStartAt: null,
      slotEndAt: null,
      bookingId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ep-cypher-1',
      showId: 'show-series-cypher',
      episodeNumber: 1,
      title: 'Kaiku Cypher Sessions — Episode 1',
      description:
        'Season opener — all six producers, closing group freestyle.',
      coverUrl: null,
      status: 'APPROVED',
      source: 'upload',
      archiveItemId: 'arch-mock-4',
      slotStartAt: null,
      slotEndAt: null,
      bookingId: null,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'ep-studio-talk-1',
      showId: 'show-series-studio-talk',
      episodeNumber: 1,
      title: 'Boathouse Talk — Episode 1: Saimaa Sessions',
      description:
        'First guest: the Saimaa Sessions trio on recording live over lake thaws and never repeating a set.',
      coverUrl: null,
      status: 'APPROVED',
      source: 'upload',
      archiveItemId: 'arch-mock-5',
      slotStartAt: null,
      slotEndAt: null,
      bookingId: null,
      createdAt: new Date().toISOString(),
    },
  ];
  writeJson(EPISODES_KEY, seeded);
  return seeded;
}

let mockBookings: StudioShowBooking[] = [
  {
    id: 'booking-mock-1',
    startAt: new Date(Date.now() + 26 * 3600_000).toISOString(),
    endAt: new Date(Date.now() + 28 * 3600_000).toISOString(),
    note: 'Friday Frequency',
    showType: 'LIVE_SET',
    channelSlug: 'demo',
    displayName: 'Demo Artist',
    isMine: true,
  },
  {
    id: 'booking-mock-2',
    startAt: new Date(Date.now() + 4 * 3600_000).toISOString(),
    endAt: new Date(Date.now() + 5 * 3600_000).toISOString(),
    note: 'Route 550 Live',
    showType: 'LIVE_SET',
    channelSlug: 'midnight-cartography',
    displayName: 'Midnight Cartography',
    isMine: false,
  },
  {
    id: 'booking-mock-3',
    startAt: new Date(Date.now() + 74 * 3600_000).toISOString(),
    endAt: new Date(Date.now() + 75 * 3600_000).toISOString(),
    note: 'Kaiku Cypher Sessions',
    showType: 'LIVE_SET',
    channelSlug: 'kaiku-collective',
    displayName: 'Kaiku Collective',
    isMine: false,
  },
  {
    id: 'booking-mock-4',
    startAt: new Date(Date.now() + 122 * 3600_000).toISOString(),
    endAt: new Date(Date.now() + 123 * 3600_000).toISOString(),
    note: 'Boathouse Talk',
    showType: 'TALK',
    channelSlug: 'saimaa-sessions',
    displayName: 'Saimaa Sessions',
    isMine: false,
  },
];

export async function fetchShowSeries(): Promise<{
  data: StudioShowSeries[];
  meta: FetchMeta;
}> {
  return {
    data: seedSeries(),
    meta: {
      source: 'mock',
      reason: 'Show series stored locally until a dedicated API exists',
    },
  };
}

export async function createShowSeries(input: {
  title: string;
  description?: string;
  coverUrl?: string | null;
  showType?: ShowType;
  intervalHours?: 1 | 2;
  scheduleNote?: string | null;
}): Promise<
  { ok: true; data: StudioShowSeries } | { ok: false; error: string }
> {
  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: 'Title is required' };
  }
  const list = seedSeries();
  const series: StudioShowSeries = {
    id: `show-${Date.now()}`,
    title,
    description: input.description?.trim() || '',
    coverUrl: input.coverUrl ?? null,
    showType: input.showType ?? 'LIVE_SET',
    nextEpisodeNumber: 1,
    intervalHours: input.intervalHours ?? 1,
    scheduleNote: input.scheduleNote?.trim() || null,
    createdAt: new Date().toISOString(),
  };
  writeJson(SERIES_KEY, [series, ...list]);
  return { ok: true, data: series };
}

export async function patchShowSeries(
  id: string,
  patch: Partial<
    Pick<
      StudioShowSeries,
      | 'title'
      | 'description'
      | 'coverUrl'
      | 'showType'
      | 'intervalHours'
      | 'scheduleNote'
      | 'nextEpisodeNumber'
    >
  >,
): Promise<
  { ok: true; data: StudioShowSeries } | { ok: false; error: string }
> {
  const list = seedSeries();
  const idx = list.findIndex((s) => s.id === id);
  if (idx < 0) {
    return { ok: false, error: 'Show not found' };
  }
  list[idx] = { ...list[idx]!, ...patch };
  writeJson(SERIES_KEY, list);
  return { ok: true, data: list[idx]! };
}

export async function fetchShowSeriesById(
  id: string,
): Promise<{ data: StudioShowSeries | null; meta: FetchMeta }> {
  const { data, meta } = await fetchShowSeries();
  return { data: data.find((s) => s.id === id) ?? null, meta };
}

export async function fetchEpisodesForShow(
  showId: string,
): Promise<{ data: StudioEpisode[]; meta: FetchMeta }> {
  const all = seedEpisodes();
  return {
    data: all
      .filter((e) => e.showId === showId)
      .sort((a, b) => b.episodeNumber - a.episodeNumber),
    meta: { source: 'mock', reason: 'Episodes stored locally' },
  };
}

export async function fetchEpisode(
  id: string,
): Promise<{ data: StudioEpisode | null; meta: FetchMeta }> {
  const all = seedEpisodes();
  return {
    data: all.find((e) => e.id === id) ?? null,
    meta: { source: 'mock' },
  };
}

/** Create episode with parent defaults — sequential episode number is assigned here. */
export async function createEpisode(input: {
  showId: string;
  source: EpisodeSource;
  archiveItemId?: string | null;
  slotStartAt?: string | null;
  slotEndAt?: string | null;
  bookingId?: string | null;
  /** Override title; defaults to "{show} — Episode {n}". */
  title?: string;
}): Promise<{ ok: true; data: StudioEpisode } | { ok: false; error: string }> {
  const seriesList = seedSeries();
  const show = seriesList.find((s) => s.id === input.showId);
  if (!show) {
    return { ok: false, error: 'Show not found' };
  }

  const episodeNumber = show.nextEpisodeNumber;
  const episode: StudioEpisode = {
    id: `ep-${Date.now()}`,
    showId: show.id,
    episodeNumber,
    title: input.title?.trim() || `${show.title} — Episode ${episodeNumber}`,
    description: show.description,
    coverUrl: show.coverUrl,
    status: input.source === 'broadcast' ? 'PENDING_APPROVAL' : 'DRAFT',
    source: input.source,
    archiveItemId: input.archiveItemId ?? null,
    slotStartAt: input.slotStartAt ?? null,
    slotEndAt: input.slotEndAt ?? null,
    bookingId: input.bookingId ?? null,
    createdAt: new Date().toISOString(),
  };

  const episodes = seedEpisodes();
  writeJson(EPISODES_KEY, [episode, ...episodes]);
  show.nextEpisodeNumber = episodeNumber + 1;
  writeJson(SERIES_KEY, seriesList);

  return { ok: true, data: episode };
}

export async function patchEpisode(
  id: string,
  patch: Partial<
    Pick<
      StudioEpisode,
      | 'title'
      | 'description'
      | 'coverUrl'
      | 'status'
      | 'archiveItemId'
      | 'slotStartAt'
      | 'slotEndAt'
      | 'bookingId'
    >
  >,
): Promise<{ ok: true; data: StudioEpisode } | { ok: false; error: string }> {
  const list = seedEpisodes();
  const idx = list.findIndex((e) => e.id === id);
  if (idx < 0) {
    return { ok: false, error: 'Episode not found' };
  }
  list[idx] = { ...list[idx]!, ...patch };
  writeJson(EPISODES_KEY, list);
  return { ok: true, data: list[idx]! };
}

/** Approve a recorded episode so it can go live / be scheduled. */
export async function approveEpisode(
  id: string,
): Promise<{ ok: true; data: StudioEpisode } | { ok: false; error: string }> {
  const ep = (await fetchEpisode(id)).data;
  if (!ep) {
    return { ok: false, error: 'Episode not found' };
  }
  if (
    ep.source === 'broadcast' &&
    ep.status === 'PENDING_APPROVAL' &&
    !ep.archiveItemId
  ) {
    return { ok: false, error: 'Attach audio before approving' };
  }
  return patchEpisode(id, { status: 'APPROVED' });
}

export async function fetchShowBookings(
  from: string,
  to: string,
): Promise<{ data: StudioShowBooking[]; meta: FetchMeta }> {
  if (forceMock()) {
    return {
      data: mockBookings.filter((b) => {
        const s = new Date(b.startAt).getTime();
        const e = new Date(b.endAt).getTime();
        return s < new Date(to).getTime() && e > new Date(from).getTime();
      }),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<StudioShowBooking[]>(
      `/api/me/radio-slot-bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: mockBookings, meta: failMeta(err) };
    }
    return { data: [], meta: apiErrorMeta(err) };
  }
}

export async function createShowBooking(input: {
  startAt: string;
  endAt: string;
  note?: string;
  showType?: ShowType;
}): Promise<
  { ok: true; data: StudioShowBooking } | { ok: false; error: string }
> {
  if (forceMock()) {
    const booking: StudioShowBooking = {
      id: `booking-${Date.now()}`,
      startAt: input.startAt,
      endAt: input.endAt,
      note: input.note?.trim() || null,
      showType: input.showType ?? 'LIVE_SET',
      channelSlug: 'demo',
      displayName: 'Demo Artist',
      isMine: true,
    };
    mockBookings = [...mockBookings, booking];
    return { ok: true, data: booking };
  }
  try {
    const { data } = await requestJson<StudioShowBooking>(
      '/api/me/radio-slot-bookings',
      {
        method: 'POST',
        body: JSON.stringify({
          startAt: input.startAt,
          endAt: input.endAt,
          note: input.note,
          showType: input.showType ?? 'LIVE_SET',
        }),
      },
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Booking failed',
    };
  }
}

export async function cancelShowBooking(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    mockBookings = mockBookings.filter((b) => b.id !== id);
    return { ok: true };
  }
  try {
    await requestJson(`/api/me/radio-slot-bookings/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Cancel failed',
    };
  }
}
