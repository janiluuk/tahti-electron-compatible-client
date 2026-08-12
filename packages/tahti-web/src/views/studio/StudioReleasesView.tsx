import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import type { FetchMeta } from '../../api/client';
import { createStudioRelease, fetchStudioReleases } from '../../api/studio';
import type { StudioRelease } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioReleasesView() {
  const [releases, setReleases] = useState<StudioRelease[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [openMoreId, setOpenMoreId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('SINGLE');
  const [releaseDate, setReleaseDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [msg, setMsg] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const reload = () => {
    void fetchStudioReleases().then((res) => {
      setReleases(res.data.releases);
      setMeta(res.meta);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const create = async () => {
    setCreating(true);
    setMsg(null);
    const r = await createStudioRelease({
      title: title.trim(),
      type,
      releaseDate,
    });
    setCreating(false);
    if (!r.ok) {
      setMsg(r.error);
      return;
    }
    setTitle('');
    setShowCreate(false);
    setMsg(`Created ${r.data.title}.`);
    reload();
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/releases" />
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Releases
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Package tracks into singles, EPs, and albums for your public link.
              {meta?.source === 'mock' ? ' (demo data)' : ''}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setShowCreate((v) => !v);
              setMsg(null);
            }}
          >
            {showCreate ? 'Cancel' : 'New release'}
          </Button>
        </header>

        {showCreate && (
          <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
            <h2 className="font-display text-lg font-bold">New release</h2>
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <label className="text-foreground-secondary text-xs uppercase">
              Type
              <select
                className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1.5 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                {['SINGLE', 'EP', 'ALBUM', 'COMPILATION'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-foreground-secondary text-xs uppercase">
              Release date
              <input
                type="date"
                className="border-border bg-background text-foreground mt-1 w-full rounded border px-2 py-1.5 text-sm"
                value={releaseDate}
                onChange={(e) => setReleaseDate(e.target.value)}
              />
            </label>
            <div>
              <Button
                size="sm"
                disabled={creating || !title.trim() || !releaseDate}
                onClick={() => void create()}
              >
                {creating ? 'Creating…' : 'Create'}
              </Button>
            </div>
            {msg && <p className="text-foreground-secondary text-sm">{msg}</p>}
          </section>
        )}

        {!showCreate && msg && (
          <p className="text-foreground-secondary text-sm">{msg}</p>
        )}

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : releases.length === 0 ? (
          <div className="border-border flex flex-col gap-3 rounded-lg border px-4 py-8 text-center">
            <p className="text-foreground-secondary text-sm">
              No releases yet. Create one to share a public link.
            </p>
            <div>
              <Button size="sm" onClick={() => setShowCreate(true)}>
                New release
              </Button>
            </div>
          </div>
        ) : (
          <ul className="border-border divide-border divide-y rounded-lg border">
            {releases.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-2 px-4 py-3 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to="/studio/releases/$id"
                    params={{ id: r.id }}
                    className="font-medium hover:underline"
                  >
                    {r.title}
                  </Link>
                  <p className="text-foreground-secondary text-xs">
                    {r.type}, {r.state}
                    {typeof r._count?.tracks === 'number'
                      ? `, ${r._count.tracks} tracks`
                      : ''}
                  </p>
                </div>
                <Link to="/studio/releases/$id" params={{ id: r.id }}>
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                </Link>
                <button
                  type="button"
                  className="text-foreground-secondary hover:text-foreground px-2 text-xs"
                  onClick={() =>
                    setOpenMoreId((id) => (id === r.id ? null : r.id))
                  }
                >
                  {openMoreId === r.id ? 'Less' : 'More'}
                </button>
                {openMoreId === r.id && (
                  <div className="flex w-full flex-wrap gap-2 pt-1">
                    <Link to="/r/$slug" params={{ slug: r.smartLinkSlug }}>
                      <Button size="sm" variant="text">
                        Public link
                      </Button>
                    </Link>
                    <Link to="/studio/distribution">
                      <Button size="sm" variant="text">
                        Distribution
                      </Button>
                    </Link>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudioGate>
  );
}
