# tahti-dark theme worklog — apply the tahti.live pitch interface as a first-class theme

Source: full agent brief pasted 2026-08-17 (kept verbatim in git history of this
file's first commit). This file breaks that brief into phases so it can be
picked up incrementally, one phase at a time, the same way
[UI-REDESIGN-WORKLOG.md](./UI-REDESIGN-WORKLOG.md) tracks the page-by-page
redesign: **one phase → do it → screenshot/verify → wait for approval →
next phase.** Do not start a phase until the previous one is checked off.

## Standing design principle (applies to every phase below, not just once)

**Audio editors, waveforms, and any transport/mixing UI must stay minimal,
simple, and scoped to a single use case per view.** Before adding a control,
ask what job this specific view is doing — if a field, tab, or affordance
isn't needed for *that* job, it does not belong on this surface; split it
into an "Advanced" tab, a secondary view, or drop it. This is the same
discipline already applied in the artist Music/track-editor redesign (tabbed
panel, only title required to publish) — carry it into every themed
primitive and every surface touched in Phase 5, especially the Waveform
primitive and the Go Live / audio editor surfaces. A themed waveform is
still a waveform someone has to read at a glance; don't let re-skinning
become an excuse to add chrome.

## The golden rule

Reskin through the theme system, never around it. Every colour, font,
radius, spacing step, and shadow must come from a named design token defined
in `@nuclearplayer/ui` / the `themes` package. This is a new **theme**,
not CSS sprinkled onto components. Failure conditions (any one of these
means a phase isn't done):

- A raw hex colour appears anywhere in `packages/tahti-web` component code,
  JSX `style=`, or Tailwind arbitrary values (`bg-[#...]`).
- The look comes from editing individual components' inline styles instead
  of tokens + themed primitives.
- The Nuclear desktop player theme breaks, or its existing themes are
  removed — `tahti-dark` is additive and selectable alongside them.
- `pnpm lint`, `pnpm type-check`, `pnpm test`, or Storybook fail.

---

## Phase 0 — Prerequisite: land the reference file

- [x] Add the pitch reference at
      `packages/tahti-web/docs/redesign-reference/tahti-live-pitch.html`.
      Landed 2026-08-17 (from the user's local `~/Downloads`).

**Status:** done.

## Phase 1 — Discovery (read-only, no code changes)

Read and produce a short findings note — paste it back before any editing
starts in Phase 2:

- [ ] `AGENTS.md` (repo root) — commands, package layout, code style, testing.
- [ ] `.agents/skills/` — components + host-pattern skills; treat as the
      authority for how UI gets built/modified here.
- [ ] `packages/ui/` (`@nuclearplayer/ui`) — locate the token definitions and
      theme mechanism. Answer explicitly:
      - How are tokens defined (CSS variables? TS token object? Tailwind v4
        `@theme`? a `ThemeProvider`)?
      - What semantic token names already exist (background, surface,
        border, text, primary/accent, success, danger, radii, spacing, font
        families)? New work maps onto these — it doesn't invent parallel
        names.
      - How is a theme registered and switched at runtime?
- [ ] `packages/themes` — how existing themes (incl. channel-designer
      presets like "Aurora") are declared; confirm the exact file/format
      `tahti-dark` belongs in.
- [ ] `packages/tahti-web/` — `README.md`, `FEATURES.md`, route/surface
      structure; where the app selects/loads a theme; where global styles
      live.
- [ ] Run `pnpm install`, then `VITE_FORCE_MOCK=1 pnpm dev:tahti` (login
      `demo@tahti.live` / any password) to see every surface on mock data.
      Also run `pnpm storybook`.

**Deliverable:** bullet list naming the exact token file(s), the
theme-registration API, the theme names that already exist, and the file
where `tahti-dark` will be added. Do not proceed to Phase 2 until the Phase 2
token table below has been confirmed against these *real* names.

**Findings (2026-08-17):**

- **Token mechanism:** plain CSS custom properties on `:root`, defined once
  in `packages/tailwind-config/global.css`, then re-exported as Tailwind v4
  `@theme` entries (`--color-background: var(--background)`, etc.) so
  utilities like `bg-background` / `text-foreground` / `text-primary`
  resolve to the CSS vars. Colours are OKLCH, not hex.
- **Real semantic token names already in use** (map onto these, don't invent
  parallel ones): `--background` / `--background-secondary` /
  `--background-input`, `--foreground` / `--foreground-secondary` /
  `--foreground-input`, `--primary`, `--border` / `--border-input` (see gap
  below) / `--ring`, `--accent-{green,yellow,purple,blue,orange,cyan,red}`,
  `--shadow-color` / `--shadow-x` / `--shadow-y` / `--shadow-blur`,
  `--radius-sm` / `--radius-md` / `--radius-lg`, `--font-family` (sans) /
  `--font-family-heading` / `--font-family-mono`, `--font-weight-normal` /
  `-bold` / `-extra-bold`.
- **Dark mode vs. named theme are two independent attributes:** `[data-theme='dark']`
  toggles light/dark (a Tailwind `@custom-variant dark`, global.css:5) and
  `[data-theme-id='nuclear:xxx']` selects a *named* theme
  (`packages/themes/src/basic/*.css`); a named theme's CSS only overrides
  the subset of vars it wants to change, for both
  `[data-theme-id='x']` (light) and `[data-theme-id='x'][data-theme='dark']`
  (dark) — see `aurora.css` as the reference pattern. Both attributes live on
  `document.documentElement`.
- **Theme registration/switching API:** `@nuclearplayer/themes`
  (`packages/themes/src/index.ts` + `basic/index.ts`) exports
  `BUILTIN_BASIC_THEME_IDS` (id list) and a `BUILT_INS: BasicThemeMeta[]`
  array (id/name/4-swatch palette for the picker UI) — both need a new
  entry. Switching happens via `setBasicTheme(id)` →
  `document.documentElement.setAttribute('data-theme-id', id)`. `tahti-web`
  wraps this in its own `src/stores/themeStore.ts` (zustand, persisted to
  localStorage as `tahti-web-theme`), whose own `DEFAULT_THEME_ID =
  'nuclear:default'` constant is *also* what needs updating to make
  `tahti-dark` the tahti-web default (two defaults to change, not one:
  `packages/themes`' registry default stays `nuclear:default` for the
  Nuclear desktop player; `tahti-web`'s store default becomes
  `tahti-dark`).
- **Exact files for Phase 2:**
  - New `packages/themes/src/basic/tahti-dark.css` (sibling of
    `aurora.css`/`ember.css`/`lagoon.css`/`arctic-moss.css`).
  - Register it: `packages/themes/src/index.ts` (CSS import + `BUILT_INS`
    entry) and `packages/themes/src/basic/index.ts`
    (`BUILTIN_BASIC_THEME_IDS`).
  - Default-for-tahti-web: `packages/tahti-web/src/stores/themeStore.ts`'s
    `DEFAULT_THEME_ID`.
  - Channel-designer preset list: not yet located — search
    `packages/tahti-web/src/views` for the channel-designer visual-preset
    picker before starting Phase 4 (separate from the OS-level theme
    switcher above; likely a different, tahti-web-only concept).
- **Two real gaps to resolve in Phase 2, not invented here:**
  1. `--color-border-input: var(--border-input)` is declared in the
     `@theme` block but `--border-input` is **never actually defined** in
     `:root` or `[data-theme='dark']` — pre-existing gap, not something
     `tahti-dark` broke. Give it a value for `tahti-dark` and flag it
     upstream; don't silently rely on it falling back to nothing.
  2. **Shadow/radius vocabulary mismatch.** Nuclear's existing look is
     neobrutalist: flat 0-blur offset shadows (`--shadow-x/y` + hard
     `--border`, no blur) and 3 generic radii (`sm/md/lg` = 4/8/12px). The
     pitch wants soft blurred elevation (`shadow-float: 0 24px 60px -30px
     rgba(0,0,0,.8)`) and 4 *purpose-named* radii (card 16 / control 10 /
     input 8 / pill 20). These aren't the same token shape — Phase 2 needs
     to decide whether `tahti-dark` introduces new
     `--shadow-float`/`--radius-card`/`--radius-control`/`--radius-pill`
     tokens onto the shared schema (with sane defaults for the other 4
     themes, per the golden rule) or reuses `radius-lg`≈card /
     `radius-md`≈control / `radius-sm`≈input and drops the pill/float
     concepts into `tahti-dark`'s own CSS only. Recommend the former (new
     schema tokens with defaults everywhere) since the brief explicitly
     asks for `radius-pill`/`shadow-float` as named tokens, not favours.
  3. **Fonts are not yet theme-scoped anywhere in this codebase** — the
     three `--font-family*` vars are set once, globally, in `:root`, with
     no per-`data-theme-id` override in any existing `basic/*.css`. Adding
     Space Grotesk/Inter/IBM Plex Mono as `tahti-dark`-only fonts is new
     territory (not a "map onto an existing pattern" job) — Phase 2 should
     scope this as: can `--font-family` etc. be overridden inside
     `tahti-dark.css` the same way colour vars are (should just work, CSS
     custom properties don't care that no one's done it yet), plus the
     self-hosted-fallback font loading mechanism still needs locating.

**Status:** discovery done. Ready for Phase 2 — the three gaps above are
this phase's actual output and need a decision before token authoring
starts, not a blocker on doing Phase 2 itself.

## Phase 2 — Token schema + fonts

Encode the pitch's values as the `tahti-dark` theme, using the **real** token
names found in Phase 1 (map onto them — don't invent a parallel set).

**Colour** (pitch name → hex → semantic role):

| Token | Hex | Semantic role |
|---|---|---|
| ink | `#0A0E1A` | app background / base |
| ink-2 | `#0D1223` | recessed background (inputs, wells) |
| panel | `#151B2E` | surface / card |
| panel-2 | `#1E2640` | raised surface / hover / control bg |
| line | `#2A3352` | border / divider |
| line-2 | `#38426B` | strong border / focus ring base |
| text | `#F5F7FC` | text primary |
| muted | `#9AA3BA` | text secondary |
| faint | `#6C7590` | text tertiary / captions |
| amber | `#FFB020` | primary / accent / interactive / "on air" |
| amber-dark | `#E8930A` | accent pressed / gradient end |
| ink (on amber) | `#0A0E1A` | text/icon colour on amber fills |
| teal | `#35D6C4` | secondary / success / "signal" |
| coral | `#FF6B5A` | danger / warning |
| violet | `#8AA0FF` | auxiliary data series only |

Rules: one bold accent (amber) on a dark ink base; everything else stays
quiet. Text on any amber fill is always ink, never white. Teal is secondary
signal (sparing use); coral is destructive/error only; violet is
data-series only.

**Typography:**

| Role | Family | Use |
|---|---|---|
| display | Space Grotesk | headings, wordmark, numeric stats |
| body | Inter | paragraphs, controls, most UI |
| mono | IBM Plex Mono | eyebrows/kickers, labels, data, timestamps, stream keys, "callsign" text |

Mono eyebrow (small, uppercase, ~0.2em tracking, amber) is identity —
section labels and technical fields only, never body copy. Load fonts
through the app's existing font mechanism; add self-hosted fallbacks for
offline.

**Shape / spacing / motion:**

| Token | Value | Role |
|---|---|---|
| radius-card | 16px | cards, panels, mockup windows |
| radius-control | 10px | buttons, tabs |
| radius-input | 8px | fields |
| radius-pill | 20px | pills, ON AIR badge |
| shadow-float | `0 24px 60px -30px rgba(0,0,0,.8)` | elevated windows/cards |
| space scale | 4 / 8 / 12 / 16 / 22 / 28 / 44 / 64 / 96 | generous whitespace |
| motion | scroll-reveal fade+rise, on-air pulse, waveform animation | gate all of it behind `prefers-reduced-motion` |

- [ ] Add `tahti-dark` to the `themes` package in the Phase-1-confirmed
      format; populate every semantic token from the tables above.
- [ ] If a semantic slot has no pitch value, derive from the nearest role —
      never introduce an un-tokened colour.
- [ ] If the token schema is missing a slot this needs (e.g. a distinct
      "signal/secondary" role beyond success), add it to the schema in
      `@nuclearplayer/ui` and give **every** existing theme a sensible
      default so nothing else breaks.
- [ ] Wire fonts through the design system's typography tokens/config.
- [ ] If Tailwind is in use, expose the Tahti colours as Tailwind theme
      colours/CSS variables (`bg-surface`, `text-accent`, …) — no arbitrary
      hex utilities.

**Status:** not started. Depends on Phase 1.

## Phase 3 — Themed primitives + Storybook stories

Reminder: apply the standing minimalism principle above here first — these
primitives are what every surface in Phase 5 will inherit its restraint (or
its clutter) from.

Add to `@nuclearplayer/ui` (or tahti-web shared components, whichever Phase 1
found to be the actual pattern), all token-driven and reduced-motion aware,
each with a Storybook story:

- [ ] **Eyebrow** — mono, uppercase, tracked, accent colour.
- [ ] **OnAirBadge** — pill + pulsing dot; static when
      `prefers-reduced-motion`.
- [ ] **Waveform** — renders N bars from a colour-token prop; `animated`
      prop; used for banners, hero texture, and the live indicator.
      Deterministic option for SSR/screenshot stability. Single-purpose per
      placement — a banner waveform is decoration, a live-indicator
      waveform is a status signal; don't merge their responsibilities into
      one over-configurable component.
- [ ] **StatNumber** — display face, large, accent — for "0%" / payout-style
      figures.
- [ ] Confirm base `Card`, `Button`, `Tabs`, `Field`/`Input`, `Pill`
      primitives consume the new tokens (radii, surfaces, borders, focus
      ring) so surfaces reskin themselves once primitives are right.

**Status:** not started. Depends on Phase 2.

## Phase 4 — Make `tahti-dark` selectable

- [ ] `tahti-dark` is the default theme for `tahti-web`.
- [ ] `tahti-dark` is available in the channel-designer preset list.
- [ ] All Nuclear player themes remain intact and switchable.

**Status:** not started. Depends on Phase 2–3.

## Phase 5 — Apply across surfaces (tokens/primitives only, no one-offs)

Walk every surface in the `tahti-web` README, confirm each reads from the
theme. Tone: clean, minimal chrome, generous spacing, one amber accent —
and, per the standing principle above, **each surface shows only what that
surface's single job needs**; push everything else behind an Advanced
disclosure or a separate view rather than keeping it visible by default.

**Listener surfaces:** Listen home/directory · Channel (live + archive +
chat rail) · Tahti Radio · profiles/collections · Fan subscribe
(Supporter/Patron tiers — amber primary CTA, ink text on amber).

**Studio surfaces:** Studio home · Go Live (Connect → Live → Multistream;
mono for RTMP/stream-key fields; ON AIR state) · library/upload · releases ·
playlists & albums · Channel designer (expose `tahti-dark` as a preset) ·
schedule · stats · revenue.

Per surface, verify: no raw hex; amber is the only strong accent; mono used
for labels/data; spacing matches the reference; focus states are visible;
waveform/ON AIR primitives appear only where a live signal is actually
implied (not decoratively everywhere).

- [ ] Match the existing capture set in `docs/redesign-shots/` (currently 72
      files) so before/after is comparable — same filenames/framing where a
      shot already exists for that surface.

**Status:** not started. Depends on Phase 3–4. This is the largest phase —
consider splitting listener vs. studio surfaces into two worklog passes
rather than one giant commit.

## Phase 6 — Guardrails check

- [ ] Accessibility: text on ink ≥ 4.5:1 (amber/text/muted should pass —
      verify any new pairing). Text on amber is always ink. Visible keyboard
      focus using the `line-2`/amber ring token.
- [ ] `prefers-reduced-motion` honoured for pulse, waveform, and reveal
      animations.
- [ ] Nuclear desktop player themes remain intact; every token-schema
      addition has a default in all existing themes; no removed exports.
- [ ] AGPL-3.0 headers kept; no proprietary assets or non-free fonts added.
- [ ] Scope held to visual/theme layer — no API/routing/chat/Stripe logic
      changes. If a surface genuinely needs structural change to look
      clean, note it here rather than silently rewiring behaviour.
- [ ] i18n strings untouched (Crowdin) — no hardcoded user-facing strings
      introduced while restyling.

**Status:** not started. Depends on Phase 5.

## Phase 7 — Verification

Run and paste output for:

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm storybook          # new primitives render in all themes
VITE_FORCE_MOCK=1 pnpm dev:tahti   # eyeball every surface on mock data
```

Then prove the golden rule with a grep — both must return nothing (allowed
only inside theme/token definition files):

```bash
# hex colours outside the theme layer
grep -RInE '#[0-9a-fA-F]{3,8}\b' packages/tahti-web/src \
  | grep -vE '(themes?|tokens?|\.theme\.|design-tokens)'

# Tailwind arbitrary colour utilities
grep -RInE '(bg|text|border|from|to|via|fill|stroke)-\[#' packages/tahti-web/src
```

Manual acceptance checklist:

- [ ] `tahti-dark` exists in `themes`, built from the Phase 2 tokens, default
      for `tahti-web`.
- [ ] Every colour/font/radius resolves from a token; both greps above are
      clean.
- [ ] Eyebrow, OnAirBadge, Waveform, StatNumber exist with stories,
      token-driven, reduced-motion aware.
- [ ] All README surfaces reskinned; amber is the only strong accent; mono
      used for labels/data.
- [ ] Nuclear desktop player still builds; its themes still work.
- [ ] lint / type-check / test / storybook all green.
- [ ] Refreshed captures added to `docs/redesign-shots/` matching the
      existing set.

**Status:** not started. Depends on Phase 6.

## Phase 8 — Commit / land

- [ ] Small, reviewable commits in this order: (1) token schema + fonts,
      (2) `tahti-dark` theme, (3) primitives + stories, (4) surface-by-surface
      application, (5) screenshots + docs.
- [ ] Follow `AGENTS.md` commit/style conventions.
- [ ] If opening a PR: link the pitch reference, list the token→semantic
      mappings, paste the clean grep output as proof of no hardcoded colour.
      **Do not open a PR against `nukeop/nuclear`** — see `TAHTI.md`.

**Status:** not started. Depends on Phase 7 passing.

---

### Working notes

- This repo's working tree is currently shared across multiple concurrent
  Claude Code sessions (confirmed 2026-08-17 — see git stash entries and
  cross-session coordination in this session's history). Whoever picks up a
  phase here should commit (or stash) before running any build/deploy step,
  since a `vite build` picks up whatever is uncommitted on disk at that
  moment, not just that session's own diff.
- Treat each phase's checkbox list as the literal Definition of Done for
  that phase — don't start the next phase's checkboxes until the current
  one's are all checked and screenshotted/approved, same discipline as
  `UI-REDESIGN-WORKLOG.md`.
