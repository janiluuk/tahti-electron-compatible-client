import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import {
  GaugeIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  MapIcon,
  RadioIcon,
  RssIcon,
  SettingsIcon,
  ShieldIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  PlayerShell,
  PlayerWorkspace,
  SidebarNavigation,
  SidebarNavigationItem,
  Toaster,
} from '@nuclearplayer/ui';

import { useIsMobile } from '../hooks/useIsMobile';
import { MAIN_CONTENT_PADDING } from '../layout/contentPadding';
import { cn } from '../lib/cn';
import { useAuthStore } from '../stores/authStore';
import { useLayoutStore } from '../stores/layoutStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { hasSeenOnboarding } from '../views/OnboardingView';
import { AppTopNav } from './AppTopNav';
import { AudioEngine } from './AudioEngine';
import { AuthDialog } from './AuthDialog';
import { ConnectedPlayerBar } from './ConnectedPlayerBar';
import { ConnectedSettingsModal } from './ConnectedSettingsModal';
import { FullScreenPlayer } from './FullScreenPlayer';
import { MobileBottomNav, MobileDrawer } from './MobileChrome';
import { RightRailPanel } from './RightRailPanel';

function SidebarNavItems({ compact }: { compact: boolean }) {
  const isBoard = useAuthStore((s) => Boolean(s.user?.isBoard));
  return (
    <SidebarNavigation isCompact={compact}>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-1">
        <SidebarNavigationItem
          to="/"
          icon={<GaugeIcon size={16} />}
          label="Listen"
        />
        <SidebarNavigationItem
          to="/radio"
          icon={<RadioIcon size={16} />}
          label="Radio"
        />
        <SidebarNavigationItem
          to="/feed"
          icon={<RssIcon size={16} />}
          label="Feed"
        />
        <SidebarNavigationItem
          to="/library"
          icon={<LibraryIcon size={16} />}
          label="My Library"
        />
        <SidebarNavigationItem
          to="/studio"
          icon={<LayoutDashboardIcon size={16} />}
          label="Studio"
        />
        {isBoard && (
          <SidebarNavigationItem
            to="/admin"
            icon={<ShieldIcon size={16} />}
            label="Admin"
          />
        )}
        {isBoard && (
          <SidebarNavigationItem
            to="/more"
            icon={<MapIcon size={16} />}
            label="More"
          />
        )}
      </div>
    </SidebarNavigation>
  );
}

export function AppShell() {
  const isMobile = useIsMobile();
  const {
    leftCollapsed,
    rightCollapsed,
    leftWidth,
    rightWidth,
    toggleLeft,
    toggleRight,
    setLeftWidth,
    setRightWidth,
    setRightCollapsed,
  } = useLayoutStore();
  const refresh = useAuthStore((s) => s.refresh);
  const isBoard = useAuthStore((s) => Boolean(s.user?.isBoard));
  const userId = useAuthStore((s) => s.user?.id);
  const openSettings = useSettingsModalStore((s) => s.open);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // First sign-in of the session: send a new user through onboarding once.
  // Skips/finishes mark the flag, so this never fires again for them.
  useEffect(() => {
    if (!userId || pathname === '/onboarding') {
      return;
    }
    if (!hasSeenOnboarding(userId)) {
      void navigate({ to: '/onboarding' });
    }
  }, [userId, pathname, navigate]);

  useEffect(() => {
    if (!isMobile) {
      return;
    }
    setRightCollapsed(true);
  }, [isMobile, setRightCollapsed]);

  return (
    <PlayerShell className={isMobile ? 'tahti-mobile-shell' : undefined}>
      <AppTopNav
        showMenuButton={isMobile}
        onOpenMenu={() => setMobileNavOpen(true)}
      />

      <AudioEngine />

      {isMobile ? (
        <div className="bg-background-secondary relative flex min-h-0 flex-1 flex-col overflow-hidden">
          <div
            className={cn('min-h-0 flex-1 overflow-auto', MAIN_CONTENT_PADDING)}
          >
            <Outlet />
          </div>
          <MobileBottomNav onOpenQueue={() => setMobileQueueOpen(true)} />
        </div>
      ) : (
        <PlayerWorkspace>
          <PlayerWorkspace.LeftSidebar
            width={leftWidth}
            isCollapsed={leftCollapsed}
            onWidthChange={setLeftWidth}
            onToggle={toggleLeft}
          >
            <SidebarNavigation isCompact={leftCollapsed}>
              <div className="flex h-full min-h-0 flex-col">
                <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-1">
                  <SidebarNavigationItem
                    to="/"
                    icon={<GaugeIcon size={16} />}
                    label="Listen"
                  />
                  <SidebarNavigationItem
                    to="/radio"
                    icon={<RadioIcon size={16} />}
                    label="Radio"
                  />
                  <SidebarNavigationItem
                    to="/feed"
                    icon={<RssIcon size={16} />}
                    label="Feed"
                  />
                  <SidebarNavigationItem
                    to="/library"
                    icon={<LibraryIcon size={16} />}
                    label="My Library"
                  />
                  <SidebarNavigationItem
                    to="/studio"
                    icon={<LayoutDashboardIcon size={16} />}
                    label="Studio"
                  />
                  {isBoard && (
                    <SidebarNavigationItem
                      to="/admin"
                      icon={<ShieldIcon size={16} />}
                      label="Admin"
                    />
                  )}
                  {isBoard && (
                    <SidebarNavigationItem
                      to="/more"
                      icon={<MapIcon size={16} />}
                      label="More"
                    />
                  )}
                </div>
                <div className="mt-auto flex flex-col gap-1 p-1">
                  <SidebarNavigationItem
                    icon={<SettingsIcon size={16} />}
                    label="Settings"
                    onClick={() => openSettings()}
                  />
                </div>
              </div>
            </SidebarNavigation>
          </PlayerWorkspace.LeftSidebar>

          {/*
            Padding lives on Main (outside the scrollport) so titles keep
            breathing room from the pane edge while content scrolls.
          */}
          <PlayerWorkspace.Main
            className={cn('min-h-0 overflow-hidden', MAIN_CONTENT_PADDING)}
          >
            <div className="h-full overflow-auto">
              <Outlet />
            </div>
          </PlayerWorkspace.Main>

          <PlayerWorkspace.RightSidebar
            width={rightWidth}
            isCollapsed={rightCollapsed}
            onWidthChange={setRightWidth}
            onToggle={toggleRight}
          >
            <RightRailPanel isCollapsed={rightCollapsed} />
          </PlayerWorkspace.RightSidebar>
        </PlayerWorkspace>
      )}

      <ConnectedPlayerBar />
      <FullScreenPlayer />
      <AuthDialog />
      <ConnectedSettingsModal />
      <Toaster position="bottom-right" richColors closeButton />

      <MobileDrawer
        open={mobileNavOpen}
        title="Navigate"
        side="left"
        onClose={() => setMobileNavOpen(false)}
      >
        <div
          className="flex flex-col gap-1"
          onClick={() => setMobileNavOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              setMobileNavOpen(false);
            }
          }}
          role="presentation"
        >
          <SidebarNavItems compact={false} />
          <SidebarNavigation isCompact={false}>
            <SidebarNavigationItem
              icon={<SettingsIcon size={16} />}
              label="Settings"
              onClick={() => openSettings()}
            />
          </SidebarNavigation>
        </div>
      </MobileDrawer>

      <MobileDrawer
        open={mobileQueueOpen}
        side="right"
        onClose={() => setMobileQueueOpen(false)}
      >
        <RightRailPanel isCollapsed={false} />
      </MobileDrawer>
    </PlayerShell>
  );
}
