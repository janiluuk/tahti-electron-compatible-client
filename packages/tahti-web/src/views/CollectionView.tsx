import { Link } from '@tanstack/react-router';
import { useEffect, useMemo, useState } from 'react';

import { fetchCollection } from '../api/client';
import type {
  CollectionArchiveItem,
  PublicCollection,
  TahtiPlayable,
} from '../api/types';
import { EmbedTrackRow } from '../components/EmbedTrackRow';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { Eyebrow } from '../components/tahti/Eyebrow';
import type { EmbedProvider } from '../lib/embedSrc';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchCollection(slug).then((res) => {
      if (cancelled) {
        return;
      }
      setCollection(res.data);
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

  // Items Tahti references but never hosts — only the provider's own
  // widget can play them, so they can't go through the track table.
  const embedItems = useMemo(() => {
    if (!collection) {
      return [];
    }
    const out: { archive: CollectionArchiveItem; provider: EmbedProvider }[] =
      [];
    for (const item of collection.items) {
      const archive = item.archiveItem;
      if (
        archive &&
        !archive.audioUrl &&
        archive.embedProvider &&
        archive.embedUri
      ) {
        out.push({ archive, provider: archive.embedProvider });
      }
    }
    return out;
  }, [collection]);

  if (loading) {
    return (
      <p className="text-foreground-secondary text-sm">Loading collection…</p>
    );
  }

  if (!collection) {
    return <p className="text-sm">Collection not found.</p>;
  }

  return (
    <PageFrame>
      <PageHeader
        title={collection.name}
        back={
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
        }
        subtitle={
          <>
            by{' '}
            <Link
              to="/u/$username"
              params={{ username: collection.user.username }}
              className="hover:text-foreground underline-offset-2 hover:underline"
            >
              {collection.user.displayName}
            </Link>
            {collection.collaborative ? ' (collaborative)' : ''}
          </>
        }
        meta={collection.description}
      />

      {playables.length > 0 && <PlayableTrackTable items={playables} />}

      {embedItems.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2>
            <Eyebrow>Elsewhere</Eyebrow>
          </h2>
          <ul className="flex flex-col gap-2">
            {embedItems.map(({ archive, provider }) => (
              <EmbedTrackRow
                key={archive.id}
                title={archive.title}
                provider={provider}
                embedUri={archive.embedUri!}
              />
            ))}
          </ul>
        </section>
      )}

      {playables.length === 0 && embedItems.length === 0 && (
        <p className="text-foreground-secondary text-sm">
          No tracks in this collection yet.
        </p>
      )}

      {collection.items.some((i) => i.release && !i.archiveItem) && (
        <section className="flex flex-col gap-2">
          <h2>
            <Eyebrow>Linked releases</Eyebrow>
          </h2>
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
    </PageFrame>
  );
}
