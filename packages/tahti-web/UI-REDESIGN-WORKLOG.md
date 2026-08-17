# UI redesign worklog — Nuclear (artist + admin)

Page-by-page loop: redesign → screenshot → **wait for comment or `approved`** → next page.

Screenshots: `docs/redesign-shots/{page-slug}-v{n}.png`

Workflow rules: one page at a time; do not advance until user approves.

---

## Artist studio (POC routes)

| # | Page | Route | Status | Shot |
|---|------|-------|--------|------|
| 1 | Studio home | `/studio` | **approved** | `docs/redesign-shots/studio-home-v1.png` |
| 2 | Go Live wizard | `/studio/go-live` | **approved** | `docs/redesign-shots/studio-go-live-v1.png` |
| 3 | Music / Archive (Library) | `/studio/archive` | **approved** | `docs/redesign-shots/studio-archive-v1.png` |
| 4 | Archive item | `/studio/archive/$id` | **approved** | `docs/redesign-shots/studio-archive-item-v1.png` |
| 5 | Upload | `/studio/upload` | **approved** | `docs/redesign-shots/studio-upload-v1.png` |
| 6 | Releases | `/studio/releases` | **approved** | `docs/redesign-shots/studio-releases-v1.png` |
| 7 | Release detail | `/studio/releases/$id` | **approved** | (panels + Save CTA) |
| 8 | Collections / album designer | `/studio/collections` | **approved** | `docs/redesign-shots/studio-collections-v1.png` |
| 9 | Collection editor | `/studio/collections/$slug` | **approved** | |
| 10 | Audio editor list | `/studio/editor` | **approved** | (panels + icon row actions) |
| 11 | Editor project | `/studio/editor/$id` | **approved** | |
| 12 | Schedule | `/studio/schedule` | **approved** | `docs/redesign-shots/studio-schedule-v1.png` |
| 13 | Stats | `/studio/stats` | **approved** | `docs/redesign-shots/studio-stats-v1.png` |
| 14 | Stats detail | `/studio/stats/detail` | **approved** | (panels + range chips) |
| 15 | Channel designer | `/studio/channel` | **approved** | `docs/redesign-shots/studio-channel-v1.png` |
| 16 | Shows | `/studio/shows` | **approved** | `docs/redesign-shots/studio-shows-v1.png` |
| 17 | Show detail / episode review | `/studio/shows/$id`, `…/episodes/$episodeId` | **approved** | |
| 18 | Playlists | `/studio/playlists`, `…/$slug` | **approved** | `docs/redesign-shots/studio-playlists-v1.png` |
| 19 | Updates / newsletter | `/studio/updates` | **approved** | `docs/redesign-shots/studio-updates-v1.png` |
| 20 | Revenue / Connect | `/studio/revenue` | **approved** | `docs/redesign-shots/studio-revenue-v1.png` |
| 21 | Stash | `/studio/stash` | **approved** | `docs/redesign-shots/studio-stash-v1.png` |
| 22 | Sources hub | `/sources` | **approved** | `docs/redesign-shots/sources-v1.png`, `docs/redesign-shots/sources-detail-v1.png` |
| 23 | Settings — account | `/settings/account` | **approved** | already Nuclear shell (no redesign needed) |
| 24 | Settings — artist | `/settings/artist` (etc.) | **approved** | `docs/redesign-shots/settings-artist-v1.png` |
| 25 | Settings — money / fan tiers | `/settings/money` | **approved** | already Nuclear shell (no redesign needed) |
| 26 | Settings — connections | `/settings/connections` | **approved** | already Nuclear shell (no redesign needed) |

## Admin (prod `/admin/*`)

Porting into a Nuclear admin shell, gated on `user.isBoard`. Page-by-page loop, same as artist studio above. Inventory from prod `admin-nav`:

