import { Link, useNavigate } from '@tanstack/react-router';
import {
  DownloadIcon,
  Link2Icon,
  PlayIcon,
  PlugIcon,
  Radio as RadioIcon,
  SearchIcon,
  UnplugIcon,
  UploadIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Badge, Button, Card, CardGrid, MediaArtwork } from '@nuclearplayer/ui';

import {
  COMMON_STATIONS,
  lookupStationByUrl,
  playableFromRadioStation,
  readIcyStreamTitle,
  resolveStreamUrl,
  searchStationsByName,
  type RadioStation,
} from '../api/radio-sources';
import {
  connectIntegrationMock,
  disconnectIntegration,
  fetchConnectionStatus,
  fetchSoundcloudTracks,
  fetchStashDownload,
  fetchStashFiles,
  importSoundcloudTracks,
  oauthStartUrl,
  playableFromSoundcloud,
  playableFromSpotify,
  searchSpotifyTracks,
  SOURCE_DEFS,
  type ConnectionStatus,
  type IntegrationId,
  type SoundcloudTrack,
  type SpotifySearchTrack,
  type StashFile,
} from '../api/sources';
import { PageFrame, PageHeader } from '../components/PageHeader';
import {
  SourceServiceIcon,
  sourceTileSubtitle,
} from '../components/SourceServiceIcon';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';

const forceMock = () => import.meta.env.VITE_FORCE_MOCK === '1';

type TileStatus = {
  status: ConnectionStatus | null;
  metaSource: string;
};

function statusChip(
  defKind: (typeof SOURCE_DEFS)[number]['kind'],
  tile: TileStatus | undefined,
): { label: string; color: 'green' | 'orange' | 'cyan' | 'secondary' } {
  if (!tile?.status) {
    return { label: '…', color: 'secondary' };
  }
  if (tile.metaSource === 'mock') {
    return { label: 'Mock', color: 'cyan' };
  }
  if (defKind === 'upload' || defKind === 'tool' || defKind === 'search') {
    if (tile.status.connected) {
      return { label: 'Ready', color: 'green' };
    }
    return { label: 'Open', color: 'secondary' };
  }
  if (tile.status.connected) {
    return { label: 'Connected', color: 'green' };
  }
  if (tile.status.configured) {
    return { label: 'Needs auth', color: 'orange' };
  }
  return { label: 'Not configured', color: 'secondary' };
}

