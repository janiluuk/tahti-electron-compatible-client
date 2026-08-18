import { Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import {
  cancelVenueBroadcast,
  createVenueBroadcast,
  fetchMyVenues,
  patchVenue,
  type MyVenue,
} from '../../api/venues-manage';
import { StudioGate } from '../../components/StudioGate';
import { StudioNav } from '../../components/StudioNav';
import { Eyebrow } from '../../components/tahti/Eyebrow';

function VenueCard({
  venue,
  onChanged,
}: {
  venue: MyVenue;
  onChanged: () => void;
}) {
  const [name, setName] = useState(venue.name);
  const [address, setAddress] = useState(venue.address);
  const [city, setCity] = useState(venue.city);
  const [capacity, setCapacity] = useState(
    venue.capacity != null ? String(venue.capacity) : '',
  );
  const [msg, setMsg] = useState<string | null>(null);

  const [startAt, setStartAt] = useState('');
  const [bookingDesc, setBookingDesc] = useState('');

  const upcoming = venue.broadcasts.filter((b) => b.state !== 'CANCELED');

  return (
    <div className="border-border flex flex-col gap-4 rounded-xl border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-display text-lg font-bold">{venue.name}</h2>
          <p className="text-foreground-secondary text-xs">
            /venues/{venue.slug} ·{' '}
            {venue.verifiedAt ? 'Verified' : 'Pending verification'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Input
          label="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <Input
          label="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          onClick={() => {
            const cap = Number(capacity);
            void patchVenue(venue.slug, {
              name: name.trim(),
              address: address.trim(),
              city: city.trim(),
              capacity: capacity.trim() && Number.isFinite(cap) ? cap : null,
            }).then((r) => {
              setMsg(r.ok ? 'Venue saved.' : r.error);
              if (r.ok) {
                onChanged();
              }
            });
          }}
        >
          Save venue
        </Button>
        {msg && <p className="text-xs">{msg}</p>}
      </div>

      <div className="border-border border-t pt-4">
        <Eyebrow className="mb-2 block">Bookings</Eyebrow>
        {upcoming.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No upcoming bookings.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((b) => (
              <li
                key={b.id}
                className="border-border flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
              >
                <div>
                  <div className="font-medium">
                    {new Date(b.startAt).toLocaleString()}
                  </div>
                  {b.description && (
                    <div className="text-foreground-secondary text-xs">
                      {b.description}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="text"
                  onClick={() => {
                    void cancelVenueBroadcast(venue.slug, b.id).then((r) => {
                      if (!r.ok) {
                        setMsg(r.error);
                      } else {
                        onChanged();
                      }
                    });
                  }}
                >
                  Cancel
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-foreground-secondary text-xs uppercase">
              Start
            </span>
            <input
              type="datetime-local"
              className="border-border bg-background rounded-md border px-3 py-2 text-sm"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
            />
          </label>
          <Input
            label="Description"
            value={bookingDesc}
            onChange={(e) => setBookingDesc(e.target.value)}
          />
          <Button
            size="sm"
            disabled={!startAt}
            onClick={() => {
              void createVenueBroadcast(venue.slug, {
                startAt: new Date(startAt).toISOString(),
                description: bookingDesc.trim() || undefined,
              }).then((r) => {
                if (!r.ok) {
                  setMsg(r.error);
                } else {
                  setStartAt('');
                  setBookingDesc('');
                  onChanged();
                }
              });
            }}
          >
            Add booking
          </Button>
        </div>
      </div>
    </div>
  );
}

export function StudioVenuesView() {
  const [venues, setVenues] = useState<MyVenue[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    void fetchMyVenues().then((r) => {
      setVenues(r.data);
      setLoading(false);
    });
  };

  useEffect(reload, []);

  return (
    <StudioGate>
      <div className="mx-auto flex max-w-3xl flex-col gap-6">
        <StudioNav current="/studio/venues" />
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight">
              Venues
            </h1>
            <p className="text-foreground-secondary mt-1 text-sm">
              Manage venues you registered and their live show bookings.
            </p>
          </div>
          <Link to="/venues/register">
            <Button size="sm" variant="secondary">
              Register a venue
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : venues.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No venues yet — register one to start booking shows.
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {venues.map((v) => (
              <VenueCard key={v.id} venue={v} onChanged={reload} />
            ))}
          </div>
        )}
      </div>
    </StudioGate>
  );
}
