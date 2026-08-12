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
  const [source, setSource] = useState('…');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void Promise.all([fetchChannelSchedule(), fetchProgramme()]).then(
      ([s, p]) => {
        setSchedule(s.data);
        setWhen(toLocalInput(s.data.nextBroadcastAt));
        setNote(s.data.nextBroadcastNote ?? '');
        setProgramme(p.data);
        setSource(`${s.meta.source}/${p.meta.source}`);
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
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/schedule" />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Schedule
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Next broadcast + offline programme (fallback rotation). Source:{' '}
            {source}.
          </p>
        </div>

        <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">
            Next planned broadcast
          </h2>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground-secondary text-xs uppercase">
              When (local)
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
          <Button size="sm" disabled={busy} onClick={() => void saveSchedule()}>
            {busy ? 'Saving…' : 'Save schedule'}
          </Button>
          {schedule?.nextBroadcastAt && (
            <p className="text-foreground-secondary text-xs">
              Stored: {new Date(schedule.nextBroadcastAt).toLocaleString()}
            </p>
          )}
        </section>

        <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">Offline programme</h2>
          {!programme ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={
                    programme.fallbackMode === 'shuffle'
                      ? 'default'
                      : 'secondary'
                  }
                  onClick={() => void setMode('shuffle')}
                >
                  Shuffle
                </Button>
                <Button
                  size="sm"
                  variant={
                    programme.fallbackMode === 'ordered'
                      ? 'default'
                      : 'secondary'
                  }
                  onClick={() => void setMode('ordered')}
                >
                  Ordered
                </Button>
              </div>
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
              <div>
                <p className="text-foreground-secondary mb-2 text-xs uppercase">
                  Rotation ({programme.items.length})
                </p>
                {programme.items.length === 0 ? (
                  <p className="text-foreground-secondary text-sm">
                    No programme items yet.
                  </p>
                ) : (
                  <ul className="flex flex-col gap-1">
                    {programme.items.map((item) => (
                      <li
                        key={item.id}
                        className="border-border rounded border px-3 py-2 text-sm"
                      >
                        {item.title}
                        <span className="text-foreground-secondary ml-2 text-xs">
                          {item.status}
                          {item.isFallback ? ', fallback' : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </section>

        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </StudioGate>
  );
}
