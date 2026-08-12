import { Link } from '@tanstack/react-router';
import { useState } from 'react';

import { Button, Input } from '@nuclearplayer/ui';

import { registerVenue } from '../api/client';
import { useAuthStore } from '../stores/authStore';

export function VenueRegisterView() {
  const user = useAuthStore((s) => s.user);
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [countryCode, setCountryCode] = useState('FI');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [doneSlug, setDoneSlug] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (!user) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Register a venue
        </h1>
        <p className="text-foreground-secondary text-sm">
          Sign in to submit a venue for board review.
        </p>
        <Link
          to="/login"
          className="text-sm underline-offset-2 hover:underline"
        >
          Log in →
        </Link>
      </div>
    );
  }

  if (doneSlug) {
    return (
      <div className="mx-auto flex max-w-lg flex-col gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Submitted
        </h1>
        <p className="text-foreground-secondary text-sm">
          <code>{doneSlug}</code> is pending board verification before it
          appears in the public directory.
        </p>
        <Link
          to="/venues"
          className="text-sm underline-offset-2 hover:underline"
        >
          ← Back to venues
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <div>
        <Link
          to="/venues"
          className="text-foreground-secondary text-xs hover:underline"
        >
          ← Venues
        </Link>
        <h1 className="font-display mt-2 text-3xl font-extrabold tracking-tight">
          Register a venue
        </h1>
        <p className="text-foreground-secondary mt-1 text-sm">
          New venues are reviewed by the board before appearing publicly.
        </p>
      </div>

      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          setPending(true);
          setError(null);
          void registerVenue({
            slug: slug.trim(),
            name: name.trim(),
            address: address.trim(),
            city: city.trim(),
            countryCode: countryCode.trim() || 'FI',
            capacity: capacity ? Number(capacity) : undefined,
            description: description.trim() || undefined,
          }).then((res) => {
            setPending(false);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            setDoneSlug(res.slug);
          });
        }}
      >
        <Input
          label="URL slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="kulttuuritalo"
          required
          minLength={2}
          maxLength={64}
        />
        <Input
          label="Venue name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          maxLength={120}
        />
        <Input
          label="Street address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
          maxLength={200}
        />
        <Input
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          required
          maxLength={80}
        />
        <Input
          label="Country code"
          value={countryCode}
          onChange={(e) => setCountryCode(e.target.value.toUpperCase())}
          maxLength={2}
        />
        <Input
          label="Capacity (optional)"
          variant="number"
          min={1}
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-foreground-secondary text-xs tracking-wide uppercase">
            Description (optional)
          </span>
          <textarea
            className="border-border bg-background min-h-[6rem] rounded-md border px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
            rows={4}
          />
        </label>
        <Button
          type="submit"
          disabled={
            pending ||
            !slug.trim() ||
            !name.trim() ||
            !address.trim() ||
            !city.trim()
          }
        >
          {pending ? 'Submitting…' : 'Submit for review'}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </div>
  );
}
