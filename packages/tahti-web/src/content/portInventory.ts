/**
 * Structured port / mock inventory for the Tahti map (`/more`).
 * Keep in sync with TAHTI-PORT-CHECKLIST.md + FEATURES.md + MOCKS.md.
 */

export type PortStatus =
  | 'done'
  | 'partial'
  | 'missing'
  | 'mock-only'
  | 'unwired'
  | 'link-out'
  | 'out-of-scope';

export type PortInventoryItem = {
  id: string;
  surface: string;
  /** Nuclear / beta route when present */
  route?: string;
  status: PortStatus;
  detail: string;
  /** Anchor id on /more for deep-links */
  section?: 'backlog' | 'mock' | 'gap';
};

export const PORT_STATUS_LABEL: Record<PortStatus, string> = {
  done: 'Done',
  partial: 'Partial',
  missing: 'Missing',
  'mock-only': 'Mock-only',
  unwired: 'Unwired',
  'link-out': 'Link-out',
  'out-of-scope': 'Out of scope',
};

/** Priority backlog from TAHTI-PORT-CHECKLIST.md (unchecked = still open). */
export const PORT_BACKLOG: PortInventoryItem[] = [
  {
    id: 'mobile-chrome',
    surface: 'Mobile listen chrome',
    route: '/',
    status: 'partial',
    detail:
      'Phone shell: bottom nav, drawers, compact player, icon play/queue with hint captions. Keep polishing studio forms on narrow screens.',
    section: 'backlog',
  },
  {
    id: 'chat-hardening',
    surface: 'Channel chat hardening',
    route: '/channel/$slug',
    status: 'partial',
    detail:
      'Captcha rail parity; fail closed when live join fails (no silent mock send in prod).',
    section: 'backlog',
  },
  {
    id: 'sources-oauth',
    surface: 'Sources OAuth polish',
    route: '/sources',
    status: 'partial',
    detail:
      'Live connect is href-only; in-app Connect is mock-only under VITE_FORCE_MOCK.',
    section: 'backlog',
  },
  {
    id: 'stash-share',
    surface: 'Stash share links',
    route: '/studio/stash',
    status: 'missing',
    detail: 'POST /api/me/stash/:id/share + revoke — UI not in this client.',
    section: 'backlog',
  },
  {
    id: 'membership-purchase',
    surface: 'Membership purchase',
    status: 'missing',
    detail: 'Prod /signup/payment Stripe checkout not ported.',
    section: 'backlog',
  },
  {
    id: 'studio-extras',
    surface: 'Distribution / radio slots / moderate',
    route: '/studio',
    status: 'missing',
    detail: 'Studio surfaces still missing vs production dashboard.',
    section: 'backlog',
  },
  {
    id: 'visualizer-presets',
    surface: 'Full Three.js visualizer presets',
    route: '/channel/$slug',
    status: 'partial',
    detail: 'ChannelView still aurora/grid/bars POC.',
    section: 'backlog',
  },
  {
    id: 'multitrack',
    surface: 'Multitrack timeline editing',
    route: '/studio/editor',
    status: 'partial',
    detail: 'Editor is EQ/markers/stems lite — not full multitrack.',
    section: 'backlog',
  },
  {
    id: 'member-invites',
    surface: 'Channel member invites',
    route: '/studio/moderation',
    status: 'missing',
    detail:
      'Adding a moderator by existing username is live-API and done (`/studio/moderation`). A genuine email invite — for someone without a Tahti account yet, with an accept-token flow — is a separate, larger feature with no backing API; not clearly needed given the username flow already covers the common case.',
    section: 'backlog',
  },
  {
    id: 'listener-dashboard',
    surface: 'Listener-only dashboard',
    status: 'missing',
    detail: 'Non-artist /dashboard home not rebuilt.',
    section: 'backlog',
  },
  {
    id: 'cutover',
    surface: 'Production cutover',
    status: 'missing',
    detail: 'Replace apps/web listen/studio with this client.',
    section: 'backlog',
  },
];

