import { Link } from '@tanstack/react-router';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Input, SectionShell } from '@nuclearplayer/ui';

import { fetchProfile } from '../api/client';
import type {
  PublicProfile,
  PublicProfileRelease,
  TahtiPlayable,
} from '../api/types';
import {
  MediaIconActions,
  playQueueFavoriteActions,
} from '../components/MediaIconActions';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import {
  releasePlayables,
  ReleaseTracklistDialog,
} from '../components/ReleaseTracklistDialog';
import { useAuthStore } from '../stores/authStore';
import { usePlayerStore } from '../stores/playerStore';
import { profileTrackToPlayable } from './ArtistView';

type SortKey = 'title' | 'type' | 'date';
type SortDir = 'asc' | 'desc';

function formatReleaseDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function SortHeader({
  label,
  sortKey,
  active,
  dir,
  onClick,
}: {
  label: string;
  sortKey: SortKey;
  active: boolean;
  dir: SortDir;
  onClick: (key: SortKey) => void;
}) {
  return (
    <button
      type="button"
      className="text-foreground-secondary hover:text-foreground flex items-center gap-1 text-left text-xs font-semibold tracking-wide uppercase"
      onClick={() => onClick(sortKey)}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      {label}
      {active &&
        (dir === 'asc' ? (
          <ArrowUpIcon size={12} aria-hidden />
        ) : (
          <ArrowDownIcon size={12} aria-hidden />
        ))}
    </button>
  );
}

export function MyDiscographyView() {
  const user = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [tracklistRelease, setTracklistRelease] =
    useState<PublicProfileRelease | null>(null);

  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);

  useEffect(() => {
    if (!user?.username) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void fetchProfile(user.username).then((res) => {
      if (!cancelled) {
        setProfile(res.data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  const setSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'date' ? 'desc' : 'asc');
    }
  };

  const artist = profile?.artist.displayName ?? '';
  const slug = profile?.channel?.slug;

  const sortedReleases = useMemo(() => {
    if (!profile) {
      return [];
    }
    const q = query.trim().toLowerCase();
    const filtered = q
      ? profile.releases.filter(
          (r) =>
            r.title.toLowerCase().includes(q) ||
            (r.type ?? '').toLowerCase().includes(q),
        )
      : profile.releases;
    const sign = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return sign * a.title.localeCompare(b.title);
        case 'type':
          return sign * (a.type ?? '').localeCompare(b.type ?? '');
        case 'date':
        default:
          return (
            sign * (a.releaseDate ?? '').localeCompare(b.releaseDate ?? '')
          );
      }
    });
  }, [profile, query, sortKey, sortDir]);

  const catalogPlayables = useMemo(() => {
    if (!profile) {
      return [];
    }
    return profile.tracks
      .map((t) => profileTrackToPlayable(t, artist, slug))
      .filter((p): p is TahtiPlayable => Boolean(p));
  }, [profile, artist, slug]);

  if (!user?.channel) {
    return (
      <PageEmpty
        title="No discography yet"
        description="Go live or upload a release to get an artist channel — your releases and catalog will show up here."
        action={
          <Link to="/studio/go-live">
            <Button size="sm" variant="secondary">
              Go to Studio
            </Button>
          </Link>
        }
      />
    );
  }

  if (loading) {
    return <PageLoading label="Loading your discography…" />;
  }

  if (!profile) {
    return <p className="text-sm">Couldn&apos;t load your discography.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionShell title="Releases">
        {profile.releases.length === 0 ? (
          <PageEmpty
            title="No releases yet"
            description="Publish a release in Studio to see it here."
            action={
              <Link to="/studio/releases">
                <Button size="sm" variant="secondary">
                  Studio → Releases
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="flex flex-col gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search releases…"
              className="max-w-xs"
              aria-label="Search releases"
            />

            {sortedReleases.length === 0 ? (
              <p className="text-foreground-secondary text-sm">
                No releases match “{query}”.
              </p>
            ) : (
              <div className="border-border overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-border bg-background-secondary border-b">
                      <th className="w-12 px-3 py-2" />
                      <th className="px-3 py-2 text-left">
                        <SortHeader
                          label="Title"
                          sortKey="title"
                          active={sortKey === 'title'}
                          dir={sortDir}
                          onClick={setSort}
                        />
                      </th>
                      <th className="hidden px-3 py-2 text-left sm:table-cell">
                        <SortHeader
                          label="Type"
                          sortKey="type"
                          active={sortKey === 'type'}
                          dir={sortDir}
                          onClick={setSort}
                        />
                      </th>
                      <th className="hidden px-3 py-2 text-left md:table-cell">
                        <SortHeader
                          label="Released"
                          sortKey="date"
                          active={sortKey === 'date'}
                          dir={sortDir}
                          onClick={setSort}
                        />
                      </th>
                      <th className="w-24 px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReleases.map((rel, i) => {
                      const playables = releasePlayables(rel, artist, slug);
                      return (
                        <tr
                          key={rel.id}
                          className={`border-border border-b last:border-b-0 ${
                            i % 2 === 1 ? 'bg-background-secondary/40' : ''
                          }`}
                        >
                          <td className="px-3 py-2">
                            <div className="bg-surface-secondary flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
                              {rel.artworkUrl ? (
                                <img
                                  src={rel.artworkUrl}
                                  alt=""
                                  className="size-full object-cover"
                                />
                              ) : (
                                rel.title.slice(0, 2).toUpperCase()
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              type="button"
                              className="truncate text-left font-medium hover:underline"
                              onClick={() => setTracklistRelease(rel)}
                            >
                              {rel.title}
                            </button>
                          </td>
                          <td className="text-foreground-secondary hidden px-3 py-2 sm:table-cell">
                            {rel.type ?? 'Release'}
                          </td>
                          <td className="text-foreground-secondary hidden px-3 py-2 md:table-cell">
                            {formatReleaseDate(rel.releaseDate)}
                          </td>
                          <td className="px-3 py-2">
                            <MediaIconActions
                              actions={playQueueFavoriteActions({
                                onPlay: () => {
                                  const [head, ...rest] = playables;
                                  if (head) {
                                    play(head, { enqueueRest: rest });
                                  }
                                },
                                onQueue: () => {
                                  for (const p of playables) {
                                    enqueue(p);
                                  }
                                },
                                playDisabled: playables.length === 0,
                                queueDisabled: playables.length === 0,
                                playLabel: `Play ${rel.title}`,
                                queueLabel: `Queue ${rel.title}`,
                              })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </SectionShell>

      <SectionShell title="Catalog">
        <PlayableTrackTable
          items={catalogPlayables}
          emptyMessage="No playable tracks yet."
        />
      </SectionShell>

      <ReleaseTracklistDialog
        isOpen={Boolean(tracklistRelease)}
        onClose={() => setTracklistRelease(null)}
        release={tracklistRelease}
        artistName={artist}
        channelSlug={slug}
      />
    </div>
  );
}
