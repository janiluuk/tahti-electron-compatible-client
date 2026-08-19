import type { FetchMeta } from './client';

const forceMock = () => import.meta.env.VITE_FORCE_MOCK === '1';

const apiBase = () => {
  if (import.meta.env.VITE_TAHTI_API_URL?.startsWith('http')) {
    return import.meta.env.VITE_TAHTI_API_URL.replace(/\/$/, '');
  }
  return '/tahti-api';
};

function failMeta(err: unknown): FetchMeta {
  return {
    source: 'mock',
    reason: err instanceof Error ? err.message : 'fetch failed',
  };
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ data: T; status: number }> {
  const { headers: initHeaders, ...rest } = init ?? {};
  const res = await fetch(`${apiBase()}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...initHeaders,
    },
  });
  if (!res.ok) {
    let detail = `${path} → ${res.status}`;
    try {
      const body = (await res.json()) as { error?: string; message?: string };
      if (body.error || body.message) {
        detail = body.error ?? body.message ?? detail;
      }
    } catch {
      // ignore
    }
    throw new Error(detail);
  }
  if (res.status === 204) {
    return { data: undefined as T, status: res.status };
  }
  return { data: (await res.json()) as T, status: res.status };
}

export type NotificationPrefs = {
  emailFanSub: boolean;
  emailComment: boolean;
  emailMention: boolean;
  emailBroadcastReminder: boolean;
  pushLiveStart: boolean;
  digestWeekly: boolean;
};

export type DiscoveryPrefs = {
  listedInDirectory: boolean;
  allowRadioPickup: boolean;
  showOnListenHome: boolean;
  genreTags: string;
};

export type GreenRoomPrefs = {
  defaultTitle: string;
  defaultNote: string;
  autoAnnounce: boolean;
  holdMusicEnabled: boolean;
};

export type SocialConnections = {
  website: string;
  instagram: string;
  bandcamp: string;
  soundcloud: string;
  youtube: string;
  discord: string;
};

export type ChannelMember = {
  id: string;
  username: string;
  displayName: string;
  role: 'OWNER' | 'MEMBER' | 'MODERATOR';
};

export type ModeratorRow = {
  id: string;
  username: string;
  displayName: string;
  canTimeout: boolean;
  canDelete: boolean;
};

export type PressKitMeta = {
  hasZip: boolean;
  bioShort: string;
  downloadPath: string | null;
  photoCount: number;
};

let mockNotifications: NotificationPrefs = {
  emailFanSub: true,
  emailComment: true,
  emailMention: true,
  emailBroadcastReminder: true,
  pushLiveStart: false,
  digestWeekly: true,
};

let mockDiscovery: DiscoveryPrefs = {
  listedInDirectory: true,
  allowRadioPickup: true,
  showOnListenHome: true,
  genreTags: 'ambient, live',
};

let mockGreenRoom: GreenRoomPrefs = {
  defaultTitle: 'Live session',
  defaultNote: '',
  autoAnnounce: true,
  holdMusicEnabled: false,
};

let mockSocial: SocialConnections = {
  website: '',
  instagram: '',
  bandcamp: '',
  soundcloud: '',
  youtube: '',
  discord: '',
};

const mockMembers: ChannelMember[] = [
  {
    id: 'm1',
    username: 'demo',
    displayName: 'Demo Artist',
    role: 'OWNER',
  },
  {
    id: 'm2',
    username: 'co-host',
    displayName: 'Co Host',
    role: 'MEMBER',
  },
];

const mockMods: ModeratorRow[] = [
  {
    id: 'mod1',
    username: 'mod-ada',
    displayName: 'Ada Mod',
    canTimeout: true,
    canDelete: true,
  },
];

export type ChatBan = {
  fingerprintHash: string;
  bannedAt: string;
};

const mockChatBans: ChatBan[] = [
  {
    fingerprintHash: 'a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4',
    bannedAt: '2026-07-20T18:00:00.000Z',
  },
];

let mockPress: PressKitMeta = {
  hasZip: false,
  bioShort: 'Demo Artist — live electronic sets from the north.',
  downloadPath: null,
  photoCount: 0,
};

export async function fetchNotificationPrefs(): Promise<{
  data: NotificationPrefs;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: { ...mockNotifications },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<NotificationPrefs>(
      '/api/me/notification-preferences',
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: { ...mockNotifications }, meta: failMeta(err) };
  }
}

export async function patchNotificationPrefs(
  patch: Partial<NotificationPrefs>,
): Promise<
  { ok: true; data: NotificationPrefs } | { ok: false; error: string }
> {
  if (forceMock()) {
    mockNotifications = { ...mockNotifications, ...patch };
    return { ok: true, data: { ...mockNotifications } };
  }
  try {
    const { data } = await requestJson<NotificationPrefs>(
      '/api/me/notification-preferences',
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
      },
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Save failed',
    };
  }
}

export async function fetchDiscoveryPrefs(): Promise<{
  data: DiscoveryPrefs;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: { ...mockDiscovery },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<DiscoveryPrefs>('/api/me/discovery');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: { ...mockDiscovery }, meta: failMeta(err) };
  }
}

export async function patchDiscoveryPrefs(
  patch: Partial<DiscoveryPrefs>,
): Promise<{ ok: true; data: DiscoveryPrefs } | { ok: false; error: string }> {
  if (forceMock()) {
    mockDiscovery = { ...mockDiscovery, ...patch };
    return { ok: true, data: { ...mockDiscovery } };
  }
  try {
    const { data } = await requestJson<DiscoveryPrefs>('/api/me/discovery', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Save failed',
    };
  }
}

/** Guest-side view of an artist's green room — the invite-only preview
 * stream that runs before a broadcast goes public. */
export type GreenRoomAccess = {
  hasAccess: boolean;
  channelState: 'OFFLINE' | 'PREVIEW' | 'LIVE';
  greenRoomEnabled: boolean;
  joinedAt: string | null;
  hlsUrl: string | null;
  artistUsername: string;
  artistDisplayName: string;
};

export async function fetchGreenRoomAccess(
  channelSlug: string,
): Promise<
  | { ok: true; data: GreenRoomAccess }
  | { ok: false; needsLogin: boolean; error: string }
> {
  if (forceMock()) {
    return {
      ok: true,
      data: {
        hasAccess: true,
        channelState: 'PREVIEW',
        greenRoomEnabled: true,
        joinedAt: new Date().toISOString(),
        hlsUrl: null,
        artistUsername: channelSlug,
        artistDisplayName: 'Northern Lights',
      },
    };
  }
  try {
    const { data } = await requestJson<GreenRoomAccess>(
      `/api/me/green-room/${encodeURIComponent(channelSlug)}`,
    );
    return { ok: true, data };
  } catch (err) {
    const message = err instanceof Error ? err.message : '';
    return {
      ok: false,
      needsLogin: /401|unauthor/i.test(message),
      error: message || 'Could not load green room access',
    };
  }
}

export async function joinGreenRoom(
  channelSlug: string,
): Promise<GreenRoomAccess | null> {
  if (forceMock()) {
    return null;
  }
  try {
    const { data } = await requestJson<GreenRoomAccess>(
      `/api/me/green-room/${encodeURIComponent(channelSlug)}/join`,
      { method: 'POST' },
    );
    return data;
  } catch {
    return null;
  }
}

export async function fetchGreenRoomPrefs(): Promise<{
  data: GreenRoomPrefs;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: { ...mockGreenRoom },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<GreenRoomPrefs>('/api/me/green-room');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: { ...mockGreenRoom }, meta: failMeta(err) };
  }
}

export async function patchGreenRoomPrefs(
  patch: Partial<GreenRoomPrefs>,
): Promise<{ ok: true; data: GreenRoomPrefs } | { ok: false; error: string }> {
  if (forceMock()) {
    mockGreenRoom = { ...mockGreenRoom, ...patch };
    return { ok: true, data: { ...mockGreenRoom } };
  }
  try {
    const { data } = await requestJson<GreenRoomPrefs>('/api/me/green-room', {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Save failed',
    };
  }
}

export async function fetchSocialConnections(): Promise<{
  data: SocialConnections;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: { ...mockSocial },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<SocialConnections>(
      '/api/me/connections',
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: { ...mockSocial }, meta: failMeta(err) };
  }
}

export async function patchSocialConnections(
  patch: Partial<SocialConnections>,
): Promise<
  { ok: true; data: SocialConnections } | { ok: false; error: string }
> {
  if (forceMock()) {
    mockSocial = { ...mockSocial, ...patch };
    return { ok: true, data: { ...mockSocial } };
  }
  try {
    const { data } = await requestJson<SocialConnections>(
      '/api/me/connections',
      {
        method: 'PATCH',
        body: JSON.stringify(patch),
      },
    );
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Save failed',
    };
  }
}

export async function fetchChannelMembers(): Promise<{
  data: ChannelMember[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: [...mockMembers],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<
      ChannelMember[] | { members: ChannelMember[] }
    >('/api/me/channel/members');
    const list = Array.isArray(data) ? data : (data.members ?? []);
    return { data: list, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

/** Real shape of GET /api/me/channel/moderators — delegated chat moderators. */
type ChannelModeratorApiRow = {
  userId: string;
  username: string;
  displayName: string;
  grantedAt: string;
};

function toModeratorRow(row: ChannelModeratorApiRow): ModeratorRow {
  return {
    id: row.userId,
    username: row.username,
    displayName: row.displayName,
    // Delegated moderators can ban/unban chat; prod has no finer-grained split.
    canTimeout: true,
    canDelete: true,
  };
}

export async function fetchModerators(): Promise<{
  data: ModeratorRow[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: [...mockMods],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<ChannelModeratorApiRow[]>(
      '/api/me/channel/moderators',
    );
    return { data: data.map(toModeratorRow), meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export async function addModerator(
  username: string,
): Promise<{ ok: true; data: ModeratorRow } | { ok: false; error: string }> {
  if (forceMock()) {
    const row: ModeratorRow = {
      id: `mod-mock-${Date.now()}`,
      username,
      displayName: username,
      canTimeout: true,
      canDelete: true,
    };
    mockMods.push(row);
    return { ok: true, data: row };
  }
  try {
    const { data } = await requestJson<ChannelModeratorApiRow>(
      '/api/me/channel/moderators',
      { method: 'POST', body: JSON.stringify({ username }) },
    );
    return { ok: true, data: toModeratorRow(data) };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not add moderator',
    };
  }
}

export async function removeModerator(
  userId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    const idx = mockMods.findIndex((m) => m.id === userId);
    if (idx >= 0) {
      mockMods.splice(idx, 1);
    }
    return { ok: true };
  }
  try {
    await requestJson(
      `/api/me/channel/moderators/${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
      },
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not remove moderator',
    };
  }
}

