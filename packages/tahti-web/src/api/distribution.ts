import { allowMockFallback, apiErrorMeta, failMeta, isForceMock } from './mode';
import type {
  RevelatorBillingStatus,
  RevelatorCheckoutResponse,
  RevelatorReleaseStatus,
  RevelatorRoyaltyReportRow,
  RevelatorSubmitAccepted,
} from './studio-types';

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
  return { data: (await res.json()) as T, status: res.status };
}

// ── Mock fixtures ───────────────────────────────────────────────────────────

const mockBillingByRelease: Record<string, RevelatorBillingStatus> = {};
const mockStatusByRelease: Record<string, RevelatorReleaseStatus> = {};

function mockBilling(releaseId: string): RevelatorBillingStatus {
  return (
    mockBillingByRelease[releaseId] ?? {
      paid: false,
      feeCents: 2900,
      waived: false,
      studioIncludedRemaining: 1,
      distributionPaidAt: null,
    }
  );
}

function mockStatus(
  releaseId: string,
  title = 'Mock release',
): RevelatorReleaseStatus {
  return (
    mockStatusByRelease[releaseId] ?? {
      revelatorId: null,
      revelatorStatus: null,
      title,
    }
  );
}

function mockRoyalties(): RevelatorRoyaltyReportRow[] {
  return [
    {
      id: 'roy-1',
      releaseId: 'rel-mock',
      releaseTitle: 'Mock EP',
      periodStart: '2026-06-01',
      periodEnd: '2026-06-30',
      amountCents: 4210,
      currency: 'EUR',
      streams: 18422,
      syncedAt: '2026-07-05T09:00:00.000Z',
    },
    {
      id: 'roy-2',
      releaseId: 'rel-mock',
      releaseTitle: 'Mock EP',
      periodStart: '2026-05-01',
      periodEnd: '2026-05-31',
      amountCents: 3190,
      currency: 'EUR',
      streams: 13977,
      syncedAt: '2026-06-04T09:00:00.000Z',
    },
  ];
}

// ── API ──────────────────────────────────────────────────────────────────────

export async function fetchRevelatorStatus(releaseId: string): Promise<{
  data: RevelatorReleaseStatus | null;
  meta: { source: 'api' | 'mock'; reason?: string };
}> {
  if (forceMock()) {
    return {
      data: mockStatus(releaseId),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<RevelatorReleaseStatus>(
      `/api/me/releases/${encodeURIComponent(releaseId)}/revelator`,
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: mockStatus(releaseId), meta: failMeta(err) };
    }
    return { data: null, meta: apiErrorMeta(err) };
  }
}

export async function fetchRevelatorBilling(releaseId: string): Promise<{
  data: RevelatorBillingStatus | null;
  meta: { source: 'api' | 'mock'; reason?: string };
}> {
  if (forceMock()) {
    return {
      data: mockBilling(releaseId),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<RevelatorBillingStatus>(
      `/api/me/releases/${encodeURIComponent(releaseId)}/revelator/billing`,
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: mockBilling(releaseId), meta: failMeta(err) };
    }
    return { data: null, meta: apiErrorMeta(err) };
  }
}

export async function startRevelatorCheckout(
  releaseId: string,
): Promise<
  { ok: true; data: RevelatorCheckoutResponse } | { ok: false; error: string }
> {
  if (forceMock()) {
    mockBillingByRelease[releaseId] = {
      ...mockBilling(releaseId),
      paid: true,
      distributionPaidAt: new Date().toISOString(),
    };
    return {
      ok: true,
      data: {
        paid: true,
        feeCents: mockBilling(releaseId).feeCents,
        waived: false,
      },
    };
  }
  try {
    const { data } = await requestJson<RevelatorCheckoutResponse>(
      `/api/me/releases/${encodeURIComponent(releaseId)}/revelator/checkout`,
      { method: 'POST' },
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Checkout failed',
    };
  }
}

export async function submitToRevelator(
  releaseId: string,
): Promise<
  { ok: true; data: RevelatorSubmitAccepted } | { ok: false; error: string }
> {
  if (forceMock()) {
    const billing = mockBilling(releaseId);
    if (!billing.paid) {
      return {
        ok: false,
        error: 'Pay the distribution fee before submitting to Revelator',
      };
    }
    mockStatusByRelease[releaseId] = {
      ...mockStatus(releaseId),
      revelatorStatus: 'pending',
    };
    return { ok: true, data: { releaseId, revelatorStatus: 'pending' } };
  }
  try {
    const { data } = await requestJson<RevelatorSubmitAccepted>(
      `/api/me/releases/${encodeURIComponent(releaseId)}/revelator/submit`,
      { method: 'POST' },
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Submit failed',
    };
  }
}

export async function fetchReleaseRoyalties(releaseId: string): Promise<{
  data: RevelatorRoyaltyReportRow[];
  meta: { source: 'api' | 'mock'; reason?: string };
}> {
  if (forceMock()) {
    return {
      data: mockRoyalties().filter((r) => r.releaseId === 'rel-mock'),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<{
      reports: RevelatorRoyaltyReportRow[];
    }>(`/api/me/releases/${encodeURIComponent(releaseId)}/revelator/royalties`);
    return { data: data.reports, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: mockRoyalties(), meta: failMeta(err) };
    }
    return { data: [], meta: apiErrorMeta(err) };
  }
}

export async function fetchAllRoyalties(): Promise<{
  data: RevelatorRoyaltyReportRow[];
  meta: { source: 'api' | 'mock'; reason?: string };
}> {
  if (forceMock()) {
    return {
      data: mockRoyalties(),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<{
      reports: RevelatorRoyaltyReportRow[];
    }>('/api/me/revelator/royalties');
    return { data: data.reports, meta: { source: 'api' } };
  } catch (err) {
    if (allowMockFallback()) {
      return { data: mockRoyalties(), meta: failMeta(err) };
    }
    return { data: [], meta: apiErrorMeta(err) };
  }
}
