import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  applyAdvancedTheme,
  clearAdvancedTheme,
  listBasicThemes,
  parseAdvancedTheme,
  setBasicTheme,
  type AdvancedTheme,
  type BasicThemeMeta,
} from '@nuclearplayer/themes';

const CUSTOM_THEME_PREFIX = 'custom:';

const THEME_KEY = 'tahti-nuclear-theme-id';
const DARK_KEY = 'tahti-nuclear-dark';
const PERSIST_NAME = 'tahti-web-theme';

const DEFAULT_THEME_ID = 'nuclear:default';

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') || 'theme'
  );
}

function knownBasicThemeIds(): Set<string> {
  return new Set(listBasicThemes().map((t) => t.id));
}

function resolveThemeId(
  id: string | null | undefined,
  customThemes: Record<string, AdvancedTheme>,
): string {
  if (id && knownBasicThemeIds().has(id)) {
    return id;
  }
  if (id && id.startsWith(CUSTOM_THEME_PREFIX) && customThemes[id]) {
    return id;
  }
  return DEFAULT_THEME_ID;
}

function applyToDocument(
  themeId: string,
  dark: boolean,
  customThemes: Record<string, AdvancedTheme>,
) {
  const custom = customThemes[themeId];
  if (custom) {
    // Basic theme underneath supplies structural fallbacks; the advanced
    // theme's CSS vars layer on top as an override.
    setBasicTheme(DEFAULT_THEME_ID);
    applyAdvancedTheme(custom);
  } else {
    clearAdvancedTheme();
    setBasicTheme(themeId);
  }
  if (dark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  // Keep legacy keys in sync for the early index.html bootstrap.
  try {
    localStorage.setItem(THEME_KEY, themeId);
    localStorage.setItem(DARK_KEY, dark ? '1' : '0');
  } catch {
    // ignore quota / private mode
  }
}

type ThemeState = {
  themes: BasicThemeMeta[];
  customThemes: Record<string, AdvancedTheme>;
  themeId: string;
  dark: boolean;
  hydrated: boolean;
  init: () => void;
  setTheme: (id: string) => void;
  setDark: (dark: boolean) => void;
  /** Parses and applies a theme JSON matching @nuclearplayer/themes'
   * AdvancedThemeSchema, persisting it under a generated id. */
  importCustomTheme: (
    json: unknown,
  ) => { ok: true; id: string } | { ok: false; error: string };
  removeCustomTheme: (id: string) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themes: listBasicThemes(),
      customThemes: {},
      themeId: DEFAULT_THEME_ID,
      dark: true,
      hydrated: false,

      init: () => {
        const { themeId, dark, customThemes } = get();
        const id = resolveThemeId(themeId, customThemes);
        applyToDocument(id, dark, customThemes);
        set({ themeId: id, hydrated: true });
      },

      setTheme: (rawId) => {
        const { dark, customThemes } = get();
        const id = resolveThemeId(rawId, customThemes);
        applyToDocument(id, dark, customThemes);
        set({ themeId: id });
      },

      setDark: (dark) => {
        const { themeId, customThemes } = get();
        applyToDocument(themeId, dark, customThemes);
        set({ dark });
      },

      importCustomTheme: (json) => {
        let theme: AdvancedTheme;
        try {
          theme = parseAdvancedTheme(json);
        } catch (err) {
          return {
            ok: false,
            error: err instanceof Error ? err.message : 'Invalid theme JSON',
          };
        }
        const id = `${CUSTOM_THEME_PREFIX}${slugify(theme.name)}-${Date.now().toString(36)}`;
        const customThemes = { ...get().customThemes, [id]: theme };
        applyToDocument(id, get().dark, customThemes);
        set({ customThemes, themeId: id });
        return { ok: true, id };
      },

      removeCustomTheme: (id) => {
        const customThemes = Object.fromEntries(
          Object.entries(get().customThemes).filter(([key]) => key !== id),
        );
        const stillActive = get().themeId === id;
        set({ customThemes });
        if (stillActive) {
          const fallback = resolveThemeId(undefined, customThemes);
          applyToDocument(fallback, get().dark, customThemes);
          set({ themeId: fallback });
        }
      },
    }),
    {
      name: PERSIST_NAME,
      partialize: (s) => ({
        themeId: s.themeId,
        dark: s.dark,
        customThemes: s.customThemes,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        const id = resolveThemeId(state.themeId, state.customThemes);
        applyToDocument(id, state.dark, state.customThemes);
        state.themeId = id;
        state.hydrated = true;
      },
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<ThemeState>;
        // Migrate from older localStorage keys if zustand bag is empty.
        let themeId = p.themeId;
        let dark = p.dark;
        try {
          if (themeId == null) {
            themeId = localStorage.getItem(THEME_KEY) ?? undefined;
          }
          if (dark == null) {
            const raw = localStorage.getItem(DARK_KEY);
            dark = raw == null ? true : raw === '1';
          }
        } catch {
          // ignore
        }
        const customThemes = p.customThemes ?? {};
        return {
          ...current,
          customThemes,
          themeId: resolveThemeId(themeId, customThemes),
          dark: dark ?? true,
        };
      },
    },
  ),
);
