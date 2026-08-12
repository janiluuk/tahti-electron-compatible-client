import type { FetchMeta } from './client';
import {
  getMockConnectStatus,
  mockCompleteConnectOnboard,
} from './mock-session';
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

export type FanConnectStatus = {
  stripeConfigured: boolean;
  accountId: string | null;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  paymentsReady: boolean;
};

export type GrantRow = {
  forYear: number;
  units: number;
  amountCents: string;
  state: string;
  paidAt?: string | null;
};

export type GrantEstimate = {
  year: number;
  estimateCents: number;
  units: number;
  eligible: boolean;
  freeDownloads?: number;
  paidDownloads?: number;
  fanSubEuros?: number;
};

const emptyConnect = (): FanConnectStatus => ({
  stripeConfigured: false,
  accountId: null,
  chargesEnabled: false,
  detailsSubmitted: false,
  paymentsReady: false,
});

const mockGrants = (): GrantRow[] => [
  {
    forYear: 2025,
    units: 12,
    amountCents: '45000',
    state: 'PAID',
    paidAt: '2026-01-15T00:00:00.000Z',
  },
];

const mockEstimate = (): GrantEstimate => ({
  year: new Date().getFullYear(),
  estimateCents: 12000,
  units: 8,
  eligible: true,
  freeDownloads: 40,
  paidDownloads: 12,
  fanSubEuros: 35,
});

export async function fetchFanConnectStatus(): Promise<{
  data: FanConnectStatus;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: getMockConnectStatus(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<FanConnectStatus>(
      '/api/me/fan-subs/connect',
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: getMockConnectStatus(), meta: failMeta(err) };
    }
    return { data: emptyConnect(), meta: apiErrorMeta(err) };
  }
}

export async function startFanConnectOnboard(): Promise<
  | { ok: true; url: string }
  | { ok: true; mockActivated: true; message: string }
  | { ok: false; error: string }
> {
  if (forceMock()) {
    const status = mockCompleteConnectOnboard();
    return {
      ok: true,
      mockActivated: true,
      message: status.paymentsReady
        ? 'Mock Connect onboard complete — payments ready.'
        : 'Mock Connect onboard updated.',
    };
  }
  try {
    const { data } = await requestJson<{ url: string }>(
      '/api/me/fan-subs/connect/onboard',
      {
        method: 'POST',
      },
    );
    return { ok: true, url: data.url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Onboard failed',
    };
  }
}

export async function fetchFanConnectPortal(): Promise<
  | { ok: true; url: string }
  | { ok: true; mockActivated: true; message: string }
  | { ok: false; error: string }
> {
  if (forceMock()) {
    const status = getMockConnectStatus();
    if (!status.accountId) {
      return {
        ok: false,
        error: 'Complete mock onboarding first (no Connect account yet).',
      };
    }
    return {
      ok: true,
      mockActivated: true,
      message: `Mock Stripe portal for ${status.accountId} — no redirect offline.`,
    };
  }
  try {
    const { data } = await requestJson<{ url: string }>(
      '/api/me/fan-subs/connect/portal',
    );
    return { ok: true, url: data.url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Portal failed',
    };
  }
}

export async function fetchMyGrants(): Promise<{
  data: GrantRow[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockGrants(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<GrantRow[]>('/api/me/grants');
    return { data: Array.isArray(data) ? data : [], meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: mockGrants(), meta: failMeta(err) };
    }
    return { data: [], meta: apiErrorMeta(err) };
  }
}

export async function fetchGrantEstimate(): Promise<{
  data: GrantEstimate | null;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockEstimate(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<GrantEstimate>(
      '/api/me/grants/estimate',
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: mockEstimate(), meta: failMeta(err) };
    }
    return { data: null, meta: apiErrorMeta(err) };
  }
}
