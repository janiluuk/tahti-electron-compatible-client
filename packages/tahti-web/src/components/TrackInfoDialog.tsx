import { Link } from '@tanstack/react-router';

import { Button, Dialog } from '@nuclearplayer/ui';

export type TrackInfo = {
  title: string;
  artistName: string;
  artistUsername: string | null;
  artworkUrl: string | null;
  /** Short line under the title — e.g. "3m ago" or "Live now". */
  meta?: string;
};

/** Opened by clicking a track — artwork + info, then a way onward to the
 * artist's bio. Mirrors prod's profile track-detail modal. */
export function TrackInfoDialog({
  isOpen,
  onClose,
  track,
}: {
  isOpen: boolean;
  onClose: () => void;
  track: TrackInfo | null;
}) {
  return (
    <Dialog.Root isOpen={isOpen && Boolean(track)} onClose={onClose}>
      {track && (
        <>
          <Dialog.Title>Track info</Dialog.Title>
          <div className="mt-4 flex items-start gap-4">
            <div className="bg-surface-secondary flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg text-lg font-bold tracking-tight">
              {track.artworkUrl ? (
                <img
                  src={track.artworkUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                track.title.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-lg font-bold tracking-tight">
                {track.title}
              </div>
              <div className="text-foreground-secondary mt-0.5 text-sm">
                {track.artistName}
              </div>
              {track.meta && (
                <div className="text-foreground-secondary mt-1 text-xs">
                  {track.meta}
                </div>
              )}
            </div>
          </div>
          <Dialog.Actions>
            <Dialog.Close>Close</Dialog.Close>
            {track.artistUsername ? (
              <Link
                to="/u/$username"
                params={{ username: track.artistUsername }}
                onClick={onClose}
              >
                <Button>Artist bio</Button>
              </Link>
            ) : null}
          </Dialog.Actions>
        </>
      )}
    </Dialog.Root>
  );
}
