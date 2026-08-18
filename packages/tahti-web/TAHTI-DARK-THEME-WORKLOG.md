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

- [x] Add `tahti-dark` to the `themes` package in the Phase-1-confirmed
      format; populate every semantic token from the tables above. —
      `packages/themes/src/basic/tahti-dark.css`, all hex converted to
      OKLCH via `culori` (already a repo dependency) for exact-match colour
      to the pitch. Single unconditional `:root[data-theme-id='nuclear:tahti-dark']`
      block (no separate light variant — the pitch has none).
- [x] If a semantic slot has no pitch value, derive from the nearest role —
      never introduce an un-tokened colour. — `accent-yellow`/`accent-orange`
      → amber/amber-dark, `accent-blue` → violet, `accent-cyan` → teal, so
      every existing accent slot still resolves to a pitch colour.
- [x] If the token schema is missing a slot this needs, add it and give
      **every** existing theme a sensible default. — done as a separate
      commit before this one: `radius-{card,control,input,pill}` +
      `shadow-float` added to `packages/tailwind-config/global.css`'s
      `@theme` + `:root`, defaulted onto the closest existing value for
      Default/Aurora/Ember/Lagoon/Moss. Also fixed the pre-existing
      `--border-input` gap found in Phase 1.
- [x] Wire fonts through the design system's typography tokens/config. —
      `--font-family` (Inter) / `--font-family-heading` (Space Grotesk) /
      `--font-family-mono` (IBM Plex Mono) overridden in `tahti-dark.css`
      exactly like colour vars; resolves through the existing `font-sans`
      / `font-heading` / `font-mono` Tailwind utilities. **Not done:**
      self-hosted font-file fallbacks — currently relies on whatever font
      loading the browser/OS provides; Google Fonts CDN loading (used by
      the pitch reference itself) was not wired in, per "no proprietary
      assets" caution and because Phase 1 didn't locate an existing
      font-loading mechanism to hook into.
- [x] Tahti colours exposed as Tailwind theme colours/CSS variables — no
      arbitrary hex utilities. Verified live: `bg-primary`, `text-primary`,
      `border-primary`, `bg-background-input`, `rounded-pill` all resolve
      correctly with `tahti-dark` active (see Phase 3 smoke-test
      screenshot).

**Status:** done, verified live (dev server + Playwright: body background,
card borders, nav highlight all render the pitch palette; theme picker
shows "Tahti" with the correct 4-swatch preview).

## Phase 3 — Themed primitives + Storybook stories

Reminder: apply the standing minimalism principle above here first — these
primitives are what every surface in Phase 5 will inherit its restraint (or
its clutter) from.

Add to `@nuclearplayer/ui` (or tahti-web shared components, whichever Phase 1
found to be the actual pattern), all token-driven and reduced-motion aware,
each with a Storybook story:

- [x] **Eyebrow** — mono, uppercase, tracked, accent colour. —
      `packages/tahti-web/src/components/tahti/Eyebrow.tsx`.
- [x] **OnAirBadge** — pill + pulsing dot; static when
      `prefers-reduced-motion`. — `.../tahti/OnAirBadge.tsx`, uses the new
      `rounded-pill` utility from Phase 2; pulse is Tailwind's
      `motion-safe:` variant, so it's inert under reduced-motion with zero
      extra JS.
- [x] **Waveform** — renders N bars from a colour-token prop; `animated`
      prop; deterministic (seeded, not `Math.random()`) so a given
      `(bars, seed)` renders identically every time — SSR/screenshot
      stable. — `.../tahti/Waveform.tsx`. Needs an explicit-height parent
      or its own height class to render (percentage bar heights don't
      resolve against an auto-height flex row) — defaults to `h-10`;
      found and fixed via live smoke test, not just typecheck.
- [x] **StatNumber** — display face, large, accent. — `.../tahti/StatNumber.tsx`.
- [x] Confirm base `Card`, `Button`, `Tabs`, `Field`/`Input`, `Pill`
      primitives consume the new tokens (radii, surfaces, borders, focus
      ring). — Checked `Card.tsx` directly: the amber card fill seen in
      the Phase 2 live screenshot is **not a bug and not tahti-dark's
      doing** — `Card`'s outer wrapper has hardcoded `bg-primary` (line
      54), which is Nuclear's existing neobrutalist design applied
      identically across *all six* themes (Default/Aurora/Ember/Lagoon/
      Moss/Tahti), already token-driven (`bg-primary`, not a hardcoded
      hex — passes the golden rule). It is a genuine **design tension**
      worth a decision, not a defect: the pitch wants amber reserved for
      a single strong accent, while Nuclear's Card design paints every
      card face amber-filled regardless of theme. Left as-is here since
      changing it is a cross-theme, cross-app structural change (every
      Card usage, every theme) outside a single theme addition's scope —
      per the brief's own guardrail ("if a surface needs structural
      change to look clean, note it — don't silently rewire behaviour").
      **Decision needed from here:** either accept Card's fill as part of
      Nuclear's identity that `tahti-dark` inherits, or take on a
      separate follow-up to make Card's fill theme-configurable
      (e.g. a `variant="outline"` alongside the current filled default).

