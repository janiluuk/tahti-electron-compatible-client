import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchAdminStreams,
  forceStreamOffline,
  pauseStream,
  restartStream,
  resumeStream,
  skipStreamTrack,
  type AdminLiveStreamRow,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}h ${m}m`;
  }
  if (m > 0) {
    return `${m}m ${s}s`;
  }
  return `${s}s`;
}

export function AdminStreamsView() {
  const [streams, setStreams] = useState<AdminLiveStreamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchAdminStreams().then((res) => {
      setStreams(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const run = (
    slug: string,
    action: (
      slug: string,
    ) => Promise<{ ok: true } | { ok: false; error: string }>,
    confirmText?: string,
  ) => {
    if (confirmText && !window.confirm(confirmText)) {
      return;
    }
    setBusySlug(slug);
    void action(slug).then((r) => {
      setBusySlug(null);
      if (!r.ok) {
        setMsg(r.error);
      } else {
        reload();
      }
    });
  };

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/streams" />
        <StudioPageHeader
          title="Stream manager"
          subtitle={`${streams.length} channel${streams.length === 1 ? '' : 's'} live. Restart bounces audio without ending the broadcast; Skip/Pause/Resume affect the archive rotation.`}
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : streams.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No channels are live right now.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {streams.map((s) => (
                <li key={s.slug} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-medium">
                        {s.artistName}
                        {s.isRotation && (
                          <span className="text-foreground-secondary font-normal">
                            {' '}
                            · rotation
                          </span>
                        )}
                      </div>
                      <div className="text-foreground-secondary text-xs">
                        /c/{s.slug} · live {formatDuration(s.elapsedSec)}
                        {s.goneLiveAt
                          ? ` since ${new Date(s.goneLiveAt).toLocaleTimeString()}`
                          : ''}
                      </div>
                    </div>
                    {s.hlsUrl && (
                      <a
                        href={s.hlsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
                      >
                        HLS playlist
                      </a>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busySlug === s.slug}
                      onClick={() =>
                        run(
                          s.slug,
                          restartStream,
                          `Restart audio for ${s.slug}? The channel stays live; listeners may briefly reconnect.`,
                        )
                      }
                    >
                      Restart
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busySlug === s.slug}
                      onClick={() => run(s.slug, skipStreamTrack)}
                    >
                      Skip
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busySlug === s.slug}
                      onClick={() => run(s.slug, pauseStream)}
                    >
                      Pause
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      disabled={busySlug === s.slug}
                      onClick={() => run(s.slug, resumeStream)}
                    >
                      Resume
                    </Button>
                    <Button
                      size="sm"
                      variant="text"
                      disabled={busySlug === s.slug}
                      onClick={() =>
                        run(
                          s.slug,
                          forceStreamOffline,
                          `Force ${s.slug} offline? This ends the broadcast immediately.`,
                        )
                      }
                    >
                      Force offline
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
