import { Link, useNavigate } from '@tanstack/react-router';
import { useMemo } from 'react';

import { Button, SectionShell, ViewShell } from '@nuclearplayer/ui';

import { useAuthStore } from '../../stores/authStore';
import {
  isSettingsSectionId,
  SETTINGS_NAV,
  type SettingsSectionId,
} from './settingsNav';
import { SettingsSectionBody } from './SettingsPanels';

export function SettingsView({ sectionId }: { sectionId?: string }) {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const section: SettingsSectionId = isSettingsSectionId(sectionId)
    ? sectionId
    : 'account';

  const active = useMemo(
    () => SETTINGS_NAV.find((n) => n.id === section) ?? SETTINGS_NAV[0],
    [section],
  );

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col">
      <ViewShell
        title="Settings"
        data-testid="settings-view"
        classes={{
          root: 'px-0 pt-0',
          scrollableArea: 'overflow-visible',
        }}
      >
        <div className="flex min-h-0 w-full flex-col gap-6 lg:flex-row lg:items-start">
          <nav
            aria-label="Settings sections"
            className="border-border flex w-full shrink-0 flex-col gap-1 lg:sticky lg:top-0 lg:w-56 lg:border-r lg:pr-4"
          >
            <p className="text-foreground-secondary mb-2 hidden px-2 text-xs lg:block">
              {user ? `@${user.username}` : 'Signed out'}
            </p>
            {SETTINGS_NAV.map((item) => {
              const selected = item.id === section;
              const Icon = item.Icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    void navigate({
                      to: '/settings/$section',
                      params: { section: item.id },
                    });
                  }}
                  className={`flex items-start gap-3 rounded-md px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? 'bg-primary text-foreground'
                      : 'text-foreground-secondary hover:bg-background-secondary hover:text-foreground'
                  }`}
                >
                  <Icon size={16} className="mt-0.5 shrink-0" />
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">
                      {item.label}
                    </span>
                    <span
                      className={`mt-0.5 block text-xs ${selected ? 'opacity-80' : 'opacity-60'}`}
                    >
                      {item.description}
                    </span>
                  </span>
                </button>
              );
            })}
          </nav>

          <div className="min-w-0 flex-1 px-1 lg:max-w-120 lg:px-2">
            <div className="mb-4 lg:hidden">
              <h2 className="text-2xl font-bold">{active.label}</h2>
              <p className="text-foreground-secondary text-sm">
                {active.description}
              </p>
            </div>

            <SettingsSectionBody section={section} />

            <SectionShell title="Production">
              <div className="flex flex-col gap-3">
                <p className="text-foreground-secondary text-sm">
                  Deep account security, press-kit gallery uploads, and invite
                  flows remain on the production dashboard when this POC is
                  thin.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://tahti.live/dashboard/settings"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button size="sm" variant="secondary">
                      Open tahti.live settings
                    </Button>
                  </a>
                  <Link to="/studio/channel">
                    <Button size="sm" variant="text">
                      Studio channel shortcut
                    </Button>
                  </Link>
                </div>
              </div>
            </SectionShell>
          </div>
        </div>
      </ViewShell>
    </div>
  );
}
