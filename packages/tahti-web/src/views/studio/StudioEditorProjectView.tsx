import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchEditorProject } from '../../api/studio';
import type { EditorProjectDetail } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

export function StudioEditorProjectView({ id }: { id: string }) {
  const [project, setProject] = useState<EditorProjectDetail | null>(null);
  const [source, setSource] = useState('');

  useEffect(() => {
    void fetchEditorProject(id).then((res) => {
      setProject(res.data);
      setSource(res.meta.source);
    });
  }, [id]);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/editor" />
        <Link
          to="/studio/editor"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Editor
        </Link>
        {!project ? (
          <p className="text-foreground-secondary text-sm">Loading project…</p>
        ) : (
          <>
            <div>
              <h1 className="font-display text-3xl font-extrabold tracking-tight">
                {project.title}
              </h1>
              <p className="text-foreground-secondary mt-1 text-sm">
                Multitrack session ({source}). Full DAW mixdown stays on
                production; this POC opens the linked archive in the pro
                trim/cut editor.
              </p>
            </div>
            <dl className="border-border grid gap-2 rounded-lg border p-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-foreground-secondary text-xs uppercase">
                  Project id
                </dt>
                <dd className="font-mono text-xs">{project.id}</dd>
              </div>
              <div>
                <dt className="text-foreground-secondary text-xs uppercase">
                  Updated
                </dt>
                <dd>{new Date(project.updatedAt).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-foreground-secondary text-xs uppercase">
                  Archive link
                </dt>
                <dd>{project.archiveItemId ?? 'none'}</dd>
              </div>
            </dl>
            {project.archiveItemId ? (
              <Link
                to="/studio/archive/$id/editor"
                params={{ id: project.archiveItemId }}
              >
                <Button>Open pro editor for linked archive</Button>
              </Link>
            ) : (
              <p className="text-foreground-secondary text-sm">
                No archive seed — create a project from an archive item, or open
                Music → Edit audio.
              </p>
            )}
          </>
        )}
      </div>
    </StudioGate>
  );
}
