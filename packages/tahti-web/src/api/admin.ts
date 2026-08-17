import type { FetchMeta } from './client';

const forceMock = () => import.meta.env.VITE_FORCE_MOCK === '1';

const apiBase = () => {
  if (import.meta.env.VITE_TAHTI_API_URL?.startsWith('http')) {
    return import.meta.env.VITE_TAHTI_API_URL.replace(/\/$/, '');
  }
  return '/tahti-api';
};

function failMeta(err: unknown): FetchMeta {
  return {
    source: 'mock',
    reason: err instanceof Error ? err.message : 'fetch failed',
  };
}

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    throw new Error(`${path} → ${res.status}`);
  }
  return (await res.json()) as T;
}

async function sendJson<T>(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    method,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    let detail = `${path} → ${res.status}`;
    try {
      const errBody = (await res.json()) as { error?: string };
      if (errBody.error) {
        detail = errBody.error;
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return (await res.json()) as T;
}

async function mutate(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  body?: unknown,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await sendJson(path, method, body);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export type AdminActionRow = {
  id: string;
  title: string;
  meta: string;
  actionLabel: string;
  actionTone: 'primary' | 'amber';
  href: string;
};

export type AdminSystemHealth = {
  icecast: 'up' | 'down';
  minio: 'up' | 'down';
  postgresBackupAgeHours: number | null;
  failedFanSubPayouts: number;
};

export type AdminQueueRow = { name: string; waiting: number; failed: number };

export type AdminCronRow = {
  jobName: string;
  description: string;
  lastRun: { outcome: string | null; startedAt: string } | null;
};

export type AdminAuditRow = {
  id: string;
  action: string;
  actorId: string;
  createdAt: string;
};

export type AdminLiveStream = {
  slug: string;
  artistName: string;
  elapsedSec: number;
};

export type AdminDashboard = {
  kpis: {
    activeMembers: number;
    liveNow: number;
    betaQueue: number;
    openTickets: number;
  };
  actionRows: AdminActionRow[];
  health: AdminSystemHealth;
  financeYtdCents: { surplus: number; revenue: number; costs: number };
  liveStreams: AdminLiveStream[];
  queues: AdminQueueRow[];
  cronJobs: AdminCronRow[];
  audit: AdminAuditRow[];
};

function mockDashboard(): AdminDashboard {
  return {
    kpis: { activeMembers: 214, liveNow: 3, betaQueue: 5, openTickets: 2 },
    actionRows: [
      {
        id: 'beta-1',
        title: 'Kaiku Collective · dj',
        meta: 'Beta application · applied 12 Aug',
        actionLabel: 'Approve',
        actionTone: 'primary',
        href: '/admin/beta',
      },
      {
        id: 'venue-1',
        title: 'Boathouse Studio, Savonlinna',
        meta: 'Venue verification · submitted 10 Aug',
        actionLabel: 'Verify',
        actionTone: 'primary',
        href: '/admin/venues',
      },
      {
        id: 'payout-1',
        title: '@midnight-cartography — €84.20',
        meta: 'Fan-sub payout failed',
        actionLabel: 'Retry',
        actionTone: 'amber',
        href: '/admin/financial',
      },
    ],
    health: {
      icecast: 'up',
      minio: 'up',
      postgresBackupAgeHours: 6,
      failedFanSubPayouts: 1,
    },
    financeYtdCents: { surplus: 482000, revenue: 1240000, costs: 758000 },
    liveStreams: [
      {
        slug: 'northern-lights',
        artistName: 'Northern Lights',
        elapsedSec: 5400,
      },
      { slug: 'dj-moonlight', artistName: 'DJ Moonlight', elapsedSec: 1860 },
    ],
    queues: [
      { name: 'transcode', waiting: 2, failed: 0 },
      { name: 'fansub-payouts', waiting: 0, failed: 1 },
      { name: 'email', waiting: 4, failed: 0 },
    ],
    cronJobs: [
      {
        jobName: 'nightly-backup',
        description: 'Postgres dump to offsite storage',
        lastRun: { outcome: 'SUCCESS', startedAt: '2026-08-17T03:00:00.000Z' },
      },
      {
        jobName: 'fansub-payout-sweep',
        description: 'Retry failed Stripe transfers',
        lastRun: { outcome: 'ERROR', startedAt: '2026-08-17T02:00:00.000Z' },
      },
    ],
    audit: [
      {
        id: 'a1',
        action: 'venue.verify',
        actorId: 'board-jani',
        createdAt: '2026-08-16T18:20:00.000Z',
      },
      {
        id: 'a2',
        action: 'beta.approve',
        actorId: 'board-jani',
        createdAt: '2026-08-16T14:05:00.000Z',
      },
    ],
  };
}

/** Aggregated admin dashboard — prod fans this out to ~12 separate
 * `/api/admin/*` calls; batched here into one Promise.all for a first port. */
export async function fetchAdminDashboard(): Promise<{
  data: AdminDashboard;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockDashboard(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const [
      members,
      streams,
      betaRes,
      support,
      health,
      ytd,
      queues,
      cron,
      audit,
    ] = await Promise.all([
      getJson<{ total: number }>('/api/admin/stats/members'),
      getJson<{ count: number; streams: AdminLiveStream[] }>(
        '/api/admin/streams',
      ),
      getJson<{ applications: unknown[] }>(
        '/api/admin/beta/applications?status=PENDING&limit=100',
      ),
      getJson<{ total: number }>(
        '/api/admin/support/tickets?status=OPEN&limit=1',
      ),
      getJson<AdminSystemHealth>('/api/admin/stats/system-health'),
      getJson<{ runningSurplus: string; byCategory: Record<string, string> }>(
        '/api/v1/transparency/ytd',
      ),
      getJson<AdminQueueRow[]>('/api/admin/stats/queues'),
      getJson<AdminCronRow[]>('/api/admin/stats/cron-runs'),
      getJson<AdminAuditRow[]>('/api/admin/audit/recent'),
    ]);
    const revenue = Object.entries(ytd.byCategory)
      .filter(([k]) => k.startsWith('REVENUE_'))
      .reduce((s, [, v]) => s + parseInt(v, 10), 0);
    const costs = Object.entries(ytd.byCategory)
      .filter(([k]) => k.startsWith('COST_'))
      .reduce((s, [, v]) => s + parseInt(v, 10), 0);
    return {
      data: {
        kpis: {
          activeMembers: members.total,
          liveNow: streams.count,
          betaQueue: betaRes.applications.length,
          openTickets: support.total,
        },
        actionRows: [],
        health,
        financeYtdCents: {
          surplus: parseInt(ytd.runningSurplus, 10),
          revenue,
          costs,
        },
        liveStreams: streams.streams,
        queues: queues.filter((q) => q.name !== '_queue_total'),
        cronJobs: cron,
        audit,
      },
      meta: { source: 'api' },
    };
  } catch (err) {
    return { data: mockDashboard(), meta: failMeta(err) };
  }
}

// ── Beta applications ──────────────────────────────────────────────────────

export type AdminBetaStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AdminBetaApplication = {
  id: string;
  name: string;
  email: string;
  artistType: string;
  links: string | null;
  message: string | null;
  status: AdminBetaStatus;
  userId: string | null;
  username: string | null;
  hasPassword: boolean;
  setupUrl: string | null;
  createdAt: string;
};

function mockBetaApplications(): AdminBetaApplication[] {
  return [
    {
      id: 'beta-1',
      name: 'Kaiku Collective',
      email: 'hello@kaikucollective.fi',
      artistType: 'dj',
      links: 'https://soundcloud.com/kaikucollective',
      message:
        'Six of us trading a weekly slot, closing with a freestyle line.',
      status: 'PENDING',
      userId: null,
      username: null,
      hasPassword: false,
      setupUrl: null,
      createdAt: '2026-08-12T10:00:00.000Z',
    },
    {
      id: 'beta-2',
      name: 'Valo Radio',
      email: 'valo@tahti.example',
      artistType: 'radio',
      links: null,
      message: 'Monthly all-night synth streams out of Tampere.',
      status: 'APPROVED',
      userId: 'mock-valo',
      username: 'valo-radio',
      hasPassword: false,
      setupUrl: 'https://beta.tahti.live/setup-password?token=mock-valo',
      createdAt: '2026-08-08T09:00:00.000Z',
    },
    {
      id: 'beta-3',
      name: 'Static Bloom',
      email: 'static@example.com',
      artistType: 'band',
      links: null,
      message: null,
      status: 'REJECTED',
      userId: null,
      username: null,
      hasPassword: false,
      setupUrl: null,
      createdAt: '2026-08-01T09:00:00.000Z',
    },
  ];
}

export async function fetchAdminBetaApplications(
  status?: AdminBetaStatus,
): Promise<{ data: AdminBetaApplication[]; meta: FetchMeta }> {
  if (forceMock()) {
    const all = mockBetaApplications();
    return {
      data: status ? all.filter((a) => a.status === status) : all,
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const qs = new URLSearchParams({ limit: '100' });
    if (status) {
      qs.set('status', status);
    }
    const data = await getJson<{ applications: AdminBetaApplication[] }>(
      `/api/admin/beta/applications?${qs.toString()}`,
    );
    return { data: data.applications, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export async function approveBetaApplication(
  id: string,
  input: { username: string; displayName: string },
): Promise<
  { ok: true; setupUrl: string | null } | { ok: false; error: string }
> {
  if (forceMock()) {
    return {
      ok: true,
      setupUrl: `https://beta.tahti.live/setup-password?token=mock-${id}`,
    };
  }
  try {
    const res = await sendJson<{ setupUrl: string | null }>(
      `/api/admin/beta/applications/${encodeURIComponent(id)}/approve`,
      'POST',
      input,
    );
    return { ok: true, setupUrl: res.setupUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}

export async function rejectBetaApplication(id: string) {
  if (forceMock()) {
    return { ok: true } as const;
  }
  return mutate(
    `/api/admin/beta/applications/${encodeURIComponent(id)}/reject`,
    'POST',
  );
}

export async function resendBetaSetupLink(
  id: string,
): Promise<
  { ok: true; setupUrl: string | null } | { ok: false; error: string }
> {
  if (forceMock()) {
    return {
      ok: true,
      setupUrl: `https://beta.tahti.live/setup-password?token=resent-${id}`,
    };
  }
  try {
    const res = await sendJson<{ setupUrl: string | null }>(
      `/api/admin/beta/applications/${encodeURIComponent(id)}/resend-setup`,
      'POST',
    );
    return { ok: true, setupUrl: res.setupUrl };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}

// ── Users ───────────────────────────────────────────────────────────────────

export type AdminUserRow = {
  id: string;
  memberNumber: number | null;
  displayName: string;
  email: string;
  username: string;
  tier: string;
  isMember: boolean;
  isBoard: boolean;
  suspendedAt: string | null;
  channelState: string | null;
  engagementUnitsYtd: number;
};

function mockUsers(): AdminUserRow[] {
  return [
    {
      id: 'u1',
      memberNumber: 12,
      displayName: 'DJ Moonlight',
      email: 'moonlight@example.com',
      username: 'dj-moonlight',
      tier: 'ARTIST',
      isMember: true,
      isBoard: false,
      suspendedAt: null,
      channelState: 'LIVE',
      engagementUnitsYtd: 842,
    },
    {
      id: 'u2',
      memberNumber: 4,
      displayName: 'Northern Lights',
      email: 'aurora@example.com',
      username: 'northern-lights',
      tier: 'ARTIST',
      isMember: true,
      isBoard: true,
      suspendedAt: null,
      channelState: 'OFFLINE',
      engagementUnitsYtd: 1290,
    },
    {
      id: 'u3',
      memberNumber: null,
      displayName: 'Listener One',
      email: 'listener1@example.com',
      username: 'listener-one',
      tier: 'FREE',
      isMember: false,
      isBoard: false,
      suspendedAt: null,
      channelState: null,
      engagementUnitsYtd: 12,
    },
    {
      id: 'u4',
      memberNumber: 7,
      displayName: 'Midnight Cartography',
      email: 'midnight@example.com',
      username: 'midnight-cartography',
      tier: 'ARTIST',
      isMember: true,
      isBoard: false,
      suspendedAt: '2026-07-01T00:00:00.000Z',
      channelState: 'OFFLINE',
      engagementUnitsYtd: 340,
    },
  ];
}

export async function fetchAdminUsers(filters: {
  q?: string;
  tier?: string;
  isMember?: string;
}): Promise<{ data: AdminUserRow[]; total: number; meta: FetchMeta }> {
  if (forceMock()) {
    let rows = mockUsers();
    if (filters.q) {
      const q = filters.q.toLowerCase();
      rows = rows.filter(
        (u) =>
          u.displayName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q),
      );
    }
    if (filters.tier) {
      rows = rows.filter((u) => u.tier === filters.tier);
    }
    if (filters.isMember) {
      rows = rows.filter((u) => String(u.isMember) === filters.isMember);
    }
    return {
      data: rows,
      total: rows.length,
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const qs = new URLSearchParams();
    if (filters.q) {
      qs.set('search', filters.q);
    }
    if (filters.tier) {
      qs.set('tier', filters.tier);
    }
    if (filters.isMember) {
      qs.set('isMember', filters.isMember);
    }
    const data = await getJson<{ total: number; users: AdminUserRow[] }>(
      `/api/admin/users${qs.toString() ? `?${qs.toString()}` : ''}`,
    );
    return { data: data.users, total: data.total, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], total: 0, meta: failMeta(err) };
  }
}

// ── Radio ops ───────────────────────────────────────────────────────────────

export type AdminRadioChannel = {
  channelId: string;
  slug: string;
  artistName: string;
  lastFeaturedAt: string | null;
};

export type AdminRadioHistoryItem = {
  channelId: string;
  slug: string;
  artistName: string;
  featuredAt: string;
};

export type AdminRadioOptedOut = {
  channelId: string;
  slug: string;
  artistName: string;
  isLive: boolean;
};

export type AdminRadioData = {
  nowPlaying: { live: boolean; slug: string | null; artistName: string | null };
  eligible: AdminRadioChannel[];
  history: AdminRadioHistoryItem[];
  optedOut: AdminRadioOptedOut[];
};

function mockRadioAdmin(): AdminRadioData {
  return {
    nowPlaying: {
      live: true,
      slug: 'northern-lights',
      artistName: 'Northern Lights',
    },
    eligible: [
      {
        channelId: 'c1',
        slug: 'northern-lights',
        artistName: 'Northern Lights',
        lastFeaturedAt: '2026-08-16T20:00:00.000Z',
      },
      {
        channelId: 'c2',
        slug: 'dj-moonlight',
        artistName: 'DJ Moonlight',
        lastFeaturedAt: null,
      },
    ],
    history: [
      {
        channelId: 'c3',
        slug: 'kaiku-collective',
        artistName: 'Kaiku Collective',
        featuredAt: '2026-08-16T14:00:00.000Z',
      },
      {
        channelId: 'c1',
        slug: 'northern-lights',
        artistName: 'Northern Lights',
        featuredAt: '2026-08-15T21:00:00.000Z',
      },
    ],
    optedOut: [
      {
        channelId: 'c4',
        slug: 'tundra-static',
        artistName: 'Tundra Static',
        isLive: false,
      },
    ],
  };
}

export async function fetchAdminRadio(): Promise<{
  data: AdminRadioData;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockRadioAdmin(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{
      nowPlaying: {
        live: boolean;
        channel: { slug: string; artistName: string } | null;
      };
      eligible: AdminRadioChannel[];
      history: AdminRadioHistoryItem[];
      optedOut: AdminRadioOptedOut[];
    }>('/api/admin/radio');
    return {
      data: {
        nowPlaying: {
          live: data.nowPlaying.live,
          slug: data.nowPlaying.channel?.slug ?? null,
          artistName: data.nowPlaying.channel?.artistName ?? null,
        },
        eligible: data.eligible,
        history: data.history,
        optedOut: data.optedOut,
      },
      meta: { source: 'api' },
    };
  } catch (err) {
    return { data: mockRadioAdmin(), meta: failMeta(err) };
  }
}

export function radioMoveToFront(channelId: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/radio/${encodeURIComponent(channelId)}/reset-rotation`,
    'POST',
  );
}

export function radioOptOut(channelId: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/radio/${encodeURIComponent(channelId)}/opt-out`,
    'POST',
  );
}

export function radioRemoveOptOut(channelId: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/radio/${encodeURIComponent(channelId)}/opt-out`,
    'DELETE',
  );
}

// ── Radio submissions ───────────────────────────────────────────────────────

export type AdminRadioSubmissionStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type AdminRadioSubmission = {
  id: string;
  status: AdminRadioSubmissionStatus;
  rejectionNote: string | null;
  createdAt: string;
  submitter: { username: string; displayName: string } | null;
  archiveItem: {
    id: string;
    title: string;
    artistName: string | null;
    durationSec: number | null;
    bannerUrl: string | null;
    audioUrl: string | null;
  };
};

function mockRadioSubmissions(): AdminRadioSubmission[] {
  return [
    {
      id: 'sub-1',
      status: 'PENDING',
      rejectionNote: null,
      createdAt: '2026-08-16T12:00:00.000Z',
      submitter: { username: 'dj-moonlight', displayName: 'DJ Moonlight' },
      archiveItem: {
        id: 'arch-sub-1',
        title: 'Moonlight Drive',
        artistName: 'DJ Moonlight',
        durationSec: 312,
        bannerUrl: '/mock/dj-moonlight/cover-moonlight-drive.svg',
        audioUrl:
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      },
    },
    {
      id: 'sub-2',
      status: 'PENDING',
      rejectionNote: null,
      createdAt: '2026-08-15T09:30:00.000Z',
      submitter: {
        username: 'kaiku-collective',
        displayName: 'Kaiku Collective',
      },
      archiveItem: {
        id: 'arch-sub-2',
        title: 'Echo Chamber Cypher',
        artistName: 'Kaiku Collective',
        durationSec: 254,
        bannerUrl: null,
        audioUrl:
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      },
    },
  ];
}

export async function fetchAdminRadioSubmissions(): Promise<{
  data: AdminRadioSubmission[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockRadioSubmissions(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{ submissions: AdminRadioSubmission[] }>(
      '/api/admin/radio-submissions?status=PENDING',
    );
    return { data: data.submissions, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export function approveRadioSubmission(id: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/radio-submissions/${encodeURIComponent(id)}/approve`,
    'POST',
  );
}

export function rejectRadioSubmission(id: string, note?: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/radio-submissions/${encodeURIComponent(id)}/reject`,
    'POST',
    note ? { note } : undefined,
  );
}

// ── News ────────────────────────────────────────────────────────────────────

export type AdminNewsPost = {
  id: string;
  headline: string;
  summary: string;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
};

function mockNewsPosts(): AdminNewsPost[] {
  return [
    {
      id: 'news-1',
      headline: 'Fair-rotation radio now covers 9 channels',
      summary:
        'Tahti Radio auto-features any member channel that goes live — no editorial picks.',
      authorName: 'Board',
      publishedAt: '2026-08-10T09:00:00.000Z',
      createdAt: '2026-08-10T08:30:00.000Z',
    },
    {
      id: 'news-2',
      headline: 'AGM date set for October',
      summary: 'Draft agenda circulating to members this week.',
      authorName: 'Board',
      publishedAt: null,
      createdAt: '2026-08-14T10:00:00.000Z',
    },
  ];
}

let mockNewsState: AdminNewsPost[] | null = null;
function newsState(): AdminNewsPost[] {
  if (!mockNewsState) {
    mockNewsState = mockNewsPosts();
  }
  return mockNewsState;
}

export async function fetchAdminNews(): Promise<{
  data: AdminNewsPost[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: newsState(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{ posts: AdminNewsPost[] }>('/api/admin/news');
    return { data: data.posts, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export async function createNewsPost(input: {
  headline: string;
  summary: string;
  publish: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    newsState().unshift({
      id: `news-${Date.now()}`,
      headline: input.headline,
      summary: input.summary,
      authorName: 'Demo Board',
      publishedAt: input.publish ? new Date().toISOString() : null,
      createdAt: new Date().toISOString(),
    });
    return { ok: true };
  }
  return mutate('/api/admin/news', 'POST', input);
}

export async function updateNewsPost(
  id: string,
  input: { headline?: string; summary?: string; publish?: boolean },
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    const post = newsState().find((p) => p.id === id);
    if (post) {
      if (input.headline != null) {
        post.headline = input.headline;
      }
      if (input.summary != null) {
        post.summary = input.summary;
      }
      if (input.publish != null) {
        post.publishedAt = input.publish ? new Date().toISOString() : null;
      }
    }
    return { ok: true };
  }
  return mutate(`/api/admin/news/${encodeURIComponent(id)}`, 'PATCH', input);
}

export async function deleteNewsPost(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    mockNewsState = newsState().filter((p) => p.id !== id);
    return { ok: true };
  }
  return mutate(`/api/admin/news/${encodeURIComponent(id)}`, 'DELETE');
}

// ── Tahti Selects ───────────────────────────────────────────────────────────

export type AdminSelectsItem = {
  id: string;
  archiveItemId: string;
  title: string;
  durationSec: number | null;
  license: string;
  artistName: string;
  channelSlug: string;
  addedBy: string;
};

export type AdminSelectsBrowseItem = {
  id: string;
  title: string;
  durationSec: number | null;
  license: string;
  artistName: string;
  channelSlug: string;
};

let mockSelectsItems: AdminSelectsItem[] | null = null;
let mockSelectsStreamRunning = false;

function selectsState(): AdminSelectsItem[] {
  if (!mockSelectsItems) {
    mockSelectsItems = [
      {
        id: 'sel-1',
        archiveItemId: 'arch-nl-1',
        title: 'Aurora Drift',
        durationSec: 372,
        license: 'CC_BY',
        artistName: 'Northern Lights',
        channelSlug: 'northern-lights',
        addedBy: 'board-jani',
      },
      {
        id: 'sel-2',
        archiveItemId: 'arch-mc-1',
        title: 'Route 550',
        durationSec: 541,
        license: 'CC_BY_SA',
        artistName: 'Midnight Cartography',
        channelSlug: 'midnight-cartography',
        addedBy: 'board-jani',
      },
    ];
  }
  return mockSelectsItems;
}

function mockSelectsBrowse(): AdminSelectsBrowseItem[] {
  return [
    {
      id: 'arch-dj-1',
      title: 'Moonlight Drive',
      durationSec: 312,
      license: 'CC_BY',
      artistName: 'DJ Moonlight',
      channelSlug: 'dj-moonlight',
    },
    {
      id: 'arch-kc-1',
      title: 'Echo Chamber Cypher',
      durationSec: 254,
      license: 'ALL_RIGHTS_RESERVED',
      artistName: 'Kaiku Collective',
      channelSlug: 'kaiku-collective',
    },
  ];
}

export async function fetchAdminSelects(): Promise<{
  data: { items: AdminSelectsItem[]; streamRunning: boolean };
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: { items: selectsState(), streamRunning: mockSelectsStreamRunning },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{
      items: AdminSelectsItem[];
      streamRunning: boolean;
    }>('/api/admin/tahti-selects');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return {
      data: { items: [], streamRunning: false },
      meta: failMeta(err),
    };
  }
}

export async function searchAdminSelectsBrowse(
  q: string,
): Promise<{ data: AdminSelectsBrowseItem[]; meta: FetchMeta }> {
  if (forceMock()) {
    const query = q.toLowerCase();
    return {
      data: mockSelectsBrowse().filter((i) =>
        i.title.toLowerCase().includes(query),
      ),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{ items: AdminSelectsBrowseItem[] }>(
      `/api/admin/tahti-selects/browse?q=${encodeURIComponent(q)}`,
    );
    return { data: data.items, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export function addToSelectsRotation(item: AdminSelectsBrowseItem) {
  if (forceMock()) {
    selectsState().push({
      id: `sel-${Date.now()}`,
      archiveItemId: item.id,
      title: item.title,
      durationSec: item.durationSec,
      license: item.license,
      artistName: item.artistName,
      channelSlug: item.channelSlug,
      addedBy: 'you',
    });
    return Promise.resolve({ ok: true } as const);
  }
  return mutate('/api/admin/tahti-selects', 'POST', { archiveItemId: item.id });
}

export function removeFromSelectsRotation(id: string) {
  if (forceMock()) {
    mockSelectsItems = selectsState().filter((i) => i.id !== id);
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(`/api/admin/tahti-selects/${encodeURIComponent(id)}`, 'DELETE');
}

export function reorderSelectsItem(id: string, direction: 'up' | 'down') {
  if (forceMock()) {
    const items = selectsState();
    const idx = items.findIndex((i) => i.id === id);
    const target = direction === 'up' ? idx - 1 : idx + 1;
    if (idx < 0 || target < 0 || target >= items.length) {
      return Promise.resolve({ ok: true } as const);
    }
    [items[idx], items[target]] = [items[target]!, items[idx]!];
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/tahti-selects/${encodeURIComponent(id)}/reorder`,
    'POST',
    { direction },
  );
}

export function startSelectsStream() {
  if (forceMock()) {
    mockSelectsStreamRunning = true;
    return Promise.resolve({ ok: true } as const);
  }
  return mutate('/api/admin/tahti-selects/stream/start', 'POST');
}

export function stopSelectsStream() {
  if (forceMock()) {
    mockSelectsStreamRunning = false;
    return Promise.resolve({ ok: true } as const);
  }
  return mutate('/api/admin/tahti-selects/stream/stop', 'POST');
}

// ── Stream manager ──────────────────────────────────────────────────────────

export type AdminLiveStreamRow = {
  slug: string;
  artistName: string;
  username: string;
  elapsedSec: number;
  goneLiveAt: string | null;
  hlsUrl: string | null;
  isRotation: boolean;
};

function mockLiveStreams(): AdminLiveStreamRow[] {
  return [
    {
      slug: 'northern-lights',
      artistName: 'Northern Lights',
      username: 'northern-lights',
      elapsedSec: 5400,
      goneLiveAt: '2026-08-16T20:00:00.000Z',
      hlsUrl: 'https://stream.tahti.live/northern-lights/stream.m3u8',
      isRotation: false,
    },
    {
      slug: 'dj-moonlight',
      artistName: 'DJ Moonlight',
      username: 'dj-moonlight',
      elapsedSec: 1860,
      goneLiveAt: '2026-08-17T00:39:00.000Z',
      hlsUrl: 'https://stream.tahti.live/dj-moonlight/stream.m3u8',
      isRotation: false,
    },
  ];
}

export async function fetchAdminStreams(): Promise<{
  data: AdminLiveStreamRow[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockLiveStreams(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{ streams: AdminLiveStreamRow[] }>(
      '/api/admin/streams',
    );
    return { data: data.streams, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export function restartStream(slug: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/streams/${encodeURIComponent(slug)}/restart`,
    'POST',
  );
}

export function skipStreamTrack(slug: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(`/api/admin/streams/${encodeURIComponent(slug)}/skip`, 'POST');
}

export function pauseStream(slug: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(`/api/admin/streams/${encodeURIComponent(slug)}/pause`, 'POST');
}

export function resumeStream(slug: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/streams/${encodeURIComponent(slug)}/resume`,
    'POST',
  );
}

export function forceStreamOffline(slug: string) {
  if (forceMock()) {
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(
    `/api/admin/streams/${encodeURIComponent(slug)}/force-offline`,
    'POST',
  );
}

// ── Support ─────────────────────────────────────────────────────────────────

export type AdminSupportStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export type AdminSupportTicket = {
  id: string;
  subject: string;
  category: string;
  status: AdminSupportStatus;
  artistUsername: string | null;
  contactEmail: string | null;
  createdAt: string;
};

function mockSupportTickets(): AdminSupportTicket[] {
  return [
    {
      id: 'tkt-1',
      subject: 'Cannot connect OBS to multistream target',
      category: 'broadcast',
      status: 'OPEN',
      artistUsername: 'dj-moonlight',
      contactEmail: null,
      createdAt: '2026-08-16T10:00:00.000Z',
    },
    {
      id: 'tkt-2',
      subject: 'Payout never arrived',
      category: 'billing',
      status: 'IN_PROGRESS',
      artistUsername: 'midnight-cartography',
      contactEmail: null,
      createdAt: '2026-08-15T09:00:00.000Z',
    },
    {
      id: 'tkt-3',
      subject: 'How do I change my channel URL?',
      category: 'general',
      status: 'RESOLVED',
      artistUsername: null,
      contactEmail: 'listener@example.com',
      createdAt: '2026-08-10T09:00:00.000Z',
    },
  ];
}

export async function fetchAdminSupportTickets(
  status?: AdminSupportStatus,
): Promise<{ data: AdminSupportTicket[]; meta: FetchMeta }> {
  if (forceMock()) {
    const all = mockSupportTickets();
    return {
      data: status ? all.filter((t) => t.status === status) : all,
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const qs = new URLSearchParams({ limit: '50' });
    if (status) {
      qs.set('status', status);
    }
    const data = await getJson<{ tickets: AdminSupportTicket[] }>(
      `/api/admin/support/tickets?${qs.toString()}`,
    );
    return { data: data.tickets, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

// ── Top lists ───────────────────────────────────────────────────────────────

export type AdminTopListPeriod = 'month' | 'half_year' | 'all_time';
export type AdminTopListDimension = 'type' | 'genre';
export type AdminTopListSort = 'desc' | 'asc';

export type AdminTopListEntry = {
  archiveItemId: string;
  listens: number;
  title: string;
  artistName: string;
  channelSlug: string;
};

export type AdminTopListBucket = {
  bucket: string;
  entries: AdminTopListEntry[];
};

function mockTopLists(dimension: AdminTopListDimension): AdminTopListBucket[] {
  const tracks = [
    {
      title: 'Moonlight Drive',
      artistName: 'DJ Moonlight',
      channelSlug: 'dj-moonlight',
      listens: 842,
    },
    {
      title: 'Route 550',
      artistName: 'Midnight Cartography',
      channelSlug: 'midnight-cartography',
      listens: 611,
    },
    {
      title: 'Aurora Drift',
      artistName: 'Northern Lights',
      channelSlug: 'northern-lights',
      listens: 590,
    },
    {
      title: 'Echo Chamber Cypher',
      artistName: 'Kaiku Collective',
      channelSlug: 'kaiku-collective',
      listens: 401,
    },
  ];
  const bucketed =
    dimension === 'type'
      ? [
          { bucket: 'Live sets', entries: tracks.slice(0, 2) },
          { bucket: 'Archive tracks', entries: tracks.slice(2) },
        ]
      : [
          { bucket: 'Electronic', entries: tracks.slice(0, 2) },
          { bucket: 'Downtempo', entries: [tracks[1]!] },
          { bucket: 'Hip-hop', entries: [tracks[3]!] },
        ];
  return bucketed.map((b) => ({
    bucket: b.bucket,
    entries: b.entries.map((t, i) => ({
      archiveItemId: `${b.bucket}-${i}`,
      listens: t.listens,
      title: t.title,
      artistName: t.artistName,
      channelSlug: t.channelSlug,
    })),
  }));
}

export async function fetchAdminTopLists(
  period: AdminTopListPeriod,
  dimension: AdminTopListDimension,
  sort: AdminTopListSort,
): Promise<{ data: AdminTopListBucket[]; meta: FetchMeta }> {
  if (forceMock()) {
    const buckets = mockTopLists(dimension).map((b) => ({
      bucket: b.bucket,
      entries: [...b.entries].sort((a, c) =>
        sort === 'desc' ? c.listens - a.listens : a.listens - c.listens,
      ),
    }));
    return {
      data: buckets,
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{ buckets: AdminTopListBucket[] }>(
      `/api/admin/top-lists?period=${period}&dimension=${dimension}&sort=${sort}`,
    );
    return { data: data.buckets, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

// ── Announcements ───────────────────────────────────────────────────────────

export type AdminAnnouncementScheduleMode =
  | 'AFTER_EVERY'
  | 'EVERY_NTH'
  | 'RANDOM';

export type AdminAnnouncementClip = {
  id: string;
  title: string;
  durationSec: number | null;
  isEnabled: boolean;
  scheduleMode: AdminAnnouncementScheduleMode;
  everyNth: number | null;
  audioUrl?: string | null;
};

let mockAnnouncementClips: AdminAnnouncementClip[] | null = null;
let mockAnnouncementsSystemEnabled = true;

function announcementState(): AdminAnnouncementClip[] {
  if (!mockAnnouncementClips) {
    mockAnnouncementClips = [
      {
        id: 'ann-1',
        title: 'Welcome to Tahti',
        durationSec: 12,
        isEnabled: true,
        scheduleMode: 'AFTER_EVERY',
        everyNth: null,
        audioUrl:
          'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      },
      {
        id: 'ann-2',
        title: 'AGM reminder — October',
        durationSec: 8,
        isEnabled: false,
        scheduleMode: 'EVERY_NTH',
        everyNth: 6,
        audioUrl: null,
      },
    ];
  }
  return mockAnnouncementClips;
}

export async function fetchAdminAnnouncements(): Promise<{
  data: { clips: AdminAnnouncementClip[]; systemEnabled: boolean };
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: {
        clips: announcementState(),
        systemEnabled: mockAnnouncementsSystemEnabled,
      },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const data = await getJson<{
      clips: AdminAnnouncementClip[];
      systemEnabled: boolean;
    }>('/api/admin/announcements');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return {
      data: { clips: [], systemEnabled: false },
      meta: failMeta(err),
    };
  }
}

export function setAnnouncementsSystemEnabled(enabled: boolean) {
  if (forceMock()) {
    mockAnnouncementsSystemEnabled = enabled;
    return Promise.resolve({ ok: true } as const);
  }
  return mutate('/api/admin/announcements/system-enabled', 'PATCH', {
    enabled,
  });
}

export async function patchAnnouncementClip(
  id: string,
  patch: Partial<
    Pick<AdminAnnouncementClip, 'isEnabled' | 'scheduleMode' | 'everyNth'>
  >,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    const clip = announcementState().find((c) => c.id === id);
    if (clip) {
      Object.assign(clip, patch);
    }
    return { ok: true };
  }
  return mutate(
    `/api/admin/announcements/${encodeURIComponent(id)}`,
    'PATCH',
    patch,
  );
}

export function deleteAnnouncementClip(id: string) {
  if (forceMock()) {
    mockAnnouncementClips = announcementState().filter((c) => c.id !== id);
    return Promise.resolve({ ok: true } as const);
  }
  return mutate(`/api/admin/announcements/${encodeURIComponent(id)}`, 'DELETE');
}

export async function uploadAnnouncementClip(
  file: File,
): Promise<
  { ok: true; clip: AdminAnnouncementClip } | { ok: false; error: string }
> {
  const title = file.name.replace(/\.[^.]+$/, '');
  if (forceMock()) {
    const clip: AdminAnnouncementClip = {
      id: `ann-${Date.now()}`,
      title,
      durationSec: null,
      isEnabled: true,
      scheduleMode: 'AFTER_EVERY',
      everyNth: null,
      audioUrl: null,
    };
    announcementState().unshift(clip);
    return { ok: true, clip };
  }
  try {
    const prep = await sendJson<{ objectKey: string; uploadUrl: string }>(
      '/api/admin/announcements/prepare',
      'POST',
      { filename: file.name, contentType: file.type, sizeBytes: file.size },
    );
    const put = await fetch(prep.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      body: file,
    });
    if (!put.ok) {
      return { ok: false, error: `Upload failed (${put.status})` };
    }
    const clip = await sendJson<AdminAnnouncementClip>(
      '/api/admin/announcements',
      'POST',
      { objectKey: prep.objectKey, title },
    );
    return { ok: true, clip };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Failed' };
  }
}
