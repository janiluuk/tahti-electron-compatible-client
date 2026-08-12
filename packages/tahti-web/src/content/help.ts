export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  /** Production deep-link on tahti.live */
  productionPath: string;
  sections: Array<{ heading: string; body: string[] }>;
};

export const HELP_HUB_INTRO =
  'Guides for listening, broadcasting, account tiers, and getting in touch. Content is mirrored from Tahti help for this Nuclear POC; open the production pages for the latest copy.';

export const HELP_ARTICLES: HelpArticle[] = [
  {
    slug: 'for-listeners',
    title: 'Listener guide',
    description:
      'Find channels, support artists directly, download, and chat — no account required.',
    productionPath: '/help/for-listeners',
    sections: [
      {
        heading: 'Find something to listen to',
        body: [
          'Browse who’s on air from Listen, or open a channel at /channel/$slug.',
          'When an artist is offline, their channel still plays archive items.',
          'Tahti Radio (/radio) is a fair-rotation stream across the community.',
        ],
      },
      {
        heading: 'Support an artist',
        body: [
          'Open /u/$username and choose Subscribe — fan tiers are set by the artist.',
          'Most of what you pay goes to the artist; cancel any time from your account.',
        ],
      },
      {
        heading: 'Chat',
        body: [
          'Chat is open on live channels. Anonymous join may require hCaptcha in production.',
          'Moderators can mute or remove disruptive messages.',
        ],
      },
    ],
  },
  {
    slug: 'for-artists',
    title: 'Artist guide',
    description:
      'Create your channel, go live, upload sets, and share your public links.',
    productionPath: '/help/for-artists',
    sections: [
      {
        heading: 'Create your channel',
        body: [
          'In the artist studio (production dashboard), set your slug — public home is /c/yourname.',
          'This Nuclear POC includes Studio tabs (Go Live, catalog, editor, schedule, stats, revenue, channel design), Sources as big service tiles, and profile Design for channel owners. Deep press-kit extras still link to tahti.live/dashboard.',
        ],
      },
      {
        heading: 'Go live & publish',
        body: [
          'Copy RTMP or Icecast credentials from the broadcast studio, then stream from OBS, Mixxx, or Traktor.',
          'Upload archive sets and releases from the studio; they appear on your channel and profile.',
        ],
      },
    ],
  },
  {
    slug: 'broadcast',
    title: 'Broadcast setup',
    description:
      'Connect OBS, Streamlabs, Mixxx, or Traktor to your Tahti stream key.',
    productionPath: '/help/broadcast',
    sections: [
      {
        heading: 'OBS / Streamlabs (RTMP)',
        body: [
          'Dashboard → Go Live → copy Server and Stream Key.',
          'OBS → Settings → Stream: Service Custom, paste server and key.',
          'Audio bitrate 128–192 kbps AAC. Start Streaming — channel shows Live when ingest connects.',
        ],
      },
      {
        heading: 'Phone',
        body: [
          'Same RTMP credentials work in Larix Broadcaster and similar apps.',
        ],
      },
    ],
  },
  {
    slug: 'multistream',
    title: 'Multistream',
    description:
      'Mirror your live broadcast to YouTube, Twitch, and other platforms.',
    productionPath: '/help/multistream',
    sections: [
      {
        heading: 'How it works',
        body: [
          'Stream once to Tahti. Multistream targets are configured in the studio — do not point OBS at YouTube/Twitch keys directly if Tahti is already mirroring.',
          'Supported destinations include YouTube Live, Twitch, Facebook Live, Kick, Mixcloud, and others when RTMP keys are available.',
        ],
      },
    ],
  },
  {
    slug: 'tier-limits',
    title: 'Free tier vs membership',
    description:
      'Live-hour limits, audio quality, and what changes when you support Tahti ry.',
    productionPath: '/help/tier-limits',
    sections: [
      {
        heading: 'Free-tier artist',
        body: [
          'About 1 hour of live broadcasting per week (resets Monday 00:00 UTC).',
          'Listeners hear MP3 ~192 kbps HLS; archive plays when you are offline.',
        ],
      },
      {
        heading: 'Tahti ry member',
        body: [
          'Unlimited live time and cooperative support (€40/year membership on production).',
          'Membership is support for the org, not a consumer “plan”.',
        ],
      },
    ],
  },
  {
    slug: 'support',
    title: 'Contact support',
    description:
      'Reach the Tahti team about your account, billing, or a technical issue.',
    productionPath: '/help/support',
    sections: [
      {
        heading: 'Get help',
        body: [
          'Use the production support form at tahti.live/help/support for account, billing, or streaming issues.',
          'This POC does not submit support tickets — open the production page to contact the team.',
        ],
      },
    ],
  },
];

export function getHelpArticle(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((a) => a.slug === slug);
}
