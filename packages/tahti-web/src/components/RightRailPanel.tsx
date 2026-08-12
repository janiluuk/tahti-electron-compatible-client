import { MessageCircle } from 'lucide-react';

import { useLayoutStore } from '../stores/layoutStore';
import { ChannelChatPanel } from './ChannelChatPanel';

export function RightRailPanel({ isCollapsed }: { isCollapsed: boolean }) {
  const chatSlug = useLayoutStore((s) => s.chatSlug);
  const chatEnabled = useLayoutStore((s) => s.chatEnabled);
  const chatDisabledReason = useLayoutStore((s) => s.chatDisabledReason);

  if (isCollapsed) {
    return (
      <div className="flex h-full flex-col items-center gap-3 py-3 opacity-40">
        <MessageCircle size={18} />
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col" data-testid="right-rail">
      <div className="border-border flex shrink-0 items-center gap-1.5 border-b px-3 py-2">
        <MessageCircle size={14} />
        <span className="text-xs font-semibold tracking-wide uppercase">
          Chat
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        {chatEnabled && chatSlug ? (
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
