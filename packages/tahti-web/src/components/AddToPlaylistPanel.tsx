import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  addStudioCollectionItem,
  createStudioCollection,
  fetchStudioCollections,
} from '../api/studio';
import type { StudioCollection } from '../api/studio-types';
import { useAuthStore } from '../stores/authStore';

type Props = {
  archiveItemId: string;
  trackTitle: string;
  onClose: () => void;
};

export function AddToPlaylistPanel({
  archiveItemId,
  trackTitle,
  onClose,
}: Props) {
  const user = useAuthStore((s) => s.user);
  const [collections, setCollections] = useState<StudioCollection[] | null>(
    null,
  );
  const [loadError, setLoadError] = useState<string | null>(null);
  const [addingSlug, setAddingSlug] = useState<string | null>(null);
  const [addedSlugs, setAddedSlugs] = useState<Set<string>>(new Set());
  const [note, setNote] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [creatingBusy, setCreatingBusy] = useState(false);

  useEffect(() => {
    if (!user) {
      setCollections([]);
      return;
    }
    let cancelled = false;
    void fetchStudioCollections().then((res) => {
      if (cancelled) {
        return;
      }
      if (res.meta.source === 'api' || res.data.length > 0) {
        setCollections(res.data);
        setLoadError(res.meta.reason ?? null);
      } else if (res.meta.reason) {
        setLoadError(res.meta.reason);
        setCollections([]);
      } else {
        setCollections(res.data);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const addTo = async (slug: string, name: string) => {
    setAddingSlug(slug);
    setNote(null);
    try {
      const r = await addStudioCollectionItem(slug, archiveItemId);
      if (!r.ok) {
        setNote(r.error);
        return;
      }
      setAddedSlugs((prev) => new Set(prev).add(slug));
      setNote(`Added to ${name}`);
    } finally {
      setAddingSlug(null);
    }
  };

  const createAndAdd = async () => {
    const name = newName.trim();
    if (!name) {
      return;
    }
    setCreatingBusy(true);
    setNote(null);
    try {
      const created = await createStudioCollection({
        name,
        style: 'PLAYLIST',
      });
      if (!created.ok) {
        setNote(created.error);
        return;
      }
      const add = await addStudioCollectionItem(
        created.data.slug,
        archiveItemId,
      );
      if (!add.ok) {
        setNote(add.error);
        return;
      }
      setCollections((prev) => [created.data, ...(prev ?? [])]);
      setAddedSlugs((prev) => new Set(prev).add(created.data.slug));
      setNewName('');
      setCreating(false);
      setNote(`Created "${name}" and added the track`);
    } finally {
      setCreatingBusy(false);
    }
  };

  return (
    <div
      className="border-border bg-background-secondary absolute right-0 bottom-full z-30 mb-2 w-72 rounded-lg border p-3 shadow-lg"
      role="region"
      aria-label="Add to playlist"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-sm font-medium">
          Add &ldquo;{trackTitle}&rdquo; to…
        </p>
        <button
          type="button"
          className="text-foreground-secondary text-xs hover:underline"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {!user ? (
        <p className="text-foreground-secondary text-sm">
          <Link to="/login" className="underline" onClick={onClose}>
            Sign in
          </Link>{' '}
          to save tracks to a playlist.
        </p>
      ) : collections === null ? (
        <p className="text-foreground-secondary text-sm">Loading playlists…</p>
      ) : loadError && collections.length === 0 ? (
        <p className="text-foreground-secondary text-sm">{loadError}</p>
      ) : (
        <ul className="max-h-48 space-y-1 overflow-y-auto">
          {collections.map((c) => {
            const added = addedSlugs.has(c.slug);
            return (
              <li key={c.slug}>
                <button
                  type="button"
                  className="hover:bg-background flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm disabled:opacity-50"
                  disabled={added || addingSlug === c.slug}
                  onClick={() => void addTo(c.slug, c.name)}
                >
                  <span className="min-w-0 truncate">
                    {c.name}
                    {c.style ? (
                      <span className="text-foreground-secondary text-xs">
                        {' '}
                        ({c.style})
                      </span>
                    ) : null}
                  </span>
                  <span className="text-foreground-secondary shrink-0 text-xs">
                    {added
                      ? 'Added'
                      : addingSlug === c.slug
                        ? 'Adding…'
                        : 'Add'}
                  </span>
                </button>
              </li>
            );
          })}
          {collections.length === 0 && (
            <li className="text-foreground-secondary px-2 py-1 text-sm">
              No playlists yet.
            </li>
          )}
        </ul>
      )}

      {user && collections !== null && (
        <div className="border-border mt-2 border-t pt-2">
          {creating ? (
            <form
              className="flex flex-col gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void createAndAdd();
              }}
            >
              <Input
                label="Playlist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  type="submit"
                  disabled={creatingBusy || !newName.trim()}
                >
                  {creatingBusy ? 'Creating…' : 'Create & add'}
                </Button>
                <Button
                  size="sm"
                  variant="text"
                  type="button"
                  onClick={() => {
                    setCreating(false);
                    setNewName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCreating(true)}
            >
              + New playlist
            </Button>
          )}
        </div>
      )}

      {note && <p className="text-foreground-secondary mt-2 text-xs">{note}</p>}
    </div>
  );
}
