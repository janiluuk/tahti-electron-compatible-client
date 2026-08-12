import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchVenues, type FetchMeta } from '../api/client';
import type { VenueDirectoryItem } from '../api/types';

export function VenuesView() {
  const [venues, setVenues] = useState<VenueDirectoryItem[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchVenues().then((res) => {
      if (cancelled) {
        return;
      }
      setVenues(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Venues
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          Verified venue directory from Tahti.{' '}
          <Link
            to="/venues/register"
            className="underline-offset-2 hover:underline"
          >
            Register a venue
          </Link>{' '}
          for board review.
        </p>
        {meta && (
          <p className="text-foreground-secondary mt-2 text-xs">
            Source: {meta.source}
            {meta.reason ? ` (${meta.reason})` : ''} —{' '}
            <code>/api/v1/venues</code>
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-foreground-secondary text-sm">Loading venues…</p>
      ) : venues.length === 0 ? (
        <p className="text-foreground-secondary text-sm">
          No verified venues returned.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {venues.map((v) => (
            <li
              key={v.id}
              className="border-border flex flex-col gap-1 rounded-lg border px-4 py-3"
            >
              <div className="font-medium">{v.name}</div>
              <div className="text-foreground-secondary text-xs">
                {[v.city, v.countryCode].filter(Boolean).join(', ')}
                {v.capacity != null ? ` — cap. ${v.capacity}` : ''}
              </div>
              {v.description && (
                <p className="text-foreground text-sm">{v.description}</p>
              )}
              <a
                href={`https://tahti.live/venues/${v.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
              >
                Open on tahti.live
              </a>
            </li>
          ))}
        </ul>
      )}

      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        Full feature map →
      </Link>
    </div>
  );
}
