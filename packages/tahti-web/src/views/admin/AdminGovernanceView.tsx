import { Link } from '@tanstack/react-router';
import {
  BuildingIcon,
  FileTextIcon,
  GavelIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  VoteIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  fetchAdminGovernanceOverview,
  type AdminGovernanceOverview,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function AdminGovernanceView() {
  const [overview, setOverview] = useState<AdminGovernanceOverview | null>(
    null,
  );

  useEffect(() => {
    void fetchAdminGovernanceOverview().then((res) => setOverview(res.data));
  }, []);

  const cards: {
    icon: typeof VoteIcon;
    title: string;
    desc: string;
    badge?: string;
    to?: string;
  }[] = [
    {
      icon: VoteIcon,
      title: 'Member motions & voting',
      desc: 'Open member motions and the public governance portal.',
      badge: overview ? `${overview.openMotions} open` : undefined,
    },
    {
      icon: BuildingIcon,
      title: 'Venue verification queue',
      desc: 'Review and verify venue submissions for the events calendar.',
      badge: overview
        ? `${overview.pendingVenueVerifications} pending`
        : undefined,
    },
    {
      icon: ScrollTextIcon,
      title: 'Annual report generator',
      desc: 'Generate and store the yearly nonprofit activity report.',
      badge: overview?.lastAnnualReportYear
        ? `Last: ${overview.lastAnnualReportYear}`
        : undefined,
    },
    {
      icon: GavelIcon,
      title: 'Board resolutions',
      desc: 'Record and publish formal board decisions and vote outcomes.',
      badge: overview
        ? `${overview.boardResolutionsThisYear} this year`
        : undefined,
    },
    {
      icon: VoteIcon,
      title: 'Annual General Meeting',
      desc: 'Agenda builder, open motions, member notice checklist, and minutes links.',
      to: '/admin/agm',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Audit log',
      desc: 'Searchable log of privileged actions across the platform.',
    },
    {
      icon: FileTextIcon,
      title: 'Member register',
      desc: 'Full member list, exportable for the AGM notice mailing.',
    },
  ];

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/governance" />
        <StudioPageHeader
          title="Governance"
          subtitle="Association governance tools — motions, venues, resolutions, AGM, and audit trail."
        />

        <div className="grid gap-3 sm:grid-cols-2">
          {cards.map((c) => {
            const Icon = c.icon;
            const content = (
              <StudioPanel key={c.title} className="h-full">
                <div className="flex items-start gap-3">
                  <Icon
                    size={18}
                    aria-hidden
                    className="text-foreground-secondary mt-0.5 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{c.title}</div>
                      {c.badge && (
                        <span className="text-foreground-secondary shrink-0 text-xs">
                          {c.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-foreground-secondary mt-1 text-xs">
                      {c.desc}
                    </p>
                  </div>
                </div>
              </StudioPanel>
            );
            return c.to ? (
              <Link
                key={c.title}
                to={c.to}
                className="rounded-xl transition-opacity hover:opacity-80"
              >
                {content}
              </Link>
            ) : (
              content
            );
          })}
        </div>
      </div>
    </AdminGate>
  );
}
