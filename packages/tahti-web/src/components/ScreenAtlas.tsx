import { MAP_CASE_GROUPS, type MapShot } from '../content/mapScreens';

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

function ShotPane({
  label,
  shot,
  viewName,
}: {
  label: 'Old' | 'New';
  shot: MapShot;
  viewName: string;
}) {
  const pending = !shot.image;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="border-border flex items-center justify-between gap-2 border-b px-2 py-1">
        <span className="text-[10px] font-semibold tracking-wide uppercase">
          {label}
        </span>
        <span className="text-foreground-secondary truncate font-mono text-[10px]">
          {shot.route}
        </span>
      </div>
      <div className="border-border bg-background aspect-[16/10] overflow-hidden border-b">
        {pending ? (
          <div className="text-foreground-secondary flex h-full w-full flex-col items-center justify-center gap-1 px-3 text-center text-xs">
            <span className="font-medium">Nuclear shot pending</span>
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
      <p className="text-foreground-secondary px-2 py-1.5 text-[11px] leading-snug">
        {shot.caption}
      </p>
    </div>
  );
}

/** Dual Old | New atlas driven by concrete flow cases. */
export function ScreenAtlas() {
  const total = MAP_CASE_GROUPS.reduce((n, g) => n + g.cases.length, 0);

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
          Side-by-side{' '}
          <strong className="text-foreground font-semibold">Old</strong>{' '}
          (production Tahti) and{' '}
          <strong className="text-foreground font-semibold">New</strong>{' '}
          (Nuclear beta) for each concrete flow case. Missing Nuclear captures
          show &ldquo;Nuclear shot pending&rdquo; — no invented pixels.
        </p>
        <p className="text-foreground-secondary mt-1 text-xs tracking-wide uppercase">
          {MAP_CASE_GROUPS.length} flows, {total} cases, Old | New columns
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
          <ul className="grid gap-4 lg:grid-cols-2">
            {group.cases.map((c) => {
              const openHref = firstOpenableRoute(c.new.route);
              return (
                <li key={c.id} id={`case-${c.id}`}>
                  <article className="border-border bg-background-secondary/40 flex h-full flex-col overflow-hidden rounded-xl border">
                    <div className="flex flex-col gap-0.5 p-3 pb-2">
                      <h4 className="text-sm font-semibold">{c.title}</h4>
                      <p className="text-foreground-secondary text-[11px]">
                        <span className="text-foreground font-medium">
                          {c.viewName}
                        </span>
                        {' — '}
                        {c.caption}
                      </p>
                    </div>
                    <div className="border-border flex border-t">
                      <div className="border-border min-w-0 flex-1 border-r">
                        <ShotPane
                          label="Old"
                          shot={c.old}
                          viewName={c.viewName}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <ShotPane
                          label="New"
                          shot={c.new}
                          viewName={c.viewName}
                        />
                      </div>
                    </div>
                    {openHref ? (
                      <a
                        href={openHref}
                        className="text-primary border-border border-t px-3 py-2 text-xs font-medium underline-offset-2 hover:underline"
                      >
                        Open New in beta →
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
