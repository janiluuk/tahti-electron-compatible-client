import { BookOpenIcon, GithubIcon } from 'lucide-react';
import { useEffect } from 'react';

import { Button, SettingsPanel } from '@nuclearplayer/ui';

import { MAIN_CONTENT_PADDING } from '../layout/contentPadding';
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

/** Canonical Tahti Nuclear origin (TAHTI.md / README remotes). */
const GITHUB_REPO_URL =
  'https://github.com/janiluuk/tahti-electron-compatible-client';
/** Public Scalar/OpenAPI docs (packages/tahti-web/README.md). */
const API_DOCS_URL = 'https://api.tahti.live/api';

const footerLinkClass =
  'text-foreground-secondary hover:text-foreground hover:bg-background-secondary flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors';

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
      // SettingsPanel dialog uses p-0; pad here so section headers match AppShell.
      content: () => (
        <div className={MAIN_CONTENT_PADDING}>
          <SettingsSectionBody section={item.id} />
        </div>
      ),
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
        <div className="flex flex-col gap-2">
          {!signedIn ? (
            <div className="flex flex-col gap-2">
              <p className="text-foreground-secondary text-xs">
                Sign in for account, artist, and studio settings.
              </p>
              <Button size="sm" onClick={() => openAuth('login')}>
                Log in
              </Button>
            </div>
          ) : null}
          <div className="border-border flex flex-col gap-0.5 border-t pt-2">
            <a
              href={GITHUB_REPO_URL}
              className={footerLinkClass}
              target="_blank"
              rel="noreferrer"
            >
              <GithubIcon size={14} aria-hidden />
              GitHub
            </a>
            <a
              href={API_DOCS_URL}
              className={footerLinkClass}
              target="_blank"
              rel="noreferrer"
            >
              <BookOpenIcon size={14} aria-hidden />
              API docs
            </a>
          </div>
        </div>
      }
    />
  );
}
