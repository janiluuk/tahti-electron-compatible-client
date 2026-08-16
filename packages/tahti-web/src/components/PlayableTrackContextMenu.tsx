import { ListPlusIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { useState } from 'react';

import type { Track } from '@nuclearplayer/model';
import { TrackContextMenu } from '@nuclearplayer/ui';

import { archiveItemIdFromPlayableId } from '../lib/archiveId';
import { AddToPlaylistPanel } from './AddToPlaylistPanel';

/** Per-row "Add to playlist" for `PlayableTrackTable` — radio/live rows have
 * no archive item to save, so they render the plain trigger with no menu. */
export function PlayableTrackContextMenu({
  track,
  children,
}: {
  track: Track;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const archiveItemId = archiveItemIdFromPlayableId(track.source.id);

  if (!archiveItemId) {
    return <>{children}</>;
  }

  return (
    <>
      <TrackContextMenu>
        <TrackContextMenu.Trigger>{children}</TrackContextMenu.Trigger>
        <TrackContextMenu.Content>
          <TrackContextMenu.Action
            icon={<ListPlusIcon size={16} />}
            onClick={() => setOpen(true)}
          >
            Add to playlist
          </TrackContextMenu.Action>
        </TrackContextMenu.Content>
      </TrackContextMenu>
      <AddToPlaylistPanel
        isOpen={open}
        archiveItemId={archiveItemId}
        trackTitle={track.title}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