| # | Page | Prod route | Status | Shot |
|---|------|------------|--------|------|
| A1 | Dashboard | `/admin/dashboard` → `/admin` | **approved** | `docs/redesign-shots/admin-dashboard-v1.png`, `…-expanded-v1.png` |
| A2 | Beta applications | `/admin/beta` | **approved** | `docs/redesign-shots/admin-beta-v1.png` |
| A3 | Users | `/admin/users` | **approved** | `docs/redesign-shots/admin-users-v1.png` |
| A4 | Radio | `/admin/radio` | **approved** | `docs/redesign-shots/admin-radio-v1.png` |
| A5 | Radio submissions | `/admin/radio-submissions` | **approved** | `docs/redesign-shots/admin-radio-submissions-v1.png` |
| A6 | News | `/admin/news` | **approved** | `docs/redesign-shots/admin-news-v1.png` |
| A7 | Tahti Selects | `/admin/tahti-selects` | **approved** | `docs/redesign-shots/admin-selects-v1.png` |
| A8 | Streams | `/admin/streams` | **approved** | `docs/redesign-shots/admin-streams-v1.png` |
| A9 | Support | `/admin/support` | **approved** | `docs/redesign-shots/admin-support-v1.png` |
| A10 | Top lists | `/admin/top-lists` | **approved** | `docs/redesign-shots/admin-top-lists-v1.png` |
| A11 | Announcements | `/admin/announcements` | **approved** | `docs/redesign-shots/admin-announcements-v1.png` |
| A12 | Storage | `/admin/storage` | **in-review** | `docs/redesign-shots/admin-storage-v1.png` |
| A13 | Files | `/admin/files` | **in-review** | `docs/redesign-shots/admin-files-v1.png` |
| A14 | Content reports | `/admin/content-reports` | **in-review** | `docs/redesign-shots/admin-content-reports-v1.png` |
| A15 | Financial | `/admin/financial` | **in-review** | `docs/redesign-shots/admin-financial-v1.png` |
| A16 | Governance hub | `/admin/governance` | **in-review** | `docs/redesign-shots/admin-governance-v1.png` |
| A17 | Feature requests | `/admin/feature-requests` | **in-review** | `docs/redesign-shots/admin-feature-requests-v1.png` |
| A18 | Grants | `/admin/grants` | **in-review** | `docs/redesign-shots/admin-grants-v1.png` |
| A19 | AGM | `/admin/agm` | **in-review** | `docs/redesign-shots/admin-agm-v1.png` |
| A20 | Vendors | `/admin/settings/vendors` → `/admin/vendors` | **in-review** | `docs/redesign-shots/admin-vendors-v1.png` |
| A21 | Status | `/admin/status` | **in-review** | `docs/redesign-shots/admin-status-v1.png` |
| A22 | i18n languages + CSV import | (new — see Phase 0) | pending | |

**i18n (Approved):** Admin creates languages + imports English-base CSV — [CUTOVER-PHASE0.md](./CUTOVER-PHASE0.md).

---

## Entries

### 2026-08-12 — Page 1 Studio home v1 (`in-review`)

**Goal:** Nuclear simplicity — group by context; one primary action; hide secondary clutter.

**Changes:**

- Removed flat 13-tile CardGrid + duplicate button row + “full production dashboard” escape hatch on the home surface
- Hero: channel name/state + single **Go Live** CTA
- Three context groups: **Broadcast**, **Music**, **Audience & channel** (primary links only)
- **More tools** disclosure for editor, stash, sources (collapsed by default)
- Dropped API/source jargon from the subtitle
- Kept `StudioNav` for deep navigation on other pages; home relies on groups

**Screenshot:** `docs/redesign-shots/studio-home-v1.png`

**Status:** approved (user: “move with next”).

### 2026-08-12 — Page 2 Go Live wizard v1 (`in-review`)

**Goal:** Simpler Nuclear wizard — clear steps, one job per panel, hide optional multistream noise.

**Changes:**

- Title → **Go Live**; dropped “Broadcast wizard” + API source jargon
- Compact step rail (1 Connect · 2 Live · 3 Multistream) with done ticks
- Connect: credentials + signal status; checklist as compact chips
- Live: single status card + primary actions only
- Multistream: destinations list first; **Add destination** form collapsed until opened
- Weekly usage moved to a quiet footer line

**Screenshot:** `docs/redesign-shots/studio-go-live-v1.png`

**Status:** approved (user: continue worklog).

### 2026-08-12 — Page 3 Music archive v1 (`in-review`)

**Goal:** Catalog list with one primary action; secondary row actions hidden.

**Changes:**

- Header: title + single **Upload** CTA (dropped Sources / Editor clutter)
- Empty state with Upload CTA
- Row: Play + Edit primary; playlist / audio editor / delete under **More**
- Removed API jargon from subtitle
- Shared **StudioNav** slimmed: primary 5 pills + collapsed “More studio tools”

