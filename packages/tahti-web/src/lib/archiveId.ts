/** Extract archive item UUID from playable / queue ids like `archive:<id>`. */
export function archiveItemIdFromPlayableId(
  id: string | null | undefined,
): string | null {
  if (!id) {
    return null;
  }
  if (id.startsWith('archive:')) {
    const rest = id.slice('archive:'.length);
    return rest || null;
  }
  // bare uuid-ish archive ids from studio tables
  if (/^[0-9a-f-]{8,}$/i.test(id) && !id.includes(':')) {
    return id;
  }
  return null;
}
