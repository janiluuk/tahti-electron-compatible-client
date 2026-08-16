import { useTranslation } from '@nuclearplayer/i18n';
import { SectionShell, Select } from '@nuclearplayer/ui';

import { useMarketplaceThemeOptions } from '../../hooks/useMarketplaceThemeOptions';
import { loadAndApplyMarketplaceTheme } from '../../services/advancedThemeService';
import { useThemeStore } from '../../stores/themeStore';

export const MarketplaceThemeSelect = () => {
  const { t } = useTranslation('themes');
  const marketplaceThemes = useThemeStore((state) => state.marketplaceThemes);
  const activeTheme = useThemeStore((state) => state.activeTheme);
  const options = useMarketplaceThemeOptions();
  const value = activeTheme.type === 'marketplace' ? activeTheme.id : '';

  return (
    <SectionShell data-testid="marketplace-themes" title={t('marketplace')}>
      <div className="max-w-80 p-1">
        {marketplaceThemes.length === 0 ? (
          <p className="text-foreground-secondary text-sm leading-relaxed">
            {t('marketplaceEmpty')}
          </p>
        ) : (
          <Select
            placeholder={t('selectPlaceholder')}
            options={options}
            value={value}
            onValueChange={loadAndApplyMarketplaceTheme}
          />
        )}
      </div>
    </SectionShell>
  );
};
