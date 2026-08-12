import { ListPlusIcon } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { AddToPlaylistPanel } from './AddToPlaylistPanel';

type Props = {
  archiveItemId: string;
  trackTitle: string;
  size?: 'sm' | 'default' | 'icon-sm' | 'icon';
  variant?: 'secondary' | 'text' | 'default';
  className?: string;
  /** When true, show icon only (default). Pass false for icon + label. */
  iconOnly?: boolean;
};

export function AddToPlaylistButton({
  archiveItemId,
  trackTitle,
  size = 'icon-sm',
  variant = 'text',
  className,
  iconOnly = true,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        size={
          iconOnly ? size : size === 'icon-sm' || size === 'icon' ? 'sm' : size
        }
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
        aria-label="Add to playlist"
        title="Add to playlist"
      >
        <ListPlusIcon size={16} aria-hidden />
        {!iconOnly ? <span className="ml-1.5">Add to playlist</span> : null}
      </Button>
      <AddToPlaylistPanel
        isOpen={open}
        archiveItemId={archiveItemId}
        trackTitle={trackTitle}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
