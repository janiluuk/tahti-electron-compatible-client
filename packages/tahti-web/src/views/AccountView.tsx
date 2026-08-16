import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchMembership, fetchMySubscriptions } from '../api/client';
import type { FanSubscriptionRow, MembershipStatus } from '../api/types';
import { useAuthStore } from '../stores/authStore';

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export function AccountView() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [membership, setMembership] = useState<MembershipStatus | null>(null);
  const [subs, setSubs] = useState<FanSubscriptionRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setMembership(null);
      setSubs([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    void Promise.all([fetchMembership(), fetchMySubscriptions()]).then(
      ([m, s]) => {
        if (cancelled) {
          return;
        }
        setMembership(m.data);
        setSubs(s.data);
        setLoading(false);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Account
        </h1>
        <p className="text-foreground-secondary text-sm">
          Sign in to see membership status and fan subscriptions.
        </p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Account
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            {user.displayName} (@{user.username}) — member dashboard lite
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://tahti.live/dashboard"
            target="_blank"
            rel="noreferrer"
          >
            <Button size="sm" variant="secondary">
              Open production dashboard
            </Button>
          </a>
          <Button size="sm" variant="text" onClick={() => void logout()}>
            Log out
          </Button>
        </div>
      </div>

      {loading && <p className="text-foreground-secondary text-sm">Loading…</p>}

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold">Membership</h2>
        {!membership ? (
          <p className="text-foreground-secondary text-sm">
            Could not load <code>/api/me/membership</code>.
          </p>
        ) : (
          <dl className="border-border grid gap-2 rounded-lg border p-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-foreground-secondary text-xs uppercase">
                Status
              </dt>
              <dd>{membership.status}</dd>
            </div>
            <div>
              <dt className="text-foreground-secondary text-xs uppercase">
                Member
              </dt>
              <dd>{membership.isMember ? 'Yes' : 'No'}</dd>
            </div>
            {membership.memberNumber != null && (
              <div>
                <dt className="text-foreground-secondary text-xs uppercase">
                  Member #
                </dt>
                <dd>{membership.memberNumber}</dd>
              </div>
            )}
            {membership.tier && (
              <div>
                <dt className="text-foreground-secondary text-xs uppercase">
                  Tier
                </dt>
                <dd>{membership.tier}</dd>
              </div>
            )}
            {typeof membership.priceCents === 'number' && (
              <div>
                <dt className="text-foreground-secondary text-xs uppercase">
                  Dues
                </dt>
                <dd>{euros(membership.priceCents)} / year</dd>
              </div>
            )}
            {membership.renewalDueAt && (
              <div>
                <dt className="text-foreground-secondary text-xs uppercase">
                  Renewal
                </dt>
                <dd>
                  {new Date(membership.renewalDueAt).toLocaleDateString()}
                </dd>
              </div>
            )}
          </dl>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="font-display text-xl font-bold">Fan subscriptions</h2>
        {subs.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No fan subscriptions on this account. Support an artist from their
            profile.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {subs.map((s) => (
              <li
                key={s.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
              >
                <div>
                  <Link
                    to="/u/$username"
                    params={{ username: s.artist.username }}
                    className="font-medium hover:underline"
                  >
                    {s.artist.displayName}
                  </Link>
                  <p className="text-foreground-secondary text-xs">
                    {s.tierName}, {euros(s.amountCents)}/mo, {s.state}
                    {s.currentPeriodEnd
                      ? `, until ${new Date(s.currentPeriodEnd).toLocaleDateString()}`
                      : ''}
                  </p>
                </div>
                <Link
                  to="/subscribe/$username"
                  params={{ username: s.artist.username }}
                >
                  <Button size="sm" variant="text">
                    Tiers
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-foreground-secondary text-xs">
        Studio tools (broadcast, uploads, settings) stay on{' '}
        <a
          href="https://tahti.live/dashboard"
          className="underline-offset-2 hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          tahti.live/dashboard
        </a>
        .
      </p>
    </div>
  );
}