export function SourcesView({ tabId }: { tabId?: IntegrationId }) {
  const user = useAuthStore((s) => s.user);
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const navigate = useNavigate();

  const selected =
    tabId && SOURCE_DEFS.some((d) => d.id === tabId) ? tabId : undefined;
  const def = selected ? SOURCE_DEFS.find((d) => d.id === selected)! : null;

  const [tiles, setTiles] = useState<
    Partial<Record<IntegrationId, TileStatus>>
  >({});
  const [status, setStatus] = useState<ConnectionStatus | null>(null);
  const [meta, setMeta] = useState('…');
  const [scTracks, setScTracks] = useState<SoundcloudTrack[]>([]);
  const [stash, setStash] = useState<StashFile[]>([]);
  const [spotifyQ, setSpotifyQ] = useState('');
  const [spotifyHits, setSpotifyHits] = useState<SpotifySearchTrack[]>([]);
  const [urlPaste, setUrlPaste] = useState('');
  const [note, setNote] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [radioUrl, setRadioUrl] = useState('');
  const [radioBusy, setRadioBusy] = useState(false);
  const [radioStation, setRadioStation] = useState<RadioStation | null>(null);
  const [radioNowPlaying, setRadioNowPlaying] = useState<string | null>(null);
  const [radioNote, setRadioNote] = useState<string | null>(null);
  const [radioQuery, setRadioQuery] = useState('');
  const [radioResults, setRadioResults] = useState<RadioStation[]>([]);

  // Overview: load connection status for every integration (plugin-store style chips).
  useEffect(() => {
    let cancelled = false;
    void Promise.all(
      SOURCE_DEFS.map(async (d) => {
        const r = await fetchConnectionStatus(d.id);
        return [d.id, { status: r.data, metaSource: r.meta.source }] as const;
      }),
    ).then((entries) => {
      if (cancelled) {
        return;
      }
      setTiles(Object.fromEntries(entries));
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // OAuth callback landed here via /dashboard alias (see prodPathRedirects) —
  // surface the connect/error result, then drop it from the URL.
  useEffect(() => {
    if (!selected) {
      return;
    }
    const params = new URLSearchParams(window.location.search);
    const oauthStatus = params.get('status');
    if (!oauthStatus) {
      return;
    }
    const name = SOURCE_DEFS.find((d) => d.id === selected)?.name ?? selected;
    if (oauthStatus === 'connected') {
      setNote(`${name} connected.`);
    } else if (oauthStatus === 'login') {
      setNote(`Sign in to Tahti first, then connect ${name}.`);
    } else {
      setNote(`Could not connect ${name}. Try again.`);
    }
    params.delete('status');
    const qs = params.toString();
    window.history.replaceState(
      null,
      '',
      `${window.location.pathname}${qs ? `?${qs}` : ''}`,
    );
  }, [selected]);

  useEffect(() => {
    if (!selected) {
      setStatus(null);
      return;
    }
    let cancelled = false;
    void fetchConnectionStatus(selected).then((r) => {
      if (cancelled) {
        return;
      }
      setStatus(r.data);
      setMeta(r.meta.source);
      setTiles((prev) => ({
        ...prev,
        [selected]: { status: r.data, metaSource: r.meta.source },
      }));
    });
    return () => {
      cancelled = true;
    };
  }, [selected]);

  useEffect(() => {
    if (selected !== 'soundcloud' || !status?.connected) {
      return;
    }
    void fetchSoundcloudTracks().then((r) => setScTracks(r.data));
  }, [selected, status?.connected]);

  useEffect(() => {
    if (selected !== 'stash') {
      return;
    }
    void fetchStashFiles().then((r) => setStash(r.data));
  }, [selected]);

  const overview = useMemo(() => SOURCE_DEFS, []);

  const openRadioStation = (station: RadioStation) => {
    setRadioStation(station);
    setRadioNowPlaying(null);
    setRadioNote(null);
    void readIcyStreamTitle(station.streamUrl).then((title) => {
      setRadioNowPlaying(title);
    });
  };

  const resolveRadioUrl = () => {
    const input = radioUrl.trim();
    if (!input) {
      return;
    }
    setRadioBusy(true);
    setRadioNote(null);
    void resolveStreamUrl(input).then(async ({ streamUrl, title }) => {
      const found = await lookupStationByUrl(streamUrl);
      setRadioBusy(false);
      const station: RadioStation = found ?? {
        id: streamUrl,
        name: title || streamUrl,
        streamUrl,
        source: 'unknown',
      };
      if (!found) {
        setRadioNote(
          'Not in the public station directory — playing the stream directly with the name from the playlist, if any.',
        );
      }
      openRadioStation(station);
    });
  };

  return (
    <PageFrame>
      <PageHeader
        title="Sources"
        subtitle="Connect and import from services — pick a tile to open its tools."
        meta={
          !user ? (
            <button
              type="button"
              className="underline-offset-2 hover:underline"
              onClick={() => useAuthModalStore.getState().open('login')}
            >
              Sign in to connect OAuth sources.
            </button>
          ) : undefined
        }
      />

      {!selected && (
        <CardGrid
          data-testid="sources-grid"
          className="grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]"
        >
          {overview.map((d) => {
            const chip = statusChip(d.kind, tiles[d.id]);
            return (
              <div key={d.id} className="relative">
                <Card
                  title={d.name}
                  subtitle={sourceTileSubtitle(d.id)}
                  className="w-full max-w-none"
                  image={<SourceServiceIcon id={d.id} />}
                  onClick={() => {
                    void navigate({ to: '/sources/$id', params: { id: d.id } });
                  }}
                />
                <div className="pointer-events-none absolute top-3 right-3 z-10">
                  <Badge variant="pill" color={chip.color}>
                    {chip.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardGrid>
      )}

      {selected && def && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="sm"
              variant="text"
              onClick={() => {
                void navigate({ to: '/sources' });
              }}
            >
              ← All sources
            </Button>
            <nav className="flex flex-wrap gap-1.5">
              {overview.map((t) => (
                <Link
                  key={t.id}
                  to="/sources/$id"
                  params={{ id: t.id }}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold tracking-wide uppercase ${
                    selected === t.id
                      ? 'bg-primary text-foreground'
                      : 'border-border text-foreground-secondary hover:text-foreground border'
                  }`}
                >
                  {t.name}
                </Link>
              ))}
            </nav>
          </div>

          <section className="border-border flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-start">
            <div className="border-border h-24 w-24 shrink-0 overflow-hidden rounded-lg border">
              <SourceServiceIcon id={selected} size="detail" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-xl font-bold">{def.name}</h2>
                {(() => {
                  const chip = statusChip(def.kind, {
                    status,
                    metaSource: meta,
                  });
                  return (
                    <Badge variant="pill" color={chip.color}>
                      {chip.label}
                    </Badge>
                  );
                })()}
              </div>
              <p className="text-foreground-secondary mt-2 text-sm">
                {def.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {def.kind === 'oauth' && def.oauthStartPath && (
                  <>
                    {forceMock() ? (
                      <Button
                        size="sm"
                        disabled={!user}
                        onClick={() => {
                          const id = selected as
                            | 'bandcamp'
                            | 'soundcloud'
                            | 'google-drive'
                            | 'mixcloud'
                            | 'spotify';
                          void connectIntegrationMock(id).then((r) => {
                            setNote(
                              r.ok ? `Mock connected ${def.name}.` : r.error,
                            );
                            void fetchConnectionStatus(selected).then((x) => {
                              setStatus(x.data);
                              setTiles((prev) => ({
                                ...prev,
                                [selected]: {
                                  status: x.data,
                                  metaSource: x.meta.source,
                                },
                              }));
                            });
                          });
                        }}
                      >
                        <PlugIcon size={16} aria-hidden className="mr-1.5" />
                        {status?.connected ? 'Reconnect' : 'Connect'}
                      </Button>
                    ) : (
                      <a href={oauthStartUrl(def.oauthStartPath)}>
                        <Button size="sm" disabled={!user}>
                          <PlugIcon size={16} aria-hidden className="mr-1.5" />
                          {status?.connected ? 'Reconnect' : 'Connect'}
                        </Button>
                      </a>
                    )}
                    {status?.connected && (
                      <Button
                        size="sm"
                        variant="text"
                        onClick={() => {
                          const id = selected as
                            | 'bandcamp'
                            | 'soundcloud'
                            | 'google-drive'
                            | 'mixcloud';
                          void disconnectIntegration(id).then((r) => {
                            setNote(r.ok ? 'Disconnected.' : r.error);
                            void fetchConnectionStatus(selected).then((x) => {
                              setStatus(x.data);
                              setTiles((prev) => ({
                                ...prev,
                                [selected]: {
                                  status: x.data,
                                  metaSource: x.meta.source,
                                },
                              }));
                            });
                          });
                        }}
                      >
                        <UnplugIcon size={16} aria-hidden className="mr-1.5" />
                        Disconnect
                      </Button>
                    )}
                  </>
                )}
                {def.studioDeepLink && (
                  <Link to={def.studioDeepLink as '/studio/upload'}>
                    <Button size="sm" variant="secondary">
                      <UploadIcon size={16} aria-hidden className="mr-1.5" />
                      Open in Studio
                    </Button>
                  </Link>
                )}
                {selected === 'stash' && (
                  <Link to="/studio/stash">
                    <Button size="sm" variant="secondary">
                      Studio stash
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </section>

          {note && (
            <p className="text-foreground-secondary border-border rounded border px-3 py-2 text-sm">
              {note}
            </p>
          )}

          {selected === 'soundcloud' && status?.connected && (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-bold">Tracks</h2>
              {scTracks.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No tracks returned.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {scTracks.map((t) => (
                    <li
                      key={t.id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <MediaArtwork
                          size="sm"
                          src={t.artworkUrl}
                          alt={t.title}
                          imageReveal={false}
                          onPlay={() => play(playableFromSoundcloud(t))}
                          playLabel="Preview"
                          onQueue={() => enqueue(playableFromSoundcloud(t))}
                          queueLabel="Queue"
                          className="border-border shrink-0 rounded border"
                        />
                        <span className="truncate text-sm">{t.title}</span>
                      </div>
                      <Button
                        size="sm"
                        disabled={busy}
                        onClick={() => {
                          setBusy(true);
                          void importSoundcloudTracks([
                            { trackId: t.id, title: t.title },
                          ]).then((r) => {
                            setBusy(false);
                            setNote(
                              r.ok
                                ? `Queued import (${r.count}). Check Studio → Music.`
                                : r.error,
                            );
                          });
                        }}
                      >
                        <DownloadIcon
                          size={16}
                          aria-hidden
                          className="mr-1.5"
                        />
                        Import
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {selected === 'spotify' && (
            <section className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <input
                  className="border-border bg-background text-foreground min-w-[200px] flex-1 rounded border px-2 py-1.5 text-sm"
                  value={spotifyQ}
                  onChange={(e) => setSpotifyQ(e.target.value)}
                  placeholder="Search Spotify tracks"
                />
                <Button
                  size="sm"
                  onClick={() => {
                    void searchSpotifyTracks(spotifyQ.trim()).then((r) =>
                      setSpotifyHits(r.data),
                    );
                  }}
                >
                  <SearchIcon size={16} aria-hidden className="mr-1.5" />
                  Search
                </Button>
              </div>
              <ul className="flex flex-col gap-2">
                {spotifyHits.map((t) => (
                  <li
                    key={t.id}
                    className="border-border flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <MediaArtwork
                      size="sm"
                      src={t.artworkUrl}
                      alt={t.name}
                      imageReveal={false}
                      onPlay={() => play(playableFromSpotify(t))}
                      playLabel="Preview"
                      onQueue={() => enqueue(playableFromSpotify(t))}
                      queueLabel="Queue"
                      className="border-border shrink-0 rounded border"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {t.name}
                      </div>
                      <div className="text-foreground-secondary truncate text-xs">
                        {t.artists?.join(', ')}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {selected === 'stash' && (
            <section className="flex flex-col gap-3">
              <h2 className="font-display text-lg font-bold">Files</h2>
              {stash.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  Stash is empty.
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {stash.map((f) => (
                    <li
                      key={f.id}
                      className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <span>{f.filename}</span>
                      <Button
                        size="icon-sm"
                        variant="secondary"
                        title="Play"
                        aria-label="Play"
                        onClick={() => {
                          void fetchStashDownload(f.id).then((r) => {
                            if (r.data?.url) {
                              play({
                                id: `stash:${f.id}`,
                                kind: 'archive',
                                title: f.filename,
                                artist: 'Stash',
                                streamUrl: r.data.url,
                                protocol: 'https',
                                sourceProvider: 'stash',
                              });
                            }
                          });
                        }}
                      >
                        <PlayIcon size={16} className="fill-current" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {selected === 'url' && (
            <section className="flex flex-col gap-3">
              <p className="text-foreground-secondary text-sm">
                Paste a DSP URL to open Studio releases (smart-link targets).
              </p>
              <input
                className="border-border bg-background text-foreground w-full rounded border px-2 py-1.5 text-sm"
                value={urlPaste}
                onChange={(e) => setUrlPaste(e.target.value)}
                placeholder="https://open.spotify.com/track/…"
              />
              <Link to="/studio/releases">
                <Button size="sm">
                  <Link2Icon size={16} aria-hidden className="mr-1.5" />
                  Open releases editor
                </Button>
              </Link>
            </section>
          )}

          {selected === 'radio' && (
            <section className="flex flex-col gap-5">
              <div className="flex flex-col gap-3">
                <p className="text-foreground-secondary text-sm">
                  Paste an M3U/M3U8 playlist or a direct stream URL. Station
                  metadata is looked up in the public Radio Browser directory;
                  live "now playing" is read from the stream's ICY metadata when
                  the server allows it.
                </p>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="border-border bg-background text-foreground min-w-[240px] flex-1 rounded border px-2 py-1.5 text-sm"
                    value={radioUrl}
                    onChange={(e) => setRadioUrl(e.target.value)}
                    placeholder="https://example.com/stream.m3u8"
                  />
                  <Button
                    size="sm"
                    disabled={!radioUrl.trim() || radioBusy}
                    onClick={resolveRadioUrl}
                  >
                    <RadioIcon size={16} aria-hidden className="mr-1.5" />
                    {radioBusy ? 'Resolving…' : 'Resolve'}
                  </Button>
                </div>
                {radioNote && (
                  <p className="text-foreground-secondary text-xs">
                    {radioNote}
                  </p>
                )}
              </div>

              {radioStation && (
                <div className="border-border flex flex-wrap items-center gap-3 rounded-lg border px-3 py-3">
                  <MediaArtwork
                    size="sm"
                    src={radioStation.favicon}
                    alt={radioStation.name}
                    imageReveal={false}
                    onPlay={() =>
                      play(
                        playableFromRadioStation(radioStation, radioNowPlaying),
                      )
                    }
                    playLabel="Play"
                    onQueue={() =>
                      enqueue(
                        playableFromRadioStation(radioStation, radioNowPlaying),
                      )
                    }
                    queueLabel="Queue"
                    className="border-border shrink-0 rounded border"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium">
                      {radioStation.name}
                    </div>
                    <div className="text-foreground-secondary truncate text-xs">
                      {radioNowPlaying
                        ? `Now playing: ${radioNowPlaying}`
                        : radioNowPlaying === null
                          ? 'Live "now playing" unavailable for this stream'
                          : '…'}
                    </div>
                    {radioStation.tags && radioStation.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {radioStation.tags.slice(0, 4).map((tag) => (
                          <Badge key={tag} variant="pill" color="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <h3 className="font-display text-sm font-bold tracking-wide uppercase">
                  Search the public directory
                </h3>
                <div className="flex flex-wrap gap-2">
                  <input
                    className="border-border bg-background text-foreground min-w-[200px] flex-1 rounded border px-2 py-1.5 text-sm"
                    value={radioQuery}
                    onChange={(e) => setRadioQuery(e.target.value)}
                    placeholder="Station name"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      void searchStationsByName(radioQuery.trim()).then(
                        setRadioResults,
                      );
                    }}
                  >
                    <SearchIcon size={16} aria-hidden className="mr-1.5" />
                    Search
                  </Button>
                </div>
                {radioResults.length > 0 && (
                  <ul className="flex flex-col gap-1.5">
                    {radioResults.map((s) => (
                      <li key={s.id}>
                        <button
                          type="button"
                          className="border-border hover:bg-background-secondary flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm"
                          onClick={() => openRadioStation(s)}
                        >
                          <span className="truncate">{s.name}</span>
                          <span className="text-foreground-secondary shrink-0 text-xs">
                            {s.codec}
                            {s.bitrateKbps ? ` ${s.bitrateKbps}kbps` : ''}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <h3 className="font-display text-sm font-bold tracking-wide uppercase">
                  Common stations
                </h3>
                <ul className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {COMMON_STATIONS.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="border-border hover:bg-background-secondary flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm"
                        onClick={() => openRadioStation(s)}
                      >
                        <span className="truncate">{s.name}</span>
                        <span className="text-foreground-secondary shrink-0 text-xs">
                          {s.tags?.[0]}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          {(selected === 'bandcamp' ||
            selected === 'google-drive' ||
            selected === 'mixcloud' ||
            selected === 'broadcast' ||
            selected === 'upload') && (
            <p className="text-foreground-secondary text-sm">
              {selected === 'broadcast' ? (
                <>
                  Promote captures from{' '}
                  <Link
                    to="/studio/go-live"
                    className="underline-offset-2 hover:underline"
                  >
                    Go Live
                  </Link>{' '}
                  or browse Music after a show ends.
                </>
              ) : selected === 'upload' ? (
                <>
                  Use{' '}
                  <Link
                    to="/studio/upload"
                    className="underline-offset-2 hover:underline"
                  >
                    Studio → Upload
                  </Link>{' '}
                  for prepare → PUT → complete.
                </>
              ) : (
                <>
                  Connect above, then use import UIs when list endpoints return
                  data. Mock mode pretends the provider is connected.
                </>
              )}
            </p>
          )}
        </>
      )}
    </PageFrame>
  );
}
