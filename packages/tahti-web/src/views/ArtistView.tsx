import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { Button, Card, CardGrid } from '@nuclearplayer/ui';

import { fetchProfile, type FetchMeta } from '../api/client';
import type { PublicProfile, TahtiPlayable } from '../api/types';
import { ChannelDesigner } from '../components/ChannelDesigner';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { useAuthStore } from '../stores/authStore';

type Tab = 'music' | 'releases' | 'collections' | 'design';

function profileTrackToPlayable(
  track: PublicProfile['tracks'][number],
  artist: string,
  channelSlug?: string,
): TahtiPlayable | null {
  if (!track.playUrl) {
    return null;
  }
  const isHls = track.playUrl.includes('.m3u8');
  return {
    id: `archive:${track.id}`,
    kind: 'archive',
    title: track.title,
    artist: track.artistName ?? artist,
    coverUrl: track.bannerUrl ?? undefined,
    streamUrl: track.playUrl,
    protocol: isHls ? 'hls' : 'https',
    channelSlug,
  };
}

export function ArtistView({ username }: { username: string }) {
  const me = useAuthStore((s) => s.user);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('music');

  const isOwner = Boolean(me && me.username === username);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchProfile(username).then((res) => {
      if (cancelled) {
        return;
      }
      setProfile(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  const playables = useMemo(() => {
    if (!profile) {
      return [];
    }
    return profile.tracks
      .map((t) =>
        profileTrackToPlayable(
          t,
          profile.artist.displayName,
          profile.channel?.slug,
        ),
      )
      .filter((p): p is TahtiPlayable => Boolean(p));
  }, [profile]);

  if (loading) {
    return <p className="text-foreground-secondary text-sm">Loading artist…</p>;
  }

  if (!profile) {
    return <p className="text-sm">Artist not found.</p>;
  }

  const { artist, channel, releases, collections, fanTiers } = profile;

  const tabs: Array<{ id: Tab; label: string }> = [
    { id: 'music', label: 'Music' },
    { id: 'releases', label: 'Releases' },
    { id: 'collections', label: 'Collections' },
    ...(isOwner ? [{ id: 'design' as const, label: 'Design' }] : []),
  ];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <Link
        to="/"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Listen
      </Link>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              {artist.displayName}
            </h1>
            <p className="text-foreground-secondary text-sm">
              @{artist.username}
            </p>
          </div>
          {isOwner && channel?.slug ? (
            <Link
              to="/channel/$slug"
              params={{ slug: channel.slug }}
              search={{ edit: '1' }}
            >
              <Button size="sm" variant="secondary">
                Edit design
              </Button>
            </Link>
          ) : isOwner ? (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setTab('design')}
            >
              Edit look
            </Button>
          ) : null}
        </div>
        {artist.bio && (
          <p className="text-foreground mt-2 max-w-2xl text-sm whitespace-pre-wrap">
            {artist.bio}
          </p>
        )}
        {meta && (
          <p className="text-foreground-secondary text-xs">
            Source: {meta.source}
            {meta.reason ? ` (${meta.reason})` : ''}
          </p>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-sm">
          {channel && (
            <Link
              to="/channel/$slug"
              params={{ slug: channel.slug }}
              className="text-foreground underline-offset-2 hover:underline"
            >
              Open channel ({channel.state})
            </Link>
          )}
          <Link
            to="/subscribe/$username"
            params={{ username: artist.username }}
            className="text-foreground-secondary underline-offset-2 hover:underline"
          >
            Subscribe
          </Link>
          {isOwner && (
            <Link
              to="/studio/channel"
              className="text-foreground-secondary underline-offset-2 hover:underline"
            >
              Full studio settings
            </Link>
          )}
        </div>
      </header>

      {fanTiers.length > 0 && (
        <p className="text-foreground-secondary text-xs">
          Fan tiers:{' '}
          {fanTiers
            .map((t) => `${t.name} (€${(t.amountCents / 100).toFixed(0)})`)
            .join(', ')}
        </p>
      )}

      <nav className="border-border flex flex-wrap gap-2 border-b pb-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
              tab === t.id
                ? 'bg-primary text-foreground'
                : 'border-border text-foreground-secondary hover:text-foreground border'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === 'music' && (
        <section className="flex flex-col gap-3">
          <PlayableTrackTable
            items={playables}
            emptyMessage="No playable tracks on this profile."
          />
        </section>
      )}

      {tab === 'releases' && (
        <section className="flex flex-col gap-3">
          {releases.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No published releases.
            </p>
          ) : (
            <CardGrid>
              {releases.map((rel) => (
                <div key={rel.id} className="flex flex-col gap-2">
                  {rel.smartLinkSlug ? (
                    <Link to="/r/$slug" params={{ slug: rel.smartLinkSlug }}>
                      <Card
                        title={rel.title}
                        subtitle={rel.type ?? 'Release'}
                        src={rel.artworkUrl ?? undefined}
                      />
                    </Link>
                  ) : (
                    <Card
                      title={rel.title}
                      subtitle={rel.type ?? 'Release'}
                      src={rel.artworkUrl ?? undefined}
                    />
                  )}
                </div>
              ))}
            </CardGrid>
          )}
        </section>
      )}

      {tab === 'collections' && (
        <section className="flex flex-col gap-3">
          {collections.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No public collections.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {collections.map((col) => (
                <li
                  key={col.slug}
                  className="border-border flex items-center justify-between gap-3 rounded-lg border px-4 py-3"
                >
                  <div>
                    <Link
                      to="/u/$username/c/$slug"
                      params={{ username: artist.username, slug: col.slug }}
                      className="font-medium underline-offset-2 hover:underline"
                    >
                      {col.name}
                    </Link>
                    <div className="text-foreground-secondary text-xs">
                      {col.itemCount} items
                      {col.isFeatured ? ', featured' : ''}
                    </div>
                  </div>
                  <span className="text-foreground-secondary text-xs uppercase">
                    {col.type}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {tab === 'design' && isOwner && (
        <div className="flex flex-col gap-3">
          {channel?.slug ? (
            <p className="text-foreground-secondary text-sm">
              Full layout editing (layers, hide/add, drag) lives on the{' '}
              <Link
                to="/channel/$slug"
                params={{ slug: channel.slug }}
                search={{ edit: '1' }}
                className="underline-offset-2 hover:underline"
              >
                channel page
              </Link>
              . Quick look controls below.
            </p>
          ) : null}
          <ChannelDesigner
            displayName={artist.displayName}
            username={artist.username}
            channelSlug={channel?.slug}
            avatarUrl={artist.avatarUrl}
            bio={artist.bio}
            compact
          />
        </div>
      )}
    </div>
  );
}
