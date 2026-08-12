import { Badge } from '@nuclearplayer/ui';

import {
  MAP_CASE_GROUPS,
  resolveCaseParity,
  type MapParity,
  type MapShot,
} from '../content/mapScreens';

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
      <div className="border-border flex items-center justify-between gap-2 border-b px-3 py-1.5">
        <span className="text-[10px] font-semibold tracking-wide uppercase">
          {label}
          {label === 'Tahti' ? (
            <span className="text-foreground-secondary ml-1 font-normal normal-case">
              app.tahti.live
            </span>
          ) : (
            <span className="text-foreground-secondary ml-1 font-normal normal-case">
              this client
            </span>
          )}
        </span>
        <span className="text-foreground-secondary truncate font-mono text-[10px]">
          {shot.route}
        </span>
      </div>
      <div
        className={`border-border aspect-[16/10] overflow-hidden border-b ${
          absent
            ? 'bg-background-secondary/80'
            : pending
              ? 'bg-background'
              : 'bg-background'
        }`}
      >
        {absent ? (
          <div className="text-foreground-secondary flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center text-xs">
            <Badge variant="pill" color={label === 'Tahti' ? 'cyan' : 'orange'}>
              {label === 'Tahti' ? 'Nuclear only' : 'Tahti only'}
            </Badge>
            <span className="font-medium">No equivalent on {label}</span>
            <span className="text-[10px] opacity-80">{shot.caption}</span>
          </div>
        ) : pending ? (
          <div className="text-foreground-secondary flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center text-xs">
            <span className="font-medium">
              {label === 'Nuclear'
                ? 'Nuclear shot pending'
                : 'Tahti shot pending'}
            </span>
            <span className="text-[10px] opacity-80">{viewName}</span>
          </div>
        ) : (
          <img
            src={shot.image}
            alt={`${label}: ${viewName}`}
            loading="lazy"
            className="h-full w-full object-cover object-top"
          />
        )}
      </div>
      <p className="text-foreground-secondary px-3 py-2 text-[11px] leading-snug">
        {shot.caption}
      </p>
    </div>
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
      className="flex flex-col gap-8"
      aria-labelledby="screen-atlas-heading"
    >
      <div>
        <h2
          id="screen-atlas-heading"
          className="font-display text-2xl font-extrabold tracking-tight"
        >
          Screen atlas
        </h2>
        <p className="text-foreground-secondary mt-1 max-w-3xl text-sm">
          Each case is a two-column comparison:{' '}
          <strong className="text-foreground font-semibold">Tahti</strong>{' '}
          (production) beside{' '}
          <strong className="text-foreground font-semibold">Nuclear</strong>{' '}
          (this beta). Missing captures show &ldquo;shot pending&rdquo;; views
          that exist on only one surface are flagged as a parity gap.
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
          className="flex flex-col gap-3"
        >
          <div>
            <h3 className="font-display text-lg font-bold">{group.title}</h3>
            <p className="text-foreground-secondary text-xs">
              {group.description}
            </p>
          </div>
          <ul className="flex flex-col gap-4">
            {group.cases.map((c) => {
              const parity = resolveCaseParity(c);
              const openHref = firstOpenableRoute(c.new.route);
              const tahtiAbsent =
                parity === 'nuclear-only' || Boolean(c.old.absent);
              const nuclearAbsent =
                parity === 'tahti-only' || Boolean(c.new.absent);
              return (
                <li key={c.id} id={`case-${c.id}`}>
                  <article
                    className={`border-border bg-background-secondary/40 flex flex-col overflow-hidden rounded-xl border ${
                      parity !== 'both'
                        ? 'ring-accent-yellow/40 ring-1 ring-offset-0'
                        : ''
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2 p-3 pb-2">
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <h4 className="text-sm font-semibold">{c.title}</h4>
                        <p className="text-foreground-secondary text-[11px]">
                          <span className="text-foreground font-medium">
                            {c.viewName}
                          </span>
                          {' — '}
                          {c.caption}
                        </p>
                      </div>
                      <ParityBadges parity={parity} />
                    </div>
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
                    {openHref && !nuclearAbsent ? (
                      <a
                        href={openHref}
                        className="text-primary border-border border-t px-3 py-2 text-xs font-medium underline-offset-2 hover:underline"
                      >
                        Open Nuclear in beta →
                      </a>
                    ) : null}
                  </article>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </section>
  );
}
