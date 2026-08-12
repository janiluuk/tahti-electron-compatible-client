import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  addStudioCollectionItem,
  fetchStudioArchive,
  fetchStudioCollection,
  removeStudioCollectionItem,
  reorderStudioCollectionItems,
} from '../../api/studio';
import type {
  StudioArchiveItem,
  StudioCollection,
} from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioCollectionEditView({ slug }: { slug: string }) {
  const [col, setCol] = useState<StudioCollection | null>(null);
  const [archive, setArchive] = useState<StudioArchiveItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [addId, setAddId] = useState('');

  const reload = () => {
    void Promise.all([fetchStudioCollection(slug), fetchStudioArchive()]).then(
      ([c, a]) => {
        setCol(c.data);
        setArchive(a.data);
      },
    );
  };

  useEffect(() => {
    reload();
  }, [slug]);

  const items = col?.items ?? [];

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...items];
    const j = index + dir;
    if (j < 0 || j >= next.length) {
      return;
    }
    const tmp = next[index]!;
    next[index] = next[j]!;
    next[j] = tmp;
    setCol((c) => (c ? { ...c, items: next } : c));
    const result = await reorderStudioCollectionItems(
      slug,
      next.map((i) => i.id),
    );
    setMessage(result.ok ? 'Reordered.' : result.error);
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/collections" />
        <Link
          to="/studio/collections"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Collections
        </Link>
        {!col ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : (
          <>
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {col.name}
              </h1>
              <p className="text-foreground-secondary text-xs">
                Editor lite — add / reorder / remove via
                /api/me/collections/:slug/*
              </p>
            </div>

            <ul className="border-border divide-border divide-y rounded-lg border">
              {items.length === 0 && (
                <li className="text-foreground-secondary px-4 py-3 text-sm">
                  No items yet.
                </li>
              )}
              {items.map((item, idx) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 px-4 py-2 text-sm"
                >
                  <span className="text-foreground-secondary w-6">
                    {idx + 1}.
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {item.archiveItem?.title ?? item.release?.title ?? item.id}
                  </span>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => void move(idx, -1)}
                  >
                    Up
                  </Button>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => void move(idx, 1)}
                  >
                    Down
                  </Button>
                  <Button
                    size="sm"
                    variant="text"
                    onClick={() => {
                      void removeStudioCollectionItem(slug, item.id).then(() =>
                        reload(),
                      );
                    }}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-end gap-2">
              <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Add archive item
                </span>
                <select
                  value={addId}
                  onChange={(e) => setAddId(e.target.value)}
                  className="border-border bg-background rounded-md border px-3 py-2"
                >
                  <option value="">Select…</option>
                  {archive.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.title}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                size="sm"
                disabled={!addId}
                onClick={() => {
                  void addStudioCollectionItem(slug, addId).then((r) => {
                    setMessage(r.ok ? 'Added.' : r.error);
                    if (r.ok) {
                      setAddId('');
                      reload();
                    }
                  });
                }}
              >
                Add
              </Button>
            </div>
            {message && (
              <p className="text-foreground-secondary text-sm">{message}</p>
            )}
          </>
        )}
      </div>
    </StudioGate>
  );
}
