import { useEffect, useState } from 'react';

import { Badge, Button } from '@nuclearplayer/ui';

import {
  fetchAdminRadio,
  radioMoveToFront,
  radioOptOut,
  radioRemoveOptOut,
  type AdminRadioData,
} from '../../api/admin';
import { AdminGate } from '../../components/AdminGate';
import { AdminNav } from '../../components/AdminNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

function fmt(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function AdminRadioView() {
  const [data, setData] = useState<AdminRadioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const reload = () => {
    void fetchAdminRadio().then((res) => {
      setData(res.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  return (
    <AdminGate>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-1 py-2">
        <AdminNav current="/admin/radio" />
        <StudioPageHeader
          title="Tahti Radio"
          subtitle="Fair-rotation meta-stream — member channels, no editorial picks."
        />

        {msg && (
          <p className="text-foreground-secondary text-sm" role="status">
            {msg}
          </p>
        )}

        {loading || !data ? (
          <StudioPanel>
            <p className="text-foreground-secondary text-sm">Loading…</p>
          </StudioPanel>
        ) : (
          <>
            <StudioPanel title="Now playing">
              {data.nowPlaying.live && data.nowPlaying.artistName ? (
                <div className="flex items-center gap-2 text-sm">
                  <span
                    className="bg-accent-green size-2 rounded-full"
                    aria-hidden
                  />
                  <span className="font-medium">
                    {data.nowPlaying.artistName}
                  </span>
                  <span className="text-foreground-secondary">
                    /c/{data.nowPlaying.slug}
                  </span>
                </div>
              ) : (
                <p className="text-foreground-secondary text-sm">
                  Radio is offline — no eligible channels live right now.
                </p>
              )}
            </StudioPanel>

            <StudioPanel title={`Eligible channels (${data.eligible.length})`}>
              {data.eligible.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No member channels are live right now.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {data.eligible.map((ch) => (
                    <li
                      key={ch.channelId}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">{ch.artistName}</div>
                        <div className="text-foreground-secondary text-xs">
                          /c/{ch.slug} ·{' '}
                          {ch.lastFeaturedAt
                            ? `last featured ${fmt(ch.lastFeaturedAt)}`
                            : 'never featured'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => {
                            void radioMoveToFront(ch.channelId).then((r) => {
                              if (!r.ok) {
                                setMsg(r.error);
                              } else {
                                reload();
                              }
                            });
                          }}
                        >
                          Move to front
                        </Button>
                        <Button
                          size="sm"
                          variant="text"
                          onClick={() => {
                            void radioOptOut(ch.channelId).then((r) => {
                              if (!r.ok) {
                                setMsg(r.error);
                              } else {
                                reload();
                              }
                            });
                          }}
                        >
                          Opt out
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>

            {data.optedOut.length > 0 && (
              <StudioPanel title={`Opted out (${data.optedOut.length})`}>
                <ul className="divide-border divide-y">
                  {data.optedOut.map((ch) => (
                    <li
                      key={ch.channelId}
                      className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-2">
                        <span>{ch.artistName}</span>
                        <span className="text-foreground-secondary text-xs">
                          /c/{ch.slug}
                        </span>
                        {ch.isLive && (
                          <Badge variant="pill" color="green">
                            Live
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          void radioRemoveOptOut(ch.channelId).then((r) => {
                            if (!r.ok) {
                              setMsg(r.error);
                            } else {
                              reload();
                            }
                          });
                        }}
                      >
                        Re-enable
                      </Button>
                    </li>
                  ))}
                </ul>
              </StudioPanel>
            )}

            <StudioPanel title="Feature history">
              {data.history.length === 0 ? (
                <p className="text-foreground-secondary text-sm">
                  No history yet.
                </p>
              ) : (
                <ul className="divide-border divide-y">
                  {data.history.map((item, i) => (
                    <li
                      key={`${item.channelId}-${i}`}
                      className="flex items-center justify-between py-2.5 text-sm first:pt-0 last:pb-0"
                    >
                      <span>{item.artistName}</span>
                      <span className="text-foreground-secondary text-xs">
                        {fmt(item.featuredAt)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </StudioPanel>
          </>
        )}
      </div>
    </AdminGate>
  );
}