export async function fetchChatBans(slug: string): Promise<{
  data: ChatBan[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: [...mockChatBans],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<ChatBan[]>(
      `/api/me/moderate/${encodeURIComponent(slug)}/chat/bans`,
    );
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export async function banChatFingerprint(
  slug: string,
  fingerprintHash: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    if (!mockChatBans.some((b) => b.fingerprintHash === fingerprintHash)) {
      mockChatBans.unshift({
        fingerprintHash,
        bannedAt: new Date().toISOString(),
      });
    }
    return { ok: true };
  }
  try {
    await requestJson(`/api/me/moderate/${encodeURIComponent(slug)}/chat/ban`, {
      method: 'POST',
      body: JSON.stringify({ fingerprintHash }),
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not ban',
    };
  }
}

export async function unbanChatFingerprint(
  slug: string,
  fingerprintHash: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    const idx = mockChatBans.findIndex(
      (b) => b.fingerprintHash === fingerprintHash,
    );
    if (idx >= 0) {
      mockChatBans.splice(idx, 1);
    }
    return { ok: true };
  }
  try {
    await requestJson(
      `/api/me/moderate/${encodeURIComponent(slug)}/chat/ban/${encodeURIComponent(fingerprintHash)}`,
      { method: 'DELETE' },
    );
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not unban',
    };
  }
}

