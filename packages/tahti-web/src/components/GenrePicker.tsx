import { MAX_GENRES, PRESET_GENRES } from '../lib/genres';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

/** Chip picker capped at MAX_GENRES — selecting a 6th genre is a no-op
 * until one is removed, rather than silently dropping the oldest pick. */
export function GenrePicker({ value, onChange }: Props) {
  const atLimit = value.length >= MAX_GENRES;

  const toggle = (genre: string) => {
    if (value.includes(genre)) {
      onChange(value.filter((g) => g !== genre));
      return;
    }
    if (atLimit) {
      return;
    }
    onChange([...value, genre]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {PRESET_GENRES.map((genre) => {
          const active = value.includes(genre);
          const disabled = !active && atLimit;
          return (
            <button
              key={genre}
              type="button"
              disabled={disabled}
              aria-pressed={active}
              onClick={() => toggle(genre)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? 'border-primary bg-primary/15 text-primary'
                  : disabled
                    ? 'border-border text-foreground-secondary/50 cursor-not-allowed'
                    : 'border-border text-foreground-secondary hover:text-foreground'
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>
      <p className="text-foreground-secondary text-xs">
        {value.length} / {MAX_GENRES} selected
      </p>
    </div>
  );
}
