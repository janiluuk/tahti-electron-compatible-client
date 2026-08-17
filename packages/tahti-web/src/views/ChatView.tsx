import { Link, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { mockDirectory } from '../api/mock';
import { ChannelChatPanel } from '../components/ChannelChatPanel';
import { PageFrame, PageHeader } from '../components/PageHeader';
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
      <PageFrame maxWidth="lg">
        <PageHeader
          title="Channel chat"
          subtitle="Pick a channel to open its public chat."
          back={
            <Link
              to="/more"
              className="text-foreground-secondary text-xs hover:underline"
            >
              ← Tahti map
            </Link>
          }
        />
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
      </PageFrame>
    );
  }

  return (
    <PageFrame maxWidth="lg">
      <PageHeader
        title={`Chat — ${slug}`}
        back={
          <Link
            to="/chat"
            className="text-foreground-secondary text-xs hover:underline"
          >
            ← Chat picker
          </Link>
        }
        actions={
          <>
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
              Open chat rail
            </Button>
          </>
        }
      />
      <ChannelChatPanel slug={slug} />
    </PageFrame>
  );
}
