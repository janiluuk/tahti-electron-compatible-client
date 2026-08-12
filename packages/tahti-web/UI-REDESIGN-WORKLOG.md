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
| 4 | Archive item | `/studio/archive/$id` | **in-review** | `docs/redesign-shots/studio-archive-item-v1.png` |
| 5 | Upload | `/studio/upload` | **approved** | `docs/redesign-shots/studio-upload-v1.png` |
| 6 | Releases | `/studio/releases` | **in-review** | `docs/redesign-shots/studio-releases-v1.png` |
| 7 | Release detail | `/studio/releases/$id` | **in-review** | (panels + Save CTA) |
| 8 | Collections / album designer | `/studio/collections` | **in-review** | `docs/redesign-shots/studio-collections-v1.png` |
| 9 | Collection editor | `/studio/collections/$slug` | **in-review** | |
| 10 | Audio editor list | `/studio/editor` | **in-review** | (panels + icon row actions) |
| 11 | Editor project | `/studio/editor/$id` | **in-review** | |
| 12 | Schedule | `/studio/schedule` | **in-review** | `docs/redesign-shots/studio-schedule-v1.png` |
| 13 | Stats | `/studio/stats` | **in-review** | `docs/redesign-shots/studio-stats-v1.png` |
| 14 | Stats detail | `/studio/stats/detail` | **in-review** | (panels + range chips) |
| 15 | Channel designer | `/studio/channel` | **in-review** | `docs/redesign-shots/studio-channel-v1.png` |
| 16 | Shows | `/studio/shows` | **in-review** | `docs/redesign-shots/studio-shows-v1.png` |
| 17 | Show detail / episode review | `/studio/shows/$id`, `…/episodes/$episodeId` | **in-review** | |
| 18 | Playlists | `/studio/playlists`, `…/$slug` | **in-review** | `docs/redesign-shots/studio-playlists-v1.png` |
| 19 | Updates / newsletter | `/studio/updates` | pending | |
| 20 | Revenue / Connect | `/studio/revenue` | pending | |
| 21 | Stash | `/studio/stash` | pending | |
| 22 | Sources hub | `/sources` | pending | |
| 23 | Settings — account | `/settings/account` | pending | |
| 24 | Settings — artist | `/settings/artist` (etc.) | pending | |
| 25 | Settings — money / fan tiers | `/settings/money` | pending | |
| 26 | Settings — connections | `/settings/connections` | pending | |

## Admin (prod `/admin/*` — not in POC yet)

Port into Nuclear admin shell later. Inventory from prod `admin-nav`:

| # | Page | Prod route | Status |
|---|------|------------|--------|
| A1 | Dashboard | `/admin/dashboard` | pending (stub shell later) |
| A2 | Beta applications | `/admin/beta` | pending |
| A3 | Users | `/admin/users` | pending |
| A4 | Radio | `/admin/radio` | pending |
| A5 | Radio submissions | `/admin/radio-submissions` | pending |
| A6 | News | `/admin/news` | pending |
| A7 | Tahti Selects | `/admin/tahti-selects` | pending |
| A8 | Streams | `/admin/streams` | pending |
| A9 | Support | `/admin/support` | pending |
| A10 | Top lists | `/admin/top-lists` | pending |
| A11 | Announcements | `/admin/announcements` | pending |
| A12 | Storage | `/admin/storage` | pending |
| A13 | Files | `/admin/files` | pending |
| A14 | Content reports | `/admin/content-reports` | pending |
| A15 | Financial | `/admin/financial` | pending |
| A16 | Governance hub | `/admin/governance` | pending |
| A17 | Feature requests | `/admin/feature-requests` | pending |
| A18 | Grants | `/admin/grants` | pending |
| A19 | AGM | `/admin/agm` | pending |
| A20 | Vendors | `/admin/settings/vendors` | pending |
| A21 | Status | `/admin/status` | pending |
| A22 | i18n languages + CSV import | (new — see Phase 0) | pending |

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

