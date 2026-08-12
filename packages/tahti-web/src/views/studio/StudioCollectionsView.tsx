import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import type { FetchMeta } from '../../api/client';
import { fetchStudioCollections } from '../../api/studio';
import type { StudioCollection } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioCollectionsView() {
  const [rows, setRows] = useState<StudioCollection[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchStudioCollections().then((res) => {
      setRows(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
  }, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/collections" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Collections
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Manage playlists via <code>/api/me/collections</code>
            {meta ? ` (${meta.source})` : ''}.
          </p>
        </div>
        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No collections yet.
          </p>
        ) : (
          <ul className="border-border divide-border divide-y rounded-lg border">
            {rows.map((c) => (
              <li
                key={c.slug}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-foreground-secondary text-xs">
                    /{c.slug}
                    {typeof c.itemCount === 'number'
                      ? `, ${c.itemCount} items`
                      : c.items
                        ? `, ${c.items.length} items`
                        : ''}
                    {c.isPublic === false ? ', private' : ''}
                  </p>
                </div>
                <Link to="/studio/collections/$slug" params={{ slug: c.slug }}>
                  <Button size="sm">Edit</Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudioGate>
  );
}
