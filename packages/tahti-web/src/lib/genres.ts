/** Preset genre list — mirrors ARCHIVE_GENRES in the main tahti repo
 * (packages/shared/src/dto/archive-metadata.ts), the same set archive
 * items pick from. Genres are stored as a comma-joined string (see
 * DiscoveryPrefs.genreTags / the backend's socialLinks.genres bag). */
export const PRESET_GENRES = [
  'Electronic',
  'House',
  'Techno',
  'Trance',
  'Drum & Bass',
  'Dubstep',
  'Ambient',
  'Hip-Hop',
  'Pop',
  'Rock',
  'Jazz',
  'Classical',
  'Podcast',
  'Other',
] as const;

export const MAX_GENRES = 5;

export function parseGenreTags(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  return value
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);
}

export function formatGenreTags(genres: string[]): string {
  return genres.join(', ');
}

/** Maps free-text genre tags onto the picker's preset list: matches
 * case-insensitively, dedupes, and drops anything that isn't a preset
 * (older data may have free-typed genres, or different casing, from
 * before the picker existed) -- otherwise a legacy tag like "ambient"
 * would sit in the value array occupying a cap slot with no visible,
 * clickable chip a user could ever remove it with. */
export function normalizeGenresForPicker(raw: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const tag of raw) {
    const preset = PRESET_GENRES.find(
      (g) => g.toLowerCase() === tag.trim().toLowerCase(),
    );
    if (preset && !seen.has(preset)) {
      seen.add(preset);
      out.push(preset);
    }
    if (out.length >= MAX_GENRES) {
      break;
    }
  }
  return out;
}
