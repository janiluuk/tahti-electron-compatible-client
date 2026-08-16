import { Link } from '@tanstack/react-router';

import { Badge, Button } from '@nuclearplayer/ui';

import { FlowGallery } from '../components/FlowGallery';
import { MapCommentForm } from '../components/MapCommentForm';
import { ParityBadges, ScreenAtlas } from '../components/ScreenAtlas';
import type { MapParity } from '../content/mapScreens';
import { useMapNotesStore } from '../stores/mapNotesStore';

type Status = 'live' | 'stub' | 'studio' | 'admin';

type FeatureRow = {
  feature: string;
  tahti: string;
  nuclear: string;
  status: Status;
  notes?: string;
};

function isAbsentSurface(value: string): boolean {
  const v = value.trim();
  return v === '' || v === '—' || v === '-';
}

function featureParity(row: FeatureRow): MapParity {
  const noTahti = isAbsentSurface(row.tahti);
  const noNuclear = isAbsentSurface(row.nuclear);
  if (noTahti && !noNuclear) {
    return 'nuclear-only';
  }
  if (!noTahti && noNuclear) {
    return 'tahti-only';
  }
  return 'both';
}

const STATUS_LABEL: Record<Status, string> = {
  live: 'Live in POC',
  stub: 'Stub / deep-link',
  studio: 'Studio-only (out of scope)',
  admin: 'Admin-only (out of scope)',
};

