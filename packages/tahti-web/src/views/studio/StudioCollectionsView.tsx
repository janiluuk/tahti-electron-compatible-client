import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import type { FetchMeta } from '../../api/client';
import {
  createStudioCollection,
  fetchStudioCollections,
} from '../../api/studio';
import type { StudioCollection } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

const CREATE_STYLES = ['ALBUM', 'EP', 'PLAYLIST', 'COMPILATION'] as const;

export function StudioCollectionsView() {
  const [rows, setRows] = useState<StudioCollection[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [style, setStyle] = useState<(typeof CREATE_STYLES)[number]>('ALBUM');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = () => {
    void fetchStudioCollections().then((res) => {
      setRows(res.data);
      setMeta(res.meta);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
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
            Album designer + playlists via <code>/api/me/collections</code>
            {meta ? ` (${meta.source})` : ''}.
          </p>
        </div>

        <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">
            New album / playlist
          </h2>
          <Input
            label="Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            {CREATE_STYLES.map((s) => (
              <button
                key={s}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${
                  style === s
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-foreground-secondary'
                }`}
                onClick={() => setStyle(s)}
              >
                {s}
              </button>
            ))}
          </div>
          <Button
            size="sm"
            disabled={!name.trim() || busy}
            onClick={() => {
              setBusy(true);
              setMsg(null);
              void createStudioCollection({
                name: name.trim(),
                style,
              }).then((r) => {
                setBusy(false);
                if (!r.ok) {
                  setMsg(r.error);
                  return;
                }
                setName('');
                setMsg(`Created ${r.data.name} — open designer to add tracks.`);
                reload();
              });
            }}
          >
            {busy ? 'Creating…' : 'Create'}
          </Button>
          {msg && <p className="text-sm">{msg}</p>}
        </section>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No collections yet — create an album above.
          </p>
        ) : (
          <ul className="border-border divide-border divide-y rounded-lg border">
            {rows.map((c) => (
              <li
                key={c.slug}
                className="flex items-center gap-3 px-4 py-3 text-sm"
              >
                {c.coverUrl ? (
                  <img
                    src={c.coverUrl}
                    alt=""
                    className="border-border h-12 w-12 rounded border object-cover"
                  />
                ) : (
                  <div className="border-border bg-background-secondary h-12 w-12 rounded border" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-foreground-secondary text-xs">
                    /{c.slug}
                    {c.style ? ` — ${c.style}` : ''}
                    {typeof c.itemCount === 'number'
                      ? `, ${c.itemCount} items`
                      : c.items
                        ? `, ${c.items.length} items`
                        : ''}
                    {c.isPublic === false ? ', private' : ''}
                  </p>
                </div>
                <Link to="/studio/collections/$slug" params={{ slug: c.slug }}>
                  <Button size="sm">
                    {c.style === 'ALBUM' || c.style === 'EP'
                      ? 'Design album'
                      : 'Edit'}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudioGate>
  );
}
