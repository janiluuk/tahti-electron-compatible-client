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
      </div>
    </StudioGate>
  );
}
