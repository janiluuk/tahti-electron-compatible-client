export type ChannelDirectoryItem = {
  slug: string;
  displayName: string;
  avatarUrl: string | null;
  genres: string[];
};

export type ChannelDirectoryResponse = {
  items: ChannelDirectoryItem[];
};

export type ChannelNowPlaying = {
  title: string;
  artistName: string;
  artistUsername: string | null;
  artworkUrl: string | null;
};

export type PublicChannel = {
  slug: string;
  state: 'LIVE' | 'OFFLINE' | string;
  hlsUrl: string | null;
  /** When false, channel chat is off — right rail chat unavailable. */
  chatEnabled?: boolean;
  visualPreset?: string | null;
  colorSchemeJson?: string | null;
  colorScheme?: {
    accent?: string;
    highlight?: string;
    background?: string;
    foreground?: string;
    muted?: string;
  } | null;
  user: {
    username: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  nowPlaying: ChannelNowPlaying | null;
};

export type RadioNowPlaying = {
  live: boolean;
  channel: null | {
    slug: string;
    displayName?: string;
    hlsUrl?: string | null;
    title?: string | null;
    artworkUrl?: string | null;
  };
};

/** GET /api/v1/radio/recently-played — track history on Tahti Radio. */
export type RadioRecentlyPlayedItem = {
  id: string;
  title: string;
  artistName: string;
  artistUsername: string | null;
  artworkUrl: string | null;
  playedAt: string;
};

/** Public archive row from GET /api/channels/:slug/items */
export type ArchiveItem = {
  id: string;
  title: string;
  artistName?: string | null;
  durationSec?: number | null;
  bannerUrl?: string | null;
  audioUrl?: string | null;
  genre?: string | null;
  createdAt?: string;
  /** Origin provider when imported (soundcloud, bandcamp, …). */
  sourceProvider?: string | null;
};

export type PublicProfileArtist = {
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  tipJarUrl?: string | null;
  tier?: string;
  pronouns?: string | null;
  followerCount?: number | null;
};

export type PublicProfileTrack = {
  id: string;
  title: string;
  artistName?: string | null;
  durationSec?: number | null;
  bannerUrl?: string | null;
  playUrl?: string | null;
  releaseSlug?: string | null;
};

export type PublicProfileRelease = {
  id: string;
  title: string;
  type?: string;
  artworkUrl?: string | null;
  smartLinkSlug?: string | null;
  releaseDate?: string | null;
  description?: string | null;
  tracks?: Array<{
    position: number;
    title: string;
    durationSec?: number | null;
    archiveItemId?: string | null;
    playUrl?: string | null;
  }>;
};

export type PublicProfileCollection = {
  slug: string;
  name: string;
  type: string;
  style: string;
  description: string | null;
  coverUrl: string | null;
  isFeatured: boolean;
  itemCount: number;
  url: string;
  rssUrl: string;
};

export type PublicProfile = {
  artist: PublicProfileArtist;
  channel: { slug: string; state: string; artistKind?: string } | null;
  releases: PublicProfileRelease[];
  tracks: PublicProfileTrack[];
  fanTiers: Array<{ id: string; name: string; amountCents: number }>;
  collections: PublicProfileCollection[];
  links: {
    channel: string | null;
    subscribe: string;
    feeds: { archive: string | null };
    presskit: string;
  };
  backgroundMusicUrl?: string | null;
};

export type CollectionArchiveItem = {
  id: string;
  title: string;
  durationSec?: number | null;
  bannerUrl?: string | null;
  audioUrl?: string | null;
  channel?: { slug: string } | null;
};

export type CollectionItem = {
  id?: string;
  position: number;
  archiveItem: CollectionArchiveItem | null;
  release: {
    id: string;
    title: string;
    type?: string;
    smartLinkSlug?: string | null;
    artworkUrl?: string | null;
    description?: string | null;
  } | null;
};

export type PublicCollection = {
  slug: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  isPublic: boolean;
  collaborative: boolean;
  user: { username: string; displayName: string };
  items: CollectionItem[];
  links: { page: string; rss: string };
};

export type SmartLinkView = {
  release: {
    id: string;
    title: string;
    type?: string;
    artworkUrl?: string | null;
    description?: string | null;
    smartLinkSlug?: string;
    tracks?: Array<{ title: string; position: number; isrc?: string | null }>;
  };
  artist: {
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
  featuredCollections: Array<{
    slug: string;
    name: string;
    coverUrl?: string | null;
    itemCount?: number;
    url?: string;
  }>;
  profileUrl: string;
  releaseUrl: string;
  targets: Record<string, string>;
  embedUrl: string;
};

export type VenueDirectoryItem = {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  countryCode: string | null;
  capacity: number | null;
  description: string | null;
};

/** Playable item in the Tahti listen client (live channel, radio, or archive URL). */
export type TahtiPlayable = {
  id: string;
  kind: 'live' | 'radio' | 'archive';
  title: string;
  artist: string;
  coverUrl?: string;
  streamUrl: string;
  protocol: 'hls' | 'https';
  channelSlug?: string;
  /** Nuclear ProviderRef.provider — e.g. tahti, soundcloud, bandcamp, spotify. */
  sourceProvider?: string;
};

export type ChatMessage = {
  id: string;
  handle: string;
  text: string;
  ts: number;
  supporter?: boolean;
  channelRole?: 'owner' | 'moderator' | null;
  countryCode?: string | null;
  system?: boolean;
};

export type ChatAccess = {
  fanChatEnabled: boolean;
  isSupporter: boolean;
  canJoinFanChat: boolean;
  subscribersOnly: boolean;
  canPostInChat: boolean;
};

export type ChatTokenResponse = {
  token: string;
  handle: string;
  fingerprint?: string;
  supporter?: boolean;
  countryCode?: string | null;
  channelRole?: 'owner' | 'moderator' | null;
};

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  displayName: string;
  tier?: string;
  avatarUrl?: string | null;
  isMember?: boolean;
  channel?: {
    slug: string;
    state: string;
    goneLiveAt?: string | null;
    customDomain?: string | null;
    customDomainVerified?: boolean;
  } | null;
};

export type FanTierPublic = {
  id: string;
  name: string;
  amountCents: number;
  description?: string | null;
  perks?: string[];
};

export type FanTiersResponse = {
  artist: {
    id: string;
    displayName: string;
    username: string;
    bio: string | null;
    avatarUrl: string | null;
  };
  tiers: FanTierPublic[];
  paymentsReady: boolean;
};

export type TransparencyYtd = {
  year: string;
  byCategory: Record<string, string>;
  runningSurplus: string;
  monthsFinalized: number;
};

export type TransparencyGrantReport = {
  year: number;
  totalCents: string;
  grantCount: number;
  disbursedAt: string | null;
  grants: Array<{
    publishedAs: string;
    units: number;
    amountCents: string;
    state: string;
  }>;
};

export type TransparencyLedgerEntry = {
  id: string;
  description: string;
  category: string;
  amountCents: string;
  createdAt: string;
};

export type FollowListUser = {
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export type ChannelEmbedView = {
  slug: string;
  state: string;
  artist: { username: string; displayName: string; avatarUrl: string | null };
  embedUrl?: string;
  profileUrl?: string;
  hlsUrl: string | null;
};

export type ReleaseEmbedTrack = {
  id: string;
  position: number;
  title: string;
  durationSec?: number | null;
  hasStream?: boolean;
};

export type ReleaseEmbedView = {
  id: string;
  title: string;
  type?: string;
  artworkUrl?: string | null;
  smartLinkSlug?: string | null;
  artist: { username: string; displayName: string };
  tracks: ReleaseEmbedTrack[];
  embedUrl?: string;
  profileUrl?: string;
};

export type CollectionEmbedTrack = {
  id: string;
  title: string;
  durationSec?: number | null;
  hasStream?: boolean;
};

export type CollectionEmbedView = {
  slug: string;
  name: string;
  coverUrl?: string | null;
  embedUrl?: string;
  profileUrl?: string;
  artist: { username: string; displayName: string };
  tracks: CollectionEmbedTrack[];
};

export type PlatformStatusCheck = {
  state: 'ok' | 'degraded' | 'down' | string;
  critical?: boolean;
  latencyMs?: number;
  detail?: string;
};

export type PlatformStatus = {
  status: 'ok' | 'degraded' | 'down' | string;
  version?: string;
  uptimeSec?: number;
  checks: Record<string, PlatformStatusCheck>;
  ts?: string;
};

export type MembershipStatus = {
  status: string;
  isMember: boolean;
  memberNumber?: number | null;
  memberSince?: string | null;
  tier?: string;
  priceCents?: number;
  emailVerified?: boolean;
  renewalDueAt?: string | null;
  hasStripeSubscription?: boolean;
};

export type FanSubscriptionRow = {
  id: string;
  tierName: string;
  amountCents: number;
  state: string;
  currentPeriodEnd?: string | null;
  canceledAt?: string | null;
  artist: { username: string; displayName: string };
};

export type GovernanceMotion = {
  id: string;
  title: string;
  state: string;
  advisory?: boolean;
  openAt?: string | null;
  closeAt?: string | null;
  proposer?: string;
  totalVotes?: number;
  youVoted?: boolean;
  yourChoice?: string | null;
  commentCount?: number;
  tally?: { YES: number; NO: number; ABSTAIN: number };
};

export type AnnouncementType =
  | 'feature'
  | 'fix'
  | 'improvement'
  | 'maintenance'
  | 'announcement';

/** GET /api/v1/announcements — platform news published from the admin panel. */
export type Announcement = {
  id: string;
  title: string;
  body: string;
  type: AnnouncementType;
  publishedAt: string;
  link?: string | null;
};
