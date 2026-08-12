import { MAP_SCREEN_GROUPS } from '../content/mapScreens';

/** Visual atlas: screenshot + label per major POC surface. */
export function ScreenAtlas() {
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
        <p className="text-foreground-secondary mt-1 max-w-2xl text-sm">
          What each view looks like. Thumbnails are production Tahti captures
          (same product surfaces); routes below are the Nuclear / beta paths.
        </p>
      </div>

      {MAP_SCREEN_GROUPS.map((group) => (
        <div key={group.id} className="flex flex-col gap-3">
          <div>
            <h3 className="font-display text-lg font-bold">{group.title}</h3>
            <p className="text-foreground-secondary text-xs">
              {group.description}
            </p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {group.screens.map((screen) => (
              <li key={screen.id}>
                <article className="border-border bg-background-secondary/40 flex h-full flex-col overflow-hidden rounded-xl border">
                  <div className="border-border bg-background aspect-[16/10] overflow-hidden border-b">
                    <img
                      src={screen.image}
                      alt={`${screen.title} screenshot`}
                      loading="lazy"
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <h4 className="text-sm font-semibold">{screen.title}</h4>
                    <p className="text-foreground-secondary text-xs">
                      {screen.blurb}
                    </p>
                    <p className="text-foreground mt-1 font-mono text-[11px]">
                      POC: {screen.route}
                    </p>
                    <p className="text-foreground-secondary font-mono text-[10px]">
                      Prod: {screen.prodRoute}
                    </p>
                    {screen.route.includes('$') ? (
                      <span className="text-foreground-secondary mt-auto pt-2 text-[10px] tracking-wide uppercase">
                        Parametric route
                      </span>
                    ) : (
                      <a
                        href={screen.route}
                        className="text-primary mt-auto pt-2 text-xs font-medium underline-offset-2 hover:underline"
                      >
                        Open in beta →
                      </a>
                    )}
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
