import { useEffect, useState } from 'react';

import { Badge } from '@nuclearplayer/ui';

import { fetchAdminStatus, type AdminStatusData } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function AdminStatusView() {
  const [data, setData] = useState<AdminStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminStatus().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/status" />
        <StudioPageHeader title="Service status" />

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : !data ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              Could not load status.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center gap-3 text-sm">
                <Badge
                  variant="pill"
                  color={data.status === 'operational' ? 'green' : 'orange'}
                >
                  {data.status}
                </Badge>
                <span className="text-foreground-secondary text-xs">
                  Uptime {Math.floor(data.uptimeSec / 3600)}h · checked{' '}
                  {new Date(data.ts).toLocaleString()}
                </span>
              </div>
              <ul className="divide-border divide-y">
                {Object.entries(data.checks).map(([id, check]) => (
                  <li
                    key={id}
                    className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium">{id}</div>
                      {check.detail && (
                        <div className="text-foreground-secondary text-xs">
                          {check.detail}
                        </div>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {check.latencyMs != null && (
                        <span className="text-foreground-secondary text-xs">
                          {check.latencyMs} ms
                        </span>
                      )}
                      <Badge
                        variant="pill"
                        color={check.state === 'up' ? 'green' : 'orange'}
                      >
                        {check.state}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
