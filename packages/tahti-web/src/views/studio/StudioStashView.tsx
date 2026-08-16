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
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
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
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/stash" />
        <StudioPageHeader
          title="Stash"
          subtitle="Private locker, not public archive."
          action={
            <>
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
                aria-label="Upload"
                title="Upload"
              >
                <UploadIcon size={16} aria-hidden className="mr-1.5" />
                {busy ? 'Uploading…' : 'Upload'}
              </Button>
            </>
          }
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel>
          {files.length === 0 ? (
            <div className="flex flex-col gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No stash files yet.
              </p>
              <div>
                <Button size="sm" onClick={() => inputRef.current?.click()}>
                  <UploadIcon size={16} aria-hidden className="mr-1.5" />
                  Upload
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{f.filename}</div>
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
                      variant="text"
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
                      variant="text"
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
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
