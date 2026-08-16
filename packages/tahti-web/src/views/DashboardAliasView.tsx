import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { PageLoading } from '../components/PageStates';
import { useAuthStore } from '../stores/authStore';

/** Prod `/dashboard` (bare, no sub-path) — artists land in Studio; members
 * without a channel have no Studio surface, so send them to their actual
 * hub (Feed: posts/tracks/releases from artists they follow) instead of
 * the "create a channel" wall. Sub-paths (`/dashboard/upload`, etc.) go
 * through `resolveDashboardRedirect`, which is artist-only by design. */
export function DashboardAliasView() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) {
      return;
    }
    void navigate({ to: user?.channel ? '/studio' : '/feed', replace: true });
  }, [hydrated, user, navigate]);

  return <PageLoading label="Loading dashboard…" />;
}
