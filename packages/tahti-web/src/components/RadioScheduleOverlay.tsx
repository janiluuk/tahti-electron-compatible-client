import { Link } from '@tanstack/react-router';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Dialog, Tabs } from '@nuclearplayer/ui';

import { fetchRadioRecentlyPlayed } from '../api/client';
import { fetchShowBookings, type StudioShowBooking } from '../api/shows';
import type { RadioRecentlyPlayedItem } from '../api/types';

const DAYS_SHOWN = 7;
const WINDOW_DAYS = 7;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function dayLabel(d: Date, today: Date): { top: string; bottom: string } {
  const diffDays = Math.round(
    (startOfDay(d).getTime() - startOfDay(today).getTime()) / 86_400_000,
  );
  const bottom = d.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
  });
  if (diffDays === 0) {
    return { top: 'Today', bottom };
  }
  if (diffDays === 1) {
    return { top: 'Tomorrow', bottom };
  }
  return { top: d.toLocaleDateString(undefined, { weekday: 'short' }), bottom };
}

function timeRange(startIso: string, endIso: string): string {
  const opts: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
  };
  return `${new Date(startIso).toLocaleTimeString(undefined, opts)}–${new Date(
    endIso,
  ).toLocaleTimeString(undefined, opts)}`;
}

function ScheduleList({ slots }: { slots: StudioShowBooking[] }) {
  const today = useMemo(() => new Date(), []);
  const days = useMemo(
    () =>
      Array.from({ length: DAYS_SHOWN }, (_, i) => {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        return d;
      }),
    [today],
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const activeDay = days[activeIndex]!;

  const dayStart = startOfDay(activeDay).getTime();
  const dayEnd = dayStart + 86_400_000;
  const now = Date.now();

  const daySlots = useMemo(
    () =>
      [...slots]
        .filter((s) => {
          const t = new Date(s.startAt).getTime();
          return t >= dayStart && t < dayEnd;
        })
        .sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        ),
    [slots, dayStart, dayEnd],
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex gap-1 overflow-x-auto pb-1"
        role="tablist"
        aria-label="Choose a day"
      >
        {days.map((d, i) => {
          const label = dayLabel(d, today);
          const active = i === activeIndex;
          return (
            <button
              key={d.toISOString()}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveIndex(i)}
              className={`flex shrink-0 flex-col items-center rounded-lg border px-2.5 py-1.5 text-xs transition-colors ${
                active
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border text-foreground-secondary hover:text-foreground'
              }`}
            >
              <span className="font-semibold">{label.top}</span>
              <span className="opacity-70">{label.bottom}</span>
            </button>
          );
        })}
      </div>

      {daySlots.length === 0 ? (
        <p className="text-foreground-secondary py-6 text-center text-sm">
          Nothing booked for this day yet.
        </p>
      ) : (
        <ul className="divide-border flex max-h-80 flex-col divide-y overflow-y-auto">
          {daySlots.map((slot) => {
            const isLive =
              new Date(slot.startAt).getTime() <= now &&
              new Date(slot.endAt).getTime() > now;
            const initial = slot.displayName.slice(0, 2).toUpperCase();
            const row = (
              <>
                <span className="bg-primary/20 text-primary flex size-8 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold">
                  {initial}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {slot.displayName}
                    {slot.isMine ? ' (you)' : ''}
                  </div>
                  {slot.note ? (
                    <div className="text-foreground-secondary truncate text-xs">
                      {slot.note}
                    </div>
                  ) : null}
                </div>
              </>
            );
            return (
              <li key={slot.id} className="flex items-center gap-3 py-2.5">
                {slot.channelSlug ? (
                  <Link
                    to="/channel/$slug"
                    params={{ slug: slot.channelSlug }}
                    className="flex min-w-0 flex-1 items-center gap-3"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    {row}
                  </div>
                )}
                {isLive ? (
                  <span className="text-accent-red shrink-0 text-xs font-semibold tracking-wide uppercase">
                    🔴 Live now
                  </span>
                ) : (
                  <span className="text-foreground-secondary shrink-0 text-xs tabular-nums">
                    {timeRange(slot.startAt, slot.endAt)}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function RotationList({ items }: { items: RadioRecentlyPlayedItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-foreground-secondary py-6 text-center text-sm">
        Nothing in rotation right now.
      </p>
    );
  }
  return (
    <ul className="divide-border flex max-h-80 flex-col divide-y overflow-y-auto">
      {items.map((item) => {
        const row = (
          <>
            <div className="bg-surface-secondary flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-full text-[10px] font-bold">
              {item.artworkUrl ? (
                <img
                  src={item.artworkUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                item.title.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{item.title}</div>
              <div className="text-foreground-secondary truncate text-xs">
                {item.artistName}
              </div>
            </div>
          </>
        );
        return (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            {item.artistUsername ? (
              <Link
                to="/u/$username"
                params={{ username: item.artistUsername }}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                {row}
              </Link>
            ) : (
              <div className="flex min-w-0 flex-1 items-center gap-3">
                {row}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function RadioScheduleOverlay({
  iconClassName,
}: {
  iconClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [slots, setSlots] = useState<StudioShowBooking[]>([]);
  const [rotation, setRotation] = useState<RadioRecentlyPlayedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!open || loaded) {
      return;
    }
    const from = new Date().toISOString();
    const to = new Date(Date.now() + WINDOW_DAYS * 86_400_000).toISOString();
    void Promise.all([
      fetchShowBookings(from, to),
      fetchRadioRecentlyPlayed(),
    ]).then(([bookings, recent]) => {
      setSlots(bookings.data);
      setRotation(recent.data);
      setLoaded(true);
    });
  }, [open, loaded]);

  return (
    <>
      <button
        type="button"
        className={iconClassName}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="Schedule & rotation"
        title="Schedule & rotation"
        onClick={() => setOpen(true)}
      >
        <CalendarIcon size={16} />
      </button>

      <Dialog.Root
        isOpen={open}
        onClose={() => setOpen(false)}
        className="max-w-md"
      >
        <Dialog.Title>Tahti Radio schedule</Dialog.Title>
        <Tabs
          listClassName="border-border mt-2 border-b"
          panelClassName="pt-3"
          items={[
            {
              id: 'schedule',
              label: 'Live artist slots',
              content: <ScheduleList slots={slots} />,
            },
            {
              id: 'rotation',
              label: 'In the rotation',
              content: <RotationList items={rotation} />,
            },
          ]}
        />
      </Dialog.Root>
    </>
  );
}
