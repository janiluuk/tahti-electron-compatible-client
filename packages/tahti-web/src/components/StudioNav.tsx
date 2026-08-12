import { InPageNav } from './InPageNav';

const LINKS = [
  { to: '/studio', label: 'Overview' },
  { to: '/studio/go-live', label: 'Go Live' },
  { to: '/studio/archive', label: 'Archive' },
  { to: '/studio/releases', label: 'Releases' },
  { to: '/studio/collections', label: 'Collections' },
  { to: '/studio/upload', label: 'Upload' },
  { to: '/studio/editor', label: 'Editor' },
  { to: '/studio/schedule', label: 'Schedule' },
  { to: '/studio/stats', label: 'Stats' },
  { to: '/studio/revenue', label: 'Revenue' },
  { to: '/studio/channel', label: 'Channel' },
  { to: '/studio/updates', label: 'Updates' },
  { to: '/studio/stash', label: 'Stash' },
] as const;

export function StudioNav({ current }: { current?: string }) {
  return (
    <InPageNav
      aria-label="Studio"
      items={LINKS.map((link) => ({
        id: link.to,
        label: link.label,
        to: link.to,
        active:
          current === link.to ||
          (link.to !== '/studio' && Boolean(current?.startsWith(link.to))),
      }))}
    />
  );
}
