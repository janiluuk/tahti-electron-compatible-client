import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { mockDirectory } from '../api/mock';
import { ChannelChatPanel } from '../components/ChannelChatPanel';
import { useLayoutStore } from '../stores/layoutStore';

export function ChatView({ slug }: { slug?: string }) {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(slug ?? 'northern-lights');
  const suggestions = mockDirectory().items.map((i) => i.slug);
  const setChatContext = useLayoutStore((s) => s.setChatContext);
  const openChatRail = useLayoutStore((s) => s.openChatRail);

  useEffect(() => {
    if (!slug) {
      return;
    }
    setChatContext({ slug, enabled: true, autoOpen: true });
  }, [slug, setChatContext]);

  if (!slug) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <Link
          to="/more"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Tahti map
        </Link>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Channel chat
        </h1>
        <p className="text-foreground-secondary text-sm">
          Pick a channel slug to open the public chat panel (REST history +
          optional Centrifugo).
        </p>
        <Input
          label="Channel slug"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <Button
          onClick={() => {
            const s = draft.trim();
            if (s) {
              void navigate({ to: '/chat/$slug', params: { slug: s } });
            }
          }}
        >
          Open chat
        </Button>
        <div className="flex flex-wrap gap-2 text-sm">
          {suggestions.map((s) => (
            <Link
              key={s}
              to="/chat/$slug"
              params={{ slug: s }}
              className="text-foreground-secondary underline-offset-2 hover:underline"
            >
              {s}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <Link
            to="/chat"
            className="text-foreground-secondary text-xs hover:underline"
          >
            ← Chat picker
          </Link>
          <h1 className="font-display mt-1 text-2xl font-extrabold tracking-tight">
            Chat — {slug}
          </h1>
        </div>
        <Link
          to="/channel/$slug"
          params={{ slug }}
          className="text-foreground-secondary text-sm underline-offset-2 hover:underline"
        >
          Open channel
        </Link>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => openChatRail(slug)}
        >
          Right-rail chat
        </Button>
      </div>
      <ChannelChatPanel slug={slug} />
    </div>
  );
}
