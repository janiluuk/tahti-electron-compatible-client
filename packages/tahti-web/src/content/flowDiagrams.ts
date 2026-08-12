// Extracted from tahti-fit/flows — browse on /more (Tahti map)
export type FlowDiagramPack = 'current' | 'planned';
export type FlowDiagram = {
  id: string;
  pack: FlowDiagramPack;
  source: string;
  title: string;
  blurb: string;
  mermaid: string;
};

export const FLOW_DIAGRAMS: FlowDiagram[] = [
  {
    id: 'current-README',
    pack: 'current',
    source: 'README.md',
    title: 'Master spine (all personas)',
    blurb: '---',
    mermaid:
      'flowchart TB\n  subgraph entry["1 · Entry"]\n    H["/ Home"]\n    L["/listen · /radio · /venues"]\n    H --> L\n  end\n\n  subgraph public["2 · Anonymous listen"]\n    C["/c/:slug channel"]\n    U["/u/:username profile"]\n    R["/r/:slug smart link"]\n    L --> C\n    L --> U\n    U --> C\n    U --> S["/u/:username/subscribe"]\n    R --> U\n  end\n\n  subgraph auth["3 · Account"]\n    J["/join · /signup"]\n    LI["/login"]\n    V["/verify"]\n    J --> V\n    LI --> D\n  end\n\n  subgraph studio["4 · Logged-in surfaces"]\n    D["/dashboard"]\n    G["/governance"]\n    D --> G\n  end\n\n  subgraph artist["5 · Artist studio"]\n    D --> BC["Broadcast · Schedule"]\n    D --> LIB["Music · Upload · Collections · Smart Links"]\n    D --> AUD["Newsletter · Revenue · Settings"]\n  end\n\n  subgraph board["6 · Board admin"]\n    A["/admin/*"]\n    D -.-> A\n  end\n\n  entry --> public\n  public --> auth\n  auth --> studio\n  studio --> artist\n  studio --> board\n',
  },
  {
    id: 'current-site-map',
    pack: 'current',
    source: 'site-map.md',
    title: 'Site map — every user-facing route',
    blurb:
      'Successful login defaults toward `/dashboard` (or `?next=` safe internal path). Logout returns to public home / login.',
    mermaid:
      'flowchart TB\n  %% Public marketing & discovery\n  Home["/"]:::pub\n  Listen["/listen"]:::pub\n  Radio["/radio"]:::pub\n  Venues["/venues"]:::pub\n  VenuesReg["/venues/register"]:::pub\n  How["/how-it-works"]:::pub\n  About["/about"]:::pub\n  Help["/help…"]:::pub\n  Status["/status"]:::pub\n  Trans["/transparency"]:::pub\n  Method["/transparency/methodology"]:::pub\n  Apply["/apply"]:::pub\n  Join["/join · /signup"]:::pub\n  Login["/login"]:::pub\n  Verify["/verify"]:::pub\n  Terms["/terms · /privacy · /agpl"]:::pub\n\n  %% Public artist surfaces\n  Channel["/c/:slug"]:::pub\n  Profile["/u/:username"]:::pub\n  Sub["/u/:username/subscribe"]:::pub\n  Coll["/u/:username/c/:collection"]:::pub\n  Smart["/r/:slug"]:::pub\n  EmbedC["/embed/c/:slug"]:::pub\n  EmbedR["/embed/r/:id"]:::pub\n\n  %% Authed listener / member\n  Dash["/dashboard"]:::auth\n  Gov["/governance"]:::mem\n  GovVenues["/governance/venues"]:::board\n\n  %% Artist studio (sidebar)\n  Stats["/dashboard/stats"]:::art\n  Archive["/dashboard/archive · Music"]:::art\n  Upload["/dashboard/upload"]:::art\n  Colls["/dashboard/collections"]:::art\n  Releases["/dashboard/releases · Smart Links"]:::art\n  Dist["/dashboard/distribution"]:::art\n  Stash["/dashboard/stash"]:::art\n  Broadcast["/dashboard/broadcast"]:::art\n  Schedule["/dashboard/schedule"]:::art\n  VenuesDash["/dashboard/venues"]:::art\n  Events["/dashboard/events"]:::art\n  RadioSlot["/dashboard/tahti-radio-slots"]:::art\n  Posts["/dashboard/posts"]:::art\n  Embeds["/dashboard/embeds"]:::art\n  News["/dashboard/newsletter/compose"]:::art\n  Revenue["/dashboard/revenue"]:::art\n  Design["/dashboard/channel/edit"]:::art\n  Settings["/dashboard/settings/*"]:::art\n  Editor["/dashboard/editor"]:::art\n  Msgs["/dashboard/messages"]:::art\n\n  %% Board\n  Admin["/admin/*"]:::board\n\n  Home --> Listen\n  Home --> Radio\n  Home --> Venues\n  Home --> Trans\n  Home --> Join\n  Home --> Login\n  Home --> Channel\n  Listen --> Channel\n  Radio --> Channel\n  Profile --> Channel\n  Profile --> Sub\n  Profile --> Coll\n  Smart --> Profile\n  Join --> Verify\n  Login --> Dash\n  Dash --> Stats\n  Dash --> Archive\n  Dash --> Upload\n  Dash --> Colls\n  Dash --> Releases\n  Dash --> Broadcast\n  Dash --> Schedule\n  Dash --> News\n  Dash --> Revenue\n  Dash --> Design\n  Dash --> Settings\n  Dash --> Gov\n  Dash --> Admin\n  Gov --> GovVenues\n  Admin --> GovVenues\n\n  classDef pub fill:#eef4ff,stroke:#3b82f6,color:#1e3a8a;\n  classDef auth fill:#ecfdf5,stroke:#10b981,color:#065f46;\n  classDef mem fill:#fef3c7,stroke:#d97706,color:#92400e;\n  classDef art fill:#f3e8ff,stroke:#9333ea,color:#6b21a8;\n  classDef board fill:#fef2f2,stroke:#ef4444,color:#7f1d1d;\n',
  },
  {
    id: 'current-anonymous-listener',
    pack: 'current',
    source: 'anonymous-listener.md',
    title: 'Anonymous listener — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  A([Land on Tahti]) --> H["/ Home"]\n  H --> L["/listen Discover"]\n  H --> R["/radio Tahti Radio"]\n  H --> V["/venues Calendar"]\n  H --> T["/transparency"]\n  H --> Help["/help…"]\n  H --> Auth["/join or /login"]\n\n  L --> C["/c/:slug Channel"]\n  R --> C\n  H --> C\n  H --> P["/u/:username Profile"]\n  P --> C\n  P --> S["/u/:username/subscribe"]\n  P --> Coll["/u/:username/c/:collection"]\n  Smart["/r/:slug Smart link"] --> P\n  Smart --> C\n\n  C --> Play{Live?}\n  Play -->|Yes| Live[Play HLS live + public chat]\n  Play -->|No| Arch[Archive / rotation playback]\n  Live --> Chat[Join chat with anonymous handle]\n  Arch --> Chat\n\n  S --> Gate{Want fan perks?}\n  Gate -->|Yes| Auth\n  Gate -->|Browse only| S\n\n  EmbedC["/embed/c/:slug"] -.-> C\n  EmbedR["/embed/r/:id"] -.-> Smart\n',
  },
  {
    id: 'current-logged-in-listener',
    pack: 'current',
    source: 'logged-in-listener.md',
    title: 'Logged-in listener / member — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  A([Anonymous]) --> Join["/join or /signup"]\n  Join --> Verify["/verify email"]\n  Verify --> Login["/login"]\n  A --> Login\n\n  Login --> Dash["/dashboard"]\n  Dash --> Free{Membership?}\n\n  Free -->|None · free listener| FreeDash[Listener dashboard]\n  Free -->|€40 member| MemDash[Member dashboard]\n  Free -->|Also has channel| Artist[Part 3 · Artist studio]\n\n  FreeDash --> Sub["/u/:artist/subscribe → Stripe"]\n  MemDash --> Gov["/governance"]\n  Gov --> Motions[Browse / vote motions]\n  Gov --> VenuesMem[Member venue views]\n\n  Sub --> FanChat[Fan chat on /c/:slug when perk allows]\n  FreeDash --> Msgs["/dashboard/messages"]\n  MemDash --> Msgs\n  FreeDash --> Account["/dashboard/settings/account"]\n',
  },
  {
    id: 'current-artist',
    pack: 'current',
    source: 'artist.md',
    title: 'Artist — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  Login["/login"] --> Dash["/dashboard Channel overview"]\n  Dash --> Setup["/dashboard/setup-channel if no channel"]\n\n  subgraph sidebar["Studio sidebar"]\n    direction TB\n    Dash\n    Stats["Stats"]\n    subgraph lib["My Library"]\n      Music["Music · archive"]\n      Upload["Upload"]\n      Colls["Collections"]\n      Links["Smart Links · releases"]\n      Dist["Distribution · More"]\n      Stash["Stash · More"]\n    end\n    subgraph bc["Broadcasting"]\n      Broadcast["Broadcast"]\n      Schedule["Schedule"]\n      Venues["Venues · More"]\n      Events["Events · More"]\n      RadioSlot["Radio slot · More"]\n      Posts["Posts · More"]\n      Embeds["Embeds · More"]\n    end\n    subgraph aud["Audience"]\n      Newsletter["Newsletter"]\n      Revenue["Revenue"]\n    end\n    subgraph setupG["Channel setup"]\n      Design["Design"]\n      Settings["Settings → subnav"]\n    end\n  end\n\n  Dash --> Stats\n  Dash --> lib\n  Dash --> bc\n  Dash --> aud\n  Dash --> setupG\n\n  Broadcast --> Live["Go live · OBS keys · browser studio"]\n  Music --> ArchItem["Archive item · editor"]\n  Upload --> Import["Import Bandcamp / SC / Drive / URL"]\n  Links --> RelDetail["Release detail"]\n  Colls --> CollEdit["Collection editor"]\n  Settings --> SetTabs["Account · Artist info · Fan subs · …"]\n\n  Dash -.-> Pub["Public /c/:slug · /u/:username"]\n',
  },
  {
    id: 'current-board-member',
    pack: 'current',
    source: 'board-member.md',
    title: 'Board member — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  Login["/login as board"] --> Studio["/dashboard"]\n  Studio --> Admin["/admin → /admin/dashboard"]\n\n  subgraph nav["Admin sidebar"]\n    Dash["Dashboard"]\n    Beta["Beta"]\n    Users["Users"]\n    Radio["Radio"]\n    RadioSub["Radio submissions"]\n    News["News"]\n    Selects["Selects"]\n    Streams["Streams"]\n    Support["Support"]\n    Top["Top lists"]\n    Ann["Announcements"]\n    Storage["Storage"]\n    Files["Files"]\n    Reports["Reports"]\n    Fin["Financial"]\n    Gov["Governance"]\n    Feat["Features"]\n    Grants["Grants"]\n    AGM["AGM"]\n    Vendors["Vendors"]\n    Status["Status"]\n  end\n\n  Admin --> Dash\n  Dash --> Beta\n  Dash --> Users\n  Dash --> Streams\n  Dash --> Support\n  Fin --> Ledger["/admin/financial/ledger"]\n  Fin --> FanSubs["/admin/financial/fansubs"]\n  Fin --> Legacy["/admin/financial/legacy-members"]\n  Gov --> Audit["/admin/governance/audit"]\n  Gov --> Res["/admin/governance/resolutions"]\n  Gov --> Report["/admin/governance/report"]\n  Gov --> Venues["/governance/venues verification"]\n  Grants --> GrantYear["/admin/grants/:year"]\n',
  },
  {
    id: 'current-navigation-flows-design-review',
    pack: 'current',
    source: 'navigation-flows-design-review.md',
    title: '1. Master spine (all four parts)',
    blurb: 'Full route colour map: site-map.md.',
    mermaid:
      'flowchart TB\n  subgraph p1["Part 1 · Anonymous listener"]\n    H[Home / Listen / Radio] --> C[Channel play + public chat]\n    C --> P[Profile · smart link · collection]\n  end\n\n  subgraph p2["Part 2 · Logged-in listener / member"]\n    A[Join · verify · login] --> D[Dashboard]\n    D --> F[Fan subscribe]\n    D --> G[Governance if member]\n  end\n\n  subgraph p3["Part 3 · Artist"]\n    S[Studio sidebar] --> Lib[My Library]\n    S --> Bc[Broadcasting]\n    S --> Aud[Audience + Settings]\n    Lib --> Pub[Public channel / profile]\n    Bc --> Pub\n  end\n\n  subgraph p4["Part 4 · Board"]\n    Ad[Admin sidebar] --> Ops[Users · Streams · Support]\n    Ad --> Money[Financial · Grants]\n    Ad --> Org[Governance · AGM]\n  end\n\n  p1 --> p2\n  p2 --> p3\n  p3 --> p4\n',
  },
  {
    id: 'planned-README',
    pack: 'planned',
    source: 'README.md',
    title: 'Master spine (planned)',
    blurb: 'Right rail: **Queue | Chat** (Chat when channel chat enabled).',
    mermaid:
      'flowchart TB\n  subgraph shell["Nuclear shell"]\n    SB[Sparse sidebar]\n    MAIN[Main · ViewShell]\n    RR[Right rail Queue / Chat]\n    PB[Player bar]\n  end\n\n  subgraph listen["Listen"]\n    L["/ Listen directory"]\n    R["/radio"]\n    C["/channel/:slug"]\n    U["/u/:username"]\n  end\n\n  subgraph studio["Studio · in-page tabs"]\n    ST["/studio"]\n    GL[Go Live]\n    CAT[Archive · Releases · Collections · Upload]\n    ED[Editor]\n  end\n\n  subgraph sources["Sources · big tiles"]\n    SRC["/sources"]\n  end\n\n  subgraph settings["Settings · Nuclear sections"]\n    SET["/settings"]\n    TH[Themes]\n  end\n\n  SB --> L\n  SB --> R\n  SB --> ST\n  SB --> SRC\n  SB --> SET\n  L --> C\n  C --> RR\n  C --> PB\n  ST --> GL\n  ST --> CAT\n  ST --> ED\n  SET --> TH\n  U -->|owner| Design[Profile Design tab]\n',
  },
  {
    id: 'planned-site-map',
    pack: 'planned',
    source: 'site-map.md',
    title: 'Planned site map — Nuclear tahti-web',
    blurb: 'Right rail (global): **Queue | Chat**. Bottom: **Player bar**.',
    mermaid:
      'flowchart TB\n  Listen["/ Listen"]:::pub\n  Radio["/radio"]:::pub\n  Channel["/channel/:slug"]:::pub\n  Profile["/u/:username"]:::pub\n  Sub["/subscribe/:username"]:::pub\n  Smart["/r/:slug"]:::pub\n  Coll["/u/:user/c/:slug"]:::pub\n  Embed["/embed/*"]:::pub\n  Lib["/library"]:::auth\n  Studio["/studio/* tabs"]:::studio\n  Sources["/sources"]:::studio\n  Settings["/settings"]:::auth\n  Gov["/governance"]:::auth\n  More["/more · help · legal · status"]:::pub\n  Admin["production /admin"]:::board\n\n  Listen --> Channel\n  Listen --> Radio\n  Listen --> Profile\n  Profile --> Sub\n  Profile --> Coll\n  Profile -->|owner Design| Profile\n  Channel --> Lib\n  Listen --> Studio\n  Studio --> Sources\n  Listen --> Settings\n  Listen --> More\n  Settings -.-> Admin\n  More -.-> Admin\n\n  classDef pub fill:#eef4ff,stroke:#3b82f6,color:#1e3a8a;\n  classDef auth fill:#ecfdf5,stroke:#10b981,color:#065f46;\n  classDef studio fill:#f3e8ff,stroke:#9333ea,color:#6b21a8;\n  classDef board fill:#fef2f2,stroke:#ef4444,color:#7f1d1d;\n',
  },
  {
    id: 'planned-anonymous-listener',
    pack: 'planned',
    source: 'anonymous-listener.md',
    title: 'Anonymous listener — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  A([Open beta / POC]) --> L["/ Listen · Nuclear main"]\n  L --> R["/radio"]\n  L --> C["/channel/:slug"]\n  L --> U["/u/:username"]\n  R --> C\n  U --> C\n  U --> S["/subscribe/:username"]\n  U --> Coll["/u/:user/c/:slug"]\n  Smart["/r/:slug"] --> U\n\n  C --> Rail{Right rail}\n  Rail --> Q[Queue tab]\n  Rail --> Chat[Chat tab · if enabled]\n  C --> PB[Bottom player bar · HLS]\n\n  L --> More["/more · help · legal"]\n  L --> Auth["/join · /login"]\n',
  },
  {
    id: 'planned-logged-in-listener',
    pack: 'planned',
    source: 'logged-in-listener.md',
    title: 'Logged-in listener / member — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  Auth["/join · /login · TOTP"] --> L["/ Listen"]\n  L --> Lib["/library · Favorites · History · Messages"]\n  L --> Sub["/subscribe/:artist"]\n  L --> Gov["/governance · if member"]\n  L --> Acc["/settings · Account section"]\n  Lib --> Fav[Favorites tab]\n  Lib --> Hist[History tab]\n  Lib --> DM[Messages tab]\n  Acc --> Themes[Settings → Themes]\n  Sub --> Stripe[Stripe checkout URL]\n',
  },
  {
    id: 'planned-artist',
    pack: 'planned',
    source: 'artist.md',
    title: 'Artist — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  Login["/login"] --> Studio["/studio"]\n  Studio --> Tabs{In-page tabs}\n  Tabs --> GL[Go Live]\n  Tabs --> Arch[Archive]\n  Tabs --> Rel[Releases]\n  Tabs --> Coll[Collections]\n  Tabs --> Up[Upload]\n  Tabs --> Ed[Editor]\n  Tabs --> Sch[Schedule]\n  Tabs --> St[Stats]\n  Tabs --> Ch[Channel]\n  Tabs --> Upd[Updates · newsletter]\n\n  Studio --> Sources["/sources · big tiles"]\n  Sources --> Imp[Bandcamp · SC · Drive · Mixcloud · URL]\n\n  Profile["/u/:me"] -->|owner| Design[Design tab · channel designer]\n  Studio --> Settings["/settings · full prefs"]\n\n  GL --> Live["channel LIVE → player bar"]\n  Arch --> Ed\n',
  },
  {
    id: 'planned-artist-1',
    pack: 'planned',
    source: 'artist.md',
    title: 'Artist — Go Live path',
    blurb: '---',
    mermaid:
      'flowchart LR\n  A[Studio → Go Live] --> B[Copy OBS / Icecast]\n  B --> C[Signal check]\n  C --> D[Go Live]\n  D --> E[Player bar · open channel]\n  D --> F[Multistream · secondary tab]\n',
  },
  {
    id: 'planned-board-member',
    pack: 'planned',
    source: 'board-member.md',
    title: 'Board member — navigation',
    blurb: '---',
    mermaid:
      'flowchart TD\n  POC[Nuclear tahti-web] -->|link-out| Admin["production /admin/*"]\n  Admin --> Users[Users · Streams · Support]\n  Admin --> Money[Financial · Grants]\n  Admin --> Org[Governance · AGM]\n',
  },
  {
    id: 'planned-navigation-flows-design-review',
    pack: 'planned',
    source: 'navigation-flows-design-review.md',
    title: '1. Spine',
    blurb: '---',
    mermaid:
      'flowchart TB\n  subgraph p1["Part 1 · Anonymous"]\n    L[Listen] --> C[Channel]\n    C --> PB[Player bar]\n    C --> RR[Right · Queue / Chat]\n  end\n  subgraph p2["Part 2 · Member"]\n    A[Auth] --> Lib[Library]\n    A --> Gov[Governance]\n    A --> Set[Settings]\n  end\n  subgraph p3["Part 3 · Artist"]\n    St[Studio tabs] --> GL[Go Live]\n    St --> Cat[Catalog · Editor]\n    Src[Sources tiles] --> Cat\n    Prof[Profile Design] --> St\n  end\n  p1 --> p2\n  p2 --> p3\n',
  },
];

export const FLOW_PACKS: {
  id: FlowDiagramPack;
  label: string;
  hint: string;
}[] = [
  {
    id: 'current',
    label: 'Current Tahti',
    hint: 'Production journeys (apps/web)',
  },
  { id: 'planned', label: 'Planned Nuclear', hint: 'tahti-web shell mapping' },
];
