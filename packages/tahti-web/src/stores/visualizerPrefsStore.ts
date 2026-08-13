import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { VISUAL_PRESETS, type VisualPreset } from '../api/channel-design';

type VisualizerPrefsState = {
  /** Presets the user has enabled — client-side only (no server field yet).
   * Defaults to all built-in presets so nothing is hidden out of the box;
   * presets added later ship enabled unless the user turns them off. */
  enabled: Record<VisualPreset, boolean>;
  isEnabled: (preset: VisualPreset) => boolean;
  togglePreset: (preset: VisualPreset, enabled: boolean) => void;
  enabledPresets: () => VisualPreset[];
};

function allEnabled(): Record<VisualPreset, boolean> {
  return Object.fromEntries(VISUAL_PRESETS.map((p) => [p, true])) as Record<
    VisualPreset,
    boolean
  >;
}

export const useVisualizerPrefsStore = create<VisualizerPrefsState>()(
  persist(
    (set, get) => ({
      enabled: allEnabled(),

      // Presets ship new as enabled=true unless explicitly turned off, so a
      // freshly-added preset isn't hidden by an old persisted prefs blob.
      isEnabled: (preset) => get().enabled[preset] ?? true,

      togglePreset: (preset, enabled) => {
        set({ enabled: { ...get().enabled, [preset]: enabled } });
      },

      enabledPresets: () =>
        VISUAL_PRESETS.filter((p) => get().enabled[p] ?? true),
    }),
    { name: 'tahti-web-visualizer-prefs' },
  ),
);
