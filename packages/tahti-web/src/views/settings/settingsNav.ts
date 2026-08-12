import type { LucideIcon } from 'lucide-react';
import {
  Bell,
  Link2,
  Paintbrush,
  Palette,
  Radio,
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
  | 'notifications'
  | 'themes'
  | 'connections';

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
    description: 'Session, membership, security',
    Icon: User,
  },
  {
    id: 'artist',
    label: 'Artist',
    description: 'Profile, members, press kit',
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
    id: 'notifications',
    label: 'Notifications',
    description: 'Email & alerts',
    Icon: Bell,
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
    description: 'Social + import sources',
    Icon: Link2,
  },
];

export function isSettingsSectionId(
  value: string | undefined,
): value is SettingsSectionId {
  return Boolean(value && SETTINGS_NAV.some((n) => n.id === value));
}
