import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { fetchVenues } from '../api/client';
import type { VenueDirectoryItem } from '../api/types';
import { PageFrame, PageHeader } from '../components/PageHeader';

export function VenuesView() {
  const [venues, setVenues] = useState<VenueDirectoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void fetchVenues().then((res) => {
      if (cancelled) {
        return;
      }
      setVenues(res.data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <PageFrame maxWidth="3xl">
      <PageHeader
        title="Venues"
        subtitle="Browse verified venues in the Tahti community."
        actions={
          <Link
            to="/venues/register"
            className="text-sm font-medium underline-offset-2 hover:underline"
          >
            Register a venue
          </Link>
        }
      />

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
    </PageFrame>
  );
}
