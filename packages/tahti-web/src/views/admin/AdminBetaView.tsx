import { useEffect, useState } from 'react';

import { Badge, Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  approveBetaApplication,
  fetchAdminBetaApplications,
  rejectBetaApplication,
  resendBetaSetupLink,
  type AdminBetaApplication,
  type AdminBetaStatus,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const COMBINING_DIACRITICS = new RegExp('[̀-ͯ]', 'g');

function suggestUsername(name: string): string {
  const base = name
    .toLowerCase()
    .normalize('NFKD')
    .replace(COMBINING_DIACRITICS, '')
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return base.length >= 2 ? base : 'artist';
}

function statusBadge(status: AdminBetaStatus): {
  label: string;
  color: 'green' | 'orange' | 'secondary';
} {
  if (status === 'APPROVED') {
    return { label: 'Approved', color: 'green' };
  }
  if (status === 'REJECTED') {
    return { label: 'Rejected', color: 'secondary' };
  }
  return { label: 'Pending', color: 'orange' };
}

const FILTERS: { id: AdminBetaStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
];

export function AdminBetaView() {
  const [filter, setFilter] = useState<AdminBetaStatus | 'all'>('PENDING');
  const [apps, setApps] = useState<AdminBetaApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [approveTarget, setApproveTarget] =
    useState<AdminBetaApplication | null>(null);
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [setupUrl, setSetupUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    void fetchAdminBetaApplications(filter === 'all' ? undefined : filter).then(
      (res) => {
        setApps(res.data);
        setLoading(false);
      },
    );
  };

  useEffect(reload, [filter]);

  const openApprove = (app: AdminBetaApplication) => {
    setApproveTarget(app);
    setUsername(suggestUsername(app.name));
    setDisplayName(app.name);
    setSetupUrl(null);
  };

  const closeApprove = () => {
    setApproveTarget(null);
    setSetupUrl(null);
    setBusy(false);
  };

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/beta" />
        <StudioPageHeader
          title="Beta applications"
          subtitle="Approving creates an artist account and emails a password setup link."
        />

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

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : apps.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No applications in this view.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {apps.map((app) => {
                const badge = statusBadge(app.status);
                return (
                  <li
                    key={app.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium">{app.name}</span>
                        <Badge variant="pill" color={badge.color}>
                          {badge.label}
                        </Badge>
                      </div>
                      <p className="text-foreground-secondary text-xs">
                        {app.email} · {app.artistType} ·{' '}
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                      {app.message && (
                        <p className="text-foreground-secondary mt-1 text-sm">
                          {app.message}
                        </p>
                      )}
                      {app.userId && (
                        <p className="text-foreground-secondary mt-1 text-xs">
                          @{app.username}
                          {app.hasPassword
                            ? ' · password set'
                            : ' · awaiting password'}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      {app.status === 'PENDING' && (
                        <>
                          <Button size="sm" onClick={() => openApprove(app)}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => {
                              void rejectBetaApplication(app.id).then((r) => {
                                if (!r.ok) {
                                  setMsg(r.error);
                                } else {
                                  reload();
                                }
                              });
                            }}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {app.status === 'APPROVED' &&
                        app.userId &&
                        !app.hasPassword && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              void resendBetaSetupLink(app.id).then((r) => {
                                setMsg(
                                  r.ok
                                    ? `Setup link resent: ${r.setupUrl}`
                                    : r.error,
                                );
                              });
                            }}
                          >
                            Resend setup link
                          </Button>
                        )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </StudioPanel>

        <Dialog.Root isOpen={Boolean(approveTarget)} onClose={closeApprove}>
          <Dialog.Title>Approve {approveTarget?.name}</Dialog.Title>
          {setupUrl ? (
            <div className="mt-4 flex flex-col gap-3">
              <p className="text-foreground-secondary text-sm">
                Approved. Password setup link:
              </p>
              <a
                href={setupUrl}
                className="text-primary text-sm break-all underline-offset-2 hover:underline"
              >
                {setupUrl}
              </a>
              <Dialog.Actions>
                <Dialog.Close>Close</Dialog.Close>
              </Dialog.Actions>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!approveTarget || busy) {
                  return;
                }
                setBusy(true);
                void approveBetaApplication(approveTarget.id, {
                  username: username.trim().toLowerCase(),
                  displayName: displayName.trim(),
                }).then((r) => {
                  setBusy(false);
                  if (!r.ok) {
                    setMsg(r.error);
                    return;
                  }
                  setSetupUrl(r.setupUrl);
                  reload();
                });
              }}
            >
              <div className="mt-4 flex flex-col gap-3">
                <Input
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                />
                <Input
                  label="Artist name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </div>
              <Dialog.Actions>
                <Dialog.Close>Cancel</Dialog.Close>
                <Button
                  type="submit"
                  disabled={busy || !username.trim() || !displayName.trim()}
                >
                  {busy ? 'Approving…' : 'Approve'}
                </Button>
              </Dialog.Actions>
            </form>
          )}
        </Dialog.Root>
      </div>
    </AdminGate>
  );
}
