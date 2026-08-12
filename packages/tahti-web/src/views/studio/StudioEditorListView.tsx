import { Link } from '@tanstack/react-router';
import { AudioLinesIcon, PlusIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

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
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [archiveItemId, setArchiveItemId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

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

  const closeCreate = () => {
    setCreateOpen(false);
    setTitle('');
    setArchiveItemId('');
    setBusy(false);
  };

  const submitCreate = () => {
    if (busy) {
      return;
    }
    setBusy(true);
    void createEditorProject({
      title: title || undefined,
      archiveItemId: archiveItemId || undefined,
    }).then((r) => {
      setBusy(false);
      if (!r.ok) {
        setMessage(r.error);
        return;
      }
      setMessage(`Created ${r.data.title}`);
      closeCreate();
      reload();
    });
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <StudioNav current="/studio/editor" />
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Audio editor
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Multitrack sessions (<code>/api/me/editor/projects</code>) plus
              the pro archive editor (trim/cut → draft → render). Real vs mock
              shown per action.
              {meta ? ` List source: ${meta.source}.` : ''}
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              setMessage(null);
              setCreateOpen(true);
            }}
            aria-label="New session"
            title="New session"
          >
            <PlusIcon size={16} aria-hidden className="mr-1.5" />
            New
          </Button>
        </header>

        {message && (
          <p className="text-foreground-secondary text-xs">{message}</p>
        )}

        <Dialog.Root isOpen={createOpen} onClose={closeCreate}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitCreate();
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <AudioLinesIcon size={18} aria-hidden />
                New session
              </span>
            </Dialog.Title>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled session"
                autoFocus
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
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button type="submit" disabled={busy}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Creating…' : 'Create project'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>

        <section className="flex flex-col gap-2">
          <h2 className="font-display text-lg font-bold">Projects</h2>
          {projects.length === 0 ? (
            <div className="border-border flex flex-col items-center gap-3 rounded-lg border px-4 py-8 text-center">
              <p className="text-foreground-secondary text-sm">
                No editor projects yet.
              </p>
              <Button size="sm" onClick={() => setCreateOpen(true)}>
                <PlusIcon size={16} aria-hidden className="mr-1.5" />
                New session
              </Button>
            </div>
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
                    <AudioLinesIcon size={14} aria-hidden className="mr-1" />
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