**Storybook stories: not done.** Phase 1 didn't establish whether
`tahti-web`-local components (as opposed to `@nuclearplayer/ui`) are wired
into the shared Storybook config at all — adding stories blind risked
either not rendering or needing unplanned Storybook config changes. Placed
these 4 in `tahti-web/src/components/tahti/` (not `@nuclearplayer/ui`)
since they're Tahti-brand-specific, not general Nuclear player chrome —
confirm that placement is right before adding stories.

**Status:** primitives built and live-verified (dev server + Playwright
screenshot: Eyebrow/OnAirBadge/Waveform/StatNumber all render correctly
with `tahti-dark` active). Storybook stories and the base-primitive
token-consumption check are still open.

## Phase 4 — Make `tahti-dark` selectable

- [x] `tahti-dark` is the default theme for `tahti-web`. —
      `themeStore.ts`'s `DEFAULT_THEME_ID` → `'nuclear:tahti-dark'`;
      verified live (`data-theme-id="nuclear:tahti-dark"` on a fresh load,
      no theme previously selected).
- [ ] `tahti-dark` is available in the channel-designer preset list. — it's
      in the OS-level theme switcher (`/settings` → Themes, confirmed
      live) via `BUILTIN_BASIC_THEME_IDS`, but the *channel designer*
      (artist-facing visual-preset picker, a separate tahti-web-only
      concept per the Phase 1 note) hasn't been located/checked yet.
- [x] All Nuclear player themes remain intact and switchable. — verified
      live: Default/Aurora/Ember/Lagoon/Moss all still present and
      selectable in the theme picker alongside the new "Tahti" entry.

**Status:** mostly done — default + OS-level picker confirmed live;
channel-designer preset list still open.

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

**Slices landed so far** (small, single-purpose commits, per the studio
slices already done — Studio home/Go Live/Studio stats/Revenue):

- Channel visualizer preset label → mono.
- Go Live surface → OnAirBadge + mono RTMP fields.
- Studio home section labels → Eyebrow.
- Studio stats summary → StatNumber + Eyebrow.
- Revenue grant estimate → StatNumber.
- Studio panel consistency pass (Moderation/Events/Embeds/Upload + channel
  designer + shared `PageHeader`).
- Tahti Radio on-air/offline indicator → OnAirBadge + Eyebrow; also fixed
  a real golden-rule violation found along the way (`text-amber-500`, a
  stock Tailwind utility bypassing the OKLCH token system, used for the
  offline state) → token-driven `text-accent-red`.
- Listen home library section labels (Favorite channels/tracks, Recently
  played) → Eyebrow.
- Channel page header LIVE badge → OnAirBadge.
- Listen directory channel cards → "Live" fragment of the subtitle now
  `text-primary` (amber), genre/slug text `font-mono`, replacing a plain
  string subtitle. Deliberately *not* the `OnAirBadge` pill here — a
  bordered/padded badge repeated in every tile of a dense card grid is
  exactly the "chrome" the standing minimalism principle warns against;
  colour + mono is enough signal at that density. `ListenView.tsx`.
- Collection page "Linked releases" sub-heading → `Eyebrow`, matching the
  existing h3-level secondary-section idiom used on Listen home (Favorite
  tracks/Recently played), replacing a one-off `font-display text-lg
  font-bold` heading. `CollectionView.tsx`.

  **Verification note on these two:** `eslint`/`tsc --noEmit` both clean.
  Live/Playwright screenshot verification (the norm for every other Phase
  5 slice above) was **not** obtained this pass — the sandbox's Playwright
  Chromium download stalled repeatedly (consistently froze at 8.8MB despite
  a direct `curl` of the same CDN artifact succeeding at ~24MB/s; not a
  general network issue, cause not root-caused, gave up after multiple
  retries) and the Chrome extension bridge for `claude-in-chrome` wasn't
  connected either. Lower risk than the usual live-check requirement since
  every class used (`text-primary`, `font-mono`, `Eyebrow`) is a token/
  primitive already live-verified elsewhere in `tahti-dark` (Phases 2–3) —
  but flagging honestly rather than claiming a screenshot check that didn't
  happen. Get an actual screenshot of `/listen` and a collection page next
  time a working browser is available, before checking Phase 7's manual
  acceptance checklist for these two.

