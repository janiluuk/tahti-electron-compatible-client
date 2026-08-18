import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import { fetchAdminDashboard, type AdminDashboard } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { StatNumber } from '../../components/tahti/StatNumber';

function euros(cents: number): string {
  return `€${(cents / 100).toLocaleString('fi-FI', { minimumFractionDigits: 0 })}`;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function healthChip(ok: boolean): { label: string; color: 'green' | 'orange' } {
  return ok
    ? { label: 'OK', color: 'green' }
    : { label: 'Down', color: 'orange' };
}

export function AdminDashboardView() {
  const [data, setData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    void fetchAdminDashboard().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin" />
        <StudioPageHeader
          title="Admin"
          subtitle="Operations dashboard — members, live streams, and system health."
        />

        {loading || !data ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-4">
              {(
                [
                  ['Active members', data.kpis.activeMembers],
                  ['Live now', data.kpis.liveNow],
                  ['Beta queue', data.kpis.betaQueue],
                  ['Open tickets', data.kpis.openTickets],
                ] as const
              ).map(([label, value]) => (
                <StudioPanel key={label} className="!p-4 sm:!p-5">
                  <Eyebrow>{label}</Eyebrow>
                  <StatNumber className="mt-1 block text-2xl">
                    {value.toLocaleString()}
                  </StatNumber>
                </StudioPanel>
              ))}
            </div>

            <StudioPanel title="Needs action">
              {data.actionRows.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  Nothing needs action right now.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {data.actionRows.map((row) => (
                    <li
                      key={row.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{row.title}</div>
                        <div className="text-foreground-secondary text-xs">
                          {row.meta}
                        </div>
                      </div>
                      <Link to={row.href}>
                        <Button
                          size="sm"
                          variant={
                            row.actionTone === 'amber' ? 'secondary' : 'default'
                          }
                        >
                          {row.actionLabel}
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>

            <StudioPanel title="System health">
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    ['Icecast / Liquidsoap', data.health.icecast === 'up'],
                    ['MinIO storage', data.health.minio === 'up'],
                    [
                      'Postgres backup',
                      data.health.postgresBackupAgeHours != null &&
                        data.health.postgresBackupAgeHours <= 26,
                    ],
                    ['Fan-sub payouts', data.health.failedFanSubPayouts === 0],
                  ] as const
                ).map(([label, ok]) => {
                  const chip = healthChip(ok);
                  return (
                    <div
                      key={label}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>{label}</span>
                      <Badge variant="pill" color={chip.color}>
                        {chip.label}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </StudioPanel>

            <div>
              <button
                type="button"
                className="text-foreground-secondary hover:text-foreground text-xs tracking-wide uppercase"
                onClick={() => setMoreOpen((v) => !v)}
              >
                {moreOpen ? 'Hide more' : 'Finance, streams, queues & audit'}
              </button>
            </div>

            {moreOpen && (
              <>
                <StudioPanel title="Finance YTD">
                  <div className="font-display text-2xl font-bold tracking-tight">
                    {euros(data.financeYtdCents.surplus)}
                  </div>
                  <p className="text-foreground-secondary mt-1 text-sm">
                    Revenue {euros(data.financeYtdCents.revenue)} · Costs{' '}
                    {euros(data.financeYtdCents.costs)}
                  </p>
                </StudioPanel>

                {data.liveStreams.length > 0 && (
                  <StudioPanel title={`Live now (${data.liveStreams.length})`}>
                    <ul className="divide-border divide-y">
                      {data.liveStreams.map((s) => (
                        <li
                          key={s.slug}
                          className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                        >
                          <span>{s.artistName}</span>
                          <span className="text-foreground-secondary text-xs">
                            {formatDuration(s.elapsedSec)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </StudioPanel>
                )}

                <StudioPanel title="Queue health">
                  <ul className="divide-border divide-y">
                    {data.queues.map((q) => (
                      <li
                        key={q.name}
                        className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span>{q.name}</span>
                        <span className="text-foreground-secondary text-xs">
                          {q.waiting} waiting
                          {q.failed > 0 ? `, ${q.failed} failed` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </StudioPanel>

                <StudioPanel title="Cron jobs">
                  <ul className="divide-border divide-y">
                    {data.cronJobs.map((job) => (
                      <li
                        key={job.jobName}
                        className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span title={job.description}>{job.jobName}</span>
                        <span className="text-foreground-secondary text-xs">
                          {job.lastRun?.outcome ?? '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </StudioPanel>

                <StudioPanel title="Recent audit events">
                  <ul className="divide-border divide-y">
                    {data.audit.map((row) => (
                      <li
                        key={row.id}
                        className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0"
                      >
                        <span>{row.action}</span>
                        <span className="text-foreground-secondary text-xs">
                          {new Date(row.createdAt).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                </StudioPanel>
              </>
            )}
          </>
        )}
      </div>
    </AdminGate>
  );
}
