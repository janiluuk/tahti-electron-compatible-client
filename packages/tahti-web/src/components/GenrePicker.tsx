import { CreatableCombobox } from '@nuclearplayer/ui';

import { capitalizeGenre, MAX_GENRES, PRESET_GENRES } from '../lib/genres';

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
};

/** Chip picker capped at MAX_GENRES — selecting a 6th genre is a no-op
 * until one is removed, rather than silently dropping the oldest pick.
 * Chips cover the presets plus any custom genres already selected (so a
 * previously-typed one still has a clickable, removable chip); the
 * combobox below is only for adding a genre that isn't a chip yet,
 * either an unpicked preset or a freshly-typed one. */
export function GenrePicker({ value, onChange }: Props) {
  const atLimit = value.length >= MAX_GENRES;
  const extras = value.filter(
    (g) => !PRESET_GENRES.includes(g as (typeof PRESET_GENRES)[number]),
  );
  const allGenres: string[] = [...PRESET_GENRES, ...extras];
  const addableOptions = allGenres.filter((g) => !value.includes(g));

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

  const addCustom = (typed: string) => {
    const genre = capitalizeGenre(typed);
    if (!genre || atLimit) {
      return;
    }
    if (value.some((g) => g.toLowerCase() === genre.toLowerCase())) {
      return;
    }
    onChange([...value, genre]);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {allGenres.map((genre) => {
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
      {!atLimit && (
        <CreatableCombobox
          label="Add a genre"
          placeholder="Search or type to add a genre…"
          options={addableOptions}
          value=""
          onValueChange={addCustom}
          normalize={capitalizeGenre}
          className="max-w-xs"
        />
      )}
      <p className="text-foreground-secondary text-xs">
        {value.length} / {MAX_GENRES} selected
      </p>
    </div>
  );
}
