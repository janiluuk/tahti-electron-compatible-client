import { Link } from '@tanstack/react-router';
import { LayoutDashboard, Lock } from 'lucide-react';
import type { ReactNode } from 'react';

import { Button, EmptyState } from '@nuclearplayer/ui';

import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';
import { ClientCapabilityNotice } from './ClientCapabilityNotice';
import { PageLoading } from './PageStates';

type Props = {
  children: ReactNode;
  /** When true, require an artist channel (archive/upload). */
  requireChannel?: boolean;
};

export function StudioGate({ children, requireChannel = true }: Props) {
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);
  const openAuth = useAuthModalStore((s) => s.open);

  if (!hydrated) {
    return <PageLoading label="Loading session…" />;
  }

  if (!user) {
    return (
      <EmptyState
        icon={<Lock size={40} className="opacity-40" />}
        title="Studio"
        description="Sign in to manage your catalog, uploads, and audio editor."
        action={<Button onClick={() => openAuth('login')}>Log in</Button>}
      />
    );
  }

  if (requireChannel && !user.channel) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4 py-8">
        <EmptyState
          icon={<LayoutDashboard size={40} className="opacity-40" />}
          title="Artist channel required"
          description={`Signed in as @${user.username}, but this account has no channel yet.`}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/studio/setup-channel">
                <Button size="sm">Create channel</Button>
              </Link>
              <Link to="/studio">
                <Button size="sm" variant="secondary">
                  Studio overview
                </Button>
              </Link>
            </div>
          }
        />
        <ClientCapabilityNotice
          kind="link-out"
          title="Channel setup"
          action={
            <div className="flex flex-wrap gap-2">
              <a
                href="https://tahti.live/dashboard/setup-channel"
                target="_blank"
                rel="noreferrer"
              >
                <Button size="sm">Open setup on tahti.live</Button>
              </a>
              <Link to="/more">
                <Button size="sm" variant="text">
                  Port checklist
                </Button>
              </Link>
            </div>
          }
        >
          Full channel onboarding may still need production. Use in-app setup
          when available, or continue on tahti.live.
        </ClientCapabilityNotice>
      </div>
    );
  }

  return <>{children}</>;
}
