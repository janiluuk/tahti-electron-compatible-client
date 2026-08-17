import { Link } from '@tanstack/react-router';

import { Button, Card, CardGrid, SectionShell } from '@nuclearplayer/ui';

import { fetchChannel } from '../api/client';
import {
  MediaIconActions,
  playQueueFavoriteActions,
} from '../components/MediaIconActions';
import { PageHeader } from '../components/PageHeader';
import { PageEmpty } from '../components/PageStates';
import { PlayableTrackTable } from '../components/PlayableTrackTable';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';

export function FavoritesView() {
  const favoriteChannels = useLibraryStore((s) => s.favoriteChannels);
  const favoriteTracks = useLibraryStore((s) => s.favoriteTracks);
  const toggleFavoriteChannel = useLibraryStore((s) => s.toggleFavoriteChannel);
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Favorites" />

      <SectionShell title="Channels">
        {favoriteChannels.length === 0 ? (
          <PageEmpty
            title="No favorite channels"
            description="Heart one from Listen or a channel page."
            action={
              <Link to="/">
                <Button size="sm" variant="secondary">
                  Browse Listen
                </Button>
              </Link>
            }
          />
        ) : (
          <CardGrid>
            {favoriteChannels.map((ch) => (
              <div key={ch.slug} className="flex flex-col gap-2">
                <Link to="/channel/$slug" params={{ slug: ch.slug }}>
                  <Card
                    title={ch.displayName}
                    subtitle={ch.slug}
                    src={ch.avatarUrl ?? undefined}
                  />
                </Link>
                <MediaIconActions
                  className="px-1"
                  actions={playQueueFavoriteActions({
                    onPlay: () => {
                      void fetchChannel(ch.slug).then(({ playable }) => {
                        if (playable) {
                          play(playable);
                        }
                      });
                    },
                    onQueue: () => {
                      void fetchChannel(ch.slug).then(({ playable }) => {
                        if (playable) {
                          enqueue(playable);
                        }
                      });
                    },
                    onFavorite: () => toggleFavoriteChannel(ch),
                    favorited: true,
                    queueLabel: 'Queue channel',
                  })}
                />
              </div>
            ))}
          </CardGrid>
        )}
      </SectionShell>

      <SectionShell title="Tracks">
        <PlayableTrackTable
          items={favoriteTracks}
          emptyMessage="No favorite tracks yet. Heart rows in Archive / Collections."
        />
      </SectionShell>
    </div>
  );
}
