import { PlayIcon, Trash2Icon, UploadIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  deleteStashFile,
  fetchStashDownload,
  fetchStashFiles,
  uploadStashFile,
  type StashFile,
} from '../../api/sources';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { usePlayerStore } from '../../stores/playerStore';

export function StudioStashView() {
  const play = usePlayerStore((s) => s.play);
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<StashFile[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () =>
    fetchStashFiles().then((r) => {
      setFiles(r.data);
    });

  useEffect(() => {
    void reload();
  }, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <StudioNav current="/studio/stash" />
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Stash
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Private locker, not public archive.
            </p>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                e.target.value = '';
                if (!file) {
                  return;
                }
                setBusy(true);
                setMsg(null);
                void uploadStashFile(file).then((res) => {
                  setBusy(false);
                  if (!res.ok) {
                    setMsg(res.error);
                    return;
                  }
                  setMsg(`Uploaded ${file.name}`);
                  void reload();
                });
              }}
            />
            <Button
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              <span className="inline-flex items-center gap-1.5">
                <UploadIcon size={14} />
                {busy ? 'Uploading…' : 'Upload'}
              </span>
            </Button>
          </div>
        </div>
        {msg && <p className="text-sm">{msg}</p>}
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
                <div className="flex gap-1">
                  <Button
                    size="icon-sm"
                    title="Play"
                    aria-label="Play"
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
                    <PlayIcon size={16} className="fill-current" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="secondary"
                    title="Delete"
                    aria-label="Delete"
                    onClick={() => {
                      void deleteStashFile(f.id).then((res) => {
                        if (!res.ok) {
                          setMsg(res.error);
                          return;
                        }
                        setFiles((prev) => prev.filter((x) => x.id !== f.id));
                      });
                    }}
                  >
                    <Trash2Icon size={16} />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudioGate>
  );
}
