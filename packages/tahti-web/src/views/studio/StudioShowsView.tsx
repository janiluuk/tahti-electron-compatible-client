import { Link, useNavigate } from '@tanstack/react-router';
import { MicIcon, PlusIcon, RadioIcon, UploadIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createShowSeries,
  fetchEpisodesForShow,
  fetchShowSeries,
  type StudioEpisode,
  type StudioShowSeries,
} from '../../api/shows';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioShowsView() {
  const navigate = useNavigate();
  const [shows, setShows] = useState<StudioShowSeries[]>([]);
  const [episodeCounts, setEpisodeCounts] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [intervalHours, setIntervalHours] = useState<1 | 2>(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    setLoading(true);
    void fetchShowSeries().then(async (res) => {
      setShows(res.data);
      const counts: Record<string, number> = {};
      await Promise.all(
        res.data.map(async (s) => {
          const eps = await fetchEpisodesForShow(s.id);
          counts[s.id] = eps.data.length;
        }),
      );
      setEpisodeCounts(counts);
      setLoading(false);
    });
  };

  useEffect(() => {
    reload();
  }, []);

  const create = async () => {
    if (!title.trim()) {
      return;
    }
    setBusy(true);
    setMsg(null);
    const r = await createShowSeries({
      title: title.trim(),
      description: description.trim(),
      intervalHours,
    });
    setBusy(false);
    if (!r.ok) {
      setMsg(r.error);
      return;
    }
    setCreateOpen(false);
    setTitle('');
    setDescription('');
    void navigate({ to: '/studio/shows/$id', params: { id: r.data.id } });
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/shows" />
        <StudioPageHeader
          title="Shows"
          subtitle="Create a show, book intervals, then upload or record each episode. Episode numbers increment automatically."
          action={
            <Button
              size="sm"
              onClick={() => setCreateOpen(true)}
              aria-label="New show"
              title="New show"
            >
              <PlusIcon size={16} aria-hidden className="mr-1.5" />
              New show
            </Button>
          }
        />

        {msg && <p className="text-foreground-secondary text-sm">{msg}</p>}

        <Dialog.Root isOpen={createOpen} onClose={() => setCreateOpen(false)}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <Dialog.Title>
              <span className="inline-flex items-center gap-2">
                <RadioIcon size={18} aria-hidden />
                New show
              </span>
            </Dialog.Title>
            <Dialog.Description>
              Episodes inherit description, cover, and the next episode number.
            </Dialog.Description>
            <div className="mt-4 flex flex-col gap-3">
              <Input
                label="Show title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
              />
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Description
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="border-border bg-background rounded-md border px-3 py-2"
                  placeholder="Copied to every new episode"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                {([1, 2] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    className={`rounded-md border px-3 py-1.5 text-xs ${
                      intervalHours === h
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border text-foreground-secondary'
                    }`}
                    onClick={() => setIntervalHours(h)}
                    aria-pressed={intervalHours === h}
                  >
                    {h}h slots
                  </button>
                ))}
              </div>
            </div>
            <Dialog.Actions>
              <Dialog.Close>Cancel</Dialog.Close>
              <Button type="submit" disabled={busy || !title.trim()}>
                {busy ? 'Creating…' : 'Create show'}
              </Button>
            </Dialog.Actions>
          </form>
        </Dialog.Root>

        <StudioPanel>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : shows.length === 0 ? (
            <div className="flex flex-col gap-3 py-4 text-center">
              <p className="text-foreground-secondary text-sm">
                No shows yet. Create one to start numbering episodes.
              </p>
              <div>
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  <PlusIcon size={16} aria-hidden className="mr-1.5" />
                  New show
                </Button>
              </div>
            </div>
          ) : (
            <ul className="divide-border divide-y">
              {shows.map((s) => (
                <ShowRow
                  key={s.id}
                  show={s}
                  episodeCount={episodeCounts[s.id] ?? 0}
                />
              ))}
            </ul>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}

function ShowRow({
  show,
  episodeCount,
}: {
  show: StudioShowSeries;
  episodeCount: number;
}) {
  return (
    <li className="flex flex-wrap items-center gap-3 px-4 py-3 text-sm">
      <div className="border-border bg-background-secondary flex h-12 w-12 items-center justify-center overflow-hidden rounded border">
        {show.coverUrl ? (
          <img
            src={show.coverUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <RadioIcon size={20} className="opacity-40" aria-hidden />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <Link
          to="/studio/shows/$id"
          params={{ id: show.id }}
          className="font-medium hover:underline"
        >
          {show.title}
        </Link>
        <p className="text-foreground-secondary text-xs">
          Next episode #{show.nextEpisodeNumber}
          {episodeCount ? `, ${episodeCount} episodes` : ''}
          {`, ${show.intervalHours}h slots`}
          {show.scheduleNote ? `, ${show.scheduleNote}` : ''}
        </p>
      </div>
      <Link to="/studio/shows/$id" params={{ id: show.id }}>
        <Button size="sm" variant="secondary">
          Manage
        </Button>
      </Link>
    </li>
  );
}

export function episodeStatusLabel(ep: StudioEpisode): string {
  switch (ep.status) {
    case 'PENDING_APPROVAL':
      return 'Needs approval';
    case 'APPROVED':
      return 'Approved';
    case 'SCHEDULED':
      return 'Scheduled';
    case 'LIVE':
      return 'Live';
    default:
      return 'Draft';
  }
}

export function EpisodeSourceIcon({
  source,
}: {
  source: StudioEpisode['source'];
}) {
  return source === 'broadcast' ? (
    <MicIcon size={14} aria-hidden />
  ) : (
    <UploadIcon size={14} aria-hidden />
  );
}
