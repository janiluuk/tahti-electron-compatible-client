/** Providers whose tracks are referenced, never re-hosted: the backend
 * stores only an embedUri and marks the archive item EMBED_ONLY, so the
 * audio and artwork have to come from the provider's own widget. */
export type EmbedProvider = 'HEARTHIS' | 'MIXCLOUD' | 'SPOTIFY';

/** Mirrors hearthisEmbedSrc in the main tahti repo (packages/shared).
 * waveform/cover stay on: the widget hides its play control until that
 * UI initializes, so turning both off leaves nothing clickable. */
export function hearthisEmbedSrc(trackId: string): string {
  const params = new URLSearchParams({
    hcolor: '55acee',
    color: '',
    style: '2',
    block_size: '2',
    block_space: '2',
    background: '1',
    waveform: '1',
    cover: '1',
    autoplay: '0',
    css: '',
  });
  return `https://hearthis.at/embed/${encodeURIComponent(trackId)}/transparent_black/?${params.toString()}`;
}

export function mixcloudEmbedSrc(key: string): string {
  return `https://player-widget.mixcloud.com/widget/iframe/?feed=${encodeURIComponent(key)}&hide_cover=1&light=0`;
}

export function spotifyEmbedSrc(uri: string): string {
  // spotify:track:ID → /embed/track/ID
  const path = uri.startsWith('spotify:')
    ? uri.slice('spotify:'.length).replace(/:/g, '/')
    : `track/${uri}`;
  return `https://open.spotify.com/embed/${path}`;
}

export function embedSrcFor(
  provider: EmbedProvider,
  uri: string,
): string | null {
  switch (provider) {
    case 'HEARTHIS':
      return hearthisEmbedSrc(uri);
    case 'MIXCLOUD':
      return mixcloudEmbedSrc(uri);
    case 'SPOTIFY':
      return spotifyEmbedSrc(uri);
    default:
      return null;
  }
}

export const EMBED_PROVIDER_LABEL: Record<EmbedProvider, string> = {
  HEARTHIS: 'hearthis.at',
  MIXCLOUD: 'Mixcloud',
  SPOTIFY: 'Spotify',
};

/** Widget heights differ enough that one value looks broken on the others. */
export const EMBED_PROVIDER_HEIGHT: Record<EmbedProvider, number> = {
  HEARTHIS: 150,
  MIXCLOUD: 120,
  SPOTIFY: 152,
};
