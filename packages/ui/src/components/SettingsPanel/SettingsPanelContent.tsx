import { ArrowLeftIcon } from 'lucide-react';
import { FC, ReactNode } from 'react';

import { cn } from '../../utils';
import { Button } from '../Button';

type SettingsPanelContentProps = {
  children: ReactNode;
  /** Below `sm`, the nav and content panes are mutually exclusive (list vs.
   * detail) rather than side by side — the caller toggles which is shown. */
  className?: string;
  /** Active section's label — shown in the mobile-only back-nav header. */
  title?: string;
  /** Present only on mobile (returns to the section list); omit on desktop. */
  onBack?: () => void;
};

export const SettingsPanelContent: FC<SettingsPanelContentProps> = ({
  children,
  className,
  title,
  onBack,
}) => (
  // `sm:flex!` forced important: see the matching comment in
  // SettingsPanelNav.tsx — a plain (unprefixed) rule for the same property
  // wins the cascade over the `sm:` variant in this codebase's compiled
  // Tailwind output despite equal specificity. Without `!`, this pane
  // silently stays `hidden` on desktop after the caller's mobile
  // list/detail toggle set it to `hidden` (i.e. any time a tab was ever
  // selected).
  <div
    className={cn(
      'min-h-0 flex-1 flex-col overflow-hidden sm:flex!',
      className,
    )}
  >
    {onBack && (
      <div className="border-border flex shrink-0 items-center gap-1 border-b-(length:--border-width) p-2 sm:hidden">
        <Button
          size="icon-sm"
          variant="text"
          onClick={onBack}
          aria-label="Back to settings sections"
        >
          <ArrowLeftIcon size={16} />
        </Button>
        {title && <span className="text-sm font-semibold">{title}</span>}
      </div>
    )}
    <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
  </div>
);
