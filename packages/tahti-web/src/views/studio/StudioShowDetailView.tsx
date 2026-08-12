import { Link, useNavigate } from '@tanstack/react-router';
import { CheckIcon, MicIcon, RadioIcon, UploadIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createEpisode,
  createShowBooking,
  fetchEpisodesForShow,
  fetchShowBookings,
  fetchShowSeriesById,
  patchShowSeries,
  type StudioEpisode,
  type StudioShowBooking,
  type StudioShowSeries,
} from '../../api/shows';
import { uploadArchiveFile } from '../../api/studio';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { EpisodeSourceIcon, episodeStatusLabel } from './StudioShowsView';

export function StudioShowDetailView({ id }: { id: string }) {
  const navigate = useNavigate();
  const [show, setShow] = useState<StudioShowSeries | null>(null);
  const [episodes, setEpisodes] = useState<StudioEpisode[]>([]);
  const [bookings, setBookings] = useState<StudioShowBooking[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [source, setSource] = useState<'upload' | 'broadcast'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [savingMeta, setSavingMeta] = useState(false);

  const reload = () => {
    void fetchShowSeriesById(id).then((r) => {
      setShow(r.data);
      if (r.data) {
        setTitle(r.data.title);
        setDescription(r.data.description);
      }
    });
    void fetchEpisodesForShow(id).then((r) => setEpisodes(r.data));
    const from = new Date().toISOString();
    const to = new Date(Date.now() + 14 * 24 * 3600_000).toISOString();
    void fetchShowBookings(from, to).then((r) =>
      setBookings(r.data.filter((b) => b.isMine)),
    );
  };

  useEffect(() => {
    reload();
  }, [id]);

  const nextEpisodeNumber = show?.nextEpisodeNumber ?? 1;
  const defaultEpisodeTitle = useMemo(() => {
    if (!show) {
      return '';
    }
    return `${show.title} — Episode ${nextEpisodeNumber}`;
  }, [show, nextEpisodeNumber]);

  const nextSlotHint = useMemo(() => {
    const upcoming = bookings
      .filter((b) => new Date(b.startAt).getTime() > Date.now())
      .sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
      )[0];
    if (!upcoming) {
      return null;
    }
    return upcoming;
  }, [bookings]);

  const saveMeta = async () => {
    if (!show) {
      return;
    }
    setSavingMeta(true);
    const r = await patchShowSeries(show.id, {
      title: title.trim() || show.title,
      description: description.trim(),
    });
    setSavingMeta(false);
    if (!r.ok) {
      setMsg(r.error);
      return;
    }
    setShow(r.data);
    setMsg('Show details saved — new episodes will inherit these.');
  };

  const bookNextInterval = async () => {
    if (!show) {
      return;
    }
    setBusy(true);
    setMsg(null);
    const start = new Date();
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 24);
    const end = new Date(start);
    end.setHours(end.getHours() + show.intervalHours);
    const r = await createShowBooking({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      note: show.title,
      showType: show.showType,
    });
    setBusy(false);
    if (!r.ok) {
      setMsg(r.error);
      return;
    }
    setMsg(
      `Booked ${show.intervalHours}h slot starting ${new Date(r.data.startAt).toLocaleString()}`,
    );
    reload();
  };

  const createNewEpisode = async () => {
    if (!show) {
      return;
    }
    setBusy(true);
    setMsg(null);

    let archiveItemId: string | null = null;
    if (source === 'upload') {
      if (!file) {
        setBusy(false);
        setMsg('Choose an audio file to upload.');
        return;
      }
      const up = await uploadArchiveFile({
        file,
        title: defaultEpisodeTitle,
      });
      if (!up.ok) {
        setBusy(false);
        setMsg(up.error);
        return;
      }
      archiveItemId = up.itemId;
    }

    const ep = await createEpisode({
      showId: show.id,
      source,
      archiveItemId,
      slotStartAt: nextSlotHint?.startAt ?? null,
      slotEndAt: nextSlotHint?.endAt ?? null,
      bookingId: nextSlotHint?.id ?? null,
    });
    setBusy(false);
    if (!ep.ok) {
      setMsg(ep.error);
      return;
    }
    setCreateOpen(false);
    setFile(null);
    if (source === 'broadcast') {
      void navigate({
        to: '/studio/shows/episodes/$episodeId',
        params: { episodeId: ep.data.id },
      });
      return;
    }
    void navigate({
      to: '/studio/shows/episodes/$episodeId',
      params: { episodeId: ep.data.id },
    });
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/shows" />
        <Link
          to="/studio/shows"
          className="text-foreground-secondary -mt-2 text-xs hover:underline"
        >
          ← Shows
        </Link>

        {!show ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Show not found.</p>
          </StudioPanel>
        ) : (
          <>
            <StudioPageHeader
              title={show.title}
              subtitle={`Next episode #${show.nextEpisodeNumber}, ${show.intervalHours}h intervals`}
              action={
                <Button size="sm" onClick={() => setCreateOpen(true)}>
                  New episode
                </Button>
              }
            />

            <StudioPanel
              title="Show defaults"
              description="New episodes copy description, cover, and get the next episode number automatically."
            >
              <div className="flex flex-col gap-3">
                <Input
                  label="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                  />
                </label>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={savingMeta}
                  onClick={() => void saveMeta()}
                >
                  {savingMeta ? 'Saving…' : 'Save defaults'}
                </Button>
              </div>
            </StudioPanel>

            <StudioPanel
              title="Schedule"
              action={
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => void bookNextInterval()}
                >
                  Book next {show.intervalHours}h slot
                </Button>
              }
            >
              {nextSlotHint ? (
                <p className="text-sm">
                  Next slot:{' '}
                  <strong>
                    {new Date(nextSlotHint.startAt).toLocaleString()}
                  </strong>
                </p>
              ) : (
                <p className="text-foreground-secondary text-sm">
                  No upcoming slots — book an interval for this show.
                </p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                <Link to="/studio/go-live">
                  <Button size="sm" variant="text">
                    <MicIcon size={14} aria-hidden className="mr-1" />
                    Stream live
                  </Button>
                </Link>
              </div>
            </StudioPanel>

            <StudioPanel title="Episodes">
              {episodes.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No episodes yet. Create one — episode #{nextEpisodeNumber} is
                  ready.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {episodes.map((ep) => (
                    <li
                      key={ep.id}
                      className="flex flex-wrap items-center gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <span className="text-foreground-secondary w-10 text-xs tabular-nums">
                        #{ep.episodeNumber}
                      </span>
                      <div className="min-w-0 flex-1">
                        <Link
                          to="/studio/shows/episodes/$episodeId"
                          params={{ episodeId: ep.id }}
                          className="font-medium hover:underline"
                        >
                          {ep.title}
                        </Link>
                        <p className="text-foreground-secondary inline-flex items-center gap-1 text-xs">
                          <EpisodeSourceIcon source={ep.source} />
                          {episodeStatusLabel(ep)}
                          {ep.source === 'broadcast'
                            ? ', recorded'
                            : ', upload'}
                        </p>
                      </div>
                      <Link
                        to="/studio/shows/episodes/$episodeId"
                        params={{ episodeId: ep.id }}
                      >
                        <Button size="sm" variant="secondary">
                          {ep.status === 'PENDING_APPROVAL' ? 'Review' : 'Open'}
                        </Button>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>

            <Dialog.Root
              isOpen={createOpen}
              onClose={() => setCreateOpen(false)}
            >
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void createNewEpisode();
                }}
              >
                <Dialog.Title>New episode</Dialog.Title>
                <Dialog.Description>
                  Prefills from the show — you only need audio.
                </Dialog.Description>
                <div className="mt-4 flex flex-col gap-3">
                  <div className="border-border bg-background-secondary rounded-lg border px-3 py-2 text-sm">
                    <p>
                      <span className="text-foreground-secondary text-xs uppercase">
                        Episode number
                      </span>
                      <br />
                      <strong className="font-display text-2xl">
                        #{nextEpisodeNumber}
                      </strong>
                    </p>
                    <p className="text-foreground-secondary mt-2 text-xs">
                      Title: {defaultEpisodeTitle}
                    </p>
                    {show.description ? (
                      <p className="text-foreground-secondary mt-1 line-clamp-2 text-xs">
                        Description: {show.description}
                      </p>
                    ) : null}
                    {nextSlotHint ? (
                      <p className="text-foreground-secondary mt-1 text-xs">
                        Schedule:{' '}
                        {new Date(nextSlotHint.startAt).toLocaleString()}
                      </p>
                    ) : (
                      <p className="text-foreground-secondary mt-1 text-xs">
                        Schedule: book a slot after create if needed
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs ${
                        source === 'upload'
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border text-foreground-secondary'
                      }`}
                      onClick={() => setSource('upload')}
                      aria-pressed={source === 'upload'}
                    >
                      <UploadIcon size={14} aria-hidden />
                      Upload audio
                    </button>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-xs ${
                        source === 'broadcast'
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border text-foreground-secondary'
                      }`}
                      onClick={() => setSource('broadcast')}
                      aria-pressed={source === 'broadcast'}
                    >
                      <MicIcon size={14} aria-hidden />
                      Record from broadcast
                    </button>
                  </div>

                  {source === 'upload' ? (
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-foreground-secondary text-xs uppercase">
                        Audio file
                      </span>
                      <input
                        type="file"
                        accept="audio/*,.flac,.wav,.mp3,.aiff"
                        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                      />
                    </label>
                  ) : (
                    <p className="text-foreground-secondary text-sm">
                      Creates a pending episode. Go Live to capture, then
                      review, trim/normalize, and approve before it can air.
                    </p>
                  )}
                </div>
                <Dialog.Actions>
                  <Dialog.Close>Cancel</Dialog.Close>
                  <Button
                    type="submit"
                    disabled={busy || (source === 'upload' && !file)}
                  >
                    {busy
                      ? 'Creating…'
                      : source === 'broadcast'
                        ? 'Create & go record'
                        : 'Create episode'}
                  </Button>
                </Dialog.Actions>
              </form>
            </Dialog.Root>

            {msg && <p className="text-sm">{msg}</p>}
          </>
        )}
      </div>
    </StudioGate>
  );
}

export function StudioEpisodeReviewView({ episodeId }: { episodeId: string }) {
  const navigate = useNavigate();
  const [episode, setEpisode] = useState<StudioEpisode | null>(null);
  const [show, setShow] = useState<StudioShowSeries | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(0);
  const [normalize, setNormalize] = useState(true);

  useEffect(() => {
    void import('../../api/shows').then(
      ({ fetchEpisode, fetchShowSeriesById }) => {
        void fetchEpisode(episodeId).then((r) => {
          setEpisode(r.data);
          if (r.data) {
            void fetchShowSeriesById(r.data.showId).then((s) =>
              setShow(s.data),
            );
          }
        });
      },
    );
  }, [episodeId]);

  if (!episode) {
    return (
      <StudioGate>
        <div className="mx-auto max-w-2xl">
          <StudioNav current="/studio/shows" />
          <p className="text-foreground-secondary mt-6 text-sm">Loading…</p>
        </div>
      </StudioGate>
    );
  }

  const needsApproval =
    episode.source === 'broadcast' || episode.status === 'PENDING_APPROVAL';

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <StudioNav current="/studio/shows" />
        <Link
          to="/studio/shows/$id"
          params={{ id: episode.showId }}
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← {show?.title ?? 'Show'}
        </Link>

        <header>
          <p className="text-foreground-secondary text-xs tracking-wide uppercase">
            Episode #{episode.episodeNumber}
          </p>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            {episode.title}
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            {episodeStatusLabel(episode)}
            {episode.source === 'broadcast' ? ' · recorded' : ' · upload'}
          </p>
        </header>

        {episode.description ? (
          <p className="text-sm">{episode.description}</p>
        ) : null}

        {needsApproval && (
          <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
            <h2 className="font-display text-lg font-bold">
              Review before approve
            </h2>
            <p className="text-foreground-secondary text-sm">
              Recorded episodes must be approved before they can go live. Trim
              and normalize, then approve.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Trim start (sec)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={trimStart}
                  onChange={(e) => setTrimStart(Number(e.target.value))}
                  className="border-border bg-background mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
              <label className="text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Trim end (sec, 0 = full)
                </span>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={trimEnd}
                  onChange={(e) => setTrimEnd(Number(e.target.value))}
                  className="border-border bg-background mt-1 w-full rounded border px-2 py-1.5"
                />
              </label>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={normalize}
                onChange={(e) => setNormalize(e.target.checked)}
              />
              Peak normalize / loudness (stream target)
            </label>
            {episode.archiveItemId ? (
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/studio/archive/$id/editor"
                  params={{ id: episode.archiveItemId }}
                >
                  <Button size="sm" variant="secondary">
                    Open full editor
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy}
                  onClick={() => {
                    setBusy(true);
                    void Promise.all([
                      import('../../api/studio'),
                      import('../../api/studio-types'),
                    ]).then(async ([studio, types]) => {
                      const { data: draft } = await studio.fetchEditorDraft(
                        episode.archiveItemId!,
                      );
                      const base =
                        draft.editList ?? types.createDefaultEditList(180);
                      const cuts =
                        trimEnd > trimStart
                          ? [{ start: trimStart, end: trimEnd }]
                          : trimStart > 0
                            ? [
                                {
                                  start: trimStart,
                                  end: base.sourceDuration,
                                },
                              ]
                            : [];
                      const editList = {
                        ...base,
                        cuts: cuts.length ? cuts : base.cuts,
                        loudnorm: {
                          enabled: normalize,
                          targetLufs: -14,
                          targetTp: -1.5,
                        },
                      };
                      const r = await studio.renderEditorDraft(
                        episode.archiveItemId!,
                        editList,
                        `Episode ${episode.episodeNumber} review`,
                      );
                      setBusy(false);
                      setMsg(
                        r.ok
                          ? 'Render queued — check the archive editor for progress.'
                          : r.error,
                      );
                    });
                  }}
                >
                  {busy ? 'Rendering…' : 'Apply trim / normalize'}
                </Button>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <Link to="/studio/go-live">
                  <Button size="sm">
                    <RadioIcon size={14} aria-hidden className="mr-1" />
                    Go Live to record
                  </Button>
                </Link>
                <p className="text-foreground-secondary w-full text-xs">
                  After the broadcast ends, attach the capture from Music /
                  Sources → From broadcast, then return here to approve.
                </p>
              </div>
            )}
            <Button
              disabled={busy || episode.status === 'APPROVED'}
              onClick={() => {
                setBusy(true);
                void import('../../api/shows').then(({ approveEpisode }) => {
                  void approveEpisode(episode.id).then((r) => {
                    setBusy(false);
                    if (!r.ok) {
                      setMsg(r.error);
                      return;
                    }
                    setEpisode(r.data);
                    setMsg('Episode approved — ready to schedule or publish.');
                  });
                });
              }}
            >
              <CheckIcon size={16} aria-hidden className="mr-1.5" />
              {episode.status === 'APPROVED' ? 'Approved' : 'Approve episode'}
            </Button>
          </section>
        )}

        {!needsApproval && (
          <section className="border-border flex flex-col gap-2 rounded-xl border p-4">
            <p className="text-sm">
              Episode #{episode.episodeNumber} is {episodeStatusLabel(episode)}.
            </p>
            {episode.archiveItemId && (
              <Link
                to="/studio/archive/$id"
                params={{ id: episode.archiveItemId }}
              >
                <Button size="sm" variant="secondary">
                  Open in Library
                </Button>
              </Link>
            )}
          </section>
        )}

        {msg && <p className="text-sm">{msg}</p>}

        <Button
          size="sm"
          variant="text"
          onClick={() =>
            void navigate({
              to: '/studio/shows/$id',
              params: { id: episode.showId },
            })
          }
        >
          Back to show
        </Button>
      </div>
    </StudioGate>
  );
}
