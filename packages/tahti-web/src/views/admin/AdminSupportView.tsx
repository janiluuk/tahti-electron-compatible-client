import { useEffect, useState } from 'react';

import { Badge } from '@nuclearplayer/ui';

import {
  fetchAdminSupportTickets,
  type AdminSupportStatus,
  type AdminSupportTicket,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function statusBadge(status: AdminSupportStatus): {
  label: string;
  color: 'orange' | 'cyan' | 'green';
} {
  if (status === 'OPEN') {
    return { label: 'Open', color: 'orange' };
  }
  if (status === 'IN_PROGRESS') {
    return { label: 'In progress', color: 'cyan' };
  }
  return { label: 'Resolved', color: 'green' };
}

const FILTERS: { id: AdminSupportStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'IN_PROGRESS', label: 'In progress' },
  { id: 'RESOLVED', label: 'Resolved' },
];

export function AdminSupportView() {
  const [filter, setFilter] = useState<AdminSupportStatus | 'all'>('OPEN');
  const [tickets, setTickets] = useState<AdminSupportTicket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminSupportTickets(filter === 'all' ? undefined : filter).then(
      (res) => {
        setTickets(res.data);
        setLoading(false);
      },
    );
  }, [filter]);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/support" />
        <StudioPageHeader title="Support queue" />

        <nav className="flex flex-wrap gap-2" role="tablist">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
                filter === f.id
                  ? 'bg-primary text-foreground shadow-sm'
                  : 'border-border text-foreground-secondary hover:text-foreground border'
              }`}
            >
              {f.label}
            </button>
          ))}
        </nav>

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : tickets.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No tickets.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {tickets.map((t) => {
                const badge = statusBadge(t.status);
                return (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{t.subject}</div>
                      <div className="text-foreground-secondary text-xs">
                        {t.artistUsername
                          ? `@${t.artistUsername}`
                          : (t.contactEmail ?? '—')}
                        {' · '}
                        {t.category} ·{' '}
                        {new Date(t.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge variant="pill" color={badge.color}>
                      {badge.label}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
