import { useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import {
  MAP_CASE_GROUPS,
  resolveCaseParity,
  type MapCase,
  type MapParity,
  type MapShot,
} from '../content/mapScreens';
import { useMapNotesStore, type MapComment } from '../stores/mapNotesStore';
import { MapCommentForm } from './MapCommentForm';

function csvCell(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

/** Flat id → title/viewName lookup so the export can label rows without a note. */
function caseLookup(): Record<string, { title: string; viewName: string }> {
  const map: Record<string, { title: string; viewName: string }> = {};
  for (const group of MAP_CASE_GROUPS) {
    for (const c of group.cases) {
      map[c.id] = { title: c.title, viewName: c.viewName };
    }
  }
  return map;
}

function commentsToCsv(comments: MapComment[]): string {
  const lookup = caseLookup();
  const header = [
    'kind',
    'target_id',
    'title',
    'view_name',
    'pack',
    'feature',
    'commentary',
    'submitted_at',
  ];
  const rows = comments.map((c) => {
    const meta = c.kind === 'case' ? lookup[c.targetId] : undefined;
    return [
      c.kind,
      c.targetId,
      c.title,
      meta?.viewName ?? '',
      c.pack ?? '',
      c.feature ?? '',
      c.text,
      c.submittedAt,
    ];
  });
  return [header, ...rows]
    .map((row) => row.map(csvCell).join(','))
    .join('\r\n');
}

function ExportNotesButton() {
  const comments = useMapNotesStore((s) => s.comments);
  const count = comments.length;

  const download = () => {
    const csv = commentsToCsv(comments);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `tahti-map-notes-${stamp}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      size="sm"
      variant="secondary"
      onClick={download}
      disabled={count === 0}
      aria-label="Export submitted comments as CSV"
      title={
        count === 0
          ? 'Submit a comment below to enable export'
          : `Export ${count} comment${count === 1 ? '' : 's'} as CSV`
      }
    >
      Export comments ({count}) as CSV
    </Button>
  );
}

type ReviewStatePayload = {
  generatedAt: string;
  groups: Array<{
    id: string;
    title: string;
    cases: Array<{
      id: string;
      title: string;
      viewName: string;
      tahtiRoute: string;
      nuclearRoute: string;
      approved: boolean;
      comments: Array<{ text: string; submittedAt: string }>;
    }>;
  }>;
};

function buildReviewStatePayload(
  comments: MapComment[],
  approvedByCaseId: Record<string, boolean>,
): ReviewStatePayload {
  const commentsByCase = new Map<string, MapComment[]>();
  for (const c of comments) {
    if (c.kind !== 'case') {
      continue;
    }
    const list = commentsByCase.get(c.targetId) ?? [];
    list.push(c);
    commentsByCase.set(c.targetId, list);
  }
  return {
    generatedAt: new Date().toISOString(),
    groups: MAP_CASE_GROUPS.map((group) => ({
      id: group.id,
      title: group.title,
      cases: group.cases.map((c) => ({
        id: c.id,
        title: c.title,
        viewName: c.viewName,
        tahtiRoute: c.old.route,
        nuclearRoute: c.new.route,
        approved: Boolean(approvedByCaseId[c.id]),
        comments: (commentsByCase.get(c.id) ?? [])
          .slice()
          .reverse()
          .map((c2) => ({ text: c2.text, submittedAt: c2.submittedAt })),
      })),
    })),
  };
}

/** Writes the current review state (comments + approvals) to
 * tahti-fit/review-state.json via the dev-server endpoint in vite.config.ts,
 * so Claude Code can read it and act on outstanding notes. Dev-only — the
 * endpoint doesn't exist in a static/production build. */
function ApplyReviewButton() {
  const comments = useMapNotesStore((s) => s.comments);
  const approvedByCaseId = useMapNotesStore((s) => s.approvedByCaseId);
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>(
    'idle',
  );

  if (!import.meta.env.DEV) {
    return null;
  }

  const apply = async () => {
    setState('saving');
    try {
      const payload = buildReviewStatePayload(comments, approvedByCaseId);
      const res = await fetch('/__api/apply-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      setState('done');
      window.setTimeout(() => setState('idle'), 2500);
    } catch {
      setState('error');
      window.setTimeout(() => setState('idle'), 3000);
    }
  };

  return (
    <Button
      size="sm"
      onClick={apply}
      disabled={state === 'saving'}
      title="Write comments + approvals to tahti-fit/review-state.json for Claude Code to read"
    >
      {state === 'saving'
        ? 'Applying…'
        : state === 'done'
          ? 'Applied ✓'
          : state === 'error'
            ? 'Failed — retry'
            : 'Apply review'}
    </Button>
  );
}

function firstOpenableRoute(route: string): string | null {
  const candidate = route.split(',')[0]?.trim() ?? route.trim();
  if (!candidate.startsWith('/')) {
    return null;
  }
  if (candidate.includes('$')) {
    return null;
  }
  if (candidate.includes(' ')) {
    return null;
  }
  if (candidate.includes('(')) {
    return null;
  }
  return candidate;
}

export function ParityBadges({ parity }: { parity: MapParity }) {
  if (parity === 'both') {
    return null;
  }
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      <Badge variant="pill" color="yellow">
        parity gap
      </Badge>
      {parity === 'tahti-only' ? (
        <Badge variant="pill" color="orange">
          Tahti only
        </Badge>
      ) : (
        <Badge variant="pill" color="cyan">
          Nuclear only
        </Badge>
      )}
    </span>
  );
}

function ShotPane({
  label,
  shot,
  viewName,
  absent,
}: {
  label: 'Tahti' | 'Nuclear';
  shot: MapShot;
  viewName: string;
  absent: boolean;
}) {
  const pending = !absent && !shot.image;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="border-border flex items-center justify-between gap-2 border-b px-4 py-2.5">
        <span className="text-xs font-semibold tracking-wide uppercase">
          {label}
          {label === 'Tahti' ? (
            <span className="text-foreground-secondary ml-1.5 font-normal normal-case">
              app.tahti.live
            </span>
          ) : (
            <span className="text-foreground-secondary ml-1.5 font-normal normal-case">
              this client
            </span>
          )}
        </span>
        <span className="text-foreground-secondary truncate font-mono text-xs">
          {shot.route}
        </span>
      </div>
      <div
        className={`border-border min-h-[14rem] overflow-hidden border-b sm:min-h-[18rem] lg:min-h-[22rem] ${
          absent
            ? 'bg-background-secondary/80'
            : pending
              ? 'bg-background'
              : 'bg-background'
        }`}
      >
        {absent ? (
          <div className="text-foreground-secondary flex h-full min-h-[14rem] w-full flex-col items-center justify-center gap-3 px-6 text-center text-sm sm:min-h-[18rem] lg:min-h-[22rem]">
            <Badge variant="pill" color={label === 'Tahti' ? 'cyan' : 'orange'}>
              {label === 'Tahti' ? 'Nuclear only' : 'Tahti only'}
            </Badge>
            <span className="text-base font-medium">
              No equivalent on {label}
            </span>
            <span className="text-xs opacity-80">{shot.caption}</span>
          </div>
        ) : pending ? (
          <div className="text-foreground-secondary flex h-full min-h-[14rem] w-full flex-col items-center justify-center gap-2 px-6 text-center text-sm sm:min-h-[18rem] lg:min-h-[22rem]">
            <span className="text-base font-medium">
              {label === 'Nuclear'
                ? 'Nuclear shot pending'
                : 'Tahti shot pending'}
            </span>
            <span className="text-xs opacity-80">{viewName}</span>
          </div>
        ) : (
          <img
            src={shot.image}
            alt={`${label}: ${viewName}`}
            loading="lazy"
            className="h-full min-h-[14rem] w-full object-cover object-top sm:min-h-[18rem] lg:min-h-[22rem]"
          />
        )}
      </div>
      <p className="text-foreground-secondary px-4 py-3 text-sm leading-snug">
        {shot.caption}
      </p>
    </div>
  );
}

/** One review card: Tahti | Nuclear comparison + comment form, collapsible.
 * Approved cases render collapsed on mount (persisted); expand/unapprove are
 * independent — you can open an approved case without reverting it. */
function ReviewCaseCard({ c }: { c: MapCase }) {
  const approved = useMapNotesStore((s) => Boolean(s.approvedByCaseId[c.id]));
  const setCaseApproved = useMapNotesStore((s) => s.setCaseApproved);
  const [expanded, setExpanded] = useState(!approved);

  const parity = resolveCaseParity(c);
  const openHref = firstOpenableRoute(c.new.route);
  const tahtiAbsent = parity === 'nuclear-only' || Boolean(c.old.absent);
  const nuclearAbsent = parity === 'tahti-only' || Boolean(c.new.absent);

  return (
    <li id={`case-${c.id}`}>
      <article
        className={`border-border bg-background-secondary/40 flex flex-col overflow-hidden rounded-2xl border ${
          approved
            ? 'opacity-80'
            : parity !== 'both'
              ? 'ring-accent-yellow/40 ring-1 ring-offset-0'
              : ''
        }`}
      >
        <div className="flex flex-wrap items-start justify-between gap-3 p-5 pb-4">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
            aria-expanded={expanded}
          >
            <span className="flex items-center gap-2">
              <span className="text-foreground-secondary text-xs">
                {expanded ? '▾' : '▸'}
              </span>
              <h4 className="font-display text-lg font-semibold tracking-tight">
                {c.title}
              </h4>
              {approved ? (
                <Badge variant="pill" color="green">
                  approved
                </Badge>
              ) : null}
            </span>
            <p className="text-foreground-secondary text-sm">
              <span className="text-foreground font-medium">{c.viewName}</span>
              {' — '}
              {c.caption}
            </p>
          </button>
          <div className="flex flex-shrink-0 items-center gap-2">
            <ParityBadges parity={parity} />
            <Button
              size="sm"
              variant={approved ? 'secondary' : 'default'}
              onClick={() => setCaseApproved(c.id, !approved)}
            >
              {approved ? 'Unapprove' : 'Approve'}
            </Button>
          </div>
        </div>
        {expanded ? (
          <>
            <div className="border-border flex flex-col border-t sm:flex-row">
              <div className="border-border min-w-0 flex-1 sm:border-r">
                <ShotPane
                  label="Tahti"
                  shot={c.old}
                  viewName={c.viewName}
                  absent={tahtiAbsent}
                />
              </div>
              <div className="border-border min-w-0 flex-1 border-t sm:border-t-0">
                <ShotPane
                  label="Nuclear"
                  shot={c.new}
                  viewName={c.viewName}
                  absent={nuclearAbsent}
                />
              </div>
            </div>
            <MapCommentForm kind="case" targetId={c.id} title={c.title} />
            {openHref && !nuclearAbsent ? (
              <a
                href={openHref}
                className="text-primary border-border border-t px-5 py-3 text-sm font-medium underline-offset-2 hover:underline"
              >
                Open Nuclear in beta →
              </a>
            ) : null}
          </>
        ) : null}
      </article>
    </li>
  );
}

/** Dual Tahti | Nuclear atlas driven by concrete flow cases. */
export function ScreenAtlas() {
  const total = MAP_CASE_GROUPS.reduce((n, g) => n + g.cases.length, 0);
  const gaps = MAP_CASE_GROUPS.reduce(
    (n, g) => n + g.cases.filter((c) => resolveCaseParity(c) !== 'both').length,
    0,
  );

  return (
    <section
      className="flex flex-col gap-10"
      aria-labelledby="screen-atlas-heading"
    >
      <div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h2
            id="screen-atlas-heading"
            className="font-display text-2xl font-extrabold tracking-tight"
          >
            Screen atlas
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <ApplyReviewButton />
            <ExportNotesButton />
          </div>
        </div>
        <p className="text-foreground-secondary mt-1 max-w-3xl text-sm">
          Each case is a two-column comparison:{' '}
          <strong className="text-foreground font-semibold">Tahti</strong>{' '}
          (production) beside{' '}
          <strong className="text-foreground font-semibold">Nuclear</strong>{' '}
          (this beta). Missing captures show &ldquo;shot pending&rdquo;; views
          that exist on only one surface are flagged as a parity gap. Submit
          notes on each card — they persist in this browser; export submitted
          comments as CSV (kind, ids, pack, commentary, timestamp).
        </p>
        <p className="text-foreground-secondary mt-1 text-xs tracking-wide uppercase">
          {MAP_CASE_GROUPS.length} flows · {total} cases · {gaps} parity gap
          {gaps === 1 ? '' : 's'} · Tahti | Nuclear columns
        </p>
      </div>

      {MAP_CASE_GROUPS.map((group) => (
        <div
          key={group.id}
          id={`cases-${group.id}`}
          className="flex flex-col gap-4"
        >
          <div>
            <h3 className="font-display text-xl font-bold">{group.title}</h3>
            <p className="text-foreground-secondary mt-0.5 text-sm">
              {group.description}
            </p>
          </div>
          <ul className="flex flex-col gap-6">
            {group.cases.map((c) => (
              <ReviewCaseCard key={c.id} c={c} />
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