const FEATURES: FeatureRow[] = [
  {
    feature: 'Listen directory',
    tahti: '/listen',
    nuclear: '/',
    status: 'live',
    notes: 'Search + genre chips from directory genres',
  },
  {
    feature: 'Channel live',
    tahti: '/c/:slug',
    nuclear: '/channel/$slug',
    status: 'live',
    notes: 'GET /api/channels/:slug + HLS',
  },
  {
    feature: 'Channel archive library',
    tahti: '/c/:slug (archive)',
    nuclear: '/channel/$slug',
    status: 'live',
    notes: 'TrackTable + listen-events after ~15s',
  },
  {
    feature: 'Tahti Radio',
    tahti: '/radio',
    nuclear: '/radio',
    status: 'live',
    notes: 'GET /api/channels/tahti-radio + /api/v1/radio/recently-played',
  },
  {
    feature: 'Artist profile',
    tahti: '/u/:username',
    nuclear: '/u/$username',
    status: 'live',
    notes: 'GET /api/v1/u/:username/profile',
  },
  {
    feature: 'Collections',
    tahti: '/u/:user/c/:slug',
    nuclear: '/u/$username/c/$slug',
    status: 'live',
    notes: 'GET /api/v1/collections/:slug',
  },
  {
    feature: 'Smart link release',
    tahti: '/r/:slug',
    nuclear: '/r/$slug',
    status: 'live',
    notes: 'GET /api/v1/r/:slug',
  },
  {
    feature: 'Library',
    tahti: 'follows + local history',
    nuclear: '/library (+ /library/history)',
    status: 'live',
    notes: 'Sparse sidebar; Favorites | History tabs',
  },
  {
    feature: 'Sources',
    tahti: 'dashboard import / OAuth',
    nuclear: '/sources, /sources/$id',
    status: 'live',
    notes: 'CardGrid service tiles + status chips; click → detail',
  },
  {
    feature: 'Go Live',
    tahti: '/dashboard/broadcast',
    nuclear: '/studio/go-live',
    status: 'live',
    notes: 'OBS/Icecast keys, signal, go-live, multistream tab',
  },
  {
    feature: 'Settings (Nuclear-style)',
    tahti: '/dashboard/settings/*',
    nuclear: '/settings, /settings/$section',
    status: 'live',
    notes:
      'Account · Artist · Channel & design · Broadcast · Money · Notifications · Themes · Connections',
  },
  {
    feature: 'Themes',
    tahti: 'brand tokens',
    nuclear: '/settings/themes (was /themes)',
    status: 'live',
    notes: '@nuclearplayer/themes presets under Settings',
  },
  {
    feature: 'Venues directory',
    tahti: '/venues',
    nuclear: '/venues',
    status: 'live',
    notes: 'GET /api/v1/venues — list only',
  },
  {
    feature: 'Channel chat',
    tahti: '/c/:slug chat',
    nuclear: '/chat, /chat/$slug, channel tabs',
    status: 'live',
    notes: 'REST + Centrifugo + hCaptcha + emoji react API',
  },
  {
    feature: 'Studio schedule / programme',
    tahti: '/dashboard schedule + programme',
    nuclear: '/studio/schedule',
    status: 'live',
    notes: 'nextBroadcast + fallback toggles',
  },
  {
    feature: 'Studio stats',
    tahti: '/dashboard/stats',
    nuclear: '/studio/stats',
    status: 'live',
    notes: 'summary + top tracks/countries; ledger via /studio/revenue lite',
  },
  {
    feature: 'Studio channel settings',
    tahti: '/dashboard/settings/* + channel/edit',
    nuclear: '/studio/channel (+ profile Design tab)',
    status: 'live',
    notes: 'Design | Profile | Username/domain',
  },
  {
    feature: 'Studio updates',
    tahti: 'posts + newsletter',
    nuclear: '/studio/updates',
    status: 'live',
    notes: 'Posts + draft create + send',
  },
  {
    feature: 'Profile channel designer',
    tahti: '/dashboard/channel/edit',
    nuclear: '/u/$username Design tab (owner)',
    status: 'live',
    notes: 'visual/preset/accent live preview; Studio Channel full editor',
  },
  {
    feature: 'DMs',
    tahti: 'messages',
    nuclear: '/library/messages',
    status: 'live',
    notes: 'Inbox + thread',
  },
  {
    feature: 'Revenue lite',
    tahti: 'fan-subs connect + grants',
    nuclear: '/studio/revenue',
    status: 'live',
    notes: 'Connect status + grant estimate/history',
  },
  {
    feature: 'Release create + artwork',
    tahti: '/dashboard/releases',
    nuclear: '/studio/releases',
    status: 'live',
    notes: 'POST create + artwork prepare/complete',
  },
  {
    feature: 'Fan subscribe',
    tahti: '/u/:user/subscribe',
    nuclear: '/subscribe/$username',
    status: 'live',
    notes: 'Tiers + checkout URL',
  },
  {
    feature: 'Transparency',
    tahti: '/transparency',
    nuclear: '/transparency',
    status: 'live',
    notes: 'YTD / grants / ledger',
  },
  {
    feature: 'Platform status',
    tahti: '/status',
    nuclear: '/status',
    status: 'live',
    notes: 'GET /api/v1/status',
  },
  {
    feature: 'About / legal',
    tahti: '/about, /terms, /privacy, /agpl',
    nuclear: 'same paths',
    status: 'live',
    notes: 'POC copy + links to production',
  },
  {
    feature: 'Governance',
    tahti: '/governance',
    nuclear: '/governance',
    status: 'live',
    notes: 'Motions list when member; otherwise gated',
  },
  {
    feature: 'Account + membership',
    tahti: '/dashboard/settings/account',
    nuclear: '/settings/account',
    status: 'live',
    notes: 'Session, membership, fan subs under Money',
  },
  {
    feature: 'Studio overview',
    tahti: '/dashboard',
    nuclear: '/studio',
    status: 'live',
    notes: 'Catalog hub (gated login + channel)',
  },
  {
    feature: 'Studio Music (archive)',
    tahti: '/dashboard/archive',
    nuclear: '/studio/archive',
    status: 'live',
    notes: 'List/play/meta/delete + pro editor link',
  },
  {
    feature: 'Studio releases',
    tahti: '/dashboard/releases',
    nuclear: '/studio/releases',
    status: 'live',
    notes: 'List + PATCH smart-link targets',
  },
  {
    feature: 'Studio collections',
    tahti: '/dashboard/collections',
    nuclear: '/studio/collections',
    status: 'live',
    notes: 'Add/reorder/remove items',
  },
  {
    feature: 'Studio upload',
    tahti: '/dashboard/upload',
    nuclear: '/studio/upload',
    status: 'live',
    notes: 'prepare → PUT → complete (mock offline)',
  },
  {
    feature: 'Audio editor',
    tahti: '/dashboard/editor + archive editor',
    nuclear: '/studio/editor, /studio/archive/$id/editor',
    status: 'live',
    notes: 'Waveform cut/trim, EQ/comp/limiter, stems request, draft/render',
  },
  {
    feature: 'Governance vote/comment',
    tahti: '/governance',
    nuclear: '/governance',
    status: 'live',
    notes: 'YES/NO/ABSTAIN + discussion; mock mutates tally',
  },
  {
    feature: 'Help',
    tahti: '/help/*',
    nuclear: '/help, /help/$slug',
    status: 'live',
    notes: 'Static hub + articles',
  },
  {
    feature: 'Join / Login',
    tahti: '/join, /login',
    nuclear: '/join, /login',
    status: 'live',
    notes: 'Session + TOTP',
  },
  {
    feature: 'Embeds',
    tahti: '/embed/c, /embed/r, /embed/col',
    nuclear: '/embed/c, /embed/r, /embed/col, /embed/u/…/c/…',
    status: 'live',
    notes: 'Minimal Nuclear chrome',
  },
  {
    feature: 'Seek (VOD)',
    tahti: 'apps/web player',
    nuclear: 'PlayerBar.SeekBar',
    status: 'live',
    notes: 'Archive/VOD only',
  },
  {
    feature: 'Press kit / gallery extras',
    tahti: '/dashboard press kit',
    nuclear: '—',
    status: 'studio',
    notes: 'Not rebuilt; use production dashboard',
  },
  {
    feature: 'Board admin',
    tahti: '/admin/*',
    nuclear: '—',
    status: 'admin',
    notes: 'Do not rebuild in Nuclear chrome',
  },
];

