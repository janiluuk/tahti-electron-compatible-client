import { Link } from '@tanstack/react-router';

import { getLegalPage, LEGAL_PAGES, type LegalPage } from '../content/legal';

const PRODUCTION = 'https://tahti.live';

const LEGAL_TO = {
  about: '/about',
  terms: '/terms',
  privacy: '/privacy',
  agpl: '/agpl',
  'what-is-it': '/what-is-it',
} as const satisfies Record<LegalPage['slug'], string>;

export function LegalHubLinks() {
  return (
    <ul className="text-foreground-secondary flex flex-wrap gap-3 text-xs">
      {LEGAL_PAGES.map((p) => (
        <li key={p.slug}>
          <Link
            to={LEGAL_TO[p.slug]}
            className="underline-offset-2 hover:underline"
          >
            {p.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function LegalView({ slug }: { slug: string }) {
  const page = getLegalPage(slug);
  if (!page) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <Link
          to="/more"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Tahti map
        </Link>
        <h1 className="font-display text-2xl font-bold">Page not found</h1>
      </div>
    );
  }

  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        to="/more"
        className="text-foreground-secondary text-xs hover:underline"
      >
        ← Tahti map
      </Link>
      <header className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          {page.title}
        </h1>
        <p className="text-foreground-secondary text-sm">{page.description}</p>
        <a
          href={`${PRODUCTION}${page.productionPath}`}
          target="_blank"
          rel="noreferrer"
          className="text-foreground-secondary text-xs underline-offset-2 hover:underline"
        >
          Full page on tahti.live{page.productionPath}
        </a>
      </header>
      {page.sections.map((section) => (
        <section key={section.heading} className="flex flex-col gap-2">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {section.heading}
          </h2>
          {section.paragraphs.map((p) => (
            <p
              key={p.slice(0, 48)}
              className="text-foreground-secondary text-sm leading-relaxed"
            >
              {p}
            </p>
          ))}
        </section>
      ))}
      <LegalHubLinks />
    </article>
  );
}