**Screenshot:** `docs/redesign-shots/studio-archive-v1.png` (captured mock Vite + Playwright)

**Status:** approved (user: continue / next slice).

**Note:** Same ship commit (`60f5d875a`) also included artist gallery on profiles (fan-facing; not a studio worklog row).

### 2026-08-12 — Page 5 Upload v1 (`in-review`)

**Goal:** One job — pick file, upload.

**Changes:**

- Human subtitle (no prepare/PUT/complete jargon)
- Filename hint after pick; success → Open in Music only
- Link back to Music

**Screenshot:** `docs/redesign-shots/studio-upload-v1.png` (captured mock Vite + Playwright)

**Status:** approved (user: continue / next slice).

**Shared note:** StudioNav slim (primary 5 + collapsed “More studio tools”) ships with these pages; review on both shots.

### 2026-08-12 — Page 4 Archive item v1 (`in-review`)

**Goal:** One job — edit metadata; hide audio editor until needed.

**Changes:**

- Human subtitle + status/visibility chips (no middle-dot status line)
- Header **Save** as the only primary CTA
- Fields: title, description, genre, public toggle
- **More tools** disclosure for Audio editor

**Screenshot:** `docs/redesign-shots/studio-archive-item-v1.png`

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-12 — Page 6 Releases v1 (`in-review`)

**Goal:** Catalog list with one primary action; create form collapsed.

**Changes:**

- Human subtitle (no API path jargon)
- Header **New release** CTA; create form opens on demand
- Empty state with New release CTA
- Row: Edit primary; public link / distribution under **More**
- Dropped always-visible Distribution button in the header

**Screenshot:** `docs/redesign-shots/studio-releases-v1.png`

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-12 — Shows + Playlists + Channel designer (studio pillars)

**Goal:** Ship the accumulated studio pillars with Nuclear panel depth (padded titles, containers).

**Nav IA:** Primary = Overview · Go Live · Library · Releases · Shows. More = Playlists · Channel designer · Upload · Albums · …

**Shows (`/studio/shows`):**

- Create show (interval chips); episode # auto-increments; inherit description/cover
- Detail: book intervals via radio-slot bookings API; upload or attach broadcast; approve gate with trim/normalize via archive editor render
- Series/episodes persisted in **localStorage** until a real Show API exists (honest demock gap)

**Playlists (`/studio/playlists`):**

- List + TrackTable editor; add archive tracks and releases; public/private + collaborative
- Icon-only add-to-playlist affordances on Music rows

**Channel designer (`/studio/channel`):**

- Tabs: Design · 24/7 radio · Profile · Username/domain
- 24/7 radio: pick/create playlist → apply to programme (max 5 items)
- StudioPanel / StudioPageHeader polish

**Status:** in-review — screenshots captured; awaiting comment or `approved`.

### 2026-08-12 — Release detail + Albums polish + link-out cleanup

**Goal:** Finish next worklog rows with StudioPanel depth; remove easy prod dashboard link-outs.

**Release detail (`/studio/releases/$id`):** Artwork / Details / Tracks panels; header Save CTA; Distribution in-app link.

**Albums (`/studio/collections` + editor):** Human subtitle (no API jargon); StudioPanel list; Playlists cross-link; album editor panels + Save.

**Show detail:** Defaults / Schedule / Episodes as StudioPanels.

**Setup channel:** StudioPageHeader + panel; home CTA → `/studio/setup-channel` (no tahti.live wording).

**Settings:** Dropped “Full media builder” and “Manage on production” moderator link-outs.

**Screenshots:** `studio-shows-v1`, `studio-playlists-v1`, `studio-channel-v1`, `studio-collections-v1` (+ releases refresh).

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-12 — Schedule + Stats (+ Editor panel parity)

**Goal:** Next pending studio tools with Nuclear panel depth; icon-dense secondary chrome.

**Schedule (`/studio/schedule`):**

- StudioPageHeader + Save CTA; human subtitle (no API source jargon)
- Next broadcast + Offline programme as StudioPanels
- Mode chips; quiet link to Channel 24/7 radio
- Empty rotation points to Channel designer

**Stats (`/studio/stats` + detail):**

