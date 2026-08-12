import { Link } from '@tanstack/react-router';
import { AudioLinesIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import { fetchEditorProject } from '../../api/studio';
import type { EditorProjectDetail } from '../../api/studio-types';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioEditorProjectView({ id }: { id: string }) {
  const [project, setProject] = useState<EditorProjectDetail | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    void fetchEditorProject(id).then((res) => {
      setProject(res.data);
      setIsDemo(res.meta.source === 'mock');
    });
  }, [id]);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/editor" />
        <p className="text-foreground-secondary -mb-2 text-xs">
          <Link
            to="/studio/editor"
            className="underline-offset-2 hover:underline"
          >
            ← Editor
          </Link>
        </p>
        {!project ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">
              Loading project…
            </p>
          </StudioPanel>
        ) : (
          <>
            <StudioPageHeader
              title={project.title}
              subtitle={`Multitrack session.${isDemo ? ' (demo data)' : ''} Open the linked archive in the pro trim editor when available.`}
              action={
                project.archiveItemId ? (
                  <Link
                    to="/studio/archive/$id/editor"
                    params={{ id: project.archiveItemId }}
                  >
                    <Button
                      size="sm"
                      aria-label="Open pro editor"
                      title="Open pro editor"
                    >
                      <AudioLinesIcon
                        size={16}
                        aria-hidden
                        className="mr-1.5"
                      />
                      Pro editor
                    </Button>
                  </Link>
                ) : undefined
              }
            />
            <StudioPanel title="Session">
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-foreground-secondary text-xs uppercase">
                    Updated
                  </dt>
                  <dd className="mt-0.5">
                    {new Date(project.updatedAt).toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="text-foreground-secondary text-xs uppercase">
                    Archive link
                  </dt>
                  <dd className="mt-0.5">
                    {project.archiveItemId ? (
                      <Link
                        to="/studio/archive/$id"
                        params={{ id: project.archiveItemId }}
                        className="underline-offset-2 hover:underline"
                      >
                        Open in Library
                      </Link>
                    ) : (
                      'None'
                    )}
                  </dd>
                </div>
              </dl>
              {!project.archiveItemId && (
                <p className="text-foreground-secondary mt-4 text-sm">
                  No archive seed — create a project from an archive item, or
                  open Library → Audio editor.
                </p>
              )}
            </StudioPanel>
          </>
        )}
      </div>
    </StudioGate>
  );
}
