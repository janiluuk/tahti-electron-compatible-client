import { Link } from '@tanstack/react-router';
import {
  CheckIcon,
  GlobeIcon,
  ListMusicIcon,
  LockIcon,
  PlusIcon,
  UsersIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  addStudioCollectionItem,
  createStudioCollection,
  fetchStudioCollections,
} from '../api/studio';
import type { StudioCollection } from '../api/studio-types';
import { useAuthStore } from '../stores/authStore';

type Props = {
  isOpen: boolean;
  archiveItemId: string;
  trackTitle: string;
  onClose: () => void;
};

function playlistGlyph(c: StudioCollection) {
  if (c.collaborative && c.isPublic !== false) {
    return <UsersIcon size={22} aria-hidden />;
  }
  if (c.isPublic === false) {
    return <LockIcon size={22} aria-hidden />;
  }
  return <GlobeIcon size={22} aria-hidden />;
}

export function AddToPlaylistPanel({
  isOpen,
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
  const [newPublic, setNewPublic] = useState(true);
  const [newCollab, setNewCollab] = useState(false);
  const [creatingBusy, setCreatingBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }
    setNote(null);
    setCreating(false);
    setNewName('');
    setNewPublic(true);
    setNewCollab(false);
    setAddedSlugs(new Set());
    if (!user) {
      setCollections([]);
      return;
    }
    let cancelled = false;
    setCollections(null);
    void fetchStudioCollections().then((res) => {
      if (cancelled) {
        return;
      }
      const playlists = res.data.filter(
        (c) => !c.style || c.style === 'PLAYLIST' || c.style === 'CUSTOM',
      );
      setCollections(playlists.length > 0 ? playlists : res.data);
      setLoadError(res.meta.reason ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [user, isOpen]);

  const handleClose = () => {
    setCreating(false);
    setNewName('');
    setNote(null);
    onClose();
  };

  const addTo = async (slug: string, name: string) => {
    setAddingSlug(slug);
    setNote(null);
    try {
      const r = await addStudioCollectionItem(slug, { archiveItemId });
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
        isPublic: newPublic,
        collaborative: newPublic && newCollab,
      });
      if (!created.ok) {
        setNote(created.error);
        return;
      }
      const add = await addStudioCollectionItem(created.data.slug, {
        archiveItemId,
      });
      if (!add.ok) {
        setNote(add.error);
        return;
      }
      setCollections((prev) => [created.data, ...(prev ?? [])]);
      setAddedSlugs((prev) => new Set(prev).add(created.data.slug));
      setNewName('');
      setCreating(false);
      setNote(`Created “${name}” and added the track`);
    } finally {
      setCreatingBusy(false);
    }
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <Dialog.Title>
        <span className="inline-flex items-center gap-2">
          <ListMusicIcon size={18} aria-hidden />
          Add to playlist
        </span>
      </Dialog.Title>
      <Dialog.Description>
        Choose a playlist for &ldquo;{trackTitle}&rdquo;, or create one.
      </Dialog.Description>

      <div className="mt-4">
        {!user ? (
          <p className="text-foreground-secondary text-sm">
            <Link to="/login" className="underline" onClick={handleClose}>
              Sign in
            </Link>{' '}
            to save tracks to a playlist.
          </p>
        ) : collections === null ? (
          <p className="text-foreground-secondary text-sm">
            Loading playlists…
          </p>
        ) : loadError && collections.length === 0 ? (
          <p className="text-foreground-secondary text-sm">{loadError}</p>
        ) : (
          <div className="grid max-h-64 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {collections.map((c) => {
              const added = addedSlugs.has(c.slug);
              const busy = addingSlug === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  className={`border-border hover:border-primary flex flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center disabled:opacity-50 ${
                    added ? 'border-primary bg-primary/10' : ''
                  }`}
                  disabled={added || busy}
                  onClick={() => void addTo(c.slug, c.name)}
                  aria-label={added ? `Added to ${c.name}` : `Add to ${c.name}`}
                  title={c.name}
                >
                  <span className="text-foreground-secondary flex h-10 w-10 items-center justify-center">
                    {added ? (
                      <CheckIcon
                        size={22}
                        className="text-primary"
                        aria-hidden
                      />
                    ) : (
                      playlistGlyph(c)
                    )}
                  </span>
                  <span className="line-clamp-2 w-full text-[11px] leading-tight">
                    {c.name}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              className="border-border hover:border-primary flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-2 py-3 text-center"
              onClick={() => setCreating(true)}
              aria-label="Create new playlist"
              title="New playlist"
            >
              <span className="text-foreground-secondary flex h-10 w-10 items-center justify-center">
                <PlusIcon size={22} aria-hidden />
              </span>
              <span className="text-[11px] leading-tight">New</span>
            </button>
            {collections.length === 0 && (
              <p className="text-foreground-secondary col-span-full px-1 text-xs">
                No playlists yet — tap New.
              </p>
            )}
          </div>
        )}
      </div>

      {user && creating && (
        <form
          className="border-border mt-4 flex flex-col gap-3 border-t pt-4"
          onSubmit={(e) => {
            e.preventDefault();
            void createAndAdd();
          }}
        >
          <Input
            label="Playlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            autoFocus
          />
          <div className="flex flex-wrap gap-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newPublic}
                onChange={(e) => {
                  setNewPublic(e.target.checked);
                  if (!e.target.checked) {
                    setNewCollab(false);
                  }
                }}
              />
              Public
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newCollab}
                disabled={!newPublic}
                onChange={(e) => setNewCollab(e.target.checked)}
              />
              Others can add tracks
            </label>
          </div>
          <Dialog.Actions>
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
            <Button
              size="sm"
              type="submit"
              disabled={creatingBusy || !newName.trim()}
            >
              <PlusIcon size={16} aria-hidden className="mr-1.5" />
              {creatingBusy ? 'Creating…' : 'Create & add'}
            </Button>
          </Dialog.Actions>
        </form>
      )}

      {note && <p className="text-foreground-secondary mt-3 text-xs">{note}</p>}
    </Dialog.Root>
  );
}
