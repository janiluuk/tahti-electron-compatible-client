import { FC, ReactNode } from 'react';

import { SettingsTab } from './SettingsPanel';
import { SettingsPanelNavItem } from './SettingsPanelNavItem';

type SettingsPanelNavProps = {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  footer?: ReactNode;
};

export const SettingsPanelNav: FC<SettingsPanelNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
  footer,
}) => (
  // `sm:w-56!` is forced important: this codebase's compiled Tailwind
  // output emits a second, later `.w-full{width:100%}` rule (from a
  // separately-scanned @source root) that otherwise wins the cascade over
  // `.sm\:w-56` at equal specificity despite appearing earlier in the
  // file — confirmed by inspecting the built CSS, not a specificity
  // mistake here. Without `!`, the settings nav silently stays full-width
  // above the sm breakpoint and squeezes SettingsPanelContent to ~0.
  <nav className="border-border flex w-full shrink-0 flex-col border-b-(length:--border-width) p-2 sm:w-56! sm:border-r-(length:--border-width) sm:border-b-0 sm:p-4">
    <div className="flex flex-row gap-1 overflow-x-auto pr-10 sm:flex-col sm:overflow-visible sm:pr-0">
      {tabs.map((tab) => (
        <SettingsPanelNavItem
          key={tab.id}
          id={tab.id}
          label={tab.label}
          icon={tab.icon}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        />
      ))}
    </div>
    {footer && <div className="mt-2 sm:mt-auto">{footer}</div>}
  </nav>
);
