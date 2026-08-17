import { useEffect, useState } from 'react';

import { Badge } from '@nuclearplayer/ui';

import {
  fetchAdminIntegrationStatus,
  type AdminIntegrationStatus,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

const CRITICAL_VENDORS = [
  {
    name: 'Fiber ISP',
    service: 'Business fiber (symmetric gigabit, static IP)',
    dpaRequired: false,
  },
  {
    name: 'UpCloud',
    service: 'VPS / object storage disaster recovery',
    dpaRequired: true,
  },
  {
    name: 'Stripe',
    service: 'Payments — platform and Connect payouts',
    dpaRequired: true,
  },
  {
    name: 'Domain registrar',
    service: 'tahti.live DNS',
    dpaRequired: false,
  },
] as const;

const INTEGRATION_VENDORS = [
  { name: 'Mixcloud', service: 'OAuth / archive uploads', dpaRequired: true },
  {
    name: 'Revelator',
    service: 'DSP distribution — ISRC registration, royalty pull-back',
    dpaRequired: true,
  },
  {
    name: 'Email provider',
    service: 'SMTP, newsletter dispatch, bounce webhook',
    dpaRequired: true,
  },
  {
    name: 'hCaptcha',
    service: 'Bot protection on signup and login',
    dpaRequired: false,
  },
  {
    name: 'Bandcamp',
    service: 'Import own releases into the archive',
    dpaRequired: true,
  },
  {
    name: 'SoundCloud',
    service: 'Import own downloadable tracks into the archive',
    dpaRequired: true,
  },
  {
    name: 'Google Drive',
    service: 'Cloud-storage import into the archive',
    dpaRequired: true,
  },
  {
    name: 'Twitter / X',
    service: 'Auto-post broadcast and release announcements',
    dpaRequired: false,
  },
  {
    name: 'Instagram',
    service: 'Auto-post broadcast and release announcements',
    dpaRequired: false,
  },
  {
    name: 'AcoustID',
    service: 'Track fingerprint / metadata lookup',
    dpaRequired: false,
  },
] as const;

function VendorTable({
  vendors,
}: {
  vendors: readonly { name: string; service: string; dpaRequired: boolean }[];
}) {
  return (
    <ul className="divide-border divide-y">
      {vendors.map((v) => (
        <li
          key={v.name}
          className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm first:pt-0 last:pb-0"
        >
          <div className="min-w-0 flex-1">
            <div className="font-medium">{v.name}</div>
            <div className="text-foreground-secondary text-xs">{v.service}</div>
          </div>
          {v.dpaRequired && (
            <Badge variant="pill" color="orange">
              DPA required
            </Badge>
          )}
        </li>
      ))}
    </ul>
  );
}

export function AdminVendorsView() {
  const [integrations, setIntegrations] = useState<AdminIntegrationStatus[]>(
    [],
  );

  useEffect(() => {
    void fetchAdminIntegrationStatus().then((res) => setIntegrations(res.data));
  }, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/vendors" />
        <StudioPageHeader
          title="Vendors & DPA tracking"
          subtitle="Association-owned accounts. Credentials live in the board vault, never here."
        />

        {integrations.length > 0 && (
          <StudioPanel title="Distribution status">
            <ul className="flex flex-col gap-2">
              {integrations.map((row) => (
                <li key={row.name} className="flex items-center gap-3 text-sm">
                  <Badge variant="pill" color={row.live ? 'green' : 'orange'}>
                    {row.live ? 'Live' : 'Stub'}
                  </Badge>
                  <div>
                    <div className="font-medium">{row.name}</div>
                    <div className="text-foreground-secondary text-xs">
                      {row.detail}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </StudioPanel>
        )}

        <StudioPanel title="Critical vendors">
          <VendorTable vendors={CRITICAL_VENDORS} />
        </StudioPanel>

        <StudioPanel title="Integrations">
          <VendorTable vendors={INTEGRATION_VENDORS} />
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
