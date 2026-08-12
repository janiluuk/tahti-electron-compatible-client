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
| 3 | Music / Archive | `/studio/archive` | **approved** | `docs/redesign-shots/studio-archive-v1.png` |
| 4 | Archive item | `/studio/archive/$id` | **in-review** | `docs/redesign-shots/studio-archive-item-v1.png` |
| 5 | Upload | `/studio/upload` | **approved** | `docs/redesign-shots/studio-upload-v1.png` |
| 6 | Releases | `/studio/releases` | **in-review** | `docs/redesign-shots/studio-releases-v1.png` |
| 7 | Release detail | `/studio/releases/$id` | pending | |
| 8 | Collections / album designer | `/studio/collections` | pending | |
| 9 | Collection editor | `/studio/collections/$id` | pending | |
| 10 | Audio editor list | `/studio/editor` | pending | |
| 11 | Editor project | `/studio/editor/$id` | pending | |
| 12 | Schedule | `/studio/schedule` | pending | |
| 13 | Stats | `/studio/stats` | pending | |
| 14 | Stats detail | `/studio/stats/detail` | pending | |
| 15 | Channel design | `/studio/channel` | pending | |
| 16 | Updates / newsletter | `/studio/updates` | pending | |
| 17 | Revenue / Connect | `/studio/revenue` | pending | |
| 18 | Stash | `/studio/stash` | pending | |
| 19 | Sources hub | `/sources` | pending | |
| 20 | Settings — account | `/settings/account` | pending | |
| 21 | Settings — artist | `/settings/artist` (etc.) | pending | |
| 22 | Settings — money / fan tiers | `/settings/money` | pending | |
| 23 | Settings — connections | `/settings/connections` | pending | |

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

