import { useEffect, useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import type { FetchMeta } from '../../api/client';
import {
  fetchReleaseRoyalties,
  fetchRevelatorBilling,
  fetchRevelatorStatus,
  startRevelatorCheckout,
  submitToRevelator,
} from '../../api/distribution';
import { fetchStudioReleases } from '../../api/studio';
import type {
  RevelatorBillingStatus,
  RevelatorReleaseStatus,
  RevelatorRoyaltyReportRow,
  StudioRelease,
} from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

function statusColor(
  status: string | null,
): 'green' | 'yellow' | 'red' | 'secondary' {
  if (status === 'delivered' || status === 'live') {
    return 'green';
  }
  if (status === 'pending') {
    return 'yellow';
  }
  if (status === 'failed') {
    return 'red';
  }
  return 'secondary';
}

function ReleaseDistributionPanel({ release }: { release: StudioRelease }) {
  const [status, setStatus] = useState<RevelatorReleaseStatus | null>(null);
  const [billing, setBilling] = useState<RevelatorBillingStatus | null>(null);
  const [royalties, setRoyalties] = useState<RevelatorRoyaltyReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    void Promise.all([
      fetchRevelatorStatus(release.id),
      fetchRevelatorBilling(release.id),
      fetchReleaseRoyalties(release.id),
    ]).then(([s, b, r]) => {
      setStatus(s.data);
      setBilling(b.data);
      setRoyalties(r.data);
      setLoading(false);
    });
  };

  useEffect(reload, [release.id]);

  const canSubmit =
    (release._count?.tracks ?? release.tracks?.length ?? 0) > 0 &&
    (!status?.revelatorStatus || status.revelatorStatus === 'failed');

  return (
    <div className="border-border rounded-lg border p-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{release.title}</p>
          <p className="text-foreground-secondary text-xs">
            {release.type} · {release._count?.tracks ?? 0} tracks
            {release.upc ? ` · UPC ${release.upc}` : ''}
          </p>
        </div>
        <Badge
          variant="pill"
          color={statusColor(status?.revelatorStatus ?? null)}
        >
          {status?.revelatorStatus ?? 'not submitted'}
        </Badge>
      </div>

      {loading ? (
        <p className="text-foreground-secondary mt-3 text-xs">Loading…</p>
      ) : (
        <>
          {billing && (
            <p className="text-foreground-secondary mt-3 text-xs">
              {billing.paid
                ? `Distribution fee paid${billing.distributionPaidAt ? ` on ${new Date(billing.distributionPaidAt).toLocaleDateString()}` : ''}.`
                : billing.studioIncludedRemaining
                  ? `${billing.studioIncludedRemaining} Studio-included submission(s) left, or pay ${euros(billing.feeCents)}.`
                  : `Distribution fee: ${euros(billing.feeCents)}.`}
            </p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {billing && !billing.paid && (
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setBusy(true);
                  void startRevelatorCheckout(release.id).then((r) => {
                    setBusy(false);
                    if (!r.ok) {
                      setMsg(r.error);
                      return;
                    }
                    if ('checkoutUrl' in r.data) {
                      window.location.href = r.data.checkoutUrl;
                      return;
                    }
                    setMsg('Distribution fee settled.');
                    reload();
                  });
                }}
              >
                Pay distribution fee
              </Button>
            )}
            <Button
              size="sm"
              disabled={busy || !canSubmit}
              onClick={() => {
                setBusy(true);
                void submitToRevelator(release.id).then((r) => {
                  setBusy(false);
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setMsg('Submitted to Revelator.');
                    reload();
                  }
                });
              }}
            >
              Submit to Revelator
            </Button>
          </div>

          {msg && <p className="mt-2 text-xs">{msg}</p>}

          {royalties.length > 0 && (
            <div className="mt-4">
              <p className="text-foreground-secondary text-xs uppercase">
                Royalty reports
              </p>
              <table className="mt-1 w-full text-left text-xs">
                <thead>
                  <tr className="text-foreground-secondary">
                    <th className="py-1 pr-3 font-medium">Period</th>
                    <th className="py-1 pr-3 font-medium">Streams</th>
                    <th className="py-1 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {royalties.map((row) => (
                    <tr key={row.id} className="border-border border-t">
                      <td className="py-1 pr-3">
                        {row.periodStart} – {row.periodEnd}
                      </td>
                      <td className="py-1 pr-3">
                        {row.streams?.toLocaleString() ?? '—'}
                      </td>
                      <td className="py-1">
                        {euros(row.amountCents)} {row.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function StudioDistributionView() {
  const [releases, setReleases] = useState<StudioRelease[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStudioReleases().then((res) => {
      setReleases(res.data.releases);
      setMeta(res.meta);
      setLoading(false);
    });
  }, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/distribution" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Distribution
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Submit releases to Revelator for streaming platforms, and track
            royalty reports.
            {meta ? ` Source: ${meta.source}.` : ''}
          </p>
        </div>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : releases.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No releases yet — create one under Releases first.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {releases.map((release) => (
              <ReleaseDistributionPanel key={release.id} release={release} />
            ))}
          </div>
        )}
      </div>
    </StudioGate>
  );
}
