import { FC, ReactNode } from 'react';

import { DialogRoot } from '../Dialog/DialogRoot';
import { SettingsPanelContent } from './SettingsPanelContent';
import { SettingsPanelNav } from './SettingsPanelNav';

export type SettingsTab = {
  id: string;
  label: string;
  icon: ReactNode;
  content: () => ReactNode;
};

type SettingsPanelProps = {
  isOpen: boolean;
  onClose: () => void;
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  navFooter?: ReactNode;
};

export const SettingsPanel: FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  tabs,
  activeTab,
  onTabChange,
  navFooter,
}) => {
  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <DialogRoot
      isOpen={isOpen}
      onClose={onClose}
      className="flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden p-0 sm:h-[80vh] sm:max-h-[900px] sm:w-[80vw] sm:max-w-6xl sm:flex-row"
    >
      <SettingsPanelNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={onTabChange}
        footer={navFooter}
      />
      <SettingsPanelContent>
        {activeTabContent && activeTabContent()}
      </SettingsPanelContent>
    </DialogRoot>
  );
};
