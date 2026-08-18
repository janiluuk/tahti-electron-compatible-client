import { Link } from '@tanstack/react-router';
import { CalendarClockIcon, RadioIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  fetchChannelSchedule,
  fetchProgramme,
  patchChannelSchedule,
  patchProgramme,
  type ChannelSchedule,
  type ProgrammeView,
} from '../../api/studio-extras';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';

function toLocalInput(iso: string | null): string {
  if (!iso) {
    return '';
  }
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return '';
  }
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromLocalInput(value: string): string | null {
  if (!value.trim()) {
    return null;
  }
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return null;
  }
  return d.toISOString();
}

export function StudioScheduleView() {
  const [schedule, setSchedule] = useState<ChannelSchedule | null>(null);
  const [programme, setProgramme] = useState<ProgrammeView | null>(null);
  const [when, setWhen] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void Promise.all([fetchChannelSchedule(), fetchProgramme()]).then(
      ([s, p]) => {
        setSchedule(s.data);
        setWhen(toLocalInput(s.data.nextBroadcastAt));
        setNote(s.data.nextBroadcastNote ?? '');
        setProgramme(p.data);
        setLoading(false);
      },
    );
  }, []);

  const saveSchedule = async () => {
    setBusy(true);
    setMsg(null);
    const result = await patchChannelSchedule({
      nextBroadcastAt: fromLocalInput(when),
      nextBroadcastNote: note.trim() || null,
    });
    setBusy(false);
    if (!result.ok) {
      setMsg(result.error);
      return;
    }
    setSchedule(result.data);
    setMsg('Schedule saved.');
  };

  const toggleProgramme = async (
    key: 'fallbackEnabled' | 'fallbackAutoEnroll' | 'announcementsEnabled',
  ) => {
    if (!programme) {
      return;
    }
    const next = !programme[key];
    const result = await patchProgramme({ [key]: next });
    if (result.ok) {
      setProgramme(result.data);
    } else {
      setMsg(result.error);
    }
  };

  const setMode = async (fallbackMode: 'shuffle' | 'ordered') => {
    const result = await patchProgramme({ fallbackMode });
    if (result.ok) {
      setProgramme(result.data);
    } else {
      setMsg(result.error);
    }
  };

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/schedule" />
        <StudioPageHeader
          title="Schedule"
          subtitle="Plan your next broadcast and control what plays when you are offline."
          action={
            <Button
              size="sm"
              disabled={busy || loading}
              onClick={() => void saveSchedule()}
              aria-label="Save schedule"
              title="Save schedule"
            >
              <CalendarClockIcon size={16} aria-hidden className="mr-1.5" />
              {busy ? 'Saving…' : 'Save'}
            </Button>
          }
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel
          title="Next planned broadcast"
          description="Shown on your channel when the next live session is set."
        >
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-foreground-secondary text-xs uppercase">
                When (local time)
              </span>
              <input
                type="datetime-local"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
                className="border-border bg-background rounded-md border px-3 py-2"
              />
            </label>
            <Input
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Friday deep set"
            />
            {schedule?.nextBroadcastAt && (
              <p className="text-foreground-secondary text-xs">
                Stored as {new Date(schedule.nextBroadcastAt).toLocaleString()}
              </p>
            )}
          </div>
        </StudioPanel>

        <StudioPanel
          title="Offline programme"
          description="Fallback rotation when you are not live."
          action={
            <Link to="/studio/channel">
              <Button
                size="icon-sm"
                variant="text"
                aria-label="Open channel 24/7 radio"
                title="24/7 radio playlist"
              >
                <RadioIcon size={16} aria-hidden />
              </Button>
            </Link>
          }
        >
          {loading || !programme ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : (
            <div className="flex flex-col gap-4">
              <div
                className="border-border flex flex-wrap gap-1 rounded-lg border p-1"
                role="group"
                aria-label="Playback mode"
              >
                {(
                  [
                    ['shuffle', 'Shuffle'] as const,
                    ['ordered', 'Ordered'] as const,
                  ] as const
                ).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => void setMode(mode)}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase ${
                      programme.fallbackMode === mode
                        ? 'bg-primary text-foreground'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                    aria-pressed={programme.fallbackMode === mode}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col gap-2">
                {(
                  [
                    ['fallbackEnabled', 'Fallback enabled'] as const,
                    ['fallbackAutoEnroll', 'Auto-enroll new archive'] as const,
                    ['announcementsEnabled', 'Announcements'] as const,
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={programme[key]}
                      onChange={() => void toggleProgramme(key)}
                    />
                    {label}
                  </label>
                ))}
              </div>

              <div>
                <Eyebrow className="mb-2 block">
                  Rotation ({programme.items.length})
                </Eyebrow>
                {programme.items.length === 0 ? (
                  <p className="text-foreground-secondary text-sm">
                    No programme items yet. Build a playlist in Channel designer
                    → 24/7 radio.
                  </p>
                ) : (
                  <ul className="divide-border divide-y">
                    {programme.items.map((item) => (
                      <li
                        key={item.id}
                        className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0"
                      >
                        <span className="min-w-0 font-medium">
                          {item.title}
                        </span>
                        <span className="text-foreground-secondary text-xs">
                          {item.status}
                          {item.isFallback ? ', fallback' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </StudioPanel>
      </div>
    </StudioGate>
  );
}
