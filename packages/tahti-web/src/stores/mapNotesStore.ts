import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type MapNotesState = {
  /** User notes keyed by map case id (`MapCase.id`). */
  notesByCaseId: Record<string, string>;
  setNote: (caseId: string, note: string) => void;
};

export const useMapNotesStore = create<MapNotesState>()(
  persist(
    (set) => ({
      notesByCaseId: {},
      setNote: (caseId, note) =>
        set((s) => {
          const next = { ...s.notesByCaseId };
          const trimmed = note.trimEnd();
          if (trimmed.length === 0) {
            delete next[caseId];
          } else {
            next[caseId] = note;
          }
          return { notesByCaseId: next };
        }),
    }),
    {
      name: 'tahti-web-map-notes',
      partialize: (s) => ({ notesByCaseId: s.notesByCaseId }),
    },
  ),
);