- Summary metric panels; Top tracks / countries lists
- Detail CTA → plays chart; track titles link into Library
- Revenue note is in-app (`/studio/revenue`), not a prod escape hatch
- Detail: StudioPageHeader + range chips; drop API path jargon / middle-dot meta

**Editor list / project (also pending; brought to same shell):**

- StudioPageHeader / StudioPanel; icon-only Open / Pro editor row actions
- Project page: Pro editor primary CTA; archive link into Library

**UX / icons (studio sweep):**

- Library: Play / More / Pin / Audio editor / Delete → icon-only with aria-label
- Albums tracklist: Up / Down / Remove → chevron / trash icons
- Releases More: Public link / Distribution → icons; release detail secondary same

**Screenshots:** `studio-schedule-v1.png`, `studio-stats-v1.png`

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-13 — Mock content pass + map notes export

**Goal:** Data/content richness across the listen directory and studio calendar, plus a reviewer tool on the Tahti map page — not a page-by-page layout redesign, so it sits outside the usual one-page loop above.

**Mock stations (`src/api/mock.ts`):** Grew the listen directory from 2 to 8 stations (Northern Lights, Screenshot Demo, Midnight Cartography, Tundra Static, Saimaa Sessions, Kaiku Collective, Valo Radio, Metsänpeitto), each with its own bio, genre tags, two releases with real descriptions, follower count, and distinct track titles — replaces the single repeated "Mock channel for the Nuclear × Tahti listen POC" blurb.

**Gig calendar (`src/api/events.ts`, `StudioEventsView`):** Added a `description` field end to end (type, form, list rendering) and seeded 7 representative events across Finnish venues with full descriptions.

**Shows/schedule (`src/api/shows.ts`):** 1 → 4 show series (added Route 550 Live, Kaiku Cypher Sessions, Boathouse Talk) with matching episodes and radio-slot bookings.

**Map notes export (`ScreenAtlas.tsx`):** Added a CSV export button next to "Screen atlas" — exports `view_id, view_name, case_title, commentary` for every case with a saved note, so review notes left on `/more` can be saved to a file and revisited later instead of only living in this browser's localStorage.

**Screenshots:** `listen-artist-rich-v1.png` (new — enriched artist profile), `studio-events-v1.png` (new), `map-more-v1.png` (new — export button), refreshed `listen-home-v1`, `listen-radio-v1`, `listen-artist-v1`, `studio-shows-v1`, and the rest of the atlas set against the new mock data.

**Status:** in-review — awaiting comment or `approved`.

### 2026-08-16 — Page 19 Updates / newsletter v1 (`in-review`)

**Goal:** Bring the last un-styled studio page to the StudioPageHeader/StudioPanel shell used by Schedule and Releases; one primary action per tab.

**Changes:**

- `StudioPageHeader` with tab-aware primary CTA (**New post** / **New draft**) instead of a right-aligned button row
- Tabs restyled to match Channel designer (`shadow-sm` active state, `role="tablist"`/`role="tab"`)
- Posts and drafts lists moved into `StudioPanel` with `divide-y` rows (was ad-hoc bordered `<li>` cards), matching Releases
- Dropped the "Source: mock/live" jargon from the subtitle
- No behavior changes — same create/delete/send handlers and dialogs

**Screenshots:** `docs/redesign-shots/studio-updates-v1.png` (Posts tab), `docs/redesign-shots/studio-updates-newsletter-v1.png` (Newsletter tab)

**Status:** approved.

### 2026-08-16 — Page 20 Revenue / Connect v1 (`in-review`)

**Goal:** Same StudioPageHeader/StudioPanel shell; replace the yes/no status list with the ✓/○ chip pattern from the Go Live wizard; drop dev jargon from user-facing copy.

**Changes:**

- `StudioPageHeader` with a plain subtitle — dropped "Source: mock" and the `VITE_FORCE_MOCK=1` dev-env line that was leaking into the UI
- Stripe Connect status (configured / charges enabled / details submitted / payments ready) now reads as compact ✓/○ chips instead of a `yes`/`no` bullet list
- Fan-sub Connect, grant estimate, and past grants are each a `StudioPanel`; past grants moved to `divide-y` rows
- No behavior changes — same onboarding/portal handlers

**Screenshot:** `docs/redesign-shots/studio-revenue-v1.png`

**Status:** approved.

### 2026-08-17 — Page 21 Stash v1 (`in-review`)

