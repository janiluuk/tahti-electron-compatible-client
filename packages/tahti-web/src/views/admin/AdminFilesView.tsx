import { PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge, Button, Input } from '@nuclearplayer/ui';

import {
  deleteAdminFile,
  fetchAdminFiles,
  type AdminFileRow,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { usePlayerStore } from '../../stores/playerStore';

function fmtDuration(sec: number | null): string {
  if (!sec) {
    return '—';
  }
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AdminFilesView() {
  const play = usePlayerStore((s) => s.play);
  const [query, setQuery] = useState('');
  const [files, setFiles] = useState<AdminFileRow[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = (q?: string) => {
    void fetchAdminFiles(q).then((res) => {
      setFiles(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    const handle = setTimeout(() => reload(query), 250);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/files" />
        <StudioPageHeader
          title="Files"
          subtitle="Every archive item across every channel, in one browsable table."
        />

        <Input
          placeholder="Search by title, artist, or username…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : files.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No files match this search.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {files.map((f) => (
                <li
                  key={f.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{f.title}</div>
                    <div className="text-foreground-secondary text-xs">
                      {f.artistName} · @{f.username} ·{' '}
                      {fmtDuration(f.durationSec)}
                      {f.genre ? ` · ${f.genre}` : ''}
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="pill"
                      color={f.isPublic ? 'green' : 'secondary'}
                    >
                      {f.isPublic ? 'Public' : 'Private'}
                    </Badge>
                    {f.audioUrl && (
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label="Preview"
                        title="Preview"
                        onClick={() => {
                          play({
                            id: `admin-file:${f.id}`,
                            kind: 'archive',
                            title: f.title,
                            artist: f.artistName,
                            streamUrl: f.audioUrl!,
                            protocol: 'https',
                          });
                        }}
                      >
                        <PlayIcon size={16} aria-hidden />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => {
                        if (
                          !window.confirm(`Delete "${f.title}" permanently?`)
                        ) {
                          return;
                        }
                        void deleteAdminFile(f.id).then(() => reload(query));
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
