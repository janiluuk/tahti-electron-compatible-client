import { useEffect, useState } from 'react';

import { Input } from '@nuclearplayer/ui';

import { fetchAdminUsers, type AdminUserRow } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const TIERS = ['', 'FREE', 'ARTIST', 'STUDIO'] as const;

export function AdminUsersView() {
  const [q, setQ] = useState('');
  const [tier, setTier] = useState('');
  const [isMember, setIsMember] = useState('');
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      void fetchAdminUsers({ q, tier, isMember }).then((res) => {
        setUsers(res.data);
        setTotal(res.total);
        setLoading(false);
      });
    }, 200);
    return () => clearTimeout(handle);
  }, [q, tier, isMember]);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/users" />
        <StudioPageHeader title="Users" subtitle={`${total} users`} />

        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search name, email, username"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="max-w-64"
          />
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="border-border bg-background rounded-md border px-2 py-1.5 text-sm"
          >
            {TIERS.map((t) => (
              <option key={t} value={t}>
                {t || 'All tiers'}
              </option>
            ))}
          </select>
          <select
            value={isMember}
            onChange={(e) => setIsMember(e.target.value)}
            className="border-border bg-background rounded-md border px-2 py-1.5 text-sm"
          >
            <option value="">All members</option>
            <option value="true">Members</option>
            <option value="false">Non-members</option>
          </select>
        </div>

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : users.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No users match.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {u.displayName}
                      {u.isBoard ? (
                        <span className="text-foreground-secondary font-normal">
                          {' '}
                          · board
                        </span>
                      ) : null}
                      {u.suspendedAt ? (
                        <span className="text-accent-red font-normal">
                          {' '}
                          · suspended
                        </span>
                      ) : null}
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {u.email} · {u.tier}
                      {u.memberNumber != null ? ` · #${u.memberNumber}` : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-xs">
                    <span
                      className={
                        u.channelState === 'LIVE'
                          ? 'text-primary'
                          : 'text-foreground-secondary'
                      }
                    >
                      {u.channelState ?? '—'}
                    </span>
                    <span className="text-foreground-secondary">
                      {u.engagementUnitsYtd} units
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
