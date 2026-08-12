import { Link } from '@tanstack/react-router';
import { AudioLinesIcon, FolderOpenIcon, PlusIcon } from 'lucide-react';
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
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioEditorListView() {
  const [projects, setProjects] = useState<EditorProjectRow[]>([]);
  const [archive, setArchive] = useState<StudioArchiveItem[]>([]);
  const [meta, setMeta] = useState<FetchMeta | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [archiveItemId, setArchiveItemId] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    void Promise.all([fetchEditorProjects(), fetchStudioArchive()]).then(
      ([p, a]) => {
        setProjects(p.data);
        setMeta(p.meta);
        setArchive(a.data);
        setLoading(false);
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
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/editor" />
        <StudioPageHeader
          title="Audio editor"
          subtitle={`Trim and process archive tracks. Sessions keep a linked archive when you seed one.${meta?.source === 'mock' ? ' (demo data)' : ''}`}
          action={
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
          }
        />

        {message && (
          <p className="text-foreground-secondary text-xs" role="status">
            {message}
          </p>
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
                {busy ? 'Creating…' : 'Create'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>

        <StudioPanel title="Projects">
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : projects.length === 0 ? (
            <div className="flex flex-col gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No editor projects yet.
              </p>
              <div>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon size={16} aria-hidden className="mr-1.5" />
                  New session
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {projects.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{p.title}</p>
                    <p className="text-foreground-secondary text-xs">
                      Updated {new Date(p.updatedAt).toLocaleString()}
                      {p.archiveItemId ? ', linked archive' : ''}
                    </p>
                  </div>
                  <Link to="/studio/editor/$id" params={{ id: p.id }}>
                    <Button
                      size="icon-sm"
                      variant="secondary"
                      aria-label={`Open ${p.title}`}
                      title="Open session"
                    >
                      <FolderOpenIcon size={16} aria-hidden />
                    </Button>
                  </Link>
                  {p.archiveItemId && (
                    <Link
                      to="/studio/archive/$id/editor"
                      params={{ id: p.archiveItemId }}
                    >
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label="Pro editor"
                        title="Pro editor"
                      >
                        <AudioLinesIcon size={16} aria-hidden />
                      </Button>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>

        <StudioPanel
          title="Open archive in pro editor"
          description="Jump straight into trim and render for a library track."
        >
          {archive.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              Upload a track in Library first.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              {archive.slice(0, 8).map((a) => (
                <li key={a.id}>
                  <Link to="/studio/archive/$id/editor" params={{ id: a.id }}>
                    <Button
                      size="sm"
                      variant="secondary"
                      aria-label={`Edit ${a.title}`}
                      title={a.title}
                    >
                      <AudioLinesIcon
                        size={14}
                        aria-hidden
                        className="mr-1.5"
                      />
                      <span className="max-w-[10rem] truncate">{a.title}</span>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
