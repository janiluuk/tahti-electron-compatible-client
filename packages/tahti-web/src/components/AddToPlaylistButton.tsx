import { useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { AddToPlaylistPanel } from './AddToPlaylistPanel';

type Props = {
  archiveItemId: string;
  trackTitle: string;
  size?: 'sm' | 'default';
  variant?: 'secondary' | 'text' | 'default';
  className?: string;
};

export function AddToPlaylistButton({
  archiveItemId,
  trackTitle,
  size = 'sm',
  variant = 'text',
  className,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`relative inline-flex ${className ?? ''}`}>
      <Button size={size} variant={variant} onClick={() => setOpen((v) => !v)}>
        {open ? 'Close' : 'Add to playlist'}
      </Button>
      {open && (
        <AddToPlaylistPanel
          archiveItemId={archiveItemId}
          trackTitle={trackTitle}
          onClose={() => setOpen(false)}
        />
      )}
    </div>
  );
}
