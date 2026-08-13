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
  return { data: (await res.json()) as T, status: res.status };
}

function failMeta(err: unknown): FetchMeta {
  return {
    source: 'mock',
    reason: err instanceof Error ? err.message : 'fetch failed',
  };
}

/** A rendered/uploaded revision of an archive track. Old versions are kept
 * (not deleted) when a new one is rendered — GC is a server-side concern. */
export type ArchiveVersion = {
  id: string;
  versionNumber: number;
  versionLabel: string;
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'ERROR' | string;
  isActive: boolean;
  durationSec: number | null;
  sourceFormat: string | null;
  sourceBitrateKbps: number | null;
  createdAt: string;
};

const mockVersionsByItem = new Map<string, ArchiveVersion[]>();

function mockVersions(archiveItemId: string): ArchiveVersion[] {
  const existing = mockVersionsByItem.get(archiveItemId);
  if (existing) {
    return existing;
  }
  const initial: ArchiveVersion[] = [
    {
      id: `ver-mock-${archiveItemId}-1`,
      versionNumber: 1,
      versionLabel: 'Original upload',
      status: 'READY',
      isActive: true,
      durationSec: 180,
      sourceFormat: 'mp3',
      sourceBitrateKbps: 320,
      createdAt: new Date(Date.now() - 86400_000).toISOString(),
    },
  ];
  mockVersionsByItem.set(archiveItemId, initial);
  return initial;
}

export async function fetchArchiveVersions(archiveItemId: string): Promise<{
  data: ArchiveVersion[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockVersions(archiveItemId),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<ArchiveVersion[]>(
      `/api/me/archive/${encodeURIComponent(archiveItemId)}/versions`,
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export async function activateArchiveVersion(
  archiveItemId: string,
  versionId: string,
): Promise<
  { ok: true; data: ArchiveVersion[] } | { ok: false; error: string }
> {
  if (forceMock()) {
    const versions = mockVersions(archiveItemId).map((v) => ({
      ...v,
      isActive: v.id === versionId,
    }));
    mockVersionsByItem.set(archiveItemId, versions);
    return { ok: true, data: versions };
  }
  try {
    const { data } = await requestJson<ArchiveVersion[]>(
      `/api/me/archive/${encodeURIComponent(archiveItemId)}/versions/${encodeURIComponent(versionId)}/activate`,
      { method: 'POST' },
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not switch version',
    };
  }
}

export async function fetchVersionDownloadUrl(
  archiveItemId: string,
  versionId: string,
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  if (forceMock()) {
    return { ok: true, url: '#mock-download' };
  }
  try {
    const { data } = await requestJson<{ url: string; contentType: string }>(
      `/api/me/archive/${encodeURIComponent(archiveItemId)}/versions/${encodeURIComponent(versionId)}/download`,
    );
    return { ok: true, url: data.url };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Download unavailable',
    };
  }
}