function statusClass(status: Status): string {
  switch (status) {
    case 'live':
      return 'bg-primary text-foreground';
    case 'stub':
      return 'border-border text-foreground-secondary border';
    case 'studio':
    case 'admin':
      return 'bg-background-secondary text-foreground-secondary';
    default:
      return '';
  }
}

const QUICK_LINKS: Array<{
  to: string;
  label: string;
  params?: Record<string, string>;
}> = [
  { to: '/studio/go-live', label: 'Go Live' },
  { to: '/sources', label: 'Sources' },
  { to: '/studio/schedule', label: 'Schedule' },
  { to: '/studio/stats', label: 'Stats' },
  { to: '/studio/updates', label: 'Updates' },
  { to: '/studio/revenue', label: 'Revenue' },
  { to: '/library/messages', label: 'Messages' },
  { to: '/settings', label: 'Settings' },
  { to: '/settings/$section', label: 'Themes', params: { section: 'themes' } },
  { to: '/governance', label: 'Governance' },
  { to: '/help', label: 'Help' },
  { to: '/venues', label: 'Venues' },
  { to: '/transparency', label: 'Transparency' },
  { to: '/status', label: 'Status' },
  { to: '/chat', label: 'Chat' },
];

function FeatureCompareCard({ row }: { row: FeatureRow }) {
  const parity = featureParity(row);
  const tahtiAbsent = isAbsentSurface(row.tahti);
  const nuclearAbsent = isAbsentSurface(row.nuclear);

  return (
    <article
      className={`border-border bg-background-secondary/40 overflow-hidden rounded-xl border ${
        parity !== 'both' ? 'ring-accent-yellow/40 ring-1 ring-offset-0' : ''
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2 p-3 pb-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="text-sm font-semibold">{row.feature}</h3>
          <span
            className={`inline-flex w-fit rounded px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
          >
            {STATUS_LABEL[row.status]}
          </span>
        </div>
        <ParityBadges parity={parity} />
      </div>
      <div className="border-border grid border-t sm:grid-cols-2">
        <div
          className={`border-border flex min-w-0 flex-col gap-1 border-b p-3 sm:border-r sm:border-b-0 ${
            tahtiAbsent ? 'bg-background-secondary/80' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold tracking-wide uppercase">
              Tahti
              <span className="text-foreground-secondary ml-1 font-normal normal-case">
                app.tahti.live
              </span>
            </span>
            {tahtiAbsent ? (
              <Badge variant="pill" color="cyan">
                Nuclear only
              </Badge>
            ) : null}
          </div>
          <p
            className={`font-mono text-xs break-all ${
              tahtiAbsent
                ? 'text-foreground-secondary italic'
                : 'text-foreground-secondary'
            }`}
          >
            {tahtiAbsent ? 'No equivalent' : row.tahti}
          </p>
        </div>
        <div
          className={`flex min-w-0 flex-col gap-1 p-3 ${
            nuclearAbsent ? 'bg-background-secondary/80' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] font-semibold tracking-wide uppercase">
              Nuclear
              <span className="text-foreground-secondary ml-1 font-normal normal-case">
                this client
              </span>
            </span>
            {nuclearAbsent ? (
              <Badge variant="pill" color="orange">
                Tahti only
              </Badge>
            ) : null}
          </div>
          <p
            className={`font-mono text-xs break-all ${
              nuclearAbsent
                ? 'text-foreground-secondary italic'
                : 'text-foreground'
            }`}
          >
            {nuclearAbsent ? 'No equivalent' : row.nuclear}
          </p>
        </div>
      </div>
      {row.notes ? (
        <p className="text-foreground-secondary border-border border-t px-3 py-2 text-xs">
          {row.notes}
        </p>
      ) : null}
      <MapCommentForm
        kind="feature"
        targetId={row.feature}
        title={row.feature}
        feature={row.feature}
        label="Parity comment"
        placeholder={`Comment on “${row.feature}”…`}
        className="border-border flex flex-col gap-2 border-t px-3 py-3"
      />
    </article>
  );
}

function SavedMapComments() {
  const comments = useMapNotesStore((s) => s.comments);
  const clearComments = useMapNotesStore((s) => s.clearComments);

  if (comments.length === 0) {
    return null;
  }

  return (
    <section
      id="saved-comments"
      className="border-border flex flex-col gap-3 rounded-xl border p-4"
      aria-labelledby="saved-comments-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2
            id="saved-comments-heading"
            className="font-display text-xl font-bold tracking-tight"
          >
            Saved comments
          </h2>
          <p className="text-foreground-secondary mt-1 text-sm">
            Submitted from this page · stored in localStorage (
            <code className="text-foreground">tahti-web-map-notes</code>).
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => clearComments()}>
          Clear log
        </Button>
      </div>
      <ul className="flex max-h-80 flex-col gap-2 overflow-y-auto">
        {comments.map((c) => (
          <li
            key={c.id}
            className="border-border bg-background-secondary/40 rounded-lg border px-3 py-2 text-sm"
          >
            <div className="text-foreground-secondary flex flex-wrap gap-x-2 text-[11px] tracking-wide uppercase">
              <span>{c.kind}</span>
              <span>{c.title}</span>
              {c.pack ? <span>pack {c.pack}</span> : null}
              <span>{new Date(c.submittedAt).toLocaleString()}</span>
            </div>
            <p className="mt-1 whitespace-pre-wrap">{c.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function MoreView() {
  const gapCount = FEATURES.filter((r) => featureParity(r) !== 'both').length;

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Tahti map
        </h1>
        <p className="text-foreground-secondary mt-1 max-w-2xl text-sm">
          Three surfaces, one API: canonical{' '}
          <code className="text-foreground">apps/web</code>, this Nuclear client
          (<code className="text-foreground">beta.tahti.live</code>), and public
          docs at{' '}
          <a
            href="https://api.tahti.live/api"
            target="_blank"
            rel="noreferrer"
            className="underline-offset-2 hover:underline"
          >
            api.tahti.live/api
          </a>
          . Side-by-side screenshots, mermaid journeys, and the feature matrix.
          Port checklist: <code className="text-foreground">FEATURES.md</code>.
        </p>
        <nav className="mt-3 flex flex-wrap gap-2 text-xs">
          <a
            href="#cases-anonymous"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Anonymous
          </a>
          <a
            href="#cases-auth"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Auth
          </a>
          <a
            href="#cases-listener"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Listener
          </a>
          <a
            href="#cases-artist"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Artist
          </a>
          <a
            href="#cases-edge"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Edge
          </a>
          <a
            href="#flow-gallery"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Flows
          </a>
          <a
            href="#feature-matrix"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Features
          </a>
          <a
            href="#saved-comments"
            className="border-border hover:text-foreground text-foreground-secondary rounded-md border px-2 py-1"
          >
            Comments
          </a>
        </nav>
      </div>

      <nav className="flex flex-wrap gap-2">
        {QUICK_LINKS.map((link) => (
          <Link
            key={`${link.to}-${link.label}`}
            to={link.to}
            params={link.params}
            className="border-border text-foreground-secondary hover:text-foreground rounded-md border px-3 py-1.5 text-xs font-medium tracking-wide uppercase"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <ScreenAtlas />

      <FlowGallery />

      <SavedMapComments />

      <section
        id="feature-matrix"
        className="flex flex-col gap-3"
        aria-labelledby="feature-matrix-heading"
      >
        <div>
          <h2
            id="feature-matrix-heading"
            className="font-display text-2xl font-extrabold tracking-tight"
          >
            Feature matrix
          </h2>
          <p className="text-foreground-secondary mt-1 max-w-3xl text-sm">
            Same inventory as before — each row is Tahti | Nuclear side by side.
            Rows that exist on only one surface show a parity-gap badge.
          </p>
          <p className="text-foreground-secondary mt-1 text-xs tracking-wide uppercase">
            {FEATURES.length} features · {gapCount} parity gap
            {gapCount === 1 ? '' : 's'}
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {FEATURES.map((row) => (
            <li key={row.feature}>
              <FeatureCompareCard row={row} />
            </li>
          ))}
        </ul>
      </section>

      <p className="text-foreground-secondary text-xs">
        Production site:{' '}
        <a
          href="https://tahti.live"
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:underline"
        >
          tahti.live
        </a>
      </p>
    </div>
  );
}
