import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchAdminContentReports,
  resolveContentReport,
  type AdminContentReportRow,
  type AdminContentReportStatus,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const FILTERS: { id: AdminContentReportStatus | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'OPEN', label: 'Open' },
  { id: 'REVIEWING', label: 'Reviewing' },
  { id: 'ACTIONED', label: 'Actioned' },
  { id: 'DISMISSED', label: 'Dismissed' },
];

function ReportActions({
  report,
  onDone,
}: {
  report: AdminContentReportRow;
  onDone: () => void;
}) {
  const [note, setNote] = useState('');
  const [pending, setPending] = useState(false);

  if (report.status === 'ACTIONED' || report.status === 'DISMISSED') {
    return (
      <div className="text-foreground-secondary text-xs">
        {report.status === 'ACTIONED' ? 'Actioned' : 'Dismissed'}
        {report.resolvedByDisplayName
          ? ` by ${report.resolvedByDisplayName}`
          : ''}
        {report.resolutionNote && (
          <p className="mt-0.5">{report.resolutionNote}</p>
        )}
      </div>
    );
  }

  const resolve = (status: 'REVIEWING' | 'ACTIONED' | 'DISMISSED') => {
    setPending(true);
    void resolveContentReport(report.id, status, note.trim() || undefined).then(
      () => {
        setPending(false);
        onDone();
      },
    );
  };

  return (
    <div className="flex flex-col gap-1.5">
      <Input
        placeholder="Resolution note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="h-7 max-w-xs text-xs"
      />
      <div className="flex flex-wrap gap-1.5">
        {report.status === 'OPEN' && (
          <Button
            size="sm"
            variant="secondary"
            disabled={pending}
            onClick={() => resolve('REVIEWING')}
          >
            Start review
          </Button>
        )}
        <Button
          size="sm"
          disabled={pending}
          onClick={() => resolve('ACTIONED')}
        >
          Mark actioned
        </Button>
        <Button
          size="sm"
          variant="text"
          disabled={pending}
          onClick={() => resolve('DISMISSED')}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

export function AdminContentReportsView() {
  const [filter, setFilter] = useState<AdminContentReportStatus | 'all'>(
    'OPEN',
  );
  const [reports, setReports] = useState<AdminContentReportRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    void fetchAdminContentReports(filter === 'all' ? undefined : filter).then(
      (res) => {
        setReports(res.data);
        setLoading(false);
      },
    );
  };

  useEffect(reload, [filter]);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/content-reports" />
        <StudioPageHeader
          title="Content reports"
          subtitle="Anonymous reports of channels, releases, archive items, and collections — reporting needs no account."
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

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : reports.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No reports in this view.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {reports.map((r) => (
                <li
                  key={r.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {r.reason.replace(/_/g, ' ')} ·{' '}
                      <span className="text-foreground-secondary font-normal">
                        {r.targetType.replace(/_/g, ' ').toLowerCase()}
                      </span>
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {r.details ?? 'No details provided'} ·{' '}
                      {new Date(r.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ReportActions report={r} onDone={reload} />
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
