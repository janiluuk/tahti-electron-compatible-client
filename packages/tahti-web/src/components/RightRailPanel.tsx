import { ListMusic, MessageCircle } from 'lucide-react';

import { QueuePanel } from '@nuclearplayer/ui';

import { useLayoutStore } from '../stores/layoutStore';
import { usePlayerStore } from '../stores/playerStore';
import { ChannelChatPanel } from './ChannelChatPanel';

export function RightRailPanel({ isCollapsed }: { isCollapsed: boolean }) {
  const queue = usePlayerStore((s) => s.queue);
  const currentId = usePlayerStore((s) => s.currentId);
  const playQueueIndex = usePlayerStore((s) => s.playQueueIndex);
  const removeFromQueue = usePlayerStore((s) => s.removeFromQueue);

  const mode = useLayoutStore((s) => s.rightRailMode);
  const chatSlug = useLayoutStore((s) => s.chatSlug);
  const chatEnabled = useLayoutStore((s) => s.chatEnabled);
  const chatDisabledReason = useLayoutStore((s) => s.chatDisabledReason);
  const setRightRailMode = useLayoutStore((s) => s.setRightRailMode);

  if (isCollapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-3 py-3 opacity-40">
        <ListMusic size={18} />
        <MessageCircle size={18} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="right-rail">
      <div className="border-border flex shrink-0 gap-1 border-b p-2">
        <button
          type="button"
          data-testid="right-rail-queue"
          onClick={() => setRightRailMode('queue')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold tracking-wide uppercase ${
            mode === 'queue'
              ? 'bg-primary text-foreground'
              : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
          }`}
        >
          <ListMusic size={14} />
          Queue
        </button>
        <button
          type="button"
          data-testid="right-rail-chat"
          disabled={!chatEnabled}
          title={
            !chatEnabled
              ? (chatDisabledReason ?? 'Chat unavailable')
              : undefined
          }
          onClick={() => setRightRailMode('chat')}
          className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold tracking-wide uppercase ${
            mode === 'chat'
              ? 'bg-primary text-foreground'
              : !chatEnabled
                ? 'text-foreground-secondary cursor-not-allowed opacity-40'
                : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
          }`}
        >
          <MessageCircle size={14} />
          Chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {mode === 'queue' ? (
          <QueuePanel
            items={queue}
            currentItemId={currentId ?? undefined}
            isCollapsed={false}
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
        ) : chatEnabled && chatSlug ? (
          <div className="flex h-full min-h-0 flex-col p-2">
            <ChannelChatPanel slug={chatSlug} rail />
          </div>
        ) : (
          <div className="text-foreground-secondary flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-sm">
            <MessageCircle size={40} className="opacity-40" />
            <p className="text-foreground font-semibold">Chat unavailable</p>
            <p className="text-xs opacity-70">
              {chatDisabledReason ?? 'Open a channel with chat enabled.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
