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
} from '@nuclearplayer/ui';

import {
  fetchChannel,
  fetchDirectory,
  fetchRadioStation,
  type FetchMeta,
} from '../api/client';
import type { ChannelDirectoryItem, PublicChannel } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { useAuthStore } from '../stores/authStore';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

export function ListenView() {
  const navigate = useNavigate();
  const [items, setItems] = useState<ChannelDirectoryItem[]>([]);
  const [radio, setRadio] = useState<PublicChannel | null>(null);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('all');
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const toggleFavoriteChannel = useLibraryStore((s) => s.toggleFavoriteChannel);
  const isFavoriteChannel = useLibraryStore((s) => s.isFavoriteChannel);
  const user = useAuthStore((s) => s.user);

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
      setItems(dir.data.items);
      setMeta(dir.meta);
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

  return (
    <PageFrame>
      <PageHeader
        title="Listen"
        subtitle="Tahti channels on Nuclear chrome. Anonymous by default — no account to tune in."
        meta={
          meta
            ? `Data source: ${meta.source}${meta.reason ? ` (${meta.reason})` : ''}`
            : undefined
        }
        actions={
          user?.channel ? (
            <Link to="/studio/go-live">
              <Button size="sm">Go Live</Button>
            </Link>
          ) : undefined
        }
      />

      {radio ? (
        <Box
          variant="secondary"
          className="flex flex-wrap items-center justify-between gap-3"
        >
          <div className="flex min-w-0 items-start gap-3">
            <RadioIcon
              size={20}
              className="text-foreground-secondary mt-0.5 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-bold tracking-tight">
                Tahti Radio
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

      <Input
        label="Search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Channel name, slug, genre…"
        className="max-w-md"
      />

      {genres.length > 0 && (
        <FilterChips items={chipItems} selected={genre} onChange={setGenre} />
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
            const favorited = isFavoriteChannel(ch.slug);
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
                onFavorite={() =>
                  toggleFavoriteChannel({
                    slug: ch.slug,
                    displayName: ch.displayName,
                    avatarUrl: ch.avatarUrl,
                  })
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
    </PageFrame>
  );
}
