/**
 * Production tahti.live path → Nuclear SPA path.
 * Used for cutover compatibility (emails, Stripe returns, bookmarks).
 */
export const DASHBOARD_REDIRECTS: Record<string, string> = {
  '': '/studio',
  broadcast: '/studio/go-live',
  archive: '/studio/archive',
  upload: '/studio/upload',
  releases: '/studio/releases',
  collections: '/studio/collections',
  editor: '/studio/editor',
  stash: '/studio/stash',
  schedule: '/studio/schedule',
  stats: '/studio/stats',
  channel: '/studio/channel',
  'channel/edit': '/studio/channel',
  'tahti-radio-slots': '/studio/shows',
  shows: '/studio/shows',
  playlists: '/studio/playlists',
  newsletter: '/studio/updates',
  updates: '/studio/updates',
  revenue: '/studio/revenue',
  messages: '/library/messages',
  'setup-channel': '/studio/setup-channel',
  settings: '/settings',
  'settings/account': '/settings/account',
  'settings/artist-info': '/settings/artist',
  'settings/fan-subs': '/settings/money',
  'settings/connections': '/settings/connections',
  'settings/notifications': '/settings/notifications',
  'settings/domain': '/settings/channel',
  'settings/multistream': '/studio/go-live',
};

/** Resolve /dashboard/... rest path to Nuclear target, or /studio fallback. */
export function resolveDashboardRedirect(rest: string | undefined): string {
  const key = (rest ?? '').replace(/^\/+|\/+$/g, '');
  if (DASHBOARD_REDIRECTS[key]) {
    return DASHBOARD_REDIRECTS[key];
  }
  // Prefix matches (e.g. archive/:id → archive)
  const first = key.split('/')[0] ?? '';
  if (first === 'archive' && key.includes('/')) {
    const id = key.split('/')[1];
    return id ? `/studio/archive/${id}` : '/studio/archive';
  }
  if (first === 'releases' && key.includes('/')) {
    const id = key.split('/')[1];
    return id ? `/studio/releases/${id}` : '/studio/releases';
  }
  if (first === 'collections' && key.includes('/')) {
    const slug = key.split('/')[1];
    return slug ? `/studio/collections/${slug}` : '/studio/collections';
  }
  if (first === 'editor' && key.includes('/')) {
    const id = key.split('/')[1];
    return id ? `/studio/editor/${id}` : '/studio/editor';
  }
  if (first === 'stats' && key.includes('detail')) {
    return '/studio/stats/detail';
  }
  if (first === 'moderate') {
    return '/studio/moderation';
  }
  if (DASHBOARD_REDIRECTS[first]) {
    return DASHBOARD_REDIRECTS[first];
  }
  return '/studio';
}
