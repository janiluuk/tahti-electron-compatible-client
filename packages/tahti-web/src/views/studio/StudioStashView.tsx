import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchStashDownload,
  fetchStashFiles,
  type StashFile,
} from '../../api/sources';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { usePlayerStore } from '../../stores/playerStore';

export function StudioStashView() {
  const play = usePlayerStore((s) => s.play);
  const [files, setFiles] = useState<StashFile[]>([]);
  const [source, setSource] = useState('…');

  useEffect(() => {
    void fetchStashFiles().then((r) => {
      setFiles(r.data);
      setSource(r.meta.source);
    });
  }, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <StudioNav current="/studio/stash" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Stash
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Private locker (not public archive). Source: {source}. Full upload
            UI remains on production; preview downloads here.
          </p>
        </div>
        {files.length === 0 ? (
          <p className="text-foreground-secondary text-sm">No stash files.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {files.map((f) => (
              <li
                key={f.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2"
              >
                <div>
                  <div className="text-sm font-medium">{f.filename}</div>
                  <div className="text-foreground-secondary text-xs">
                    {f.contentType ?? 'file'}
                    {f.sizeBytes != null
                      ? ` · ${Math.round(f.sizeBytes / 1024)} KB`
                      : ''}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    void fetchStashDownload(f.id).then((r) => {
                      if (!r.data?.url) {
                        return;
                      }
                      play({
                        id: `stash:${f.id}`,
                        kind: 'archive',
                        title: f.filename,
                        artist: 'Stash',
                        streamUrl: r.data.url,
                        protocol: 'https',
                        sourceProvider: 'stash',
                      });
                    });
                  }}
                >
                  Play
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudioGate>
  );
}
