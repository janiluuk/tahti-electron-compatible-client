import { Link } from '@tanstack/react-router';
import { ChartLineIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchStatsSummary,
  fetchStatsTopCountries,
  fetchStatsTopTracks,
  type StatsSummary,
  type StatsTopCountry,
  type StatsTopTrack,
} from '../../api/studio-extras';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { Eyebrow } from '../../components/tahti/Eyebrow';
import { StatNumber } from '../../components/tahti/StatNumber';

export function StudioStatsView() {
  const [summary, setSummary] = useState<StatsSummary | null>(null);
  const [tracks, setTracks] = useState<StatsTopTrack[]>([]);
  const [countries, setCountries] = useState<StatsTopCountry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    void Promise.all([
      fetchStatsSummary(),
      fetchStatsTopTracks(),
      fetchStatsTopCountries(),
    ]).then(([s, t, c]) => {
      setSummary(s.data);
      setTracks(t.data);
      setCountries(c.data);
      setIsDemo(s.meta.source === 'mock');
      setLoading(false);
    });
  }, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-1 py-2">
        <StudioNav current="/studio/stats" />
        <StudioPageHeader
          title="Stats"
          subtitle={`Plays and downloads across your catalog.${isDemo ? ' (demo data)' : ''}`}
          action={
            <Link to="/studio/stats/detail">
              <Button
                size="sm"
                variant="secondary"
                aria-label="Plays detail"
                title="Plays detail"
              >
                <ChartLineIcon size={16} aria-hidden className="mr-1.5" />
                Detail
              </Button>
            </Link>
          }
        />

        {loading || !summary ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(
              [
                ['Plays today', summary.playsToday],
                ['Plays total', summary.playsTotal],
                ['Downloads today', summary.downloadsToday],
                ['Downloads total', summary.downloadsTotal],
              ] as const
            ).map(([label, value]) => (
              <StudioPanel key={label} className="!p-4 sm:!p-5">
                <Eyebrow>{label}</Eyebrow>
                <StatNumber className="mt-1 block">
                  {value.toLocaleString()}
                </StatNumber>
              </StudioPanel>
            ))}
          </div>
        )}

        <StudioPanel title="Top tracks">
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : tracks.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No track stats yet.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {tracks.map((t) => (
                <li
                  key={t.archiveItemId}
                  className="flex justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                >
                  <Link
                    to="/studio/archive/$id"
                    params={{ id: t.archiveItemId }}
                    className="min-w-0 truncate font-medium hover:underline"
                  >
                    {t.title}
                  </Link>
                  <span className="text-foreground-secondary shrink-0 tabular-nums">
                    {t.plays.toLocaleString()} plays
                  </span>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>

        <StudioPanel title="Top countries">
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : countries.length === 0 ? (
            <p className="text-foreground-secondary text-sm">
              No country data yet.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {countries.map((c) => (
                <li
                  key={c.country}
                  className="flex justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0"
                >
                  <span className="font-medium">{c.country}</span>
                  <span className="text-foreground-secondary tabular-nums">
                    {c.count.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>

        <p className="text-foreground-secondary text-xs">
          Fan payouts live under{' '}
          <Link
            to="/studio/revenue"
            className="underline-offset-2 hover:underline"
          >
            Revenue
          </Link>
          .
        </p>
      </div>
    </StudioGate>
  );
}
