/** Composable blocks on the public channel page (owner design mode). */

export const CHANNEL_PAGE_ITEM_TYPES = [
  'hero',
  'actions',
  'archive',
  'chat',
  'about',
  'links',
  'textOverlay',
  'subscribe',
] as const;

export type ChannelPageItemType = (typeof CHANNEL_PAGE_ITEM_TYPES)[number];

export type ChannelPageItem = {
  id: string;
  type: ChannelPageItemType;
  visible: boolean;
};

export const CHANNEL_PAGE_ITEM_META: Record<
  ChannelPageItemType,
  { label: string; hint: string }
> = {
  hero: {
    label: 'Live stage',
    hint: 'Visualizer + now playing',
  },
  actions: {
    label: 'Tune-in actions',
    hint: 'Play, queue, favorite',
  },
  archive: {
    label: 'Archive',
    hint: 'Past sets table',
  },
  chat: {
    label: 'Chat',
    hint: 'Right-rail chat (no in-page panel)',
  },
  about: {
    label: 'About',
    hint: 'Bio and profile link',
  },
  links: {
    label: 'Links',
    hint: 'Social / outbound links',
  },
  textOverlay: {
    label: 'Text overlay',
    hint: 'Stylized headline on stage',
  },
  subscribe: {
    label: 'Subscribe CTA',
    hint: 'Fan membership pitch',
  },
};

export type ChannelLookBundle = {
  visualPreset: string;
  headerStyle: string;
  brandAccentPreset: string;
  colorScheme: {
    accent: string;
    highlight: string;
    background: string;
    foreground: string;
  };
};

export type ChannelLayoutPresetId = 'subtle' | 'stage' | 'full';

export type ChannelLayoutPreset = {
  id: ChannelLayoutPresetId;
  name: string;
  description: string;
  items: ChannelPageItem[];
  look: ChannelLookBundle;
};

function item(type: ChannelPageItemType, visible: boolean): ChannelPageItem {
  return { id: type, type, visible };
}

/** Named one-click page layouts (order + visibility + matching look). */
export const CHANNEL_LAYOUT_PRESETS: ChannelLayoutPreset[] = [
  {
    id: 'subtle',
    name: 'Subtle / Solid',
    description:
      'Clean minimal page — hero, actions, about, quiet archive. Solid noir look.',
    items: [
      item('hero', true),
      item('actions', true),
      item('about', true),
      item('archive', true),
      item('subscribe', false),
      item('chat', false),
      item('links', false),
      item('textOverlay', false),
    ],
    look: {
      visualPreset: 'MINIMAL',
      headerStyle: 'SOLID',
      brandAccentPreset: 'noir',
      colorScheme: {
        accent: '#94A3B8',
        highlight: '#CBD5E1',
        background: '#0B0F14',
        foreground: '#E8EEF5',
      },
    },
  },
  {
    id: 'stage',
    name: 'Stage / Live',
    description:
      'Hero-forward live layout; chat opens in the right rail beside the stage.',
    items: [
      item('hero', true),
      item('actions', true),
      item('subscribe', true),
      item('archive', true),
      item('about', true),
      item('chat', false),
      item('textOverlay', false),
      item('links', false),
    ],
    look: {
      visualPreset: 'AURORA',
      headerStyle: 'GRADIENT',
      brandAccentPreset: 'aurora',
      colorScheme: {
        accent: '#22D3EE',
        highlight: '#A78BFA',
        background: '#0B1220',
        foreground: '#F8FAFC',
      },
    },
  },
  {
    id: 'full',
    name: 'Archive-first',
    description:
      'Catalog up front, then stage and the rest of the blocks visible. Chat stays in the right rail.',
    items: [
      item('archive', true),
      item('hero', true),
      item('actions', true),
      item('about', true),
      item('subscribe', true),
      item('links', true),
      item('chat', false),
      item('textOverlay', false),
    ],
    look: {
      visualPreset: 'WAVEFORM_BARS',
      headerStyle: 'GRADIENT',
      brandAccentPreset: 'ember',
      colorScheme: {
        accent: '#F97316',
        highlight: '#FBBF24',
        background: '#120B08',
        foreground: '#FFF7ED',
      },
    },
  },
];

