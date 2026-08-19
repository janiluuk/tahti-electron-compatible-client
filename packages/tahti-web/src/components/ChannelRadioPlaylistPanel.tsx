import { Link } from '@tanstack/react-router';
import { ListMusicIcon, PlusIcon, RadioIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input, Toggle } from '@nuclearplayer/ui';

import {
  createStudioCollection,
  fetchStudioCollection,
  fetchStudioCollections,
} from '../api/studio';
import {
  applyPlaylistToProgramme,
  fetchProgramme,
  MAX_RADIO_PLAYLIST_ITEMS,
  patchProgramme,
  type ProgrammeView,
} from '../api/studio-extras';
import type { StudioCollection } from '../api/studio-types';

/** 24/7 radio — pick or create a playlist, apply as offline rotation. */
export function ChannelRadioPlaylistPanel() {
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [playlists, setPlaylists] = useState<StudioCollection[]>([]);
  const [selectedSlug, setSelectedSlug] = useState('');
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void Promise.all([fetchProgramme(), fetchStudioCollections()]).then(
      ([p, c]) => {
        setProgramme(p.data);
        setPlaylists(
          c.data.filter(
            (x) => !x.style || x.style === 'PLAYLIST' || x.style === 'CUSTOM',
          ),
        );
      },
    );
  };

  useEffect(() => {
    reload();
  }, []);

  const toggleRadio = async (on: boolean) => {
    setBusy(true);
    setMsg(null);
    const r = await patchProgramme({ fallbackEnabled: on });
    setBusy(false);
    if (!r.ok) {
      setMsg(r.error);
      return;
    }
    setProgramme(r.data);
  };

  const applySelected = async (slug: string) => {
    setBusy(true);
    setMsg(null);
    const { data } = await fetchStudioCollection(slug);
    const ids = (data.items ?? [])
      .map((i) => i.archiveItemId)
      .filter((id): id is string => Boolean(id));
    const r = await applyPlaylistToProgramme(ids, {
      enable: true,
      mode: 'ordered',
    });
    setBusy(false);
    if (!r.ok) {
      setMsg(r.error);
      return;
    }
    setProgramme(r.data);
    setSelectedSlug(slug);
    setMsg(
      `24/7 uses “${data.name}” (${Math.min(ids.length, MAX_RADIO_PLAYLIST_ITEMS)} tracks).`,
    );
  };

  const createInline = async () => {
    if (!newName.trim()) {
      return;
    }
    setBusy(true);
    const created = await createStudioCollection({
      name: newName.trim(),
      style: 'PLAYLIST',
      isPublic: true,
    });
    setBusy(false);
    if (!created.ok) {
      setMsg(created.error);
      return;
    }
    setCreating(false);
    setNewName('');
    setPlaylists((prev) => [created.data, ...prev]);
    setSelectedSlug(created.data.slug);
    setMsg(
      `Created “${created.data.name}”. Add tracks in Playlists, then Apply.`,
    );
  };

  const on = programme?.fallbackEnabled ?? false;

  return (
    <section className="border-border bg-background-secondary/40 rounded-xl border p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-lg font-bold tracking-tight">
            <RadioIcon size={18} aria-hidden />
            24/7 radio
          </h2>
          <p className="text-foreground-secondary mt-1 text-sm">
            When you&apos;re offline, this playlist loops on your channel (up to{' '}
            {MAX_RADIO_PLAYLIST_ITEMS} tracks).
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Toggle
            checked={on}
            disabled={busy || !programme}
            onChange={(checked) => void toggleRadio(checked)}
            aria-label="24/7 radio"
          />
          {on ? 'On' : 'Off'}
        </label>
      </div>

      {on && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground-secondary text-xs uppercase">
              Playlist
            </span>
            <select
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="border-border bg-background rounded-md border px-3 py-2"
            >
              <option value="">Choose…</option>
              {playlists.map((p) => (
                <option key={p.slug} value={p.slug}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              disabled={busy || !selectedSlug}
              onClick={() => void applySelected(selectedSlug)}
            >
              Apply to radio
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCreating((v) => !v)}
            >
              <PlusIcon size={14} aria-hidden className="mr-1" />
              New playlist
            </Button>
            {selectedSlug ? (
              <Link
                to="/studio/playlists/$slug"
                params={{ slug: selectedSlug }}
              >
                <Button size="sm" variant="text">
                  <ListMusicIcon size={14} aria-hidden className="mr-1" />
                  Edit playlist
                </Button>
              </Link>
            ) : (
              <Link to="/studio/playlists">
                <Button size="sm" variant="text">
                  Open playlists
                </Button>
              </Link>
            )}
          </div>
          {creating && (
            <div className="border-border bg-background flex flex-col gap-2 rounded-lg border p-3">
              <Input
                label="Playlist name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
              />
              <Button
                size="sm"
                disabled={busy || !newName.trim()}
                onClick={() => void createInline()}
              >
                Create
              </Button>
            </div>
          )}
          {programme &&
            programme.items.filter((i) => i.isFallback).length > 0 && (
              <p className="text-foreground-secondary text-xs">
                Rotation now:{' '}
                {programme.items.filter((i) => i.isFallback).length} tracks (
                {programme.fallbackMode})
              </p>
            )}
        </div>
      )}

      {msg && <p className="text-foreground-secondary mt-3 text-xs">{msg}</p>}
    </section>
  );
}
