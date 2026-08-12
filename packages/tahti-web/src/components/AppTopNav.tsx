import { Link, useRouterState } from '@tanstack/react-router';
import {
  ExternalLinkIcon,
  LayoutDashboardIcon,
  LogInIcon,
  LogOutIcon,
  MenuIcon,
  MessageSquareIcon,
  RadioIcon,
  SettingsIcon,
  SparklesIcon,
  UploadIcon,
  UserIcon,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { cn } from '../lib/cn';
import { useAuthModalStore } from '../stores/authModalStore';
import { useAuthStore } from '../stores/authStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { TahtiLogoLink } from './TahtiLogo';

type AppTopNavProps = {
  /** Show hamburger for mobile left drawer. */
  showMenuButton?: boolean;
  onOpenMenu?: () => void;
};

const iconBtnClass =
  'text-foreground-secondary hover:text-foreground hover:bg-background-secondary inline-flex size-8 shrink-0 items-center justify-center rounded-lg border border-transparent transition-colors hover:border-border';

/**
 * Production-parity top bar (StudioTopNav / ChannelHeader chrome):
 * logo left, icon actions right, labels only inside the user dropdown.
 */
export function AppTopNav({ showMenuButton, onOpenMenu }: AppTopNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const openAuth = useAuthModalStore((s) => s.open);
  const openSettings = useSettingsModalStore((s) => s.open);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const hasChannel = Boolean(user?.channel?.slug);
  const isLive = user?.channel?.state === 'LIVE';
  const displayName = user?.displayName?.trim() || user?.username || '';
  const initial = displayName ? displayName.charAt(0).toUpperCase() : '?';

  useEffect(() => {
    if (!open) {
      return;
    }
    function onPointerDown(e: PointerEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="border-border bg-background sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3 md:px-6">
      <div className="flex min-w-0 items-center gap-2">
        {showMenuButton ? (
          <button
            type="button"
            className={iconBtnClass}
            aria-label="Open menu"
            onClick={onOpenMenu}
          >
            <MenuIcon size={18} />
          </button>
        ) : null}
        <TahtiLogoLink />
      </div>

      <div className="flex min-w-0 items-center gap-1">
        {user && hasChannel ? (
          <>
            <Link
              to="/studio/go-live"
              className={iconBtnClass}
              aria-label="Go live"
              title="Go live"
            >
              <RadioIcon size={16} />
            </Link>
            <Link
              to="/studio/upload"
              className={iconBtnClass}
              aria-label="Upload"
              title="Upload"
            >
              <UploadIcon size={16} />
            </Link>
          </>
        ) : null}

        {user ? (
          <Link
            to="/library/messages"
            className={iconBtnClass}
            aria-label="Messages"
            title="Messages"
          >
            <MessageSquareIcon size={16} />
          </Link>
        ) : null}

        <Link
          to="/whats-new"
          className={iconBtnClass}
          aria-label="What's new"
          title="What's new"
        >
          <SparklesIcon size={16} />
        </Link>

        {user ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              className={cn(
                'hover:bg-background-secondary inline-flex items-center gap-1.5 rounded-lg border px-1.5 py-1 transition-colors',
                open
                  ? 'border-border bg-background-secondary'
                  : 'border-border/60',
              )}
              aria-label={`Signed in as ${displayName}`}
              aria-haspopup="menu"
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {isLive ? (
                <span
                  className="bg-primary size-1.5 shrink-0 rounded-full"
                  aria-hidden
                />
              ) : null}
              <span
                className="bg-primary/20 text-primary font-display flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold"
                aria-hidden
              >
                {initial}
              </span>
              <span
                className="text-foreground-secondary text-[10px]"
                aria-hidden
              >
                {open ? '▴' : '▾'}
              </span>
            </button>

            {open ? (
              <div
                className="border-border bg-background absolute top-[calc(100%+6px)] right-0 z-40 flex min-w-[11.5rem] flex-col gap-0.5 rounded-lg border p-1.5 shadow-lg"
                role="menu"
              >
                <div className="text-foreground-secondary truncate px-2.5 py-1.5 text-[11px]">
                  {displayName}
                  {user.username ? (
                    <span className="block truncate opacity-80">
                      @{user.username}
                    </span>
                  ) : null}
                </div>
                <div className="bg-border mx-1 my-0.5 h-px" role="separator" />

                {hasChannel ? (
                  <>
                    <Link
                      to="/studio"
                      className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <LayoutDashboardIcon size={14} />
                      Artist panel
                    </Link>
                    <Link
                      to="/u/$username"
                      params={{ username: user.username }}
                      className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      <UserIcon size={14} />
                      My channel
                    </Link>
                  </>
                ) : null}

                <button
                  type="button"
                  className="hover:bg-background-secondary flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    openSettings('account');
                  }}
                >
                  <SettingsIcon size={14} />
                  Settings
                </button>
                <Link
                  to="/whats-new"
                  className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                >
                  <SparklesIcon size={14} />
                  What&apos;s new
                </Link>
                <a
                  href="https://tahti.live"
                  className="hover:bg-background-secondary flex items-center gap-2 rounded-md px-2.5 py-2 text-xs"
                  role="menuitem"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setOpen(false)}
                >
                  <ExternalLinkIcon size={14} />
                  tahti.live
                </a>

                <div className="bg-border mx-1 my-0.5 h-px" role="separator" />
                <button
                  type="button"
                  className="hover:bg-background-secondary flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-xs text-red-400 hover:text-red-300"
                  role="menuitem"
                  onClick={() => {
                    setOpen(false);
                    void logout();
                  }}
                >
                  <LogOutIcon size={14} />
                  Log out
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            className={iconBtnClass}
            aria-label="Log in"
            title="Log in"
            onClick={() => openAuth('login')}
          >
            <LogInIcon size={16} />
          </button>
        )}
      </div>
    </header>
  );
}
