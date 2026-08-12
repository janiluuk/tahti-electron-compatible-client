import { QueuePanel } from '@nuclearplayer/ui';

import { usePlayerStore } from '../stores/playerStore';

export function ConnectedQueuePanel({ isCollapsed }: { isCollapsed: boolean }) {
  const queue = usePlayerStore((s) => s.queue);
  const currentId = usePlayerStore((s) => s.currentId);
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);

  return (
    <QueuePanel
      items={queue}
      currentItemId={currentId ?? undefined}
      isCollapsed={isCollapsed}
      reorderable={false}
      onSelectItem={(id) => playQueueIndex(id)}
      onRemoveItem={(id) => removeFromQueue(id)}
      labels={{
        emptyTitle: 'Queue empty',
        emptySubtitle: 'Play a channel or radio to start listening',
        removeButton: 'Remove',
        playbackError: 'Could not play',
        noCandidates: 'No stream',
        candidateFailed: 'Stream failed',
      }}
    />
  );
}
