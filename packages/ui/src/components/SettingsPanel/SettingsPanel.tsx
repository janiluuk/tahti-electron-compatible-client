import { FC, ReactNode, useEffect, useState } from 'react';

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
  const activeTabMeta = tabs.find((tab) => tab.id === activeTab);
  // Below `sm`, nav and content share one screen's worth of space and can't
  // sit side by side — show the section list first, then swap to the
  // section's content on selection (native "settings app" pattern). Desktop
  // always shows both; this state only ever matters below the sm breakpoint.
  const [mobileShowList, setMobileShowList] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setMobileShowList(true);
    }
  }, [isOpen]);

  return (
    <DialogRoot
      isOpen={isOpen}
      onClose={onClose}
      className="flex h-[calc(100vh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col overflow-hidden p-0 sm:h-[80vh] sm:max-h-[900px] sm:w-[80vw] sm:max-w-6xl sm:flex-row"
    >
      <SettingsPanelNav
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(tabId) => {
          onTabChange(tabId);
          setMobileShowList(false);
        }}
        footer={navFooter}
        className={mobileShowList ? 'flex' : 'hidden'}
      />
      <SettingsPanelContent
        className={mobileShowList ? 'hidden' : 'flex'}
        title={activeTabMeta?.label}
        onBack={() => setMobileShowList(true)}
      >
        {activeTabMeta?.content()}
      </SettingsPanelContent>
    </DialogRoot>
  );
};