export async function fetchPressKitMeta(): Promise<{
  data: PressKitMeta;
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: { ...mockPress },
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<PressKitMeta>('/api/me/press-kit');
    return { data, meta: { source: 'api' } };
  } catch (err) {
    return {
      data: { ...mockPress, hasZip: false, downloadPath: null },
      meta: failMeta(err),
    };
  }
}

export async function patchPressKitBio(
  bioShort: string,
): Promise<{ ok: true; data: PressKitMeta } | { ok: false; error: string }> {
  if (forceMock()) {
    mockPress = { ...mockPress, bioShort };
    return { ok: true, data: { ...mockPress } };
  }
  try {
    const { data } = await requestJson<PressKitMeta>('/api/me/press-kit', {
      method: 'PATCH',
      body: JSON.stringify({ bioShort }),
    });
    return { ok: true, data };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Save failed',
    };
  }
}

export type PublicPressKitImage = {
  id: string;
  imageUrl: string;
  title: string | null;
};

export type PressKitImageItem = PublicPressKitImage & {
  position: number;
  includeInZip: boolean;
};

const ACCEPTED_PRESS_KIT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_PRESS_KIT_IMAGES = 30;

/** Starts empty so the artist-page “add images” affordance is exercisable offline. */
let mockGalleryImages: PressKitImageItem[] = [];

