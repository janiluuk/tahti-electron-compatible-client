import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { fetchCollection, type FetchMeta } from '../api/client';
import type { PublicCollection, TahtiPlayable } from '../api/types';
import { PlayableTrackTable } from '../components/PlayableTrackTable';

function collectionToPlayables(col: PublicCollection): TahtiPlayable[] {
  const out: TahtiPlayable[] = [];
  for (const item of col.items) {
    const archive = item.archiveItem;
    if (!archive?.audioUrl) {
      continue;
    }
    const isHls = archive.audioUrl.includes('.m3u8');
    out.push({
      id: `archive:${archive.id}`,
      kind: 'archive',
      title: archive.title,
      artist: col.user.displayName,
      coverUrl: archive.bannerUrl ?? col.coverUrl ?? undefined,
      streamUrl: archive.audioUrl,
      protocol: isHls ? 'hls' : 'https',
      channelSlug: archive.channel?.slug,
    });
  }
  return out;
}

export function CollectionView({
  username,
  slug,
}: {
  username: string;
  slug: string;
}) {
  const [collection, setCollection] = useState<PublicCollection | null>(null);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchCollection(slug).then((res) => {
      if (cancelled) {
        return;
      }
      setCollection(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const playables = useMemo(
    () => (collection ? collectionToPlayables(collection) : []),
    [collection],
  );

  if (loading) {
    return (
      <p className="text-foreground-secondary text-sm">Loading collection…</p>
    );
  }

  if (!collection) {
    return <p className="text-sm">Collection not found.</p>;
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <div className="flex flex-wrap gap-3 text-xs">
        <Link to="/" className="text-foreground-secondary hover:underline">
          ← Listen
        </Link>
        <Link
          to="/u/$username"
          params={{ username }}
          className="text-foreground-secondary hover:underline"
        >
          @{username}
        </Link>
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {collection.name}
        </h1>
        <p className="text-foreground-secondary text-sm">
          by{' '}
          <Link
            to="/u/$username"
            params={{ username: collection.user.username }}
            className="hover:text-foreground underline-offset-2 hover:underline"
          >
            {collection.user.displayName}
          </Link>
          {collection.collaborative ? ' (collaborative)' : ''}
        </p>
        {collection.description && (
          <p className="text-foreground max-w-2xl text-sm">
            {collection.description}
          </p>
        )}
        {meta && (
          <p className="text-foreground-secondary text-xs">
            Source: {meta.source}
            {meta.reason ? ` (${meta.reason})` : ''} — API{' '}
            <code>/api/v1/collections/{slug}</code>
          </p>
        )}
      </header>

      <PlayableTrackTable
        items={playables}
        emptyMessage="No playable archive items in this collection (embed-only rows stay silent)."
      />

      {collection.items.some((i) => i.release && !i.archiveItem) && (
        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Linked releases</h2>
          <ul className="text-sm">
            {collection.items
              .filter((i) => i.release)
              .map((i) => (
                <li key={i.release!.id}>
                  {i.release!.smartLinkSlug ? (
                    <Link
                      to="/r/$slug"
                      params={{ slug: i.release!.smartLinkSlug }}
                      className="underline-offset-2 hover:underline"
                    >
                      {i.release!.title}
                    </Link>
                  ) : (
                    i.release!.title
                  )}
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
