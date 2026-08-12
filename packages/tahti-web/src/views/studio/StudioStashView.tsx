import { Button } from '@nuclearplayer/ui';

import { ClientCapabilityNotice } from '../../components/ClientCapabilityNotice';
import { StashFilesPanel } from '../../components/StashFilesPanel';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader } from '../../components/StudioPanel';

export function StudioStashView() {
  return (
    <StudioGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/stash" />
        <StudioPageHeader
          title="Stash"
          subtitle="Private locker — also available under Music → Files."
        />
        <StashFilesPanel />
        <ClientCapabilityNotice
          kind="not-in-client"
          title="Share links"
          action={
            <a
              href="https://tahti.live/dashboard/stash"
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="text">
                Open stash on tahti.live
              </Button>
            </a>
          }
        >
          Create / revoke share URLs (<code>POST /api/me/stash/:id/share</code>)
          are not available in this client yet.
        </ClientCapabilityNotice>
      </div>
    </StudioGate>
  );
}
