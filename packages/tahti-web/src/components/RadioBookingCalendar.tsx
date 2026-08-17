import { Link } from '@tanstack/react-router';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MessageCircleIcon,
  MicIcon,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { Button, Dialog, Input } from '@nuclearplayer/ui';

import {
  createShowBooking,
  fetchShowBookings,
  SHOW_SLOT_MAX_HOURS,
  type ShowType,
  type StudioShowBooking,
} from '../api/shows';
import { useAuthStore } from '../stores/authStore';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

/** Monday-first 6-week grid covering the given month. */
function monthGridDays(monthCursor: Date): Date[] {
  const first = startOfMonth(monthCursor);
  const firstWeekday = (first.getDay() + 6) % 7; // 0 = Monday
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - firstWeekday);
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
}

function combineDateAndTime(date: Date, timeHHMM: string): Date | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(timeHHMM);
  if (!match) {
    return null;
  }
  const d = new Date(date);
  d.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return d;
}

function formatTimeRange(startAt: string, endAt: string): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  return `${fmt(startAt)}–${fmt(endAt)}`;
}

export function RadioBookingCalendar({
  isOpen,
  onClose,
  onBooked,
}: {
  isOpen: boolean;
  onClose: () => void;
  onBooked?: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [monthCursor, setMonthCursor] = useState(() =>
    startOfMonth(new Date()),
  );
  const [bookings, setBookings] = useState<StudioShowBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [startTime, setStartTime] = useState('20:00');
  const [durationHours, setDurationHours] = useState<1 | 2>(1);
  const [note, setNote] = useState('');
  const [showType, setShowType] = useState<ShowType>('LIVE_SET');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const days = useMemo(() => monthGridDays(monthCursor), [monthCursor]);

  const reload = () => {
    setLoading(true);
    const from = days[0]!.toISOString();
    const to = new Date(
      days[days.length - 1]!.getTime() + 24 * 3600_000,
    ).toISOString();
    void fetchShowBookings(from, to).then((r) => {
      setBookings(r.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    if (isOpen) {
      reload();
    }
  }, [isOpen, monthCursor]);

  const bookingsByDay = useMemo(() => {
    const map = new Map<string, StudioShowBooking[]>();
    for (const b of bookings) {
      const key = new Date(b.startAt).toDateString();
      const list = map.get(key) ?? [];
      list.push(b);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startAt.localeCompare(b.startAt));
    }
    return map;
  }, [bookings]);

  const today = new Date();
  const selectedKey = selectedDate.toDateString();
  const selectedBookings = bookingsByDay.get(selectedKey) ?? [];
  const endOfSelectedDay = new Date(selectedDate);
  endOfSelectedDay.setHours(23, 59, 59, 999);
  const isPastDay = endOfSelectedDay.getTime() < Date.now();

  const book = async () => {
    setMsg(null);
    const start = combineDateAndTime(selectedDate, startTime);
    if (!start) {
      setMsg('Enter a valid start time.');
      return;
    }
    const end = new Date(start.getTime() + durationHours * 3600_000);
    setBusy(true);
    const r = await createShowBooking({
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      note: note.trim() || undefined,
      showType,
    });
    setBusy(false);
    if (!r.ok) {
      setMsg(r.error);
      return;
    }
    setNote('');
    setMsg(
      `Booked ${durationHours}h — ${start.toLocaleString([], {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}.`,
    );
    reload();
    onBooked?.();
  };

  return (
    <Dialog.Root isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <Dialog.Title>Tahti Radio schedule</Dialog.Title>
      <Dialog.Description>
        Community slot calendar — book time to broadcast on Tahti Radio.
      </Dialog.Description>

      <div className="mt-4 flex items-center justify-between">
        <Button
          size="icon-sm"
          variant="text"
          aria-label="Previous month"
          onClick={() =>
            setMonthCursor(
              (m) => new Date(m.getFullYear(), m.getMonth() - 1, 1),
            )
          }
        >
          <ChevronLeftIcon size={16} aria-hidden />
        </Button>
        <div className="text-sm font-semibold">
          {monthCursor.toLocaleDateString([], {
            month: 'long',
            year: 'numeric',
          })}
        </div>
        <Button
          size="icon-sm"
          variant="text"
          aria-label="Next month"
          onClick={() =>
            setMonthCursor(
              (m) => new Date(m.getFullYear(), m.getMonth() + 1, 1),
            )
          }
        >
          <ChevronRightIcon size={16} aria-hidden />
        </Button>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="text-foreground-secondary py-1 text-center text-[11px] font-semibold tracking-wide uppercase"
          >
            {label}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = day.getMonth() === monthCursor.getMonth();
          const dayBookings = bookingsByDay.get(day.toDateString()) ?? [];
          const isToday = isSameDay(day, today);
          const isSelected = isSameDay(day, selectedDate);
          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => setSelectedDate(day)}
              className={`flex flex-col items-center gap-1 rounded-md py-1.5 text-sm ${
                isSelected
                  ? 'bg-primary text-foreground'
                  : inMonth
                    ? 'hover:bg-background-secondary'
                    : 'text-foreground-secondary hover:bg-background-secondary opacity-40'
              } ${isToday && !isSelected ? 'ring-primary ring-1' : ''}`}
            >
              <span className="tabular-nums">{day.getDate()}</span>
              <span
                className={`h-1 w-1 rounded-full ${
                  dayBookings.length > 0
                    ? isSelected
                      ? 'bg-background'
                      : 'bg-primary'
                    : 'bg-transparent'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="border-border mt-4 flex flex-col gap-3 border-t pt-3">
        <div className="text-sm font-semibold">
          {selectedDate.toLocaleDateString([], {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </div>

        {loading ? (
          <p className="text-foreground-secondary text-sm">Loading…</p>
        ) : selectedBookings.length === 0 ? (
          <p className="text-foreground-secondary text-sm">
            No slots booked yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5">
            {selectedBookings.map((b) => (
              <li
                key={b.id}
                className="border-border flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm"
              >
                {b.showType === 'TALK' ? (
                  <MessageCircleIcon
                    size={14}
                    aria-hidden
                    className="text-foreground-secondary shrink-0"
                  />
                ) : (
                  <MicIcon
                    size={14}
                    aria-hidden
                    className="text-foreground-secondary shrink-0"
                  />
                )}
                <span className="text-foreground-secondary shrink-0 tabular-nums">
                  {formatTimeRange(b.startAt, b.endAt)}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {b.note ?? b.displayName}
                  {b.isMine ? ' (you)' : ''}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!user ? (
          <p className="text-foreground-secondary text-sm">
            <Link
              to="/login"
              onClick={onClose}
              className="text-foreground underline-offset-2 hover:underline"
            >
              Sign in
            </Link>{' '}
            to book a slot.
          </p>
        ) : isPastDay ? (
          <p className="text-foreground-secondary text-sm">
            Pick a day from today onward to book.
          </p>
        ) : (
          <div className="bg-background-secondary flex flex-col gap-3 rounded-lg p-3">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-foreground-secondary text-xs uppercase">
                  Start
                </span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="border-border bg-background rounded-md border px-3 py-2"
                />
              </label>
              <div
                className="border-border flex gap-1 rounded-lg border p-1"
                role="group"
                aria-label="Duration"
              >
                {Array.from(
                  { length: SHOW_SLOT_MAX_HOURS },
                  (_, i) => (i + 1) as 1 | 2,
                ).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setDurationHours(h)}
                    aria-pressed={durationHours === h}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase ${
                      durationHours === h
                        ? 'bg-primary text-foreground'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
              <div
                className="border-border flex gap-1 rounded-lg border p-1"
                role="group"
                aria-label="Show type"
              >
                {(
                  [
                    ['LIVE_SET', 'Live set', MicIcon] as const,
                    ['TALK', 'Talk', MessageCircleIcon] as const,
                  ] as const
                ).map(([type, label, Icon]) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setShowType(type)}
                    aria-pressed={showType === type}
                    className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold tracking-wide uppercase ${
                      showType === type
                        ? 'bg-primary text-foreground'
                        : 'text-foreground-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon size={13} aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <Input
              label="Note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Friday Frequency"
            />
            <Button size="sm" disabled={busy} onClick={() => void book()}>
              {busy ? 'Booking…' : `Book ${durationHours}h slot`}
            </Button>
          </div>
        )}

        {msg && (
          <p className="text-sm" role="status">
            {msg}
          </p>
        )}
      </div>

      <Dialog.Actions>
        <Dialog.Close>Close</Dialog.Close>
      </Dialog.Actions>
    </Dialog.Root>
  );
}
