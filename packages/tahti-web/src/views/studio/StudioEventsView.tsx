import { useEffect, useState } from 'react';

import { Button, Input, Textarea } from '@nuclearplayer/ui';

import {
  createEvent,
  deleteEvent,
  fetchMyEvents,
  type ArtistEvent,
} from '../../api/events';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';

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
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">
            Events
          </h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            List upcoming appearances — festivals, in-person shows, and other
            events tied to your artist profile.
          </p>
        </div>

        <section className="border-border flex flex-col gap-3 rounded-xl border p-4">
          <h2 className="font-display text-lg font-bold">Add event</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              label="Place"
              value={place}
              onChange={(e) => setPlace(e.target.value)}
              placeholder="Northern Lights Hall"
            />
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Helsinki, Finland"
            />
            <Input
              label="Event URL (optional)"
              value={eventUrl}
              onChange={(e) => setEventUrl(e.target.value)}
              placeholder="https://…"
            />
          </div>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground-secondary text-xs uppercase">
              Description
            </span>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
              onChange={(e) => setStartAt(e.target.value)}
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
              }).then((r) => {
                if (!r.ok) {
                  setMsg(r.error);
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
        </section>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : events.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No events listed yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {events.map((ev) => (
              <li
                key={ev.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 text-sm"
              >
                <div>
                  <div className="font-medium">{ev.title}</div>
                  <div className="text-foreground-secondary text-xs">
                    {new Date(ev.startAt).toLocaleString()} · {ev.place},{' '}
                    {ev.location}
                  </div>
                  {ev.description && (
                    <p className="text-foreground-secondary mt-1 max-w-md text-xs">
                      {ev.description}
                    </p>
                  )}
                  {ev.eventUrl && (
                    <a
                      href={ev.eventUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary text-xs hover:underline"
                    >
                      {ev.eventUrl}
                    </a>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => {
                    void deleteEvent(ev.id).then((r) => {
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
              </li>
            ))}
          </ul>
        )}
      </div>
    </StudioGate>
  );
}
