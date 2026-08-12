import type { LucideIcon } from 'lucide-react';
import {
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
    id: 'whats-new',
    label: "What's new",
    description: 'Product announcements',
    Icon: Sparkles,
  },
];

export function isSettingsSectionId(
  value: string | undefined,
): value is SettingsSectionId {
  return Boolean(value && SETTINGS_NAV.some((n) => n.id === value));
}
