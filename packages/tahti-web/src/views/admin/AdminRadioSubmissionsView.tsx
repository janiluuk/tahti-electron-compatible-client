import { PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  approveRadioSubmission,
  fetchAdminRadioSubmissions,
  rejectRadioSubmission,
  type AdminRadioSubmission,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { usePlayerStore } from '../../stores/playerStore';

function fmtDuration(sec: number | null): string {
  if (sec == null) {
    return '—';
  }
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AdminRadioSubmissionsView() {
  const play = usePlayerStore((s) => s.play);
  const [items, setItems] = useState<AdminRadioSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busyId, setBusyId] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchAdminRadioSubmissions().then((res) => {
      setItems(res.data);
      setLoading(false);
      setActiveId((prev) => prev ?? res.data[0]?.id ?? null);
    });
  };

  useEffect(reload, []);

  const active = items.find((i) => i.id === activeId) ?? items[0] ?? null;

  const playActive = (row: AdminRadioSubmission) => {
    if (!row.archiveItem.audioUrl) {
      return;
    }
    play({
      id: `radio-sub:${row.archiveItem.id}`,
      kind: 'archive',
      title: row.archiveItem.title,
      artist: row.archiveItem.artistName ?? row.submitter?.displayName ?? '',
      coverUrl: row.archiveItem.bannerUrl ?? undefined,
      streamUrl: row.archiveItem.audioUrl,
      protocol: 'https',
    });
  };

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/radio-submissions" />
        <StudioPageHeader
          title="Radio submissions"
          subtitle="Audit tracks submitted for Tahti Radio rotation."
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        {loading ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : items.length === 0 ? (
          <StudioPanel>
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No unaudited radio submissions.
            </p>
          </StudioPanel>
        ) : (
          <>
            {active && (
              <StudioPanel title="Auditing">
                <div className="flex items-start gap-4">
                  <div className="bg-surface-secondary flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg text-xs font-bold">
                    {active.archiveItem.bannerUrl ? (
                      <img
                        src={active.archiveItem.bannerUrl}
                        alt=""
                        className="size-full object-cover"
                      />
                    ) : (
                      active.archiveItem.title.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold">
                      {active.archiveItem.title}
                    </h3>
                    <p className="text-foreground-secondary text-sm">
                      {active.archiveItem.artistName ??
                        active.submitter?.displayName ??
                        'Unknown artist'}{' '}
                      · {fmtDuration(active.archiveItem.durationSec)}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="mt-2"
                      onClick={() => playActive(active)}
                    >
                      <PlayIcon size={16} aria-hidden className="mr-1.5" />
                      Play
                    </Button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-3">
                  <label className="flex flex-col gap-1 text-sm">
                    <span className="text-foreground-secondary text-xs uppercase">
                      Rejection note (optional)
                    </span>
                    <textarea
                      value={notes[active.id] ?? ''}
                      onChange={(e) =>
                        setNotes((prev) => ({
                          ...prev,
                          [active.id]: e.target.value,
                        }))
                      }
                      rows={2}
                      className="border-border bg-background rounded-md border px-3 py-2"
                    />
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      disabled={
                        busyId === active.id || active.status !== 'PENDING'
                      }
                      onClick={() => {
                        setBusyId(active.id);
                        void approveRadioSubmission(active.id).then((r) => {
                          setBusyId(null);
                          if (!r.ok) {
                            setMsg(r.error);
                          } else {
                            reload();
                          }
                        });
                      }}
                    >
                      Approve to radio
                    </Button>
                    <Button
                      size="sm"
                      variant="text"
                      disabled={
                        busyId === active.id || active.status === 'REJECTED'
                      }
                      onClick={() => {
                        setBusyId(active.id);
                        void rejectRadioSubmission(
                          active.id,
                          notes[active.id],
                        ).then((r) => {
                          setBusyId(null);
                          if (!r.ok) {
                            setMsg(r.error);
                          } else {
                            reload();
                          }
                        });
                      }}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </StudioPanel>
            )}

            <StudioPanel>
              <ul className="divide-border divide-y">
                {items.map((row) => (
                  <li
                    key={row.id}
                    className={`flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0 ${
                      row.id === active?.id ? 'bg-background-secondary/40' : ''
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(row.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="font-medium">{row.archiveItem.title}</div>
                      <div className="text-foreground-secondary text-xs">
                        {row.submitter?.displayName ?? '—'} ·{' '}
                        {fmtDuration(row.archiveItem.durationSec)} ·{' '}
                        {new Date(row.createdAt).toLocaleDateString()}
                      </div>
                    </button>
                    <span className="text-foreground-secondary font-mono text-xs uppercase">
                      {row.status}
                    </span>
                  </li>
                ))}
              </ul>
            </StudioPanel>
          </>
        )}
      </div>
    </AdminGate>
  );
}
