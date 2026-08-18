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

export const VISUAL_PRESETS = [
  'MINIMAL',
  'WATER_RIPPLE',
  'WAVEFORM_BARS',
  'PARTICLE_FIELD',
  'AURORA',
  'REACTIVE_GRID',
  'CLOUDSCAPE',
  'LINE_TANGLE',
  'BACKDROP_BOX',
  'LENS_FLARES',
  'IES_SPOTLIGHT',
] as const;

export type VisualPreset = (typeof VISUAL_PRESETS)[number];

export const HEADER_STYLES = ['GRADIENT', 'SOLID', 'VIDEO_LOOP'] as const;
export type HeaderStyle = (typeof HEADER_STYLES)[number];

export const BRAND_ACCENTS = [
  {
    id: 'aurora',
    label: 'Aurora',
    accent: '#22D3EE',
    highlight: '#A78BFA',
    gradient: 'linear-gradient(135deg,#A78BFA,#22D3EE,#3FE07A)',
  },
  {
    id: 'ember',
    label: 'Ember',
    accent: '#F97316',
    highlight: '#FBBF24',
    gradient: 'linear-gradient(135deg,#F97316,#FBBF24,#EF4444)',
  },
  {
    id: 'noir',
    label: 'Noir',
    accent: '#94A3B8',
    highlight: '#E2E8F0',
    gradient: 'linear-gradient(135deg,#0F172A,#334155,#94A3B8)',
  },
  {
    id: 'violet',
    label: 'Violet',
    accent: '#A855F7',
    highlight: '#EC4899',
    gradient: 'linear-gradient(135deg,#7C3AED,#A855F7,#EC4899)',
  },
  {
    id: 'tahti',
    label: 'Tahti',
    accent: '#FFB020',
    highlight: '#35D6C4',
    gradient: 'linear-gradient(135deg,#0A0E1A,#FFB020,#35D6C4)',
  },
] as const;

export type ColorScheme = {
  accent?: string;
  highlight?: string;
  background?: string;
  foreground?: string;
};

export type ChannelVisual = {
  visualPreset: VisualPreset | string;
  colorSchemeJson: string | null;
  visualSettingsJson?: string | null;
  headerStyle: HeaderStyle | string;
  brandAccentPreset: string | null;
  slideshowPreset?: string | null;
  slideshowIntervalSeconds?: number;
  slideshowTransitionMs?: number;
  slideshowAutoplay?: boolean;
};

let mockVisual: ChannelVisual = {
  visualPreset: 'AURORA',
  colorSchemeJson: JSON.stringify({
    accent: '#22D3EE',
    highlight: '#A78BFA',
    background: '#0B1220',
    foreground: '#F8FAFC',
  }),
  headerStyle: 'GRADIENT',
  brandAccentPreset: 'aurora',
  slideshowPreset: 'FADE',
  slideshowIntervalSeconds: 8,
  slideshowTransitionMs: 600,
  slideshowAutoplay: true,
};

export function parseColorScheme(json: string | null | undefined): ColorScheme {
  if (!json) {
    return {
      accent: '#22D3EE',
      highlight: '#A78BFA',
      background: '#0B1220',
      foreground: '#F8FAFC',
    };
  }
  try {
    return JSON.parse(json) as ColorScheme;
  } catch {
    return {
      accent: '#22D3EE',
      highlight: '#A78BFA',
      background: '#0B1220',
      foreground: '#F8FAFC',
    };
  }
}

export async function fetchChannelVisual(): Promise<{
  data: ChannelVisual;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: { ...mockVisual },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<ChannelVisual>('/api/me/channel/visual');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: { ...mockVisual }, meta: failMeta(err) };
  }
}

export async function patchChannelVisual(patch: {
  visualPreset?: string;
  colorScheme?: ColorScheme | null;
  headerStyle?: string;
  brandAccentPreset?: string | null;
}): Promise<{ ok: true; data: ChannelVisual } | { ok: false; error: string }> {
  if (forceMock()) {
    mockVisual = {
      ...mockVisual,
      ...(patch.visualPreset !== undefined
        ? { visualPreset: patch.visualPreset }
        : {}),
      ...(patch.headerStyle !== undefined
        ? { headerStyle: patch.headerStyle }
        : {}),
      ...(patch.brandAccentPreset !== undefined
        ? { brandAccentPreset: patch.brandAccentPreset }
        : {}),
      ...(patch.colorScheme !== undefined
        ? {
            colorSchemeJson: patch.colorScheme
              ? JSON.stringify(patch.colorScheme)
              : null,
          }
        : {}),
    };
    return { ok: true, data: { ...mockVisual } };
  }
  try {
    const { data } = await requestJson<ChannelVisual>(
      '/api/me/channel/visual',
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
      },
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Save failed',
    };
  }
}

export async function checkSlugAvailable(
  slug: string,
): Promise<{ available: boolean; reason?: string; meta: FetchMeta }> {
  if (forceMock()) {
    return {
      available: slug.length >= 3 && slug !== 'taken',
      reason: slug === 'taken' ? 'taken' : undefined,
      meta: { source: 'mock' },
    };
  }
  try {
    const { data } = await requestJson<{ available: boolean; reason?: string }>(
      `/api/me/channel/slug-available?slug=${encodeURIComponent(slug)}`,
    );
    return { ...data, meta: { source: 'api' } };
  } catch (err) {
    return { available: false, reason: 'error', meta: failMeta(err) };
  }
}

export async function updateChannelSlug(
  slug: string,
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  if (forceMock()) {
    if (slug.length < 3) {
      return { ok: false, error: 'Slug too short' };
    }
    return { ok: true, slug };
  }
  try {
    const { data } = await requestJson<{ slug?: string; username?: string }>(
      '/api/me/channel/slug',
      { method: 'PATCH', body: JSON.stringify({ slug }) },
    );
    return { ok: true, slug: data.slug ?? slug };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Rename failed',
    };
  }
}

export async function setCustomDomain(
  domain: string,
): Promise<
  | { ok: true; domain: string; txtHost: string; txtRecord: string }
  | { ok: false; error: string }
> {
  if (forceMock()) {
    return {
      ok: true,
      domain,
      txtHost: `_tahti.${domain}`,
      txtRecord: 'tahti-verify=mock-token',
    };
  }
  try {
    const { data } = await requestJson<{
      domain: string;
      txtHost: string;
      txtRecord: string;
    }>('/api/me/channel/custom-domain', {
      method: 'POST',
      body: JSON.stringify({ domain }),
    });
    return { ok: true, ...data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Set domain failed',
    };
  }
}

export async function verifyCustomDomain(): Promise<
  { ok: true; verified: boolean } | { ok: false; error: string }
> {
  if (forceMock()) {
    return { ok: true, verified: true };
  }
  try {
    const { data } = await requestJson<{ verified?: boolean; ok?: boolean }>(
      '/api/me/channel/custom-domain/verify',
      { method: 'POST' },
    );
    return { ok: true, verified: Boolean(data.verified ?? data.ok) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Verify failed',
    };
  }
}
