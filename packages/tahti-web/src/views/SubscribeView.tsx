import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchFanTiers,
  startFanSubscribe,
  type FetchMeta,
} from '../api/client';
import type { FanTiersResponse } from '../api/types';
import { useAuthStore } from '../stores/authStore';

function formatEur(cents: number) {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}/mo`;
}

export function SubscribeView({ username }: { username: string }) {
  const [data, setData] = useState<FanTiersResponse | null>(null);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyTier, setBusyTier] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    void fetchFanTiers(username).then((res) => {
      if (cancelled) {
        return;
      }
      setData(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [username]);

  if (loading) {
    return <p className="text-foreground-secondary text-sm">Loading tiers…</p>;
  }

  if (!data) {
    return <p className="text-sm">Artist not found.</p>;
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/u/$username"
        params={{ username }}
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← @{username}
      </Link>

      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Subscribe to {data.artist.displayName}
        </h1>
        <p className="text-foreground-secondary text-sm">
          @{data.artist.username}
        </p>
        {data.artist.bio && (
          <p className="text-foreground max-w-2xl text-sm whitespace-pre-wrap">
            {data.artist.bio}
          </p>
        )}
        {meta && (
          <p className="text-foreground-secondary text-xs">
            Source: {meta.source}
            {meta.reason ? ` (${meta.reason})` : ''}
            {!data.paymentsReady ? ' — payments not ready on this artist' : ''}
          </p>
        )}
      </header>

      {!user && (
        <p className="border-border bg-background-secondary rounded-lg border px-3 py-2 text-sm">
          Sign in to start Stripe Checkout.{' '}
          <Link to="/login" className="underline-offset-2 hover:underline">
            Login
          </Link>{' '}
          or{' '}
          <Link to="/join" className="underline-offset-2 hover:underline">
            Join
          </Link>
          . Tier cards still load anonymously.
        </p>
      )}

      {note && <p className="text-foreground-secondary text-sm">{note}</p>}

      {data.tiers.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No active fan tiers yet.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {data.tiers.map((tier) => (
            <div
              key={tier.id}
              className="border-border bg-background flex flex-col gap-3 rounded-lg border p-4"
            >
              <div>
                <div className="font-display text-lg font-bold">
                  {tier.name}
                </div>
                <div className="text-primary text-sm font-semibold">
                  {formatEur(tier.amountCents)}
                </div>
              </div>
              {tier.description && (
                <p className="text-foreground-secondary text-sm">
                  {tier.description}
                </p>
              )}
              {tier.perks && tier.perks.length > 0 && (
                <ul className="text-foreground-secondary list-inside list-disc text-xs">
                  {tier.perks.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              )}
              <Button
                size="sm"
                disabled={busyTier === tier.id}
                onClick={() => {
                  if (!user) {
                    setNote(
                      'Log in first, then Subscribe opens Stripe Checkout (or redirects).',
                    );
                    return;
                  }
                  setBusyTier(tier.id);
                  setNote(null);
                  void startFanSubscribe(username, tier.id).then((res) => {
                    setBusyTier(null);
                    if (!res.ok) {
                      setNote(res.error);
                      return;
                    }
                    if ('checkoutUrl' in res) {
                      setNote('Redirecting to Stripe Checkout…');
                      window.location.assign(res.checkoutUrl);
                      return;
                    }
                    setNote(res.message);
                  });
                }}
              >
                {busyTier === tier.id ? 'Starting…' : 'Subscribe'}
              </Button>
              {!data.paymentsReady && meta?.source !== 'mock' && (
                <p className="text-foreground-secondary text-[10px]">
                  Artist Connect may not accept charges yet — checkout can 503.
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-foreground-secondary text-xs">
        API: <code>GET /api/v1/u/:username/tiers</code>,{' '}
        <code>POST /api/v1/u/:username/subscribe</code> →{' '}
        <code>checkoutUrl</code>
      </p>
    </div>
  );
}
