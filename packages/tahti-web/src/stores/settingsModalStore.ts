import { create } from 'zustand';

import type { SettingsSectionId } from '../views/settings/settingsNav';

type SettingsModalState = {
  isOpen: boolean;
  activeTab: SettingsSectionId;
  open: (tab?: SettingsSectionId) => void;
  close: () => void;
  setActiveTab: (tab: SettingsSectionId) => void;
};

export const useSettingsModalStore = create<SettingsModalState>((set) => ({
  isOpen: false,
  activeTab: 'account',
  open: (tab) =>
    set((state) => ({
      isOpen: true,
      ...(tab ? { activeTab: tab } : { activeTab: state.activeTab }),
    })),
  close: () => set({ isOpen: false }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
