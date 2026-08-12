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
  const [title, setTitle] = useState('');
  const [type, setType] = useState('SINGLE');
  const [releaseDate, setReleaseDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [msg, setMsg] = useState<string | null>(null);

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

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/releases" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Releases
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Smart-link releases from <code>GET /api/me/releases</code>
            {meta ? ` (${meta.source})` : ''}.
          </p>
        </div>

        <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">Create release</h2>
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
          <Button
            size="sm"
            disabled={!title.trim() || !releaseDate}
            onClick={() => {
              void createStudioRelease({
                title: title.trim(),
                type,
                releaseDate,
              }).then((r) => {
                if (!r.ok) {
                  setMsg(r.error);
                } else {
                  setTitle('');
                  setMsg(
                    `Created ${r.data.title} (/r/${r.data.smartLinkSlug}).`,
                  );
                  reload();
                }
              });
            }}
          >
            Create
          </Button>
          {msg && <p className="text-sm">{msg}</p>}
        </section>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : releases.length === 0 ? (
          <p className="text-foreground-secondary text-sm">No releases yet.</p>
        ) : (
          <ul className="border-border divide-border divide-y rounded-lg border">
            {releases.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
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
                    {r.type}, {r.state}, /r/{r.smartLinkSlug}
                    {typeof r._count?.tracks === 'number'
                      ? `, ${r._count.tracks} tracks`
                      : ''}
                  </p>
                </div>
                <Link to="/r/$slug" params={{ slug: r.smartLinkSlug }}>
                  <Button size="sm" variant="text">
                    Public
                  </Button>
                </Link>
                <Link to="/studio/releases/$id" params={{ id: r.id }}>
                  <Button size="sm" variant="secondary">
                    Detail
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
