import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import {
  listBasicThemes,
  setBasicTheme,
  type BasicThemeMeta,
} from '@nuclearplayer/themes';

const THEME_KEY = 'tahti-nuclear-theme-id';
const DARK_KEY = 'tahti-nuclear-dark';
const PERSIST_NAME = 'tahti-web-theme';

const DEFAULT_THEME_ID = 'nuclear:default';

function knownThemeIds(): Set<string> {
  return new Set(listBasicThemes().map((t) => t.id));
}

function resolveThemeId(id: string | null | undefined): string {
  const known = knownThemeIds();
  if (id && known.has(id)) {
    return id;
  }
  return DEFAULT_THEME_ID;
}

function applyToDocument(themeId: string, dark: boolean) {
  setBasicTheme(themeId);
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
  themeId: string;
  dark: boolean;
  hydrated: boolean;
  init: () => void;
  setTheme: (id: string) => void;
  setDark: (dark: boolean) => void;
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      themes: listBasicThemes(),
      themeId: DEFAULT_THEME_ID,
      dark: true,
      hydrated: false,

      init: () => {
        const { themeId, dark } = get();
        const id = resolveThemeId(themeId);
        applyToDocument(id, dark);
        set({ themeId: id, hydrated: true });
      },

      setTheme: (rawId) => {
        const id = resolveThemeId(rawId);
        applyToDocument(id, get().dark);
        set({ themeId: id });
      },

      setDark: (dark) => {
        applyToDocument(get().themeId, dark);
        set({ dark });
      },
    }),
    {
      name: PERSIST_NAME,
      partialize: (s) => ({
        themeId: s.themeId,
        dark: s.dark,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }
        const id = resolveThemeId(state.themeId);
        applyToDocument(id, state.dark);
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
        return {
          ...current,
          themeId: resolveThemeId(themeId),
          dark: dark ?? true,
        };
      },
    },
  ),
);
