import { PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@nuclearplayer/ui';

import {
  fetchAdminTopLists,
  type AdminTopListBucket,
  type AdminTopListDimension,
  type AdminTopListPeriod,
  type AdminTopListSort,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { usePlayerStore } from '../../stores/playerStore';

const PERIODS: { id: AdminTopListPeriod; label: string }[] = [
  { id: 'month', label: 'Month' },
  { id: 'half_year', label: 'Half year' },
  { id: 'all_time', label: 'All time' },
];

const DIMENSIONS: { id: AdminTopListDimension; label: string }[] = [
  { id: 'type', label: 'By type' },
  { id: 'genre', label: 'By genre' },
];

const SORTS: { id: AdminTopListSort; label: string }[] = [
  { id: 'desc', label: 'Most listened' },
  { id: 'asc', label: 'Least listened' },
];

function FilterRow<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <nav className="flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          role="tab"
          aria-selected={value === o.id}
          onClick={() => onChange(o.id)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${
            value === o.id
              ? 'bg-primary text-foreground shadow-sm'
              : 'border-border text-foreground-secondary hover:text-foreground border'
          }`}
        >
          {o.label}
        </button>
      ))}
    </nav>
  );
}

export function AdminTopListsView() {
  const play = usePlayerStore((s) => s.play);
  const [period, setPeriod] = useState<AdminTopListPeriod>('month');
  const [dimension, setDimension] = useState<AdminTopListDimension>('type');
  const [sort, setSort] = useState<AdminTopListSort>('desc');
  const [buckets, setBuckets] = useState<AdminTopListBucket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    void fetchAdminTopLists(period, dimension, sort).then((res) => {
      setBuckets(res.data);
      setLoading(false);
    });
  }, [period, dimension, sort]);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/top-lists" />
        <StudioPageHeader
          title="Top lists"
          subtitle="Listens are counted once per track per listener per day — a genuine play, not a raw click."
        />

        <div className="flex flex-col gap-2">
          <FilterRow options={PERIODS} value={period} onChange={setPeriod} />
          <FilterRow
            options={DIMENSIONS}
            value={dimension}
            onChange={setDimension}
          />
          <FilterRow options={SORTS} value={sort} onChange={setSort} />
        </div>

        {loading ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : buckets.length === 0 ? (
          <StudioPanel>
            <p className="text-foreground-secondary py-4 text-center text-sm">
              No listens recorded for this period yet.
            </p>
          </StudioPanel>
        ) : (
          buckets.map((bucket) => {
            const max = Math.max(...bucket.entries.map((e) => e.listens), 1);
            return (
              <StudioPanel key={bucket.bucket} title={bucket.bucket}>
                <div className="flex flex-col gap-3">
                  {bucket.entries.map((entry, i) => (
                    <div key={entry.archiveItemId} className="text-sm">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5">
                          {entry.audioUrl && (
                            <Button
                              size="icon-sm"
                              variant="text"
                              aria-label={`Preview ${entry.title}`}
                              title="Preview"
                              onClick={() => {
                                play({
                                  id: `archive:${entry.archiveItemId}`,
                                  kind: 'archive',
                                  title: entry.title,
                                  artist: entry.artistName,
                                  streamUrl: entry.audioUrl!,
                                  protocol: 'https',
                                  channelSlug: entry.channelSlug,
                                });
                              }}
                            >
                              <PlayIcon size={14} aria-hidden />
                            </Button>
                          )}
                          <span className="min-w-0 truncate">
                            #{i + 1} {entry.title} — {entry.artistName}
                          </span>
                        </span>
                        <span className="text-foreground-secondary shrink-0 text-xs">
                          {entry.listens}{' '}
                          {entry.listens === 1 ? 'listen' : 'listens'}
                        </span>
                      </div>
                      <div className="bg-background-secondary mt-1 h-1.5 overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full"
                          style={{
                            width: `${(entry.listens / max) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </StudioPanel>
            );
          })
        )}
      </div>
    </AdminGate>
  );
}
