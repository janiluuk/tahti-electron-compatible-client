import { InPageNav } from './InPageNav';

const PRIMARY = [
  { to: '/admin', label: 'Dashboard' },
  { to: '/admin/beta', label: 'Beta' },
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/radio', label: 'Radio' },
  { to: '/admin/radio-submissions', label: 'Radio submissions' },
  { to: '/admin/news', label: 'News' },
  { to: '/admin/tahti-selects', label: 'Selects' },
  { to: '/admin/streams', label: 'Streams' },
  { to: '/admin/support', label: 'Support' },
  { to: '/admin/top-lists', label: 'Top lists' },
  { to: '/admin/announcements', label: 'Announcements' },
] as const;

function isActive(current: string | undefined, to: string) {
  return (
    current === to || (to !== '/admin' && Boolean(current?.startsWith(to)))
  );
}

/** Grows page-by-page alongside the admin port — see UI-REDESIGN-WORKLOG.md. */
export function AdminNav({ current }: { current?: string }) {
  return (
    <InPageNav
      aria-label="Admin"
      items={PRIMARY.map((link) => ({
        id: link.to,
        label: link.label,
        to: link.to,
        active: isActive(current, link.to),
      }))}
    />
  );
}
