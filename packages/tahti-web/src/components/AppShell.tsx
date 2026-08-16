import { Outlet } from '@tanstack/react-router';
import {
  GaugeIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  MapIcon,
  RadioIcon,
  SettingsIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  PlayerShell,
  PlayerWorkspace,
  SidebarNavigation,
  SidebarNavigationItem,
} from '@nuclearplayer/ui';

import { useIsMobile } from '../hooks/useIsMobile';
import { MAIN_CONTENT_PADDING } from '../layout/contentPadding';
import { cn } from '../lib/cn';
import { useAuthStore } from '../stores/authStore';
import { useLayoutStore } from '../stores/layoutStore';
import { useSettingsModalStore } from '../stores/settingsModalStore';
import { AppTopNav } from './AppTopNav';
import { AudioEngine } from './AudioEngine';
import { AuthDialog } from './AuthDialog';
import { ConnectedPlayerBar } from './ConnectedPlayerBar';
import { ConnectedSettingsModal } from './ConnectedSettingsModal';
import { MobileBottomNav, MobileDrawer } from './MobileChrome';
import { RightRailPanel } from './RightRailPanel';

function SidebarNavItems({ compact }: { compact: boolean }) {
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
          to="/library"
          icon={<LibraryIcon size={16} />}
          label="My Library"
        />
        <SidebarNavigationItem
          to="/studio"
          icon={<LayoutDashboardIcon size={16} />}
          label="Studio"
        />
        <SidebarNavigationItem
          to="/more"
          icon={<MapIcon size={16} />}
          label="More"
        />
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
  const openSettings = useSettingsModalStore((s) => s.open);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);

  useEffect(() => {
    void refresh();
  }, [refresh]);

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
                    to="/library"
                    icon={<LibraryIcon size={16} />}
                    label="My Library"
                  />
                  <SidebarNavigationItem
                    to="/studio"
                    icon={<LayoutDashboardIcon size={16} />}
                    label="Studio"
                  />
                  <SidebarNavigationItem
                    to="/more"
                    icon={<MapIcon size={16} />}
                    label="More"
                  />
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
      <AuthDialog />
      <ConnectedSettingsModal />

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
        title="Chat"
        side="right"
        onClose={() => setMobileQueueOpen(false)}
      >
        <RightRailPanel isCollapsed={false} />
      </MobileDrawer>
    </PlayerShell>
  );
}
