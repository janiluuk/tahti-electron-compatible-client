import { useEffect, useState } from 'react';

import { Button, Dialog, Input, Textarea } from '@nuclearplayer/ui';

import { fetchStudioArchiveItem, patchStudioArchiveItem } from '../api/studio';
import type {
  StudioArchiveItem,
  StudioArchivePatch,
} from '../api/studio-types';

type Tab = 'info' | 'visuals';

type Props = {
  archiveItemId: string | null;
  onClose: () => void;
  onSaved?: (item: StudioArchiveItem) => void;
};

/** Quick edit modal for a track the current user owns — essential
 * metadata plus cover/backdrop image, without leaving to the full
 * Studio archive editor. Gated by the caller: only rendered/opened for
 * tracks the viewer actually has edit rights on. */
export function TrackEditDialog({ archiveItemId, onClose, onSaved }: Props) {
  const isOpen = Boolean(archiveItemId);
  const [tab, setTab] = useState<Tab>('info');
  const [item, setItem] = useState<StudioArchiveItem | null>(null);
  const [form, setForm] = useState<StudioArchivePatch>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!archiveItemId) {
      setItem(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTab('info');
    void fetchStudioArchiveItem(archiveItemId).then((res) => {
      if (cancelled) {
        return;
      }
      setItem(res.data);
      setForm({
        title: res.data.title,
        description: res.data.description ?? '',
        genre: res.data.genre ?? '',
        license: res.data.license ?? '',
        isPublic: res.data.isPublic ?? true,
        bannerUrl: res.data.bannerUrl ?? '',
      });
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [archiveItemId]);

  const save = async () => {
    if (!archiveItemId) {
      return;
    }
    setSaving(true);
    setError(null);
    const result = await patchStudioArchiveItem(archiveItemId, form);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    onSaved?.(result.data);
    onClose();
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose} className="max-w-lg">
      {loading || !item ? (
        <p className="text-foreground-secondary text-sm">Loading track…</p>
      ) : (
        <>
          <Dialog.Title>Edit “{item.title}”</Dialog.Title>

          <div className="border-border mt-2 mb-4 flex gap-2 border-b">
            {(
              [
                { id: 'info' as const, label: 'Info' },
                { id: 'visuals' as const, label: 'Visuals' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
                  tab === t.id
                    ? 'border-primary text-foreground'
                    : 'text-foreground-secondary hover:text-foreground border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'info' && (
            <div className="flex flex-col gap-3">
              <Input
                label="Title"
                value={form.title ?? ''}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <label className="flex flex-col gap-1 text-sm">
                Description
                <Textarea
                  rows={3}
                  value={form.description ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Genre"
                  value={form.genre ?? ''}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                />
                <Input
                  label="License"
                  value={form.license ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, license: e.target.value })
                  }
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.isPublic ?? true}
                  onChange={(e) =>
                    setForm({ ...form, isPublic: e.target.checked })
                  }
                />
                Public on profile
              </label>
            </div>
          )}

          {tab === 'visuals' && (
            <div className="flex flex-col gap-3">
              <div className="border-border bg-background-secondary flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg border">
                {form.bannerUrl ? (
                  <img
                    src={form.bannerUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-foreground-secondary text-xs">
                    No cover/backdrop set
                  </span>
                )}
              </div>
              <Input
                label="Cover / backdrop image URL"
                value={form.bannerUrl ?? ''}
                placeholder="https://…"
                onChange={(e) =>
                  setForm({ ...form, bannerUrl: e.target.value || null })
                }
              />
              <p className="text-foreground-secondary text-xs">
                Shown as the track&apos;s artwork in listings, players, and
                embeds.
              </p>
            </div>
          )}

          {error && (
            <p className="text-accent-red mt-3 text-sm" role="alert">
              {error}
            </p>
          )}

          <Dialog.Actions>
            <Dialog.Close>Cancel</Dialog.Close>
            <Button disabled={saving} onClick={() => void save()}>
              {saving ? 'Saving…' : 'Save'}
            </Button>
          </Dialog.Actions>
        </>
      )}
    </Dialog.Root>
  );
}
