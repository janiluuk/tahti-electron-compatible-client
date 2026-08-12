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
  const [source, setSource] = useState('');

  useEffect(() => {
    void fetchStudioArchiveItem(id).then((res) => {
      setItem(res.data);
      setTitle(res.data.title);
      setDescription(res.data.description ?? '');
      setGenre(res.data.genre ?? '');
      setIsPublic(res.data.isPublic !== false);
      setSource(res.meta.source);
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
    setMessage('Saved metadata.');
  };

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
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {item.title}
              </h1>
              <p className="text-foreground-secondary mt-1 text-xs">
                {item.status} — metadata via PATCH /api/me/archive/:id ({source}
                )
              </p>
            </div>
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
            {message && (
              <p className="text-foreground-secondary text-sm">{message}</p>
            )}
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={saving || !title.trim()}
                onClick={() => void save()}
              >
                {saving ? 'Saving…' : 'Save metadata'}
              </Button>
              <Link to="/studio/archive/$id/editor" params={{ id }}>
                <Button variant="secondary">Open audio editor</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </StudioGate>
  );
}
