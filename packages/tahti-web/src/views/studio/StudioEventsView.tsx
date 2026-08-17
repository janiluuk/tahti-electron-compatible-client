import { useEffect, useState } from 'react';

import { Button, Input, Tabs, Textarea } from '@nuclearplayer/ui';

import {
  createEvent,
  deleteEvent,
  fetchMyEvents,
  type ArtistEvent,
} from '../../api/events';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { StudioPageHeader, StudioPanel } from '../../components/StudioPanel';

export function StudioEventsView() {
  const [events, setEvents] = useState<ArtistEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [place, setPlace] = useState('');
  const [location, setLocation] = useState('');
  const [eventUrl, setEventUrl] = useState('');
  const [startAt, setStartAt] = useState('');

  const reload = () => {
    void fetchMyEvents().then((r) => {
      setEvents(r.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  const canSubmit = title.trim() && place.trim() && location.trim() && startAt;

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/events" />
        <StudioPageHeader
          title="Events"
          subtitle="List upcoming appearances tied to your artist profile."
        />

        <Tabs
          listClassName="border-border border-b pb-3"
          panelClassName="pt-2"
          items={[
            {
              id: 'upcoming',
              label: 'Upcoming',
              content: (
                <StudioPanel
                  title="Upcoming events"
                  description="Festivals, live shows, and public appearances."
                >
                  {loading ? (
                    <p className="text-foreground-secondary text-sm">
                      Loading…
                    </p>
                  ) : events.length === 0 ? (
                    <p className="text-foreground-secondary text-sm">
                      No events listed yet.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {events.map((event) => (
                        <li
                          key={event.id}
                          className="border-border bg-background flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
                        >
                          <div>
                            <div className="font-medium">{event.title}</div>
                            <div className="text-foreground-secondary text-xs">
                              {new Date(event.startAt).toLocaleString()} ·{' '}
                              {event.place}, {event.location}
                            </div>
                            {event.description && (
                              <p className="text-foreground-secondary mt-1 max-w-md text-xs">
                                {event.description}
                              </p>
                            )}
                            {event.eventUrl && (
                              <a
                                href={event.eventUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-primary text-xs hover:underline"
                              >
                                {event.eventUrl}
                              </a>
                            )}
                          </div>
                          <Button
                            size="sm"
                            variant="text"
                            onClick={() => {
                              void deleteEvent(event.id).then((result) => {
                                if (!result.ok) {
                                  setMsg(result.error);
                                } else {
                                  reload();
                                }
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </StudioPanel>
              ),
            },
            {
              id: 'add',
              label: 'Add event',
              content: (
                <StudioPanel
                  title="Add event"
                  description="Publish a new appearance to your profile."
                >
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Input
                        label="Title"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                      />
                      <Input
                        label="Place"
                        value={place}
                        onChange={(event) => setPlace(event.target.value)}
                        placeholder="Northern Lights Hall"
                      />
                      <Input
                        label="Location"
                        value={location}
                        onChange={(event) => setLocation(event.target.value)}
                        placeholder="Helsinki, Finland"
                      />
                      <Input
                        label="Event URL (optional)"
                        value={eventUrl}
                        onChange={(event) => setEventUrl(event.target.value)}
                        placeholder="https://…"
                      />
                    </div>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-foreground-secondary text-xs uppercase">
                        Description
                      </span>
                      <Textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        rows={3}
                        placeholder="What should people expect — set details, door time, ticketing…"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm">
                      <span className="text-foreground-secondary text-xs uppercase">
                        Start
                      </span>
                      <input
                        type="datetime-local"
                        className="border-border bg-background w-full rounded-md border px-3 py-2 text-sm"
                        value={startAt}
                        onChange={(event) => setStartAt(event.target.value)}
                      />
                    </label>
                    <Button
                      size="sm"
                      disabled={!canSubmit}
                      onClick={() => {
                        void createEvent({
                          title: title.trim(),
                          description: description.trim(),
                          place: place.trim(),
                          location: location.trim(),
                          eventUrl: eventUrl.trim() || undefined,
                          startAt: new Date(startAt).toISOString(),
                        }).then((result) => {
                          if (!result.ok) {
                            setMsg(result.error);
                          } else {
                            setTitle('');
                            setDescription('');
                            setPlace('');
                            setLocation('');
                            setEventUrl('');
                            setStartAt('');
                            reload();
                          }
                        });
                      }}
                    >
                      Add event
                    </Button>
                    {msg && <p className="text-sm">{msg}</p>}
                  </div>
                </StudioPanel>
              ),
            },
          ]}
        />
      </div>
    </StudioGate>
  );
}
