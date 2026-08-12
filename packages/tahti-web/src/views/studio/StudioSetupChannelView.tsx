import { Link, useNavigate } from '@tanstack/react-router';
import { LayoutDashboard } from 'lucide-react';
import { useState } from 'react';

import { Button, EmptyState } from '@nuclearplayer/ui';

import { provisionChannel } from '../../api/channel-provision';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { useAuthStore } from '../../stores/authStore';

export function StudioSetupChannelView() {
  const user = useAuthStore((s) => s.user);
  const refresh = useAuthStore((s) => s.refresh);
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggested = user?.username ?? 'your-name';

  if (user?.channel) {
    return (
      <StudioGate requireChannel={false}>
        <div className="mx-auto flex max-w-lg flex-col gap-4 px-1 py-2">
          <StudioNav current="/studio/setup-channel" />
          <EmptyState
            icon={<LayoutDashboard size={40} className="opacity-40" />}
            title="Channel ready"
            description={`You already have @${user.channel.slug}.`}
            action={
              <Link to="/studio/channel">
                <Button size="sm">Open channel design</Button>
              </Link>
            }
          />
        </div>
      </StudioGate>
    );
  }

  return (
    <StudioGate requireChannel={false}>
      <div className="mx-auto flex max-w-lg flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/setup-channel" />
        <StudioPageHeader
          title="Create your channel"
          subtitle={`One click provisions ${suggested}.tahti.live and unlocks Studio (Go Live, Library, uploads).`}
        />

        {error && (
          <p className="border-border bg-background-secondary rounded-lg border px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <StudioPanel>
          <Button
            disabled={busy || !user}
            onClick={() => {
              setBusy(true);
              setError(null);
              void provisionChannel().then(async (res) => {
                setBusy(false);
                if (!res.ok) {
                  setError(res.error);
                  return;
                }
                await refresh();
                void navigate({ to: '/studio/channel' });
              });
            }}
          >
            {busy ? 'Creating…' : `Create ${suggested}.tahti.live`}
          </Button>
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
