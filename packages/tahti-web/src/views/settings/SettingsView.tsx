import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useSettingsModalStore } from '../../stores/settingsModalStore';
import { isSettingsSectionId, type SettingsSectionId } from './settingsNav';

/** Deep link `/settings` → Nuclear SettingsPanel modal. */
export function SettingsView({ sectionId }: { sectionId?: string }) {
  const navigate = useNavigate();
  const open = useSettingsModalStore((s) => s.open);
  const section: SettingsSectionId = isSettingsSectionId(sectionId)
    ? sectionId
    : 'account';

  useEffect(() => {
    open(section);
    void navigate({ to: '/', replace: true });
  }, [navigate, open, section]);

  return null;
}
