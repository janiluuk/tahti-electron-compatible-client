import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchFanConnectPortal,
  fetchFanConnectStatus,
  fetchGrantEstimate,
  fetchMyGrants,
  startFanConnectOnboard,
  type FanConnectStatus,
  type GrantEstimate,
  type GrantRow,
} from '../../api/revenue';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function euros(cents: number | string): string {
  const n = typeof cents === 'string' ? Number(cents) : cents;
  if (!Number.isFinite(n)) {
    return '—';
  }
  return `€${(n / 100).toFixed(n % 100 === 0 ? 0 : 2)}`;
}

export function StudioRevenueView() {
  const [connect, setConnect] = useState<FanConnectStatus | null>(null);
  const [grants, setGrants] = useState<GrantRow[]>([]);
  const [estimate, setEstimate] = useState<GrantEstimate | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([
      fetchFanConnectStatus(),
      fetchMyGrants(),
      fetchGrantEstimate(),
    ]).then(([c, g, e]) => {
      setConnect(c.data);
      setGrants(g.data);
      setEstimate(e.data);
    });
  }, []);

  return (
    <StudioGate requireChannel={false}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/revenue" />
        <StudioPageHeader
          title="Revenue"
          subtitle="Fan subscription payouts and your cooperative grant share."
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        {connect && (
          <StudioPanel title="Fan subs · Stripe Connect">
            <div className="text-foreground-secondary flex flex-wrap gap-2 text-xs">
              <span
                className={`rounded-full border px-2 py-0.5 ${connect.stripeConfigured ? 'border-primary/40' : 'border-border'}`}
              >
                {connect.stripeConfigured ? '✓' : '○'} Stripe configured
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 ${connect.chargesEnabled ? 'border-primary/40' : 'border-border'}`}
              >
                {connect.chargesEnabled ? '✓' : '○'} Charges enabled
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 ${connect.detailsSubmitted ? 'border-primary/40' : 'border-border'}`}
              >
                {connect.detailsSubmitted ? '✓' : '○'} Details submitted
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 ${connect.paymentsReady ? 'border-primary/40' : 'border-border'}`}
              >
                {connect.paymentsReady ? '✓' : '○'} Payments ready
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {!connect.paymentsReady && (
                <Button
                  size="sm"
                  onClick={() => {
                    void startFanConnectOnboard().then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                        return;
                      }
                      if ('mockActivated' in r) {
                        setMsg(r.message);
                        void fetchFanConnectStatus().then((x) => {
                          setConnect(x.data);
                        });
                        return;
                      }
                      window.open(r.url, '_blank', 'noopener,noreferrer');
                    });
                  }}
                >
                  Start / resume onboarding
                </Button>
              )}
              {connect.accountId && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    void fetchFanConnectPortal().then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                        return;
                      }
                      if ('mockActivated' in r) {
                        setMsg(r.message);
                        return;
                      }
                      window.open(r.url, '_blank', 'noopener,noreferrer');
                    });
                  }}
                >
                  Open Stripe portal
                </Button>
              )}
            </div>
          </StudioPanel>
        )}

        {estimate && (
          <StudioPanel title={`Grant estimate (${estimate.year})`}>
            <p className="text-3xl font-bold">
              {euros(estimate.estimateCents)}
            </p>
            <p className="text-foreground-secondary mt-1 text-sm">
              {estimate.units} engagement units
              {estimate.eligible
                ? ', eligible'
                : ', not yet eligible (need more units)'}
            </p>
          </StudioPanel>
        )}

        <StudioPanel title="Past grants">
          {grants.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No disbursements yet.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {grants.map((g) => (
                <li
                  key={`${g.forYear}-${g.state}`}
                  className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
                >
                  <span>
                    {g.forYear} — {g.state}
                  </span>
                  <span className="font-medium">{euros(g.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
