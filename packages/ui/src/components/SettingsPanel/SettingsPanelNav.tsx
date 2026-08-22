import { FC, ReactNode } from 'react';

import { cn } from '../../utils';
import { SettingsTab } from './SettingsPanel';
import { SettingsPanelNavItem } from './SettingsPanelNavItem';

type SettingsPanelNavProps = {
  tabs: SettingsTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  footer?: ReactNode;
  /** Below `sm`, the nav and content panes are mutually exclusive (list vs.
   * detail) rather than side by side — the caller toggles which is shown. */
  className?: string;
};

export const SettingsPanelNav: FC<SettingsPanelNavProps> = ({
  tabs,
  activeTab,
  onTabChange,
  footer,
  className,
}) => (
  // `sm:w-56!`/`sm:flex!` are forced important: this codebase's compiled
  // Tailwind output emits a second, later plain (unprefixed) rule for the
  // same property — from a separately-scanned @source root — that wins the
  // cascade over the `sm:` variant at equal specificity despite the `sm:`
  // rule appearing earlier in the file — confirmed by inspecting the built
  // CSS, not a specificity mistake here. Without `!`, `sm:w-56` silently
  // stays full-width above the sm breakpoint and squeezes
  // SettingsPanelContent to ~0, and `sm:flex` silently stays `hidden`
  // whenever the caller's mobile list/detail toggle set this pane to
  // `hidden` — i.e. every time a tab was ever selected, permanently.
  <nav
    className={cn(
      'border-border w-full shrink-0 flex-col overflow-y-auto border-b-(length:--border-width) p-2 sm:flex! sm:w-56! sm:border-r-(length:--border-width) sm:border-b-0 sm:p-4',
      className,
    )}
  >
    <div className="flex flex-col gap-1">
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
