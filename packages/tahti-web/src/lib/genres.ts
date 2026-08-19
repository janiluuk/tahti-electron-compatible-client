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
