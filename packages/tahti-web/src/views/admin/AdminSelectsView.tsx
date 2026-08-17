import { PlayIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  addToSelectsRotation,
  fetchAdminSelects,
  removeFromSelectsRotation,
  reorderSelectsItem,
  searchAdminSelectsBrowse,
  startSelectsStream,
  stopSelectsStream,
  type AdminSelectsBrowseItem,
  type AdminSelectsItem,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';
import { usePlayerStore } from '../../stores/playerStore';

function fmtDuration(sec: number | null): string {
  if (!sec) {
    return '—';
  }
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function AdminSelectsView() {
  const play = usePlayerStore((s) => s.play);
  const [items, setItems] = useState<AdminSelectsItem[]>([]);
  const [streamRunning, setStreamRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [browse, setBrowse] = useState<AdminSelectsBrowseItem[]>([]);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchAdminSelects().then((res) => {
      setItems(res.data.items);
      setStreamRunning(res.data.streamRunning);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  useEffect(() => {
    if (!query.trim()) {
      setBrowse([]);
      return;
    }
    const handle = setTimeout(() => {
      void searchAdminSelectsBrowse(query).then((res) => setBrowse(res.data));
    }, 250);
    return () => clearTimeout(handle);
  }, [query]);

  const inRotationIds = new Set(items.map((i) => i.archiveItemId));

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/tahti-selects" />
        <StudioPageHeader
          title="Tahti Selects"
          subtitle="Always-on curated rotation — loops endlessly. Only public archive items can be added."
          action={
            <Button
              size="sm"
              variant={streamRunning ? 'secondary' : 'default'}
              onClick={() => {
                const action = streamRunning
                  ? stopSelectsStream
                  : startSelectsStream;
                void action().then((r) => {
                  if (!r.ok) {
                    setMsg(r.error);
                  } else {
                    setStreamRunning(!streamRunning);
                  }
                });
              }}
            >
              {streamRunning ? 'Stop stream' : 'Start stream'}
            </Button>
          }
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        <StudioPanel title={`Current rotation (${items.length})`}>
          {loading ? (
            <p className="text-foreground-secondary text-sm">Loading…</p>
          ) : items.length === 0 ? (
            <p className="text-foreground-secondary py-4 text-center text-sm">
              Nothing in rotation yet — add tracks below.
            </p>
          ) : (
            <ul className="divide-border divide-y">
              {items.map((item, index) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <div className="font-medium">
                      {index + 1}. {item.title}
                    </div>
                    <div className="text-foreground-secondary text-xs">
                      {item.artistName} · {fmtDuration(item.durationSec)} ·{' '}
                      {item.license.replace(/_/g, ' ')} · added by{' '}
                      {item.addedBy}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {item.audioUrl && (
                      <Button
                        size="icon-sm"
                        variant="text"
                        aria-label={`Preview ${item.title}`}
                        title="Preview"
                        onClick={() => {
                          play({
                            id: `archive:${item.archiveItemId}`,
                            kind: 'archive',
                            title: item.title,
                            artist: item.artistName,
                            streamUrl: item.audioUrl!,
                            protocol: 'https',
                            channelSlug: item.channelSlug,
                          });
                        }}
                      >
                        <PlayIcon size={16} aria-hidden />
                      </Button>
                    )}
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label="Move up"
                      title="Move up"
                      disabled={index === 0}
                      onClick={() => {
                        void reorderSelectsItem(item.id, 'up').then(reload);
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="text"
                      aria-label="Move down"
                      title="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => {
                        void reorderSelectsItem(item.id, 'down').then(reload);
                      }}
                    >
                      ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="text"
                      onClick={() => {
                        void removeFromSelectsRotation(item.id).then((r) => {
                          if (!r.ok) {
                            setMsg(r.error);
                          } else {
                            reload();
                          }
                        });
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </StudioPanel>

        <StudioPanel title="Add from artist archives">
          <Input
            placeholder="Search public archive items by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          {query.trim() && (
            <ul className="divide-border mt-3 divide-y">
              {browse.length === 0 ? (
                <li className="text-foreground-secondary py-3 text-sm">
                  No public archive items match &ldquo;{query}&rdquo;.
                </li>
              ) : (
                browse.map((item) => {
                  const already = inRotationIds.has(item.id);
                  return (
                    <li
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-foreground-secondary text-xs">
                          {item.artistName} · {fmtDuration(item.durationSec)} ·{' '}
                          {item.license.replace(/_/g, ' ')}
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        {item.audioUrl && (
                          <Button
                            size="icon-sm"
                            variant="text"
                            aria-label={`Preview ${item.title}`}
                            title="Preview"
                            onClick={() => {
                              play({
                                id: `archive:${item.id}`,
                                kind: 'archive',
                                title: item.title,
                                artist: item.artistName,
                                streamUrl: item.audioUrl!,
                                protocol: 'https',
                                channelSlug: item.channelSlug,
                              });
                            }}
                          >
                            <PlayIcon size={16} aria-hidden />
                          </Button>
                        )}
                        {already ? (
                          <span className="text-foreground-secondary text-xs">
                            In rotation
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => {
                              void addToSelectsRotation(item).then((r) => {
                                if (!r.ok) {
                                  setMsg(r.error);
                                } else {
                                  reload();
                                }
                              });
                            }}
                          >
                            Add
                          </Button>
                        )}
                      </div>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </StudioPanel>
      </div>
    </AdminGate>
  );
}
