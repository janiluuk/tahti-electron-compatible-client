import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchStudioArchiveItem,
  patchStudioArchiveItem,
} from '../../api/studio';
import type { StudioArchiveItem } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioArchiveItemView({ id }: { id: string }) {
  const [item, setItem] = useState<StudioArchiveItem | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    void fetchStudioArchiveItem(id).then((res) => {
      setItem(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description ?? '');
      setGenre(res.data.genre ?? '');
      setIsPublic(res.data.isPublic !== false);
    });
  }, [id]);

  const save = async () => {
    setSaving(true);
    setMessage(null);
    const result = await patchStudioArchiveItem(id, {
      title,
      description,
      genre: genre || null,
      isPublic,
    });
    setSaving(false);
    if (!result.ok) {
      setMessage(result.error);
      return;
    }
    setItem(result.data);
    setMessage('Saved.');
  };

  const visibility = item
    ? item.isPublic === false
      ? 'Private'
      : 'Public'
    : '';

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <StudioNav current="/studio/archive" />
        <Link
          to="/studio/archive"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Music
        </Link>
        {!item ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : (
          <>
            <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="font-display text-3xl font-extrabold tracking-tight">
                  {item.title}
                </h1>
                <p className="text-foreground-secondary mt-1 text-sm">
                  Edit title, description, and visibility.
                  <span className="ml-2 text-xs tracking-wide uppercase opacity-70">
                    {item.status}, {visibility}
                  </span>
                </p>
              </div>
              <Button
                disabled={saving || !title.trim()}
                onClick={() => void save()}
              >
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </header>

            <div className="flex flex-col gap-4">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="border-border bg-background focus:border-primary rounded-md border px-3 py-2 outline-none"
                />
              </label>
              <Input
                label="Genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                />
                Public on channel
              </label>
            </div>

            {message && (
              <p className="text-foreground-secondary text-sm">{message}</p>
            )}

            <div>
              <button
                type="button"
                className="text-foreground-secondary hover:text-foreground text-xs tracking-wide uppercase"
                onClick={() => setShowMore((v) => !v)}
              >
                {showMore ? 'Hide more' : 'More tools'}
              </button>
              {showMore && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link to="/studio/archive/$id/editor" params={{ id }}>
                    <Button size="sm" variant="secondary">
                      Audio editor
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StudioGate>
  );
}
