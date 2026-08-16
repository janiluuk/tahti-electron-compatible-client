import { Link, useNavigate } from '@tanstack/react-router';
import { PlayIcon, RadioIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Button,
  Card,
  CardGrid,
  FilterChips,
  Input,
  SectionShell,
} from '@nuclearplayer/ui';

import {
  fetchChannel,
  fetchDirectory,
  fetchRadioStation,
  TAHTI_RADIO_SLUG,
} from '../api/client';
import type { ChannelDirectoryItem, PublicChannel } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { useAuthStore } from '../stores/authStore';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

const LIBRARY_PREVIEW_CHANNELS = 8;
const LIBRARY_PREVIEW_TRACKS = 6;
const LIBRARY_PREVIEW_HISTORY = 5;

export function ListenView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChannelDirectoryItem[]>([]);
  const [radio, setRadio] = useState<PublicChannel | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const toggleFavoriteChannel = useLibraryStore((s) => s.toggleFavoriteChannel);
  const isFavoriteChannel = useLibraryStore((s) => s.isFavoriteChannel);
  const favoriteChannels = useLibraryStore((s) => s.favoriteChannels);
  const favoriteTracks = useLibraryStore((s) => s.favoriteTracks);
  const history = useLibraryStore((s) => s.history);
  const user = useAuthStore((s) => s.user);
  const signedIn = Boolean(user);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void Promise.all([
      fetchDirectory(),
      fetchRadioStation().catch(() => null),
    ]).then(([dir, station]) => {
      if (cancelled) {
        return;
      }
      // Featured radio slot owns tahti-radio — drop it from the grid so it
      // does not appear twice (directory card often lacks the station logo).
      setItems(dir.data.items.filter((ch) => ch.slug !== TAHTI_RADIO_SLUG));
      setRadio(station?.data ?? null);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const genres = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ch of items) {
      for (const g of ch.genres) {
        const key = g.trim();
        if (!key) {
          continue;
        }
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([name, count]) => ({ name, count }));
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((ch) => {
      if (
        genre !== 'all' &&
        !ch.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
      ) {
        return false;
      }
      if (!q) {
        return true;
      }
      return (
        ch.displayName.toLowerCase().includes(q) ||
        ch.slug.toLowerCase().includes(q) ||
        ch.genres.some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [items, query, genre]);

  const playNow = async (slug: string) => {
    const { playable } = await fetchChannel(slug);
    if (playable) {
      play(playable);
    }
  };

  const add = async (slug: string) => {
    const { playable } = await fetchChannel(slug);
    if (playable) {
      enqueue(playable);
    }
  };

  const chipItems = useMemo(
    () => [
      { id: 'all', label: `All (${items.length})` },
      ...genres.map((g) => ({ id: g.name, label: `${g.name} (${g.count})` })),
    ],
    [genres, items.length],
  );

  const radioLogo =
    radio?.user.avatarUrl ?? radio?.nowPlaying?.artworkUrl ?? null;
  const radioName = radio?.user.displayName ?? 'Tahti Radio';

  const libraryChannels = favoriteChannels.slice(0, LIBRARY_PREVIEW_CHANNELS);
  const libraryTracks = favoriteTracks.slice(0, LIBRARY_PREVIEW_TRACKS);
  const recentHistory = history.slice(0, LIBRARY_PREVIEW_HISTORY);
  const hasLibraryContent =
    libraryChannels.length > 0 ||
    libraryTracks.length > 0 ||
    recentHistory.length > 0;

  return (
    <PageFrame>
      <PageHeader
        title="Listen"
        subtitle={
          signedIn
            ? 'Your library up top — then discover community channels.'
            : 'Discover Tahti channels. Sign in to see your library here.'
        }
        actions={
          user?.channel ? (
            <Link to="/studio/go-live">
              <Button size="sm">Go Live</Button>
            </Link>
          ) : undefined
        }
      />

      {signedIn ? (
        <section className="mb-6 flex w-full flex-col gap-3">
          <div className="flex w-full flex-wrap items-center justify-between gap-2">
            <h2 className="text-2xl font-bold">My Library</h2>
            <Link to="/library">
              <Button size="sm" variant="secondary">
                Open library
              </Button>
            </Link>
          </div>
          {!hasLibraryContent ? (
            <PageEmpty
              title="Nothing saved yet"
              description="Heart channels while browsing, or open Library for favorites, history, and messages."
              action={
                <Link to="/library">
                  <Button size="sm" variant="secondary">
                    My Library
                  </Button>
                </Link>
              }
            />
          ) : (
            <div className="flex flex-col gap-5">
              {libraryChannels.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
                      Favorite channels
                    </h3>
                    {favoriteChannels.length > LIBRARY_PREVIEW_CHANNELS ? (
                      <Link
                        to="/library"
                        className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                      >
                        +{favoriteChannels.length - LIBRARY_PREVIEW_CHANNELS}{' '}
                        more
                      </Link>
                    ) : null}
                  </div>
                  <CardGrid>
                    {libraryChannels.map((ch) => (
                      <Card
                        key={ch.slug}
                        title={
                          <Link
                            to="/channel/$slug"
                            params={{ slug: ch.slug }}
                            className="hover:underline"
                          >
                            {ch.displayName}
                          </Link>
                        }
                        subtitle={ch.slug}
                        src={ch.avatarUrl ?? undefined}
                        onPlay={() => void playNow(ch.slug)}
                        onQueue={() => void add(ch.slug)}
                        favorited
                        onFavorite={() => toggleFavoriteChannel(ch)}
                        onClick={() => {
                          void navigate({
                            to: '/channel/$slug',
                            params: { slug: ch.slug },
                          });
                        }}
                      />
                    ))}
                  </CardGrid>
                </div>
              ) : null}

              {libraryTracks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <h3 className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
                    Favorite tracks
                  </h3>
                  <PlayableTrackTable
                    items={libraryTracks}
                    emptyMessage="No favorite tracks."
                  />
                </div>
              ) : null}

              {recentHistory.length > 0 ? (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-foreground-secondary text-xs font-semibold tracking-wide uppercase">
                      Recently played
                    </h3>
                    <Link
                      to="/library/history"
                      className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                    >
                      Full history
                    </Link>
                  </div>
                  <ul className="border-border divide-border divide-y overflow-hidden rounded-lg border">
                    {recentHistory.map((entry) => (
                      <li
                        key={`${entry.playable.id}-${entry.playedAt}`}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {entry.playable.title}
                          </div>
                          <div className="text-foreground-secondary truncate text-xs">
                            {entry.playable.artist ?? 'Unknown'}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => play(entry.playable)}
                        >
                          Play
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </section>
      ) : null}

      {radio ? (
        <Box
          variant="secondary"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex min-w-0 items-start gap-3">
            <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg text-sm font-bold tracking-tight">
              {radioLogo ? (
                <img
                  src={radioLogo}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                <RadioIcon size={20} className="text-foreground-secondary" />
              )}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-tight">
                {radioName}
              </div>
              <p className="text-foreground-secondary text-xs">
                {radio.hlsUrl
                  ? (radio.nowPlaying?.title ?? '24/7 community stream')
                  : 'Temporarily offline'}
                {radio.nowPlaying?.artistName
                  ? ` · ${radio.nowPlaying.artistName}`
                  : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="icon-sm"
              disabled={!radio.hlsUrl}
              title="Play Radio"
              aria-label="Play Radio"
              onClick={() => {
                void fetchRadioStation().then(({ playable }) => {
                  if (playable) {
                    play(playable);
                  }
                });
              }}
            >
              <PlayIcon size={16} className="fill-current" />
            </Button>
            <Link to="/radio">
              <Button size="sm" variant="secondary">
                Open radio
              </Button>
            </Link>
          </div>
        </Box>
      ) : null}

      <SectionShell title={signedIn ? 'Discover' : 'Channels'}>
        <div className="flex flex-col gap-4">
          <Input
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Channel name, slug, genre…"
            className="max-w-md"
          />

          {genres.length > 0 && (
            <FilterChips
              items={chipItems}
              selected={genre}
              onChange={setGenre}
            />
          )}

          <p className="text-foreground-secondary text-xs">
            Showing {filtered.length} of {items.length} channels
          </p>

          {loading ? (
            <PageLoading label="Loading channels…" />
          ) : filtered.length === 0 ? (
            <PageEmpty
              title="No channels match"
              description={`${query ? `“${query}”` : 'Try another filter'}${genre !== 'all' ? ` in ${genre}` : ''}.`}
            />
          ) : (
            <CardGrid>
              {filtered.map((ch) => {
                const favorited = signedIn && isFavoriteChannel(ch.slug);
                return (
                  <Card
                    key={ch.slug}
                    title={
                      <Link
                        to="/channel/$slug"
                        params={{ slug: ch.slug }}
                        className="hover:underline"
                      >
                        {ch.displayName}
                      </Link>
                    }
                    subtitle={ch.genres.slice(0, 2).join(', ') || ch.slug}
                    src={ch.avatarUrl ?? undefined}
                    onPlay={() => void playNow(ch.slug)}
                    onQueue={() => void add(ch.slug)}
                    onFavorite={
                      signedIn
                        ? () =>
                            toggleFavoriteChannel({
                              slug: ch.slug,
                              displayName: ch.displayName,
                              avatarUrl: ch.avatarUrl,
                            })
                        : undefined
                    }
                    favorited={favorited}
                    onClick={() => {
                      void navigate({
                        to: '/channel/$slug',
                        params: { slug: ch.slug },
                      });
                    }}
                  />
                );
              })}
            </CardGrid>
          )}
        </div>
      </SectionShell>
    </PageFrame>
  );
}
