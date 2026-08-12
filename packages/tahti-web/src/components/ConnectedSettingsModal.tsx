import { useEffect } from 'react';

import { Button, SettingsPanel } from '@nuclearplayer/ui';

import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import {
  DEFAULT_PUBLIC_SETTINGS_SECTION,
  isPublicSettingsSection,
  settingsNavForAuth,
  type SettingsSectionId,
} from '../views/settings/settingsNav';
import { SettingsSectionBody } from '../views/settings/SettingsPanels';

/** Nuclear SettingsPanel modal wrapping Tahti settings sections. */
export function ConnectedSettingsModal() {
  const isOpen = useSettingsModalStore((s) => s.isOpen);
  const close = useSettingsModalStore((s) => s.close);
  const activeTab = useSettingsModalStore((s) => s.activeTab);
  const setActiveTab = useSettingsModalStore((s) => s.setActiveTab);
  const user = useAuthStore((s) => s.user);
  const openAuth = useAuthModalStore((s) => s.open);
  const signedIn = Boolean(user);

  const nav = settingsNavForAuth(signedIn);

  useEffect(() => {
    if (!isOpen || signedIn) {
      return;
    }
    if (!isPublicSettingsSection(activeTab)) {
      setActiveTab(DEFAULT_PUBLIC_SETTINGS_SECTION);
    }
  }, [activeTab, isOpen, setActiveTab, signedIn]);

  const resolvedTab =
    !signedIn && !isPublicSettingsSection(activeTab)
      ? DEFAULT_PUBLIC_SETTINGS_SECTION
      : activeTab;

  const tabs = nav.map((item) => {
    const Icon = item.Icon;
    return {
      id: item.id,
      label: item.label,
      icon: <Icon size={16} />,
      content: () => <SettingsSectionBody section={item.id} />,
    };
  });

  return (
    <SettingsPanel
      isOpen={isOpen}
      onClose={close}
      tabs={tabs}
      activeTab={resolvedTab}
      onTabChange={(tabId) => setActiveTab(tabId as SettingsSectionId)}
      navFooter={
        !signedIn ? (
          <div className="flex flex-col gap-2">
            <p className="text-foreground-secondary text-xs">
              Sign in for account, artist, and studio settings.
            </p>
            <Button size="sm" onClick={() => openAuth('login')}>
              Log in
            </Button>
          </div>
        ) : undefined
      }
    />
  );
}
