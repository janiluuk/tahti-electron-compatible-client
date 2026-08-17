import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  createLedgerEntry,
  fetchAdminFinancial,
  LEDGER_CATEGORIES,
  type AdminFinancialOverview,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function formatEur(cents: number): string {
  return `€${(cents / 100).toLocaleString('fi-FI', { minimumFractionDigits: 2 })}`;
}

function categoryLabel(category: string): string {
  return category.replace(/_/g, ' ').toLowerCase();
}

export function AdminFinancialView() {
  const [overview, setOverview] = useState<AdminFinancialOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<string>(LEDGER_CATEGORIES[0]);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const reload = () => {
    void fetchAdminFinancial().then((res) => {
      setOverview(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/financial" />
        <StudioPageHeader
          title="Financial"
          subtitle="Ledger entries and fan-subscription revenue at a glance."
        />

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : !overview ? (
          <p className="text-foreground-secondary py-4 text-center text-sm">
            Could not load financial data.
          </p>
        ) : (
          <>
            <StudioPanel title="Fan subscriptions">
              <div className="flex flex-wrap gap-6">
                <div>
                  <div className="text-foreground-secondary text-xs">
                    Active subscriptions
                  </div>
                  <div className="text-lg font-semibold">
                    {overview.activeFanSubCount}
                  </div>
                </div>
                <div>
                  <div className="text-foreground-secondary text-xs">MRR</div>
                  <div className="text-lg font-semibold">
                    {formatEur(overview.mrrCents)}
                  </div>
                </div>
                <div>
                  <div className="text-foreground-secondary text-xs">
                    Pending payouts
                  </div>
                  <div className="text-lg font-semibold">
                    {overview.pendingPayouts.count} (
                    {formatEur(overview.pendingPayouts.totalNetCents)})
                  </div>
                </div>
                {overview.failedPayouts.count > 0 && (
                  <div>
                    <div className="text-foreground-secondary text-xs">
                      Failed payouts
                    </div>
                    <div className="text-lg font-semibold text-red-400">
                      {overview.failedPayouts.count} (
                      {formatEur(overview.failedPayouts.totalNetCents)})
                    </div>
                  </div>
                )}
              </div>
            </StudioPanel>

            <StudioPanel
              title="Ledger entries"
              action={
                <Button size="sm" onClick={() => setShowForm((v) => !v)}>
                  {showForm ? 'Cancel' : 'Add entry'}
                </Button>
              }
            >
              {showForm && (
                <div className="border-border mb-4 flex flex-col gap-2 border-b pb-4">
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="border-border bg-background rounded-md border px-2 py-1.5 text-xs"
                    >
                      {LEDGER_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {categoryLabel(c)}
                        </option>
                      ))}
                    </select>
                    <Input
                      placeholder="Amount (€, negative for cost)"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="h-8 w-52 text-xs"
                    />
                  </div>
                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="h-8 text-xs"
                  />
                  <div>
                    <Button
                      size="sm"
                      disabled={saving || !amount.trim() || !description.trim()}
                      onClick={() => {
                        const eur = Number(amount);
                        if (!Number.isFinite(eur)) {
                          return;
                        }
                        setSaving(true);
                        void createLedgerEntry({
                          category,
                          amountCents: Math.round(eur * 100),
                          description: description.trim(),
                        }).then(() => {
                          setSaving(false);
                          setShowForm(false);
                          setAmount('');
                          setDescription('');
                          reload();
                        });
                      }}
                    >
                      {saving ? 'Saving…' : 'Save entry'}
                    </Button>
                  </div>
                </div>
              )}

              {overview.entries.length === 0 ? (
                <p className="text-foreground-secondary py-4 text-center text-sm">
                  No ledger entries yet.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {overview.entries.map((e) => (
                    <li
                      key={e.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{e.description}</div>
                        <div className="text-foreground-secondary text-xs">
                          {categoryLabel(e.category)} ·{' '}
                          {new Date(e.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div
                        className={`text-sm font-medium ${e.amountCents < 0 ? 'text-red-400' : 'text-green-400'}`}
                      >
                        {e.amountCents < 0 ? '−' : '+'}
                        {formatEur(Math.abs(e.amountCents))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>
          </>
        )}
      </div>
    </AdminGate>
  );
}