**Goal:** Same StudioPageHeader/StudioPanel shell as the rest of studio; the page still used the pre-redesign bordered-`<li>` list and a raw flex header.

**Changes:**

- `StudioPageHeader` with Upload as the single header CTA (file input stays hidden, triggered via ref)
- File list moved into `StudioPanel` with `divide-y` rows, matching Releases/Stash's siblings
- Empty state gets its own Upload CTA
- Play/Delete stay icon-only, switched to `variant="text"` for consistency with other row actions
- No behavior changes — same upload/download/delete handlers

**Screenshot:** `docs/redesign-shots/studio-stash-v1.png`

**Status:** approved.

### 2026-08-17 — Page 22 Sources hub v1 (`in-review`)

**Goal:** Lighter pass than most pages — the overview grid and per-source detail panels already had good Nuclear treatment (service-branded tiles, status chips) from an earlier "plugin-store style" pass. Mainly a chrome/jargon cleanup.

**Changes:**

- Outer page switched from a raw `<h1>` block to the shared `PageFrame`/`PageHeader` (matches Listen/Radio/Feed instead of a bespoke header)
- Dropped "Opened from Music when you add tracks (alongside upload)" implementation detail from the subtitle
- Removed the "Status source: mock" debug line from the per-source detail header — the existing status chip (Mock/Connected/Needs auth/etc.) already conveys this
- No behavior changes — grid, tabs, connect/disconnect, and import flows untouched

**Screenshots:** `docs/redesign-shots/sources-v1.png` (overview grid), `docs/redesign-shots/sources-detail-v1.png` (SoundCloud detail tab)

**Status:** approved.

### 2026-08-17 — Pages 23–26 Settings account/artist/money/connections

**Finding:** these four rows were tracked as `pending`, but the worklog was stale — the Settings modal (`SettingsPanels.tsx`) already uses the Nuclear `SettingsPanel` shell consistently across every section (sub-tabs, bordered `SettingsInfo` rows, real Save CTAs, tier cards). No layout/chrome work was actually outstanding.

**Verified via screenshot, no changes needed:** Account (Session/Security/Membership/Notifications sub-tabs, read-only `SettingsInfo` rows are intentional — editable display name lives under Artist → Profile), Money (Fan tiers list with New/Deactivate, matches the Releases/Stash divide-y pattern), Connections (short redirect notice pointing to Sources, intentionally minimal).

**One real fix, already shipped in the Source:/API sweep:** Account → Membership had a raw `Source: {source}` debug line — removed there, not here.

**Screenshot:** `docs/redesign-shots/settings-artist-v1.png` (representative — Profile sub-tab with Save CTA)

**Status:** approved.

### 2026-08-17 — Page A1 Admin dashboard v1 (`in-review`)

**Goal:** First admin page — reverses the earlier CUTOVER.md "out-of-scope" call (confirmed with user). Establish the board-gated shell + nav pattern the remaining 21 admin pages will build on.

**Changes:**

