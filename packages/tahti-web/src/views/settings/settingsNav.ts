import type { LucideIcon } from 'lucide-react';
import {
  ArrowLeftRight,
  Link2,
  Paintbrush,
  Palette,
  Radio,
  Sparkles,
  User,
  UserCircle2,
  Wallet,
} from 'lucide-react';

export type SettingsSectionId =
  | 'account'
  | 'artist'
  | 'channel'
  | 'broadcast'
  | 'money'
  | 'themes'
  | 'connections'
  | 'integrations'
  | 'whats-new';

export type SettingsNavItem = {
  id: SettingsSectionId;
  label: string;
  description: string;
  Icon: LucideIcon;
};

export const SETTINGS_NAV: SettingsNavItem[] = [
  {
    id: 'account',
    label: 'Account',
    description: 'Session, security, membership, notifications',
    Icon: User,
  },
  {
    id: 'artist',
    label: 'Artist',
    description: 'Profile, social links, members, press kit',
    Icon: UserCircle2,
  },
  {
    id: 'channel',
    label: 'Channel & design',
    description: 'Look, discovery, username',
    Icon: Paintbrush,
  },
  {
    id: 'broadcast',
    label: 'Broadcast',
    description: 'Radio, green room, mods, multistream',
    Icon: Radio,
  },
  {
    id: 'money',
    label: 'Money',
    description: 'Fan subs & grants',
    Icon: Wallet,
  },
  {
    id: 'themes',
    label: 'Themes',
    description: 'App appearance',
    Icon: Palette,
  },
  {
    id: 'connections',
    label: 'Connections',
    description: 'Import sources',
    Icon: Link2,
  },
  {
    id: 'integrations',
    label: 'Import & export',
    description: 'Bring music in, send releases out',
    Icon: ArrowLeftRight,
  },
  {
    id: 'whats-new',
    label: "What's new",
    description: 'Product announcements',
    Icon: Sparkles,
  },
];

/** Sections visible without signing in (prefs + announcements). Import &
 * export links into Studio/Sources, which all require an account, so it
 * stays sign-in-only rather than showing dead-end links while signed out. */
export const PUBLIC_SETTINGS_SECTION_IDS: readonly SettingsSectionId[] = [
  'themes',
  'whats-new',
];

export const DEFAULT_PUBLIC_SETTINGS_SECTION: SettingsSectionId = 'themes';

export function isPublicSettingsSection(id: SettingsSectionId): boolean {
  return PUBLIC_SETTINGS_SECTION_IDS.includes(id);
}

export function settingsNavForAuth(signedIn: boolean): SettingsNavItem[] {
  if (signedIn) {
    return SETTINGS_NAV;
  }
  return SETTINGS_NAV.filter((item) => isPublicSettingsSection(item.id));
}

export function isSettingsSectionId(
  value: string | undefined,
): value is SettingsSectionId {
  return Boolean(value && SETTINGS_NAV.some((n) => n.id === value));
}
