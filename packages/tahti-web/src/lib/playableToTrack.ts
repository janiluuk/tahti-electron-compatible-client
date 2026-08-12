import type { ArtistCredit, Track } from '@nuclearplayer/model';

import type { TahtiPlayable } from '../api/types';

export function playableToTrack(item: TahtiPlayable): Track {
  const provider = item.sourceProvider?.trim() || 'tahti';
  const artists: ArtistCredit[] = [{ name: item.artist, roles: ['performer'] }];
  const tags = provider === 'tahti' ? undefined : [provider];
  return {
    title: item.title,
    artists,
    tags,
    album:
      provider !== 'tahti'
        ? {
            title: provider,
            source: { provider, id: item.id },
          }
        : undefined,
    artwork: item.coverUrl
      ? { items: [{ url: item.coverUrl, purpose: 'cover' }] }
      : undefined,
    source: { provider, id: item.id, url: item.streamUrl },
    streamCandidates: [
      {
        id: `${item.id}:stream`,
        title: item.title,
        thumbnail: item.coverUrl,
        failed: false,
        source: { provider, id: item.id },
        stream: {
          url: item.streamUrl,
          protocol: item.protocol === 'hls' ? 'hls' : 'https',
          source: { provider, id: item.id },
        },
        lastResolvedAtIso: new Date().toISOString(),
      },
    ],
  };
}

export function formatDuration(sec?: number | null): string {
  if (sec == null || !Number.isFinite(sec)) {
    return '';
  }
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function providerLabel(provider?: string | null): string | null {
  if (!provider || provider === 'tahti') {
    return null;
  }
  return provider;
}
