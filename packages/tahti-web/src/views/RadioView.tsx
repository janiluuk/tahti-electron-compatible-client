import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Box, Button } from '@nuclearplayer/ui';

import {
  fetchRadio,
  fetchRadioRecentlyPlayed,
  fetchRadioStation,
  TAHTI_RADIO_SLUG,
} from '../api/client';
import type {
  PublicChannel,
  RadioNowPlaying,
  RadioRecentlyPlayedItem,
} from '../api/types';
import { ChannelVisualizer } from '../components/ChannelVisualizer';
import {
  MediaIconActions,
  playQueueFavoriteActions,
} from '../components/MediaIconActions';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { TrackInfoDialog, type TrackInfo } from '../components/TrackInfoDialog';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

function formatAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 1) {
    return 'just now';
  }
  if (mins < 60) {
    return `${mins}m ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  return `${Math.floor(hours / 24)}d ago`;
}

export function RadioView() {
  const [station, setStation] = useState<PublicChannel | null>(null);
  const [relay, setRelay] = useState<RadioNowPlaying | null>(null);
  const [recent, setRecent] = useState<RadioRecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [infoTrack, setInfoTrack] = useState<TrackInfo | null>(null);

  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const toggleFavoriteChannel = useLibraryStore((s) => s.toggleFavoriteChannel);
  const isFavoriteChannel = useLibraryStore((s) => s.isFavoriteChannel);

  const reload = () => {
    setLoading(true);
    void Promise.all([
      fetchRadioStation().catch(() => null),
      fetchRadio(),
      fetchRadioRecentlyPlayed(),
    ]).then(([ch, memberRelay, recentRes]) => {
      setStation(ch?.data ?? null);
      setRelay(memberRelay.data);
      setRecent(recentRes.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const favorited = isFavoriteChannel(TAHTI_RADIO_SLUG);
  const online = Boolean(station?.hlsUrl);
  const nowPlaying = station?.nowPlaying;
  const stationLogo =
    station?.user.avatarUrl ?? station?.nowPlaying?.artworkUrl ?? null;
  const memberLive =
    relay?.live && relay.channel
      ? {
          slug: relay.channel.slug,
          name: relay.channel.displayName ?? relay.channel.slug,
          title: relay.channel.title,
        }
      : null;

  const playStation = () => {
    void fetchRadioStation().then(({ playable }) => {
      if (playable) {
        play(playable);
      }
    });
  };

  const queueStation = () => {
    void fetchRadioStation().then(({ playable }) => {
      if (playable) {
        enqueue(playable);
      }
    });
  };

  return (
    <PageFrame maxWidth="3xl">
      <PageHeader
        title="Tahti Radio"
        subtitle="24/7 community radio — always on. Fair rotation when nobody is booked."
      />

      {loading ? (
        <PageLoading label="Tuning Tahti Radio…" />
      ) : !station ? (
        <PageEmpty
          icon="radio"
          title="Radio unavailable"
          description="Could not load the Tahti Radio station. Try again in a moment."
          action={
            <Button size="sm" variant="secondary" onClick={reload}>
              Refresh
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          <header className="flex flex-wrap items-start gap-4">
            <div className="bg-surface-secondary flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl text-lg font-bold tracking-tight">
              {stationLogo ? (
                <img
                  src={stationLogo}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                'TR'
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-foreground text-2xl font-bold tracking-tight">
                {station.user.displayName}
              </div>
              <div className="text-foreground-secondary text-sm">
                @{TAHTI_RADIO_SLUG}
                {online ? (
                  <span className="text-foreground-secondary ml-2 text-xs tracking-wide uppercase">
                    · On air
                  </span>
                ) : (
                  <span className="ml-2 text-xs tracking-wide text-amber-500 uppercase">
                    · Offline
                  </span>
                )}
              </div>
              {station.user.bio ? (
                <p className="text-foreground-secondary mt-2 max-w-2xl text-sm whitespace-pre-wrap">
                  {station.user.bio}
                </p>
              ) : null}
            </div>
          </header>

          {memberLive ? (
            <Box variant="secondary" className="text-sm">
              <span className="mr-1" aria-hidden>
                🔴
              </span>
              Live now on the member relay: <strong>{memberLive.name}</strong>
              {memberLive.title ? ` — ${memberLive.title}` : null}
              {' · '}
              <Link
                to="/channel/$slug"
                params={{ slug: memberLive.slug }}
                className="underline-offset-2 hover:underline"
              >
                Open {memberLive.slug}
              </Link>
            </Box>
          ) : null}

          {!online ? (
            <PageEmpty
              icon="radio"
              title="Tahti Radio is temporarily offline"
              description="Browse live channels or check back soon."
              action={
                <div className="flex flex-wrap gap-2">
                  <Link to="/">
                    <Button size="sm" variant="secondary">
                      Browse listen
                    </Button>
                  </Link>
                  <Button size="sm" variant="secondary" onClick={reload}>
                    Refresh
                  </Button>
                </div>
              }
            />
          ) : (
            <Box
              variant="secondary"
              className="relative overflow-hidden rounded-xl"
            >
              <div className="absolute inset-0 opacity-40">
                <ChannelVisualizer
                  preset={station.visualPreset ?? 'REACTIVE_GRID'}
                  colorSchemeJson={station.colorSchemeJson}
                  className="h-full min-h-[160px] w-full"
                />
              </div>
              <div className="relative z-10 flex flex-col gap-4 p-4 sm:p-5">
                <div>
                  <div className="text-foreground-secondary text-xs tracking-wide uppercase">
                    Now playing
                  </div>
                  {nowPlaying?.title ? (
                    <button
                      type="button"
                      onClick={() =>
                        setInfoTrack({
                          title: nowPlaying.title,
                          artistName: nowPlaying.artistName ?? 'Tahti Radio',
                          artistUsername: nowPlaying.artistUsername ?? null,
                          artworkUrl: nowPlaying.artworkUrl ?? null,
                          meta: 'Live now',
                        })
                      }
                      className="text-foreground mt-1 text-left text-xl font-bold tracking-tight underline-offset-4 hover:underline"
                    >
                      {nowPlaying.title}
                    </button>
                  ) : (
                    <div className="text-foreground mt-1 text-xl font-bold tracking-tight">
                      Tahti Radio
                    </div>
                  )}
                  <div className="text-foreground-secondary mt-0.5 text-sm">
                    {nowPlaying?.artistUsername ? (
                      <Link
                        to="/u/$username"
                        params={{ username: nowPlaying.artistUsername }}
                        className="underline-offset-2 hover:underline"
                      >
                        {nowPlaying.artistName}
                      </Link>
                    ) : (
                      (nowPlaying?.artistName ?? '24/7 rotation')
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-start gap-3">
                  <MediaIconActions
                    actions={playQueueFavoriteActions({
                      onPlay: playStation,
                      onQueue: queueStation,
                      onFavorite: () =>
                        toggleFavoriteChannel({
                          slug: TAHTI_RADIO_SLUG,
                          displayName: station.user.displayName,
                          avatarUrl: station.user.avatarUrl,
                        }),
                      favorited,
                      playLabel: 'Play Radio',
                      queueLabel: 'Queue',
                    })}
                  />
                  <Link to="/channel/$slug" params={{ slug: TAHTI_RADIO_SLUG }}>
                    <Button size="sm" variant="secondary">
                      Open channel
                    </Button>
                  </Link>
                </div>
              </div>
            </Box>
          )}

          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold tracking-tight">
              Recently played
            </h2>
            {recent.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                No recent plays logged yet.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {recent.map((item) => (
                  <li
                    key={item.id}
                    className="border-border flex items-center gap-3 rounded-lg border px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setInfoTrack({
                          title: item.title,
                          artistName: item.artistName,
                          artistUsername: item.artistUsername,
                          artworkUrl: item.artworkUrl,
                          meta: formatAgo(item.playedAt),
                        })
                      }
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <div className="bg-surface-secondary flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
                        {item.artworkUrl ? (
                          <img
                            src={item.artworkUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          item.title.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium underline-offset-2 hover:underline">
                          {item.title}
                        </div>
                        <div className="text-foreground-secondary truncate text-xs">
                          {item.artistName}
                        </div>
                      </div>
                    </button>
                    <span className="text-foreground-secondary shrink-0 text-xs">
                      {formatAgo(item.playedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-foreground-secondary text-xs">
            Prefer a single artist?{' '}
            <Link to="/" className="underline-offset-2 hover:underline">
              Browse the listen directory
            </Link>{' '}
            (e.g.{' '}
            <Link
              to="/channel/$slug"
              params={{ slug: 'northern-lights' }}
              className="underline-offset-2 hover:underline"
            >
              northern-lights
            </Link>
            ).
          </p>
        </div>
      )}

      <TrackInfoDialog
        isOpen={Boolean(infoTrack)}
        onClose={() => setInfoTrack(null)}
        track={infoTrack}
      />
    </PageFrame>
  );
}
