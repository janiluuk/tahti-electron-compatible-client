import {
  Filter as FilterIcon,
  Gauge,
  ShieldAlert,
  SlidersHorizontal,
  type LucideIcon,
} from 'lucide-react';

import type { ProEditorPluginId } from '../api/studio-types';

export type PluginMeta = {
  label: string;
  description: string;
  icon: LucideIcon;
  /** Tile background — brand-mark style, same idiom as SourceServiceIcon. */
  bg: string;
};

export const PLUGIN_META: Record<ProEditorPluginId, PluginMeta> = {
  eq: {
    label: 'EQ',
    description: '3-band parametric equalizer',
    icon: SlidersHorizontal,
    bg: '#0ea5e9',
  },
  comp: {
    label: 'Compressor',
    description: 'Dynamics compressor',
    icon: Gauge,
    bg: '#7c3aed',
  },
  limiter: {
    label: 'Limiter',
    description: 'Fast ceiling limiter',
    icon: ShieldAlert,
    bg: '#dc2626',
  },
  filter: {
    label: 'Filter',
    description: 'High/low-pass or shelf filter',
    icon: FilterIcon,
    bg: '#059669',
  },
};

export const ALL_PLUGIN_IDS: ProEditorPluginId[] = [
  'eq',
  'comp',
  'limiter',
  'filter',
];