/** Mock / stub / unwired inventory rows. */
export const PORT_MOCK_INVENTORY: PortInventoryItem[] = [
  {
    id: 'force-mock',
    surface: 'VITE_FORCE_MOCK whole app',
    status: 'mock-only',
    detail: 'Full fixture session — demos only; never default in prod.',
    section: 'mock',
  },
  {
    id: 'mock-fallback',
    surface: 'Dev silent mock fallback',
    status: 'mock-only',
    detail:
      'When API down + VITE_ALLOW_MOCK_FALLBACK (default on in Vite dev). Set 0 for strict live.',
    section: 'mock',
  },
  {
    id: 'sources-connect',
    surface: 'Sources OAuth Connect',
    route: '/sources',
    status: 'unwired',
    detail:
      'In-app toggle only under FORCE_MOCK; live uses external OAuth href.',
    section: 'mock',
  },
  {
    id: 'preview-demo',
    surface: 'Spotify / SoundCloud stream URLs',
    route: '/sources',
    status: 'partial',
    detail:
      'Often DEMO_MP3 — preview disabled in live until real stream URLs exist.',
    section: 'mock',
  },
  {
    id: 'chat-mock',
    surface: 'Channel chat',
    route: '/chat/$slug',
    status: 'partial',
    detail:
      'Local mock send only under FORCE_MOCK; live join failure fails closed.',
    section: 'mock',
  },
  {
    id: 'themes',
    surface: 'Themes',
    route: '/settings/themes',
    status: 'mock-only',
    detail: 'Nuclear local presets — not a Tahti API.',
    section: 'mock',
  },
  {
    id: 'help-legal',
    surface: 'Help / legal',
    route: '/help',
    status: 'partial',
    detail: 'Static POC copy + prod links.',
    section: 'mock',
  },
  {
    id: 'settings-linkout',
    surface: 'Studio home / Settings extras',
    route: '/settings',
    status: 'link-out',
    detail:
      'Member invites / deep security extras → tahti.live. (Press-kit gallery is live in-app — see the gallery tab on the artist profile.)',
    section: 'mock',
  },
  {
    id: 'setup-channel',
    surface: 'StudioGate setup-channel',
    route: '/studio',
    status: 'link-out',
    detail: 'Channel provision wizard stays on production.',
    section: 'mock',
  },
  {
    id: 'favorites-local',
    surface: 'Favorites / history',
    route: '/library',
    status: 'partial',
    detail: 'Mostly localStorage, not server library.',
    section: 'mock',
  },
  {
    id: 'pro-editor',
    surface: 'Pro editor',
    route: '/studio/editor',
    status: 'partial',
    detail: 'Partial vs prod multitrack.',
    section: 'mock',
  },
  {
    id: 'stash-shares',
    surface: 'Stash shares',
    route: '/studio/stash',
    status: 'missing',
    detail: 'Upload/list/play/delete done; share UI missing.',
    section: 'mock',
  },
  {
    id: 'feature-map',
    surface: 'Feature map / Screen atlas',
    route: '/more',
    status: 'mock-only',
    detail: 'Doc chrome for this map page.',
    section: 'mock',
  },
  {
    id: 'board-admin',
    surface: 'Board /admin/*',
    status: 'out-of-scope',
    detail: 'Stay on prod.',
    section: 'mock',
  },
];

/** High-level gap matrix highlights (not every FEATURES row). */
export const PORT_GAP_HIGHLIGHTS: PortInventoryItem[] = [
  {
    id: 'gap-green-room',
    surface: 'Green room',
    status: 'missing',
    detail: 'Prod /u/:user/green-room not in POC.',
    section: 'gap',
  },
  {
    id: 'gap-password',
    surface: 'Password change / setup-password',
    route: '/settings/account',
    status: 'missing',
    detail: 'Not exposed in this client.',
    section: 'gap',
  },
  {
    id: 'gap-venues-register',
    surface: 'Venue register',
    route: '/venues/register',
    status: 'done',
    detail: 'POST /api/v1/venues (wave 7).',
    section: 'gap',
  },
  {
    id: 'gap-totp',
    surface: 'Account TOTP',
    route: '/settings/account',
    status: 'done',
    detail: '/api/me/totp/* in Settings → Account.',
    section: 'gap',
  },
  {
    id: 'gap-stats-plays',
    surface: 'Stats plays series',
    route: '/studio/stats',
    status: 'done',
    detail: 'GET /api/me/stats/plays — map viz still optional.',
    section: 'gap',
  },
  {
    id: 'gap-stash-upload',
    surface: 'Stash upload / delete',
    route: '/studio/stash',
    status: 'done',
    detail: 'prepare → PUT → register + delete; shares still missing.',
    section: 'gap',
  },
  {
    id: 'gap-press-kit-gallery',
    surface: 'Press-kit gallery',
    route: '/settings/artist',
    status: 'done',
    detail:
      '/api/me/press-kit/images/* upload/delete; ArtistGalleryPanel wired into the gallery tab.',
    section: 'gap',
  },
];

export function countByStatus(
  items: PortInventoryItem[],
): Partial<Record<PortStatus, number>> {
  const out: Partial<Record<PortStatus, number>> = {};
  for (const item of items) {
    out[item.status] = (out[item.status] ?? 0) + 1;
  }
  return out;
}
