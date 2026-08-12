import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import {
  fetchTransparencyGrants,
  fetchTransparencyLedger,
  fetchTransparencyYtd,
  type FetchMeta,
} from '../api/client';
import type {
  TransparencyGrantReport,
  TransparencyLedgerEntry,
  TransparencyYtd,
} from '../api/types';

function centsLabel(raw: string) {
  const n = Number(raw);
  if (!Number.isFinite(n)) {
    return raw;
  }
  return `€${(n / 100).toFixed(2)}`;
}

export function TransparencyView() {
  const [ytd, setYtd] = useState<TransparencyYtd | null>(null);
  const [grants, setGrants] = useState<TransparencyGrantReport | null>(null);
  const [ledger, setLedger] = useState<TransparencyLedgerEntry[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetchTransparencyYtd(),
      fetchTransparencyGrants(),
      fetchTransparencyLedger(),
    ]).then(([y, g, l]) => {
      if (cancelled) {
        return;
      }
      setYtd(y.data);
      setGrants(g.data);
      setLedger(l.data);
      setMeta(y.meta.source === 'api' ? y.meta : g.meta);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <p className="text-foreground-secondary text-sm">Loading transparency…</p>
    );
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Tahti map
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Transparency
        </h1>
        <p className="text-foreground-secondary max-w-2xl text-sm">
          Public co-op ledger snapshots from <code>/api/v1/transparency/*</code>
          .
        </p>
        {meta && (
          <p className="text-foreground-secondary text-xs">
            Source: {meta.source}
            {meta.reason ? ` (${meta.reason})` : ''}
          </p>
        )}
      </header>

      {ytd && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold">YTD {ytd.year}</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label="Running surplus"
              value={centsLabel(ytd.runningSurplus)}
            />
            <Stat
              label="Months finalized"
              value={String(ytd.monthsFinalized)}
            />
            <Stat
              label="Categories"
              value={String(Object.keys(ytd.byCategory).length)}
            />
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-border text-foreground-secondary border-b text-xs uppercase">
                <th className="py-2 pr-3 font-medium">Category</th>
                <th className="py-2 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(ytd.byCategory).map(([cat, amt]) => (
                <tr key={cat} className="border-border border-b">
                  <td className="py-2 pr-3 font-mono text-xs">{cat}</td>
                  <td className="py-2">{centsLabel(amt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {grants && (
        <section className="flex flex-col gap-3">
          <h2 className="font-display text-xl font-bold">
            Grants {grants.year}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Total" value={centsLabel(grants.totalCents)} />
            <Stat label="Count" value={String(grants.grantCount)} />
            <Stat
              label="Disbursed"
              value={grants.disbursedAt ? grants.disbursedAt.slice(0, 10) : '—'}
            />
          </div>
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-border text-foreground-secondary border-b text-xs uppercase">
                <th className="py-2 pr-3 font-medium">Published as</th>
                <th className="py-2 pr-3 font-medium">Amount</th>
                <th className="py-2 font-medium">State</th>
              </tr>
            </thead>
            <tbody>
              {grants.grants.map((g) => (
                <tr
                  key={`${g.publishedAs}-${g.amountCents}`}
                  className="border-border border-b"
                >
                  <td className="py-2 pr-3">{g.publishedAs}</td>
                  <td className="py-2 pr-3">{centsLabel(g.amountCents)}</td>
                  <td className="text-foreground-secondary py-2 text-xs">
                    {g.state}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold">Latest ledger</h2>
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-border text-foreground-secondary border-b text-xs uppercase">
              <th className="py-2 pr-3 font-medium">When</th>
              <th className="py-2 pr-3 font-medium">Category</th>
              <th className="py-2 pr-3 font-medium">Description</th>
              <th className="py-2 font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((e) => (
              <tr key={e.id} className="border-border border-b">
                <td className="text-foreground-secondary py-2 pr-3 text-xs">
                  {e.createdAt.slice(0, 10)}
                </td>
                <td className="py-2 pr-3 font-mono text-xs">{e.category}</td>
                <td className="py-2 pr-3">{e.description}</td>
                <td className="py-2">{centsLabel(e.amountCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-border bg-background rounded-lg border p-3">
      <div className="text-foreground-secondary text-[10px] tracking-wide uppercase">
        {label}
      </div>
      <div className="font-display mt-1 text-lg font-bold">{value}</div>
    </div>
  );
}
