import { CellContext } from '@tanstack/react-table';
import { Music } from 'lucide-react';

import { Artwork, Track } from '@nuclearplayer/model';

import { MediaArtwork } from '../../MediaArtwork';
import { useTrackTableContext } from '../TrackTableContext';

export const ThumbnailCell = <T extends Track>({
  getValue,
  row,
}: CellContext<T, Artwork>) => {
  const { actions, labels } = useTrackTableContext<T>();
  const track = row.original;
  const artwork = getValue();

  return (
    <td className="w-10 text-center">
      <div className="flex w-full justify-center">
        <MediaArtwork
          size="sm"
          src={artwork?.url}
          alt={track.title}
          imageReveal={false}
          onPlay={
            actions.onPlayNow
              ? () => {
                  actions.onPlayNow?.(track);
                }
              : undefined
          }
          playLabel="Play"
          onQueue={
            actions.onAddToQueue
              ? () => {
                  actions.onAddToQueue?.(track);
                }
              : undefined
          }
          queueLabel={labels.addToQueue}
          placeholder={
            <Music size={16} absoluteStrokeWidth className="opacity-20" />
          }
        />
      </div>
    </td>
  );
};
