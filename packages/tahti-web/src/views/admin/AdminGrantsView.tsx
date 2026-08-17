import { useEffect, useState } from 'react';

import { fetchAdminGrants, type AdminGrantYearSummary } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function formatEur(cents: number): string {
  return `€${(cents / 100).toLocaleString('fi-FI', { minimumFractionDigits: 2 })}`;
}

export function AdminGrantsView() {
  const [history, setHistory] = useState<AdminGrantYearSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminGrants().then((res) => {
      setHistory(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/grants" />
        <StudioPageHeader
          title="Grant cycles"
          subtitle="Annual 90%-surplus disbursement to artists, based on engagement units."
        />

        <StudioPanel title="Disbursement history">
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : history.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No grant cycles have been run yet.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {history.map((row) => (
                <li
                  key={row.year}
                  className="flex items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="font-medium">{row.year}</div>
                  <div className="text-foreground-secondary text-xs">
                    {row.grantCount} recipients
                  </div>
                  <div className="text-sm font-medium">
                    {formatEur(row.totalCents)}
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
