import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  createFanTier,
  fetchMyFanTiers,
  setFanTierActive,
  type FanTierRow,
} from '../api/fan-tiers';

const PERK_OPTIONS = [
  { key: 'FAN_CHAT', label: 'Fan chat' },
  { key: 'FAN_NEWSLETTER', label: 'Fan newsletter' },
  { key: 'EARLY_ACCESS', label: 'Early access' },
] as const;

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function FanTiersEditor() {
  const [tiers, setTiers] = useState<FanTierRow[]>([]);
  const [source, setSource] = useState('…');
  const [name, setName] = useState('Supporter');
  const [eurosAmt, setEurosAmt] = useState('5');
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState<string[]>(['FAN_CHAT']);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    void fetchMyFanTiers().then((r) => {
      setTiers(r.data);
      setSource(r.meta.source);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const togglePerk = (key: string) => {
    setPerks((prev) =>
      prev.includes(key) ? prev.filter((p) => p !== key) : [...prev, key],
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-foreground-secondary text-xs">
        Artist fan tiers via <code>/api/me/fan-tiers</code> ({source}).
      </p>

      {tiers.length === 0 ? (
        <p className="text-foreground-secondary text-sm">No tiers yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {tiers.map((t) => (
            <li
              key={t.id}
              className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <div className="font-medium">
                  {t.name}{' '}
                  <span className="text-foreground-secondary">
                    {euros(t.amountCents)}/mo
                  </span>
                  {t.active === false ? (
                    <span className="text-foreground-secondary">
                      {' '}
                      · inactive
                    </span>
                  ) : null}
                </div>
                {t.description && (
                  <p className="text-foreground-secondary text-xs">
                    {t.description}
                  </p>
                )}
                {t.perks && t.perks.length > 0 && (
                  <p className="text-foreground-secondary text-[10px]">
                    {t.perks.join(', ')}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void setFanTierActive(t.id, t.active === false).then((r) => {
                    if (!r.ok) {
                      setMsg(r.error);
                      return;
                    }
                    reload();
                  });
                }}
              >
                {t.active === false ? 'Activate' : 'Deactivate'}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <div className="border-border flex flex-col gap-3 rounded-xl border p-4">
        <h3 className="font-display text-base font-bold">New tier</h3>
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Price (€ / month)"
          value={eurosAmt}
          onChange={(e) => setEurosAmt(e.target.value)}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground-secondary text-xs uppercase">
            Description
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="border-border bg-background rounded-md border px-3 py-2 outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {PERK_OPTIONS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs ${
                perks.includes(p.key)
                  ? 'border-primary bg-primary/15 text-primary'
                  : 'border-border text-foreground-secondary'
              }`}
              onClick={() => togglePerk(p.key)}
            >
              {p.label}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          disabled={busy || !name.trim()}
          onClick={() => {
            const eurosN = Number(eurosAmt.replace(',', '.'));
            if (!Number.isFinite(eurosN) || eurosN < 1) {
              setMsg('Enter a price of at least €1.');
              return;
            }
            setBusy(true);
            setMsg(null);
            void createFanTier({
              name: name.trim(),
              amountCents: Math.round(eurosN * 100),
              description: description.trim() || undefined,
              perks,
            }).then((r) => {
              setBusy(false);
              if (!r.ok) {
                setMsg(r.error);
                return;
              }
              setMsg('Tier created.');
              setDescription('');
              reload();
            });
          }}
        >
          {busy ? 'Creating…' : 'Create tier'}
        </Button>
        {msg && <p className="text-foreground-secondary text-xs">{msg}</p>}
      </div>
    </div>
  );
}
