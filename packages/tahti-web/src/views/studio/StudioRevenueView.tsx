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
  const [source, setSource] = useState('…');
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
      setSource(c.meta.source);
    });
  }, []);

  return (
    <StudioGate requireChannel={false}>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/revenue" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Revenue
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Fan-sub Connect status + cooperative grant share. Source: {source}.
          </p>
        </div>

        {connect && (
          <section className="border-border rounded-xl border p-4">
            <h2 className="font-display text-lg font-bold">
              Fan subs / Stripe Connect
            </h2>
            <ul className="text-foreground-secondary mt-2 space-y-1 text-sm">
              <li>
                Stripe configured: {connect.stripeConfigured ? 'yes' : 'no'}
              </li>
              <li>Charges enabled: {connect.chargesEnabled ? 'yes' : 'no'}</li>
              <li>
                Details submitted: {connect.detailsSubmitted ? 'yes' : 'no'}
              </li>
              <li>Payments ready: {connect.paymentsReady ? 'yes' : 'no'}</li>
              {connect.accountId && (
                <li>
                  Account: <code>{connect.accountId}</code>
                </li>
              )}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              {!connect.paymentsReady && (
                <Button
                  size="sm"
                  onClick={() => {
                    void startFanConnectOnboard().then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                      } else {
                        window.open(r.url, '_blank', 'noopener,noreferrer');
                      }
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
                      } else {
                        window.open(r.url, '_blank', 'noopener,noreferrer');
                      }
                    });
                  }}
                >
                  Open Stripe portal
                </Button>
              )}
            </div>
          </section>
        )}

        {estimate && (
          <section className="border-border rounded-xl border p-4">
            <h2 className="font-display text-lg font-bold">
              Grant estimate ({estimate.year})
            </h2>
            <p className="mt-2 text-2xl font-bold">
              {euros(estimate.estimateCents)}
            </p>
            <p className="text-foreground-secondary text-sm">
              {estimate.units} engagement units
              {estimate.eligible
                ? ', eligible'
                : ', not yet eligible (need more units)'}
            </p>
          </section>
        )}

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Past grants</h2>
          {grants.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No disbursements yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {grants.map((g) => (
                <li
                  key={`${g.forYear}-${g.state}`}
                  className="border-border flex justify-between rounded border px-3 py-2 text-sm"
                >
                  <span>
                    {g.forYear} — {g.state}
                  </span>
                  <span>{euros(g.amountCents)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </StudioGate>
  );
}