let mockGalleryPublic = false;

/** Public gallery on `/u/:username` — empty unless the artist opted in. */
export async function fetchPublicPressKitImages(
  username: string,
): Promise<{ data: PublicPressKitImage[]; meta: FetchMeta }> {
  if (forceMock()) {
    return {
      data: mockGalleryPublic
        ? mockGalleryImages.map(({ id, imageUrl, title }) => ({
            id,
            imageUrl,
            title,
          }))
        : [],
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<PublicPressKitImage[]>(
      `/api/v1/u/${encodeURIComponent(username)}/press-kit-images.json`,
    );
    return { data: Array.isArray(data) ? data : [], meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

/** Owner list — includes images even when the public gallery is off. */
export async function fetchMyPressKitImages(): Promise<{
  data: PressKitImageItem[];
  meta: FetchMeta;
}> {
  if (forceMock()) {
    return {
      data: mockGalleryImages.map((i) => ({ ...i })),
      meta: { source: 'mock', reason: 'VITE_FORCE_MOCK' },
    };
  }
  try {
    const { data } = await requestJson<PressKitImageItem[]>(
      '/api/me/press-kit/images',
    );
    return { data: Array.isArray(data) ? data : [], meta: { source: 'api' } };
  } catch (err) {
    return { data: [], meta: failMeta(err) };
  }
}

export async function setPressKitGalleryPublic(
  pressKitGalleryPublic: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    mockGalleryPublic = pressKitGalleryPublic;
    return { ok: true };
  }
  try {
    await requestJson('/api/me/press-kit/gallery-settings', {
      method: 'PATCH',
      body: JSON.stringify({ pressKitGalleryPublic }),
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Gallery setting failed',
    };
  }
}

export async function uploadPressKitImage(
  file: File,
): Promise<
  { ok: true; image: PressKitImageItem } | { ok: false; error: string }
> {
  const type = file.type || 'image/jpeg';
  if (!ACCEPTED_PRESS_KIT_TYPES.includes(type)) {
    return { ok: false, error: 'Use JPEG, PNG, or WebP' };
  }
  if (forceMock()) {
    if (mockGalleryImages.length >= MAX_PRESS_KIT_IMAGES) {
      return {
        ok: false,
        error: `Press kit is limited to ${MAX_PRESS_KIT_IMAGES} images`,
      };
    }
    const image: PressKitImageItem = {
      id: `pk-mock-${Date.now()}`,
      imageUrl: URL.createObjectURL(file),
      title: null,
      position: mockGalleryImages.length,
      includeInZip: true,
    };
    mockGalleryImages = [...mockGalleryImages, image];
    mockPress = { ...mockPress, photoCount: mockGalleryImages.length };
    mockGalleryPublic = true;
    return { ok: true, image };
  }
  try {
    const { data: prep } = await requestJson<{
      uploadKey: string;
      uploadUrl: string;
    }>('/api/me/press-kit/images/prepare', {
      method: 'POST',
      body: JSON.stringify({ filename: file.name, contentType: type }),
    });
    const put = await fetch(prep.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': type },
    });
    if (!put.ok) {
      throw new Error(`Upload PUT failed (${put.status})`);
    }
    const { data: image } = await requestJson<PressKitImageItem>(
      '/api/me/press-kit/images/complete',
      {
        method: 'POST',
        body: JSON.stringify({ uploadKey: prep.uploadKey }),
      },
    );
    return { ok: true, image };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Upload failed',
    };
  }
}

/** Sequential multi-file upload (matches dashboard press-kit builder). */
export async function uploadPressKitImages(files: FileList | File[]): Promise<{
  ok: true;
  images: PressKitImageItem[];
  errors: string[];
}> {
  const list = Array.from(files).slice(0, MAX_PRESS_KIT_IMAGES);
  const images: PressKitImageItem[] = [];
  const errors: string[] = [];
  for (const file of list) {
    const result = await uploadPressKitImage(file);
    if (result.ok) {
      images.push(result.image);
    } else {
      errors.push(`${file.name}: ${result.error}`);
    }
  }
  if (images.length > 0) {
    await setPressKitGalleryPublic(true);
  }
  return { ok: true, images, errors };
}

export async function deletePressKitImage(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (forceMock()) {
    mockGalleryImages = mockGalleryImages.filter((i) => i.id !== id);
    mockPress = { ...mockPress, photoCount: mockGalleryImages.length };
    return { ok: true };
  }
  try {
    await requestJson(`/api/me/press-kit/images/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Delete failed',
    };
  }
}
