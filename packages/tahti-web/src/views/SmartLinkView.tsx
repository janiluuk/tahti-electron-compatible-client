import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Card, CardGrid } from '@nuclearplayer/ui';

import { fetchProfile, fetchSmartLink } from '../api/client';
import type {
  SmartLinkView as SmartLinkData,
  TahtiPlayable,
} from '../api/types';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { usePlayerStore } from '../stores/playerStore';

export function SmartLinkView({ slug }: { slug: string }) {
  const [data, setData] = useState<SmartLinkData | null>(null);
  const [playables, setPlayables] = useState<TahtiPlayable[]>([]);
  const [loading, setLoading] = useState(true);
  const play = usePlayerStore((s) => s.play);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchSmartLink(slug).then(async (res) => {
      if (cancelled) {
        return;
      }
      setData(res.data);

      // Smart-link payload has track titles only; resolve play URLs via artist profile.
      try {
        const profile = await fetchProfile(res.data.artist.username);
        const matched = profile.data.releases.find(
          (r) => r.smartLinkSlug === slug || r.id === res.data.release.id,
        );
        const fromRelease =
          matched?.tracks
            ?.filter((t) => t.playUrl)
            .map(
              (t): TahtiPlayable => ({
                id: `archive:${t.archiveItemId ?? `${matched.id}-${t.position}`}`,
                kind: 'archive',
                title: t.title,
                artist: res.data.artist.displayName,
                coverUrl: matched.artworkUrl ?? undefined,
                streamUrl: t.playUrl!,
                protocol: t.playUrl!.includes('.m3u8') ? 'hls' : 'https',
                channelSlug: profile.data.channel?.slug,
              }),
            ) ?? [];
        if (!cancelled) {
          setPlayables(fromRelease);
        }
      } catch {
        if (!cancelled) {
          setPlayables([]);
        }
      }
      if (!cancelled) {
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <p className="text-foreground-secondary text-sm">Loading smart link…</p>
    );
  }

  if (!data) {
    return <p className="text-sm">Release not found.</p>;
  }

  const targets = Object.entries(data.targets);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Listen
      </Link>

      <header className="flex flex-col gap-2">
        <p className="text-foreground-secondary text-xs uppercase">
          Smart link
        </p>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {data.release.title}
        </h1>
        <p className="text-foreground-secondary text-sm">
          <Link
            to="/u/$username"
            params={{ username: data.artist.username }}
            className="hover:text-foreground underline-offset-2 hover:underline"
          >
            {data.artist.displayName}
          </Link>
          {data.release.type ? ` — ${data.release.type}` : ''}
        </p>
        {data.release.description && (
          <p className="text-foreground mt-2 text-sm whitespace-pre-wrap">
            {data.release.description}
          </p>
        )}
      </header>

      {playables.length > 0 ? (
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-display text-lg font-bold">Listen here</h2>
            <Button
              size="sm"
              onClick={() => {
                const [head, ...rest] = playables;
                if (head) {
                  play(head, { enqueueRest: rest });
                }
              }}
            >
              Play all
            </Button>
          </div>
          <PlayableTrackTable items={playables} />
        </section>
      ) : (
        <p className="text-foreground-secondary text-sm">
          No stream URLs on this smart link (DSP targets only). Open the artist
          profile or an external store below.
        </p>
      )}

      {targets.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Also on</h2>
          <ul className="flex flex-col gap-1 text-sm">
            {targets.map(([name, url]) => (
              <li key={name}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="underline-offset-2 hover:underline"
                >
                  {name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.featuredCollections.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold">
            Featured collections
          </h2>
          <CardGrid>
            {data.featuredCollections.map((col) => (
              <Link
                key={col.slug}
                to="/u/$username/c/$slug"
                params={{ username: data.artist.username, slug: col.slug }}
              >
                <Card
                  title={col.name}
                  subtitle={
                    col.itemCount != null
                      ? `${col.itemCount} items`
                      : 'Collection'
                  }
                  src={col.coverUrl ?? undefined}
                />
              </Link>
            ))}
          </CardGrid>
        </section>
      )}
    </div>
  );
}
