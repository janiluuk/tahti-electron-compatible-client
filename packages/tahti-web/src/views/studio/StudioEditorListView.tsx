import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import type { FetchMeta } from '../../api/client';
import {
  createEditorProject,
  fetchEditorProjects,
  fetchStudioArchive,
} from '../../api/studio';
import type {
  EditorProjectRow,
  StudioArchiveItem,
} from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioEditorListView() {
  const [projects, setProjects] = useState<EditorProjectRow[]>([]);
  const [archive, setArchive] = useState<StudioArchiveItem[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [title, setTitle] = useState('');
  const [archiveItemId, setArchiveItemId] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const reload = () => {
    void Promise.all([fetchEditorProjects(), fetchStudioArchive()]).then(
      ([p, a]) => {
        setProjects(p.data);
        setMeta(p.meta);
        setArchive(a.data);
      },
    );
  };

  useEffect(() => {
    reload();
  }, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/editor" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Audio editor
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Multitrack sessions (<code>/api/me/editor/projects</code>) plus the
            pro archive editor (trim/cut → draft → render). Real vs mock shown
            per action.
            {meta ? ` List source: ${meta.source}.` : ''}
          </p>
        </div>

        <section className="border-border flex flex-col gap-3 rounded-lg border p-4">
          <h2 className="font-display text-lg font-bold">New session</h2>
          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled session"
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground-secondary text-xs uppercase">
              Seed from archive (optional)
            </span>
            <select
              value={archiveItemId}
              onChange={(e) => setArchiveItemId(e.target.value)}
              className="border-border bg-background rounded-md border px-3 py-2"
            >
              <option value="">None</option>
              {archive.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </select>
          </label>
          <Button
            size="sm"
            onClick={() => {
              void createEditorProject({
                title: title || undefined,
                archiveItemId: archiveItemId || undefined,
              }).then((r) => {
                if (!r.ok) {
                  setMessage(r.error);
                  return;
                }
                setMessage(`Created ${r.data.title}`);
                setTitle('');
                reload();
              });
            }}
          >
            Create project
          </Button>
          {message && (
            <p className="text-foreground-secondary text-xs">{message}</p>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Projects</h2>
          {projects.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No editor projects yet.
            </p>
          ) : (
            <ul className="border-border divide-border divide-y rounded-lg border">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-foreground-secondary text-xs">
                      Updated {new Date(p.updatedAt).toLocaleString()}
                      {p.archiveItemId ? `, archive ${p.archiveItemId}` : ''}
                    </p>
                  </div>
                  <Link to="/studio/editor/$id" params={{ id: p.id }}>
                    <Button size="sm" variant="secondary">
                      Open
                    </Button>
                  </Link>
                  {p.archiveItemId && (
                    <Link
                      to="/studio/archive/$id/editor"
                      params={{ id: p.archiveItemId }}
                    >
                      <Button size="sm">Pro editor</Button>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">
            Open archive in pro editor
          </h2>
          <ul className="flex flex-wrap gap-2">
            {archive.slice(0, 8).map((a) => (
              <li key={a.id}>
                <Link to="/studio/archive/$id/editor" params={{ id: a.id }}>
                  <Button size="sm" variant="text">
                    {a.title}
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </StudioGate>
  );
}
