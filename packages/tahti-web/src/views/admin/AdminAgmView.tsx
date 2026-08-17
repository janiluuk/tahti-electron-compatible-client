import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { fetchAdminAgmMotions, type AdminMotion } from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const DEFAULT_AGENDA = [
  'Call to order',
  'Quorum check',
  'Adoption of agenda',
  'Review of previous minutes',
  'Board report',
  'Financial report',
  'Motions',
  'Election of board (if applicable)',
  'Any other business',
  'Close',
];

function AgendaBuilder() {
  const [items, setItems] = useState<string[]>(DEFAULT_AGENDA);
  const [copied, setCopied] = useState(false);

  return (
    <StudioPanel
      title="Agenda builder"
      action={
        <Button
          size="sm"
          onClick={() => {
            const text = items
              .filter(Boolean)
              .map((item, i) => `${i + 1}. ${item}`)
              .join('\n');
            void navigator.clipboard.writeText(text).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
        >
          {copied ? 'Copied ✓' : 'Copy agenda'}
        </Button>
      }
    >
      <ol className="grid gap-2 sm:grid-cols-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="text-foreground-secondary w-5 shrink-0 text-right text-xs">
              {i + 1}.
            </span>
            <Input
              value={item}
              onChange={(e) =>
                setItems((prev) =>
                  prev.map((it, idx) => (idx === i ? e.target.value : it)),
                )
              }
              className="h-8 flex-1 text-sm"
            />
            <div className="flex shrink-0 gap-0.5">
              <Button
                size="icon-sm"
                variant="text"
                aria-label="Move up"
                disabled={i === 0}
                onClick={() =>
                  setItems((prev) => {
                    const next = [...prev];
                    [next[i - 1], next[i]] = [next[i]!, next[i - 1]!];
                    return next;
                  })
                }
              >
                ↑
              </Button>
              <Button
                size="icon-sm"
                variant="text"
                aria-label="Move down"
                disabled={i === items.length - 1}
                onClick={() =>
                  setItems((prev) => {
                    const next = [...prev];
                    [next[i], next[i + 1]] = [next[i + 1]!, next[i]!];
                    return next;
                  })
                }
              >
                ↓
              </Button>
              <Button
                size="icon-sm"
                variant="text"
                aria-label="Remove item"
                onClick={() =>
                  setItems((prev) => prev.filter((_, idx) => idx !== i))
                }
              >
                ×
              </Button>
            </div>
          </li>
        ))}
      </ol>
      <Button
        size="sm"
        variant="secondary"
        className="mt-3"
        onClick={() => setItems((prev) => [...prev, ''])}
      >
        + Add item
      </Button>
    </StudioPanel>
  );
}

function motionStateLabel(state: AdminMotion['state']): string {
  return state.charAt(0) + state.slice(1).toLowerCase();
}

export function AdminAgmView() {
  const [motions, setMotions] = useState<AdminMotion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchAdminAgmMotions().then((res) => {
      setMotions(res.data);
      setLoading(false);
    });
  }, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/agm" />
        <StudioPageHeader
          title="Annual General Meeting"
          subtitle="AGM planning tools — agenda, motions, member notice, and minutes."
        />

        <AgendaBuilder />

        <StudioPanel title="Motions & proposals">
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : motions.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No open or draft motions.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {motions.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">{m.title}</div>
                    <div className="text-foreground-secondary text-xs">
                      {m.advisory ? 'Advisory' : 'Binding'} ·{' '}
                      {motionStateLabel(m.state)} · {m.totalVotes} votes
                    </div>
                  </div>
                  <div className="text-foreground-secondary text-xs">
                    Opens {new Date(m.openAt).toLocaleDateString('fi-FI')} ·
                    Closes {new Date(m.closeAt).toLocaleDateString('fi-FI')}
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-foreground-secondary mt-3 text-xs">
            All AGM decisions are advisory until bylaws authorise asynchronous
            binding votes. Formal binding resolutions are recorded as board
            resolutions.
          </p>
        </StudioPanel>

        <details className="border-border bg-background-secondary/40 rounded-xl border p-5 shadow-sm sm:p-6">
          <summary className="cursor-pointer text-sm font-medium">
            Member notification requirements
          </summary>
          <div className="mt-3 flex flex-col gap-3 text-sm">
            <p className="text-foreground-secondary text-xs">
              Finnish association law (yhdistyslaki 24 §) requires written
              notice to all members at least seven days before the AGM. The
              notice must state the date, venue, and agenda.
            </p>
            <ul className="text-foreground-secondary list-disc space-y-1 pl-5 text-xs">
              <li>Date, time, and venue (physical or remote link)</li>
              <li>Agenda (use the builder above)</li>
              <li>Any proposed bylaw changes in full</li>
              <li>Deadline for member motions</li>
              <li>Instructions for remote participation</li>
            </ul>
          </div>
        </details>
      </div>
    </AdminGate>
  );
}
