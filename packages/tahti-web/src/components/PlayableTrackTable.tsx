import type { Track } from '@nuclearplayer/model';
import { TrackTable } from '@nuclearplayer/ui';

import type { TahtiPlayable } from '../api/types';
import { playableToTrack } from '../lib/playableToTrack';
import { trackTableLabels } from '../lib/trackTableLabels';
import { useLibraryStore } from '../stores/libraryStore';
import { usePlayerStore } from '../stores/playerStore';
import { PlayableTrackContextMenu } from './PlayableTrackContextMenu';

type Props = {
  items: TahtiPlayable[];
  emptyMessage?: string;
  /** Present only when the caller has already decided the viewer can
   * edit these tracks (e.g. their own catalog) -- omit entirely to keep
   * the edit icon off tables of other people's/aggregated tracks. */
  onEdit?: (item: TahtiPlayable) => void;
};

export function PlayableTrackTable({
  items,
  emptyMessage = 'No tracks yet.',
  onEdit,
}: Props) {
  const play = usePlayerStore((s) => s.play);
  const enqueue = usePlayerStore((s) => s.enqueue);
  const currentId = usePlayerStore((s) => s.currentId);
  const toggleFavoriteTrack = useLibraryStore((s) => s.toggleFavoriteTrack);
  const favoriteTracks = useLibraryStore((s) => s.favoriteTracks);

  if (items.length === 0) {
    return <p className="text-foreground-secondary text-sm">{emptyMessage}</p>;
  }

  const tracks: Track[] = items.map(playableToTrack);
  const byId = new Map(items.map((i) => [i.id, i]));

  const resolve = (track: Track): TahtiPlayable | null =>
    byId.get(track.source.id) ?? null;

  return (
    <div className="flex min-h-[240px] flex-col gap-3">
      <TrackTable
        tracks={tracks}
        labels={trackTableLabels}
        features={{
          header: true,
          filterable: true,
          sortable: true,
          favorites: true,
          playAll: true,
          addAllToQueue: true,
          reorderable: false,
          contextMenu: true,
        }}
        display={{
          displayThumbnail: true,
          displayFavorite: true,
          displayArtist: true,
          displayDuration: false,
          displayAlbum: items.some((i) =>
            Boolean(i.sourceProvider && i.sourceProvider !== 'tahti'),
          ),
          displayQueueControls: true,
          displayPosition: true,
        }}
        actions={{
          onPlayNow: (track) => {
            const item = resolve(track);
            if (!item) {
              return;
            }
            const rest = items.filter((i) => i.id !== item.id);
            play(item, { enqueueRest: rest });
          },
          onAddToQueue: (track) => {
            const item = resolve(track);
            if (item) {
              enqueue(item);
            }
          },
          onPlayAll: () => {
            const [head, ...rest] = items;
            if (head) {
              play(head, { enqueueRest: rest });
            }
          },
          onAddAllToQueue: () => {
            for (const item of items) {
              enqueue(item);
            }
          },
          onToggleFavorite: (track) => {
            const item = resolve(track);
            if (item) {
              toggleFavoriteTrack(item);
            }
          },
          onEdit: onEdit
            ? (track) => {
                const item = resolve(track);
                if (item) {
                  onEdit(item);
                }
              }
            : undefined,
        }}
        meta={{
          isTrackFavorite: (track) =>
            favoriteTracks.some((t) => t.id === track.source.id),
          isCurrentTrack: (track) => track.source.id === currentId,
          canEditTrack: onEdit ? () => true : undefined,
          ContextMenuWrapper: PlayableTrackContextMenu,
        }}
      />
    </div>
  );
}
