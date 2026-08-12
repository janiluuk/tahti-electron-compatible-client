import { create } from 'zustand';

import {
  listBasicThemes,
  setBasicTheme,
  type BasicThemeMeta,
} from '@nuclearplayer/themes';

const THEME_KEY = 'tahti-nuclear-theme-id';
const DARK_KEY = 'tahti-nuclear-dark';

type ThemeState = {
  themes: BasicThemeMeta[];
  themeId: string;
  dark: boolean;
  init: () => void;
  setTheme: (id: string) => void;
  setDark: (dark: boolean) => void;
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  themes: listBasicThemes(),
  themeId: 'nuclear:default',
  dark: true,

  init: () => {
    const savedTheme = localStorage.getItem(THEME_KEY) ?? 'nuclear:default';
    const savedDark = localStorage.getItem(DARK_KEY);
    const dark = savedDark == null ? true : savedDark === '1';
    get().setTheme(savedTheme);
    get().setDark(dark);
  },

  setTheme: (id) => {
    setBasicTheme(id);
    localStorage.setItem(THEME_KEY, id);
    set({ themeId: id });
  },

  setDark: (dark) => {
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    localStorage.setItem(DARK_KEY, dark ? '1' : '0');
    set({ dark });
  },
}));
