import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchFeed } from '../api/client';
import type { FeedItem } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';
import { PageEmpty, PageLoading } from '../components/PageStates';
import { TrackInfoDialog, type TrackInfo } from '../components/TrackInfoDialog';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';

function formatFeedDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
}

function feedBadge(item: FeedItem): string {
  if (item.kind === 'post') {
    return 'posted';
  }
  if (item.kind === 'track') {
    return 'shared a track';
  }
  return `released a ${item.releaseType.replace(/_/g, ' ').toLowerCase()}`;
}

function ArtistAvatar({ name, src }: { name: string; src: string | null }) {
  return (
    <div className="bg-surface-secondary flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold">
      {src ? (
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </div>
  );
}

export function FeedView() {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [followingCount, setFollowingCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [infoTrack, setInfoTrack] = useState<TrackInfo | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    void fetchFeed().then((res) => {
      setItems(res.data.items);
      setFollowingCount(res.data.followingCount);
      setLoading(false);
    });
  }, [user]);

  if (!hydrated || (user && loading)) {
    return (
      <PageFrame maxWidth="3xl">
        <PageLoading label="Loading your feed…" />
      </PageFrame>
    );
  }

  if (!user) {
    return (
      <PageFrame maxWidth="3xl">
        <PageHeader
          title="Your feed"
          subtitle="New posts, tracks, and releases from artists you follow."
        />
        <PageEmpty
          icon="inbox"
          title="Sign in to see your feed"
          description="Follow artists to build a personal timeline of what they share."
          action={
            <Button onClick={() => useAuthModalStore.getState().open('login')}>
              Log in
            </Button>
          }
        />
      </PageFrame>
    );
  }

  return (
    <PageFrame maxWidth="3xl">
      <PageHeader
        title="Your feed"
        subtitle={`New posts, tracks, and releases from the ${followingCount} artist${followingCount === 1 ? '' : 's'} you follow.`}
      />

      {items.length === 0 ? (
        <PageEmpty
          icon="inbox"
          title={
            followingCount === 0
              ? "You're not following any artists yet"
              : 'All quiet here'
          }
          description={
            followingCount === 0
              ? 'Discover artists on Listen, then follow them to fill this feed.'
              : 'New posts, tracks, and releases from artists you follow will show up here.'
          }
          action={
            <Link to="/">
              <Button size="sm" variant="secondary">
                Discover artists
              </Button>
            </Link>
          }
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={`${item.kind}-${item.id}`}
              className="border-border flex items-start gap-3 rounded-lg border px-3 py-3"
            >
              <Link
                to="/u/$username"
                params={{ username: item.artist.username }}
              >
                <ArtistAvatar
                  name={item.artist.displayName}
                  src={item.artist.avatarUrl}
                />
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-sm">
                  <Link
                    to="/u/$username"
                    params={{ username: item.artist.username }}
                    className="font-medium underline-offset-2 hover:underline"
                  >
                    {item.artist.displayName}
                  </Link>
                  <span className="text-foreground-secondary text-xs">
                    {feedBadge(item)}
                  </span>
                  <span className="text-foreground-secondary text-xs">
                    {formatFeedDate(item.date)}
                  </span>
                </div>

                {item.kind === 'post' && (
                  <div className="mt-2">
                    {item.title && (
                      <div className="text-sm font-medium">{item.title}</div>
                    )}
                    <p className="text-foreground-secondary mt-0.5 text-sm">
                      {item.body}
                    </p>
                  </div>
                )}

                {item.kind === 'track' && (
                  <button
                    type="button"
                    onClick={() =>
                      setInfoTrack({
                        title: item.title,
                        artistName: item.artist.displayName,
                        artistUsername: item.artist.username,
                        artworkUrl: item.bannerUrl,
                        meta: formatFeedDate(item.date),
                      })
                    }
                    className="mt-2 flex items-center gap-3 text-left"
                  >
                    <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
                      {item.bannerUrl ? (
                        <img
                          src={item.bannerUrl}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        item.title.slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium underline-offset-2 hover:underline">
                      {item.title}
                    </span>
                  </button>
                )}

                {item.kind === 'release' &&
                  (item.smartLinkSlug ? (
                    <Link
                      to="/r/$slug"
                      params={{ slug: item.smartLinkSlug }}
                      className="mt-2 flex items-center gap-3"
                    >
                      <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
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
                      <span className="text-sm font-medium underline-offset-2 hover:underline">
                        {item.title}
                      </span>
                    </Link>
                  ) : (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="bg-surface-secondary flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md text-[10px] font-bold">
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
                      <span className="text-sm font-medium">{item.title}</span>
                    </div>
                  ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      <TrackInfoDialog
        isOpen={Boolean(infoTrack)}
        onClose={() => setInfoTrack(null)}
        track={infoTrack}
      />
    </PageFrame>
  );
}