export function getLayoutPreset(
  id: string | null | undefined,
): ChannelLayoutPreset | undefined {
  return CHANNEL_LAYOUT_PRESETS.find((p) => p.id === id);
}

export function defaultChannelPageLayout(): ChannelPageItem[] {
  return [
    item('hero', true),
    item('actions', true),
    item('textOverlay', false),
    item('archive', true),
    item('about', true),
    item('links', false),
    item('subscribe', true),
    // Chat is the Nuclear right rail — keep the layout slot hidden so it
    // never double-renders an in-page panel alongside the rail.
    item('chat', false),
  ];
}

function storageKey(slug: string) {
  return `tahti.channelPageLayout.${slug}`;
}

function presetStorageKey(slug: string) {
  return `tahti.channelPageLayoutPreset.${slug}`;
}

export function loadChannelPageLayout(slug: string): ChannelPageItem[] {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) {
      return defaultChannelPageLayout();
    }
    const parsed = JSON.parse(raw) as ChannelPageItem[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return defaultChannelPageLayout();
    }
    return normalizeLayout(parsed);
  } catch {
    return defaultChannelPageLayout();
  }
}

export function saveChannelPageLayout(
  slug: string,
  items: ChannelPageItem[],
): void {
  localStorage.setItem(
    storageKey(slug),
    JSON.stringify(normalizeLayout(items)),
  );
}

export function loadChannelLayoutPresetId(
  slug: string,
): ChannelLayoutPresetId | null {
  try {
    const raw = localStorage.getItem(presetStorageKey(slug));
    if (raw === 'subtle' || raw === 'stage' || raw === 'full') {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveChannelLayoutPresetId(
  slug: string,
  id: ChannelLayoutPresetId | null,
): void {
  if (!id) {
    localStorage.removeItem(presetStorageKey(slug));
    return;
  }
  localStorage.setItem(presetStorageKey(slug), id);
}

export function normalizeLayout(items: ChannelPageItem[]): ChannelPageItem[] {
  const seenIds = new Set<string>();
  const seenTypes = new Set<ChannelPageItemType>();
  const out: ChannelPageItem[] = [];
  for (const item of items) {
    if (!CHANNEL_PAGE_ITEM_TYPES.includes(item.type)) {
      continue;
    }
    const id = item.id || item.type;
    if (seenIds.has(id) || seenTypes.has(item.type)) {
      continue;
    }
    seenIds.add(id);
    seenTypes.add(item.type);
    out.push({
      id,
      type: item.type,
      visible: Boolean(item.visible),
    });
  }
  for (const def of defaultChannelPageLayout()) {
    if (!seenTypes.has(def.type)) {
      out.push({ ...def, visible: false });
    }
  }
  return out;
}

export function moveItem(
  items: ChannelPageItem[],
  fromId: string,
  toId: string,
): ChannelPageItem[] {
  if (fromId === toId) {
    return items;
  }
  const next = [...items];
  const from = next.findIndex((i) => i.id === fromId);
  const to = next.findIndex((i) => i.id === toId);
  if (from < 0 || to < 0) {
    return items;
  }
  const [row] = next.splice(from, 1);
  if (!row) {
    return items;
  }
  next.splice(to, 0, row);
  return next;
}

export function setItemVisible(
  items: ChannelPageItem[],
  id: string,
  visible: boolean,
): ChannelPageItem[] {
  return items.map((i) => (i.id === id ? { ...i, visible } : i));
}

export function addItemType(
  items: ChannelPageItem[],
  type: ChannelPageItemType,
): ChannelPageItem[] {
  const existing = items.find((i) => i.type === type);
  if (existing) {
    return setItemVisible(items, existing.id, true);
  }
  return [
    ...items,
    {
      id: `${type}-${Date.now().toString(36)}`,
      type,
      visible: true,
    },
  ];
}
