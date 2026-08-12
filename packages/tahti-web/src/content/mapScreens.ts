/** Screenshot atlas for the Tahti map (`/more`).
 *
 * Images are curated from production e2e captures
 * (`tahti/docs/e2e-screenshots`) to show *what each surface looks like*.
 * Nuclear POC routes are listed alongside — chrome differs, purpose matches.
 */

export type MapScreen = {
  id: string;
  title: string;
  /** Nuclear / beta route */
  route: string;
  /** Prod Tahti route (for orientation) */
  prodRoute: string;
  /** Path under /map/… served from public/ */
  image: string;
  blurb: string;
};

export type MapScreenGroup = {
  id: string;
  title: string;
  description: string;
  screens: MapScreen[];
};

export const MAP_SCREEN_GROUPS: MapScreenGroup[] = [
  {
    id: 'listen',
    title: 'Listen',
    description: 'Public discovery and playback surfaces.',
    screens: [
      {
        id: 'listen',
        title: 'Listen directory',
        route: '/',
        prodRoute: '/listen',
        image: '/map/listen/listen.png',
        blurb: 'Channel directory / home hub',
      },
      {
        id: 'channel',
        title: 'Channel',
        route: '/channel/$slug',
        prodRoute: '/c/:slug',
        image: '/map/listen/channel.png',
        blurb: 'Live + archive + visualizer',
      },
      {
        id: 'radio',
        title: 'Tahti Radio',
        route: '/radio',
        prodRoute: '/radio',
        image: '/map/listen/radio.png',
        blurb: 'Co-op radio now-playing',
      },
      {
        id: 'profile',
        title: 'Artist profile',
        route: '/u/$username',
        prodRoute: '/u/:username',
        image: '/map/listen/profile.png',
        blurb: 'Bio, tracks, collections',
      },
      {
        id: 'collection',
        title: 'Collection',
        route: '/u/$username/c/$slug',
        prodRoute: '/u/:user/c/:slug',
        image: '/map/listen/collection.png',
        blurb: 'Public playlist / album page',
      },
      {
        id: 'smart-link',
        title: 'Smart link',
        route: '/r/$slug',
        prodRoute: '/r/:slug',
        image: '/map/listen/smart-link.png',
        blurb: 'Release DSP landing',
      },
      {
        id: 'subscribe',
        title: 'Fan subscribe',
        route: '/subscribe/$username',
        prodRoute: '/u/:user/subscribe',
        image: '/map/listen/subscribe.png',
        blurb: 'Tier cards → Stripe',
      },
      {
        id: 'venues',
        title: 'Venues',
        route: '/venues',
        prodRoute: '/venues',
        image: '/map/listen/venues.png',
        blurb: 'Venue calendar list',
      },
      {
        id: 'transparency',
        title: 'Transparency',
        route: '/transparency',
        prodRoute: '/transparency',
        image: '/map/listen/transparency.png',
        blurb: 'YTD / grants',
      },
      {
        id: 'status',
        title: 'Status',
        route: '/status',
        prodRoute: '/status',
        image: '/map/listen/status.png',
        blurb: 'Platform health',
      },
      {
        id: 'help',
        title: 'Help',
        route: '/help',
        prodRoute: '/help',
        image: '/map/listen/help.png',
        blurb: 'Help center index',
      },
      {
        id: 'embed',
        title: 'Embed',
        route: '/embed/c/$slug',
        prodRoute: '/embed/c/:slug',
        image: '/map/listen/embed.png',
        blurb: 'Minimal embed player',
      },
    ],
  },
  {
    id: 'auth',
    title: 'Auth & member',
    description: 'Account entry and member surfaces.',
    screens: [
      {
        id: 'login',
        title: 'Login',
        route: '/login',
        prodRoute: '/login',
        image: '/map/auth/login.png',
        blurb: 'Session + TOTP',
      },
      {
        id: 'join',
        title: 'Join',
        route: '/join',
        prodRoute: '/join',
        image: '/map/auth/join.png',
        blurb: 'Register',
      },
      {
        id: 'verify',
        title: 'Verify email',
        route: '/verify',
        prodRoute: '/verify',
        image: '/map/auth/verify.png',
        blurb: 'Email token landing',
      },
      {
        id: 'governance',
        title: 'Governance',
        route: '/governance',
        prodRoute: '/governance',
        image: '/map/auth/governance.png',
        blurb: 'Member motions / votes',
      },
    ],
  },
  {
    id: 'studio',
    title: 'Studio',
    description: 'Artist tools (prod chrome shown; POC uses /studio/*).',
    screens: [
      {
        id: 'studio-home',
        title: 'Studio home',
        route: '/studio',
        prodRoute: '/dashboard',
        image: '/map/studio/home.png',
        blurb: 'Artist overview',
      },
      {
        id: 'go-live',
        title: 'Go Live',
        route: '/studio/go-live',
        prodRoute: '/dashboard/broadcast',
        image: '/map/studio/go-live.png',
        blurb: 'Broadcast wizard',
      },
      {
        id: 'archive',
        title: 'Music / archive',
        route: '/studio/archive',
        prodRoute: '/dashboard/archive',
        image: '/map/studio/archive.png',
        blurb: 'Catalog list',
      },
      {
        id: 'upload',
        title: 'Upload',
        route: '/studio/upload',
        prodRoute: '/dashboard/upload',
        image: '/map/studio/upload.png',
        blurb: 'Prepare → PUT → complete',
      },
      {
        id: 'releases',
        title: 'Releases',
        route: '/studio/releases',
        prodRoute: '/dashboard/releases',
        image: '/map/studio/releases.png',
        blurb: 'Smart-link releases',
      },
      {
        id: 'collections',
        title: 'Collections',
        route: '/studio/collections',
        prodRoute: '/dashboard/collections',
        image: '/map/studio/collections.png',
        blurb: 'Album / playlist designer',
      },
      {
        id: 'schedule',
        title: 'Schedule',
        route: '/studio/schedule',
        prodRoute: '/dashboard/schedule',
        image: '/map/studio/schedule.png',
        blurb: 'Next show + programme',
      },
      {
        id: 'stats',
        title: 'Stats',
        route: '/studio/stats',
        prodRoute: '/dashboard/stats',
        image: '/map/studio/stats.png',
        blurb: 'Plays / top tracks',
      },
      {
        id: 'channel',
        title: 'Channel design',
        route: '/studio/channel',
        prodRoute: '/dashboard/channel/edit',
        image: '/map/studio/channel.png',
        blurb: 'Look & presets',
      },
      {
        id: 'updates',
        title: 'Updates',
        route: '/studio/updates',
        prodRoute: '/dashboard/newsletter',
        image: '/map/studio/updates.png',
        blurb: 'Posts / newsletter',
      },
      {
        id: 'revenue',
        title: 'Revenue',
        route: '/studio/revenue',
        prodRoute: '/dashboard/revenue',
        image: '/map/studio/revenue.png',
        blurb: 'Connect + grants',
      },
      {
        id: 'editor',
        title: 'Editor',
        route: '/studio/editor',
        prodRoute: '/dashboard/editor',
        image: '/map/studio/editor.png',
        blurb: 'Waveform / stems',
      },
      {
        id: 'stash',
        title: 'Stash',
        route: '/studio/stash',
        prodRoute: '/dashboard/stash',
        image: '/map/studio/stash.png',
        blurb: 'Private locker',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Account and artist prefs (POC: /settings/$section).',
    screens: [
      {
        id: 'account',
        title: 'Account',
        route: '/settings/account',
        prodRoute: '/dashboard/settings/account',
        image: '/map/settings/account.png',
        blurb: 'Session / membership',
      },
      {
        id: 'artist',
        title: 'Artist info',
        route: '/settings/artist',
        prodRoute: '/dashboard/settings/artist',
        image: '/map/settings/artist.png',
        blurb: 'Profile fields',
      },
      {
        id: 'money',
        title: 'Money / fan tiers',
        route: '/settings/money',
        prodRoute: '/dashboard/settings/fan-subs',
        image: '/map/settings/money.png',
        blurb: 'Tiers + Connect',
      },
      {
        id: 'connections',
        title: 'Connections',
        route: '/settings/connections',
        prodRoute: '/dashboard/settings/connections',
        image: '/map/settings/connections.png',
        blurb: 'Social + sources',
      },
    ],
  },
];
