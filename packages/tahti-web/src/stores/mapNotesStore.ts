import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** Where on `/more` the comment was submitted from. */
export type MapCommentKind = 'case' | 'flow' | 'feature';

export type MapComment = {
  id: string;
  kind: MapCommentKind;
  /** Case id, flow diagram id, or feature name. */
  targetId: string;
  title: string;
  /** Flow pack (`current` / `nuclear`) when kind is `flow`. */
  pack?: string;
  /** Feature matrix label when kind is `feature`. */
  feature?: string;
  text: string;
  submittedAt: string;
};

export type SubmitMapCommentInput = {
  kind: MapCommentKind;
  targetId: string;
  title: string;
  pack?: string;
  feature?: string;
  text: string;
};

function draftKey(kind: MapCommentKind, targetId: string): string {
  return `${kind}:${targetId}`;
}

function newCommentId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `map-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type MapNotesState = {
  /**
   * Live drafts keyed by `kind:targetId`.
   * Legacy case drafts also mirror into `notesByCaseId` for older builds.
   */
  draftsByKey: Record<string, string>;
  /** @deprecated Prefer draftsByKey — kept for localStorage migrate. */
  notesByCaseId: Record<string, string>;
  /** Submitted comments (append-only log, newest first). */
  comments: MapComment[];
  setDraft: (kind: MapCommentKind, targetId: string, text: string) => void;
  getDraft: (kind: MapCommentKind, targetId: string) => string;
  /** Persist a submitted comment; updates the draft to the saved text. */
  submitComment: (input: SubmitMapCommentInput) => MapComment | null;
  clearComments: () => void;
  /** Snapshot of submitted comments (exportable). */
  listComments: () => MapComment[];
};

export const useMapNotesStore = create<MapNotesState>()(
  persist(
    (set, get) => ({
      draftsByKey: {},
      notesByCaseId: {},
      comments: [],
      setDraft: (kind, targetId, text) =>
        set((s) => {
          const key = draftKey(kind, targetId);
          const nextDrafts = { ...s.draftsByKey };
          const nextCases = { ...s.notesByCaseId };
          const trimmed = text.trimEnd();
          if (trimmed.length === 0) {
            delete nextDrafts[key];
            if (kind === 'case') {
              delete nextCases[targetId];
            }
          } else {
            nextDrafts[key] = text;
            if (kind === 'case') {
              nextCases[targetId] = text;
            }
          }
          return { draftsByKey: nextDrafts, notesByCaseId: nextCases };
        }),
      getDraft: (kind, targetId) => {
        const s = get();
        const key = draftKey(kind, targetId);
        if (s.draftsByKey[key] != null) {
          return s.draftsByKey[key]!;
        }
        if (kind === 'case') {
          return s.notesByCaseId[targetId] ?? '';
        }
        return '';
      },
      submitComment: (input) => {
        const text = input.text.trim();
        if (!text) {
          return null;
        }
        const comment: MapComment = {
          id: newCommentId(),
          kind: input.kind,
          targetId: input.targetId,
          title: input.title,
          pack: input.pack,
          feature: input.feature,
          text,
          submittedAt: new Date().toISOString(),
        };
        set((s) => {
          const key = draftKey(input.kind, input.targetId);
          const nextDrafts = { ...s.draftsByKey, [key]: text };
          const nextCases = { ...s.notesByCaseId };
          if (input.kind === 'case') {
            nextCases[input.targetId] = text;
          }
          return {
            draftsByKey: nextDrafts,
            notesByCaseId: nextCases,
            comments: [comment, ...s.comments].slice(0, 200),
          };
        });
        return comment;
      },
      clearComments: () => set({ comments: [] }),
      listComments: () => get().comments,
    }),
    {
      name: 'tahti-web-map-notes',
      version: 2,
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<MapNotesState>;
        const notesByCaseId = p.notesByCaseId ?? {};
        const draftsByKey = { ...(p.draftsByKey ?? {}) };
        for (const [caseId, note] of Object.entries(notesByCaseId)) {
          const key = draftKey('case', caseId);
          if (draftsByKey[key] == null && note) {
            draftsByKey[key] = note;
          }
        }
        return {
          draftsByKey,
          notesByCaseId,
          comments: Array.isArray(p.comments) ? p.comments : [],
        };
      },
      partialize: (s) => ({
        draftsByKey: s.draftsByKey,
        notesByCaseId: s.notesByCaseId,
        comments: s.comments,
      }),
    },
  ),
);

/** Draft key helper for selectors outside the store. */
export function mapDraftKey(kind: MapCommentKind, targetId: string): string {
  return draftKey(kind, targetId);
}
