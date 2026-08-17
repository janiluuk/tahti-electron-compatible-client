import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchAdminStorage,
  setUserStorageQuota,
  type AdminStorageOverview,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function formatBytes(bytes: number): string {
  if (bytes >= 1024 ** 3) {
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  }
  if (bytes >= 1024 ** 2) {
    return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function bytesToMb(bytes: number): number {
  return Math.round(bytes / (1024 * 1024));
}

function QuotaEditor({
  userId,
  quotaBytes,
  onSaved,
}: {
  userId: string;
  quotaBytes: number;
  onSaved: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(bytesToMb(quotaBytes)));
  const [saving, setSaving] = useState(false);

  if (!editing) {
    return (
      <Button
        size="sm"
        variant="text"
        onClick={() => {
          setValue(String(bytesToMb(quotaBytes)));
          setEditing(true);
        }}
      >
        Edit quota
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="border-border bg-background h-7 w-20 rounded-md border px-2 text-xs"
        disabled={saving}
      />
      <span className="text-foreground-secondary text-xs">MB</span>
      <Button
        size="sm"
        disabled={saving}
        onClick={() => {
          const mb = Number(value);
          if (!Number.isFinite(mb) || mb <= 0) {
            return;
          }
          setSaving(true);
          void setUserStorageQuota(userId, Math.round(mb * 1024 * 1024)).then(
            () => {
              setSaving(false);
              setEditing(false);
              onSaved();
            },
          );
        }}
      >
        Save
      </Button>
      <Button size="sm" variant="text" onClick={() => setEditing(false)}>
        Cancel
      </Button>
    </div>
  );
}

export function AdminStorageView() {
  const [overview, setOverview] = useState<AdminStorageOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    void fetchAdminStorage().then((res) => {
      setOverview(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/storage" />
        <StudioPageHeader
          title="Storage"
          subtitle="Long-term storage usage, tracked against each user's quota (500 MB free tier default)."
        />

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : !overview ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              Could not load storage usage.
            </p>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap gap-6">
                <div>
                  <div className="text-foreground-secondary text-xs">
                    Total used
                  </div>
                  <div className="text-lg font-semibold">
                    {formatBytes(overview.totalUsedBytes)}
                  </div>
                </div>
                <div>
                  <div className="text-foreground-secondary text-xs">
                    Total quota
                  </div>
                  <div className="text-lg font-semibold">
                    {formatBytes(overview.totalQuotaBytes)}
                  </div>
                </div>
                <div>
                  <div className="text-foreground-secondary text-xs">
                    Users with usage
                  </div>
                  <div className="text-lg font-semibold">
                    {overview.userCount}
                  </div>
                </div>
              </div>

              {overview.users.length === 0 ? (
                <p className="text-foreground-secondary py-4 text-center text-sm">
                  No usage recorded yet.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {overview.users.map((row) => {
                    const pct =
                      row.quotaBytes > 0
                        ? (row.usedBytes / row.quotaBytes) * 100
                        : 0;
                    return (
                      <li
                        key={row.userId}
                        className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-medium">
                            {row.displayName}{' '}
                            <span className="text-foreground-secondary font-normal">
                              @{row.username}
                            </span>
                          </div>
                          <div className="text-foreground-secondary text-xs">
                            {formatBytes(row.usedBytes)} of{' '}
                            {formatBytes(row.quotaBytes)}
                            {' · '}
                            <span className={pct > 100 ? 'text-red-400' : ''}>
                              {Math.round(pct)}%
                            </span>
                          </div>
                        </div>
                        <QuotaEditor
                          userId={row.userId}
                          quotaBytes={row.quotaBytes}
                          onSaved={reload}
                        />
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