- New `AdminGate` component (mirrors `StudioGate`) — gates on `user.isBoard` instead of channel ownership; shows sign-in or "board access required" states
- New `AdminNav` (mirrors `StudioNav`'s `InPageNav` chip pattern) — starts with just Dashboard, grows page-by-page
- `isBoard?: boolean` added to `AuthUser`; new "Admin" sidebar item (shield icon), visible only when `user.isBoard`
- `/admin` route renders `AdminDashboardView`, reusing `StudioPageHeader`/`StudioPanel` for visual consistency with the rest of the app rather than inventing new admin-specific chrome
- Content follows the same disclosure pattern as Studio home: KPI row (active members, live now, beta queue, open tickets) + Needs action queue + System health up front; Finance YTD, live streams, queue health, cron jobs, and audit log tucked behind a "Finance, streams, queues & audit" toggle
- `api/admin.ts`: prod's dashboard fans out to ~12 separate `/api/admin/*` calls — batched into one `fetchAdminDashboard()` for this first port, with a rich mock payload for offline demo

**Screenshots:** `docs/redesign-shots/admin-dashboard-v1.png` (collapsed), `docs/redesign-shots/admin-dashboard-expanded-v1.png` (More expanded)

**Status:** approved.

### 2026-08-17 — Pages A2–A6 Beta / Users / Radio / Radio submissions / News v1 (`in-review`)

**Goal:** Continue the admin port — five pages in one pass, all reusing the AdminGate/AdminNav/StudioPanel foundation from A1. `AdminNav` grows to 6 entries.

**A2 Beta applications** (`/admin/beta`): status filter chips (All/Pending/Approved/Rejected); Approve opens a `Dialog` for username/display name, shows the resulting setup link inline; Reject and Resend-setup-link stay inline row actions.

**A3 Users** (`/admin/users`): search + tier/member selects (debounced, client-side filter under mock), divide-y list with board/suspended tags and live-state coloring. Dropped the per-row detail link and CSV export — no detail page or export endpoint exists yet, out of scope for this pass.

**A4 Radio** (`/admin/radio`): Now playing, Eligible channels (Move to front / Opt out), Opted out (Re-enable), Feature history — four `StudioPanel`s matching prod 1:1.

**A5 Radio submissions** (`/admin/radio-submissions`): auditing panel plays through Nuclear's real player bar (`usePlayerStore`) instead of a bespoke audio element like prod's — one less thing to build, and it's consistent with how every other page in the app plays audio. Approve/reject with an optional rejection note.

**A6 News** (`/admin/news`): compose in a `Dialog` (Publish / Save as draft), list rows with inline Edit (swaps to a form in place, no separate route) / Publish-Unpublish / Delete.

All five: `api/admin.ts` mock + live fetchers (`fetchAdminBetaApplications`, `fetchAdminUsers`, `fetchAdminRadio`, `fetchAdminRadioSubmissions`, `fetchAdminNews` + mutations), same forceMock()-first pattern as the rest of the app.

**Screenshots:** `docs/redesign-shots/admin-beta-v1.png`, `admin-users-v1.png`, `admin-radio-v1.png`, `admin-radio-submissions-v1.png`, `admin-news-v1.png`

**Status:** approved.

### 2026-08-17 — Pro audio editor v2 (`/studio/archive/$id/editor`) (`in-review`)

**Goal:** Rows 10/11 (Editor list, Editor project summary) were marked approved earlier, but that swept past the actual waveform tool at `/studio/archive/$id/editor` (`StudioProEditorView`) without a real pass — it was still the pre-redesign raw layout. User flagged it specifically: give it space, make it look correct.

**Problems found:** capped at `max-w-4xl` (896px) on a page whose whole job is a waveform; waveform canvas fixed at 96px tall and its render effect never re-ran on resize; raw `<h1>`/bordered-`<div>` chrome instead of `StudioPageHeader`/`StudioPanel`; dev jargon in copy ("Real: PATCH draft + POST render (ffmpeg job). Mock: local draft store...") and a raw `EditList JSON` `<details>` dump; limiter had a checkbox but no way to actually adjust its ceiling.

**Changes:**

- Widened to `max-w-[1400px]`; waveform panel is full-width
- `WaveformCanvas`: height now driven by its own `clientHeight` (was hardcoded 96px) so the CSS class controls it; added a `ResizeObserver` so it redraws on layout/viewport changes instead of only on data changes; bumped to 224px tall
- Mastering (EQ/Compressor/Limiter) spread across a 3-column grid instead of 2, each control gets room; limiter's ceiling is now a real slider (-6..0 dB) instead of static text
- Stems and Export moved into side-by-side panels instead of stacking full-width
- Dropped the PATCH/POST/ffmpeg jargon line and the EditList JSON debug dump; save/render feedback stays in the Export panel as a plain status line
- Play/Save/Render buttons got icons, matching the rest of studio

**Screenshots:** `docs/redesign-shots/studio-editor-project-v1.png` (1280px), `docs/redesign-shots/studio-editor-project-wide-v1.png` (1680px, shows it scaling)

**Status:** approved.

### 2026-08-17 — Pages A7–A11 Tahti Selects / Streams / Support / Top lists / Announcements v1 (`in-review`)

**Goal:** Finish the admin nav's first row — 11 of 22 pages now built. Same AdminGate/StudioPanel foundation as A1–A6.

**A7 Tahti Selects** (`/admin/tahti-selects`): Start/stop stream as the header action; current-rotation list with up/down reorder + remove; debounced search-to-add from public archive. Dropped prod's Liquidsoap/`TAHTI_RADIO_AUDIO_URL` infra paragraph — that's ops detail, not something a board member editing rotation content needs to see.

**A8 Streams** (`/admin/streams`): live-channel list, each row gets Restart/Skip/Pause/Resume/Force offline — matches prod's control set exactly, confirm dialogs kept on the destructive ones.

**A9 Support** (`/admin/support`): status filter chips + ticket list. No detail page (same scope trim as Users/Beta) — ticket detail/reply isn't built yet.

**A10 Top lists** (`/admin/top-lists`): three filter rows (period/dimension/sort) driving per-bucket progress-bar lists; built a small inline bar (`bg-primary` fill over `bg-background-secondary` track) since Nuclear UI doesn't have one.

**A11 Announcements** (`/admin/announcements`): system on/off toggle, upload button (mirrors the stash prepare→PUT→complete pattern), per-clip enable/schedule-mode/Nth-interval/delete, preview plays through Nuclear's real player bar instead of a raw `<audio>` element like prod. No separate clip editor page (out of scope, same as the announcements/editor/[id] sub-route in prod).

**Screenshots:** `docs/redesign-shots/admin-selects-v1.png`, `admin-streams-v1.png`, `admin-support-v1.png`, `admin-top-lists-v1.png`, `admin-announcements-v1.png`

**Status:** approved.

### 2026-08-17 — Pages A12–A21 Storage / Files / Content reports / Financial / Governance / Feature requests / Grants / AGM / Vendors / Status v1 (`in-review`)

**Goal:** Close out the remaining board-admin nav — all 21 built pages now live under `/admin/*`, gated on `user.isBoard`. AdminNav grew from 11 to 21 entries.

**A12 Storage** (`/admin/storage`): total used/quota/user-count summary + per-user usage list with an inline MB quota editor (mirrors prod's `QuotaEditor`). Per-user file browser (`/admin/storage/[userId]`) stays out of scope — folded into A13 instead.

**A13 Files** (`/admin/files`): board-wide archive browser — debounced search by title/artist/username, public/private badge, inline play preview, delete. Prod's `_admin-files-browser.tsx` (856 lines: facets, bulk edit, saved filter presets) trimmed to single-item search + delete for v1; bulk operations deferred.

**A14 Content reports** (`/admin/content-reports`): status filter chips + report list with resolve-with-note actions (start review / mark actioned / dismiss) — ported prod's flow directly, it was already simple.

**A15 Financial** (`/admin/financial`): folded prod's link-only hub plus its `ledger` and `fansubs/overview` sub-pages into one page — fan-sub stats (active subs, MRR, pending/failed payouts) + ledger entries with an add-entry form. `fansubs` (per-subscriber payout retry) and `legacy-members` (Stripe migration queue) sub-pages stay out of scope.

**A16 Governance** (`/admin/governance`): prod is a pure link hub to 6 sub-tools; ported as an info-card grid instead, with live counts where available (open motions, pending venue verifications, resolutions this year). Only AGM links through to a built page — Audit log, Annual report generator, Board resolutions, and Member register stay informational cards for v1 (no dedicated pages yet).

**A17 Feature requests** (`/admin/feature-requests`): status filter chips + vote-ranked list with Plan/In progress/Done/Decline/Reopen actions. Dropped the "close as duplicate + merge target" flow (low-value complexity for a first pass) and the quarterly report panel.

**A18 Grants** (`/admin/grants`): disbursement history table (year, recipients, total). Per-year preview/run flow (`/admin/grants/[year]`, a dry-run + irreversible disbursement trigger) stays out of scope — too high-stakes for a v1 port without a real confirm-and-audit flow.

**A19 AGM** (`/admin/agm`): agenda builder ported verbatim (fully client-side in prod — add/reorder/remove/copy-to-clipboard) + open/draft motions list + the member-notification-requirements disclosure. Minutes/records links point at pages that don't exist yet in this shell, so that section was dropped rather than link to nothing.

**A20 Vendors** (`/admin/settings/vendors`, mounted at `/admin/vendors` here): static critical-vendor and integration-vendor reference tables + live Mixcloud/Revelator distribution status. Dropped raw env-var names (`MIXCLOUD_CLIENT_ID` etc.) — board members need to know a DPA is required, not which env var holds the secret.

**A21 Status** (`/admin/status`): service health table (state, criticality, latency, detail) with an overall operational badge — direct port, prod page was already clean.

**Screenshots:** `docs/redesign-shots/admin-storage-v1.png`, `admin-files-v1.png`, `admin-content-reports-v1.png`, `admin-financial-v1.png`, `admin-governance-v1.png`, `admin-feature-requests-v1.png`, `admin-grants-v1.png`, `admin-agm-v1.png`, `admin-vendors-v1.png`, `admin-status-v1.png`

**Status:** in-review — awaiting comment or `approved`. A22 (i18n languages + CSV import) is still pending and tracked separately per its Phase-0 note.

### 2026-08-17 — Mobile pass + icon-only media actions + mock-text sweep

**Goal:** Not a page-by-page redesign — a cross-cutting cleanup requested directly: kill redundant text links next to icon buttons, strip leftover "(mock)" jargon from user-facing copy, and fix concrete mobile breakage (found via a Playwright audit at a 390×844 viewport, since no live browser session was available this pass).

**`MediaIconActions`:** Dropped the auto-generated hint line under the icon row (`Play Radio · Queue · Favorite`) — every action already carries `title`/`aria-label`, so the caption was pure duplication. Used on `RadioView` and `ChannelView`.

**Mobile layout bug (`RadioView`):** The member-relay banner (`Live now on the member relay: …`) put raw text and inline elements as direct children of `Box`, which is `display: flex` — on a 390px viewport each text fragment became its own flex item and wrapped word-salad style instead of flowing as a sentence. Fixed by wrapping the sentence in a single `<span>`.

**Mock jargon removed from content strings:** `src/api/mock.ts` had "(mock rotation)", "(mock HLS)", "(mock chat)" etc. baked directly into now-playing titles, chat messages, and revenue line items — these render as real UI copy, not just an internal flag. Also cleaned `(mock)` suffixes in `client.ts`, `broadcast.ts`, `channel-provision.ts`, `sources.ts` error/label strings.

**Live vs browsable artists (`mockChannel`/`mockDirectory`):** Every one of the 9 demo channels was hardcoded `state: 'LIVE'` with a working `hlsUrl`, so every artist card in the Listen directory offered a misleading "Play" as if they were all broadcasting. Only `tahti-radio` and `northern-lights` (the member-relay slug used by `mockRadio()`) are actually live now; the rest report `OFFLINE`/`hlsUrl: null`/`nowPlaying: null`. `ChannelDirectoryItem` gained an optional `live` flag so the Listen grid only shows the Play/Queue overlay on genuinely-live cards — offline artists are click-through to their profile, which already had a real per-artist archive (`mockArchiveItems` → `trackTitles`) and releases; that infrastructure just wasn't being reached from the directory.

**Screenshots:** `mobile-shots/radio-fixed.png` (banner fix), `mobile-shots/channel-offline-artist.png` (offline-artist profile), `mobile-shots/home-v2.png` (Listen directory) — captured to scratch, not committed to `docs/redesign-shots/`.

**Status:** shipped — verified via `tsc --noEmit`, `eslint`, and `vite build`; no automated screenshot regen against `docs/redesign-shots/` this pass.

### 2026-08-17 — Music page folds in Stash as a Files folder

**Goal:** User request — archive items should live under "Music," with an Archive folder sitting alongside the artist's other files, instead of Archive (`/studio/archive`, labelled "Library") and Stash (`/studio/stash`, private uploads) being two disconnected nav entries.

**Changes:**

- `StudioArchiveView` renamed "Library" → **Music**; added an Archive/Files folder-tab switcher (`?folder=files` search param, same `role="tablist"` pattern as Updates' Posts/Newsletter tabs) — Archive tab is the unchanged catalog list, Files tab renders the Stash file browser inline
- Extracted Stash's upload/list/play/delete UI into a shared `StashFilesPanel` component so it's not duplicated between the standalone Stash page and the new Files folder
- `StudioStashView` now just wraps `StashFilesPanel`; page stays reachable directly (Sources hub and Studio home's "More tools" still deep-link there) and its subtitle now points back at Music → Files
- `StudioNav`: primary pill relabelled "Music"; dropped the separate "Stash" entry from More studio tools (folded into Music)
- Studio home's Music group card relabelled "Library" → "Music" to match

**Screenshots:** `mobile-shots/music-archive-tab.png`, `mobile-shots/music-files-tab.png` (scratch, not committed).

**Status:** shipped — verified via `tsc --noEmit`, `eslint`, and `vite build`.