**Still open, listener side:** Channel page beyond the header badge
(archive/chat rail — largest single surface, has a known pre-existing hex
leftover, `bg-[#0B0F14]` on the visualizer hero backdrop, flagged in
Phase 7, not yet fixed), the public artist profile (`/u/$username` →
`ArtistView.tsx`, 640 lines — not yet reviewed for chrome-level theming;
note its per-artist channel-designer brand-accent hex is a separate,
intentional customization system per the Phase 7 finding, not a
golden-rule violation to fix here), Fan subscribe (spot-checked — already
fully token-driven, no violation found, but tier price/CTA not yet given
a deliberate themed treatment).

**Status:** in progress. Depends on Phase 3–4 (done). This is the largest
phase — splitting listener vs. studio surfaces into slices, as suggested
below, rather than one giant commit.

## Phase 6 — Guardrails check

- [x] Accessibility: text on ink ≥ 4.5:1. — Computed (WCAG relative
      luminance formula, not eyeballed): `text` (#F5F7FC) on `ink`
      (#0A0E1A) = **17.96:1**, `muted` (#9AA3BA) on `ink` = **7.63:1**,
      `amber` (#FFB020) on `ink` = **10.53:1**, `ink` text on `amber` fill
      = **10.53:1** — all comfortably pass.
- [x] **Real failure found, not tahti-dark's bug, but tahti-dark makes it
      worse:** `Card.tsx` (`packages/ui/src/components/Card/Card.tsx:54`)
      fills every card with `bg-primary` and renders its title/subtitle
      with generic `text-foreground` (line 108) — there is no dedicated
      "text on primary fill" token anywhere in this codebase. Computed
      contrast for `--foreground` vs `--primary` in **every** dark theme
      variant: Aurora 2.83:1, Ember 2.60:1, Lagoon 3.32:1, Moss 3.02:1,
      **tahti-dark 1.71:1** — all fail 4.5:1, all pre-existing (not
      introduced here), tahti-dark is measurably the worst because amber
      is a lighter hue than the other themes' primaries. This is the same
      root issue as the Phase 3 Card-fill note above. **Not fixed here**
      — the correct fix is a new `--primary-foreground` (or
      `--on-primary`) token added to the shared schema with a real value
      for all six themes, then `Card.tsx` (and anywhere else using
      `text-foreground` on a `bg-primary` surface) switched to it — a
      cross-theme, cross-component change outside a single new theme's
      scope, flagged per the brief's own guardrail rather than silently
      patched.
- [x] Visible keyboard focus — `--ring` set to `amber` in `tahti-dark.css`
      (not `line-2`; `line-2` was the brief's own suggestion but this
      codebase's existing `--ring` token is already what focus rings
      consume, so mapped onto that instead of introducing a second,
      unused ring color — same rationale as "map onto real names" in
      Phase 1/2).
- [x] `prefers-reduced-motion` honoured for pulse, waveform, and reveal
      animations. — `OnAirBadge`/`Waveform` use Tailwind's `motion-safe:`
      variant (automatically wrapped in `@media (prefers-reduced-motion:
      no-preference)`), verified in Phase 3. Scroll-reveal animations
      mentioned in the brief weren't touched by this work (no reveal
      primitive was in scope) — not applicable here, not silently skipped.
- [x] Nuclear desktop player themes remain intact; every token-schema
      addition has a default in all existing themes; no removed exports.
      — Verified live in Phase 4 (all 5 original themes present/selectable
      alongside Tahti); `git diff` on `packages/themes/src/index.ts` and
      `basic/index.ts` confirms additive-only changes, no removed exports.
- [x] AGPL-3.0 headers kept; no proprietary assets or non-free fonts added.
      — Checked: this repo has no per-file SPDX-header convention (`Card.tsx`,
      `aurora.css`, etc. have none either) — licensing is handled at the
      repo-root `LICENSE` (AGPL-3.0) instead, so the new files match
      existing convention as-is, nothing to add. Inter / Space Grotesk /
      IBM Plex Mono are all SIL Open Font License — no proprietary fonts.
- [x] Scope held to visual/theme layer — no API/routing/chat/Stripe logic
      changes. Confirmed: every file touched across Phases 2–4 is CSS,
      theme registration, or a small new presentational component; the
      Card-fill and text-on-primary-contrast findings above were
      deliberately *not* acted on for exactly this reason.
- [x] i18n strings untouched (Crowdin) — no hardcoded user-facing strings
      introduced while restyling in Phases 2–4. (Note: the separate My
      Library debug-text sweep *did* remove/change user-facing strings —
      that was a distinct, explicitly-requested task, not part of this
      theme work, and is out of this worklog's scope.)

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

**Run 2026-08-17** (`packages/tahti-web`, `packages/ui`, `packages/themes`):

- `eslint` on all three packages: **clean, zero output**.
- `tsc --noEmit` on all three packages: **clean, exit 0** for each.
- `pnpm test` / `pnpm storybook` / `VITE_FORCE_MOCK=1 pnpm dev:tahti`: **not
  run** in this pass — this session verified live behaviour directly via a
  scripted Playwright + a real `vite build`/`vite preview` instead (see
  Phases 2–4's "verified live" notes), which is stronger evidence for the
  specific things changed than an unattended `pnpm test` run would be, but
  the actual `test`/`storybook` commands themselves are still unrun and
  should be before calling this phase fully closed.
- **Hex greps — not clean, with a specific reason:**
  - Hex-outside-theme-layer grep: **9 files** still match —
    `channelPageLayout.ts`, `ArtistView.tsx`, `channel-design.ts`,
    `ChannelVisualizer.tsx`, `mock.ts`, `ChannelDesigner.tsx`,
    `ChannelView.tsx`, `SourceServiceIcon.tsx`, `flowDiagrams.ts`. Tailwind
    arbitrary-hex grep: **1 file** (`ChannelView.tsx`, `bg-[#0B0F14]`).
  - **None of these are files this theme work touched** (Phases 2–4's edit
    list is exhaustive: `SettingsPanel*`, `tahti-dark.css`,
    `themes/src/index.ts`, `basic/index.ts`, `themeStore.ts`, the 4
    `tahti/*.tsx` primitives, `global.css`). They pre-date this work.
  - They're a **different, legitimate concept**, not a violation of the
    golden rule as stated: `channel-design.ts` / `channelPageLayout.ts` /
    `ArtistView.tsx` are the **channel-designer brand-accent-preset**
    system (per-artist channel colour customization — the answer to the
    Phase 4 open item "channel-designer preset list not yet located": it's
    a separate, content-level palette picker, not the OS-level Nuclear
    chrome theme this worklog is about). `flowDiagrams.ts`'s hex are
    Mermaid `classDef` colours for diagram styling, not app UI.
    `ChannelView.tsx`'s `bg-[#0B0F14]` looks like a genuine leftover that
    could reasonably move to a token, but doing so wasn't attempted here —
    out of scope for a theme-addition pass, flagged instead of silently
    changed, same discipline as the Card-fill/contrast findings in
    Phase 6.
  - **The grep is clean for every file this work actually added or
    edited** — confirmed by intersecting the two file lists above with
    Phases 2–4's edit list: zero overlap.

Manual acceptance checklist:

- [x] `tahti-dark` exists in `themes`, built from the Phase 2 tokens, default
      for `tahti-web`. — done, live-verified (Phase 4).
- [ ] Every colour/font/radius resolves from a token; both greps above are
      clean. — clean for files this work touched; **not** clean
      repo-wide, for the pre-existing/out-of-scope reasons above.
- [x] Eyebrow, OnAirBadge, Waveform, StatNumber exist,
      token-driven, reduced-motion aware. — **no Storybook stories**
      (documented gap, Phase 3).
- [ ] All README surfaces reskinned; amber is the only strong accent; mono
      used for labels/data. — **not attempted.** Phase 5 (apply across
      every listener/studio surface) was not started in this session;
      only the token/primitive/default work (Phases 2–4) and a guardrails
      pass (Phase 6) were done. This is the single largest remaining
      phase.
- [x] Nuclear desktop player still builds; its themes still work. —
      verified live (Phase 4), plus a real `vite build` succeeded
      (needed anyway to debug the settings-modal mobile fix).
- [x] lint / type-check green (see run above). Test/storybook not run.
- [ ] Refreshed captures added to `docs/redesign-shots/` — not done;
      depends on Phase 5 surfaces actually being reskinned first.

**Status:** partially done. Lint/type-check/greps run for real with honest
results (not assumed clean); `pnpm test`/`storybook`/full manual
surface-by-surface eyeball still open, and Phase 5 itself hasn't started —
that's the next and largest piece of work here.

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
