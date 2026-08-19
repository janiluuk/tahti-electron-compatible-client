import { Link } from '@tanstack/react-router';
import { CheckIcon, RadioIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchRecentBroadcasts,
  type RecentBroadcast,
} from '../../api/broadcast';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(seconds: number | undefined): string {
  if (!seconds) {
    return '';
  }
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

function RecordingRow({ show }: { show: RecentBroadcast }) {
  const title =
    show.title || show.archiveItemTitle || `Show ${formatDate(show.startedAt)}`;
  const published = show.archiveItemStatus === 'READY';

  return (
    <li className="border-border flex items-center gap-3 rounded-lg border px-3 py-2">
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-foreground-secondary truncate text-xs">
          {formatDate(show.startedAt)}
          {show.durationSec ? ` · ${formatDuration(show.durationSec)}` : ''}
          {show.source
            ? ` · ${show.source.toLowerCase().replace('_', ' ')}`
            : ''}
        </div>
      </div>
      <span
        className={`flex shrink-0 items-center gap-1 text-xs font-medium ${
          published ? 'text-accent-green' : 'text-foreground-secondary'
        }`}
      >
        {published && <CheckIcon size={12} aria-hidden />}
        {published ? 'Published' : 'Recorded'}
      </span>
      {show.archiveItemId ? (
        <Link to="/studio/archive/$id" params={{ id: show.archiveItemId }}>
          <Button size="sm" variant="secondary">
            Open
          </Button>
        </Link>
      ) : (
        <Link to="/studio/archive">
          <Button size="sm" variant="secondary">
            Publish
          </Button>
        </Link>
      )}
    </li>
  );
}

export function StudioRecordingsView() {
  const [shows, setShows] = useState<RecentBroadcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchRecentBroadcasts(500).then((res) => {
      setShows(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/recordings" />
        <StudioPageHeader title="Recordings" />

        <StudioPanel
          title={`Recorded shows (${shows.length})`}
          description="Every completed show recording, newest first."
        >
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : shows.length === 0 ? (
            <div className="flex flex-col items-start gap-2">
              <p className="text-foreground-secondary text-sm">
                No recorded shows yet.
              </p>
              <p className="text-foreground-secondary text-xs">
                Enable recording when you go live and completed shows will
                appear here.
              </p>
              <Link to="/studio/go-live">
                <Button size="sm" variant="secondary">
                  <RadioIcon size={14} aria-hidden className="mr-1" />
                  Open broadcast studio
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {shows.map((show) => (
                <RecordingRow key={show.id} show={show} />
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
