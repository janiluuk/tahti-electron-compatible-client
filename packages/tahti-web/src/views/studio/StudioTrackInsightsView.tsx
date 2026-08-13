import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchTrackInsights,
  type InsightsKind,
  type InsightsPeriod,
  type TrackInsights,
} from '../../api/track-insights';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

const PERIODS: InsightsPeriod[] = ['7d', '30d', 'all'];

export function StudioTrackInsightsView({
  kind,
  id,
}: {
  kind: InsightsKind;
  id: string;
}) {
  const [period, setPeriod] = useState<InsightsPeriod>('30d');
  const [insights, setInsights] = useState<TrackInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchTrackInsights(kind, id, period).then((r) => {
      setInsights(r.data);
      setLoading(false);
    });
  }, [kind, id, period]);

  const maxDaily = insights
    ? Math.max(1, ...insights.daily.map((d) => d.downloads))
    : 1;
  const maxCountry = insights
    ? Math.max(1, ...insights.countries.map((c) => c.count))
    : 1;

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <StudioNav current="/studio/archive" />
        <Link
          to={kind === 'archive' ? '/studio/archive' : '/studio/releases'}
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← {kind === 'archive' ? 'Music' : 'Releases'}
        </Link>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Insights
            </h1>
            {insights && (
              <p className="text-foreground-secondary mt-1 text-sm">
                {insights.title}
              </p>
            )}
          </div>
          <div className="flex gap-1.5">
            {PERIODS.map((p) => (
              <Button
                key={p}
                size="sm"
                variant={p === period ? undefined : 'text'}
                onClick={() => setPeriod(p)}
              >
                {p === 'all' ? 'All time' : p}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : !insights ? (
          <p className="text-foreground-secondary text-sm">
            No insights available for this track.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <div className="border-border rounded-lg border p-4">
                <p className="text-foreground-secondary text-xs uppercase">
                  Plays
                </p>
                <p className="font-display text-2xl font-bold">
                  {insights.totalPlays.toLocaleString()}
                </p>
              </div>
              <div className="border-border rounded-lg border p-4">
                <p className="text-foreground-secondary text-xs uppercase">
                  Downloads
                </p>
                <p className="font-display text-2xl font-bold">
                  {insights.totalDownloads.toLocaleString()}
                </p>
              </div>
            </div>

            <section className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-bold">
                Downloads by day
              </h2>
              {insights.daily.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No downloads in this period.
                </p>
              ) : (
                <div className="flex h-32 items-end gap-1">
                  {insights.daily.map((d) => (
                    <div
                      key={d.date}
                      className="group relative flex-1"
                      title={`${d.date}: ${d.downloads}`}
                    >
                      <div
                        className="bg-primary hover:bg-accent-cyan w-full rounded-t transition-colors"
                        style={{
                          height: `${Math.max(4, (d.downloads / maxDaily) * 100)}%`,
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="flex flex-col gap-2">
              <h2 className="font-display text-lg font-bold">Top countries</h2>
              {insights.countries.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No geo data yet.
                </p>
              ) : (
                <ul className="flex flex-col gap-1.5">
                  {insights.countries.map((c) => (
                    <li
                      key={c.countryCode}
                      className="flex items-center gap-3 text-sm"
                    >
                      <span className="w-28 shrink-0 truncate">
                        {c.displayName}
                      </span>
                      <div className="bg-background-secondary h-2 flex-1 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full"
                          style={{
                            width: `${Math.max(4, (c.count / maxCountry) * 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-foreground-secondary w-10 shrink-0 text-right text-xs">
                        {c.count}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </StudioGate>
  );
}
