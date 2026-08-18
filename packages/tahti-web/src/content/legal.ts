export type LegalPage = {
  slug: 'about' | 'terms' | 'privacy' | 'agpl' | 'what-is-it';
  title: string;
  description: string;
  productionPath: string;
  sections: Array<{ heading: string; paragraphs: string[] }>;
};

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: 'about',
    title: 'About Tahti',
    description:
      'A Finnish nonprofit broadcasting platform owned and governed by its artist members.',
    productionPath: '/about',
    sections: [
      {
        heading: 'Our mission',
        paragraphs: [
          'Tahti ry is a Finnish nonprofit association founded to put money, audience, and infrastructure in the hands of independent musicians — with no shareholders, no advertising, and no exit.',
          'The platform exists to be the best broadcasting home for independent artists. Quality is a constitutional obligation, not an aspiration.',
        ],
      },
      {
        heading: 'How the money works',
        paragraphs: [
          'Artists can use a free tier or support the cooperative with membership (€40/year). Operating surplus is largely returned to artists as grants based on engagement.',
          'Fan subscriptions go almost entirely to the artist (2% platform fee into the grant pool). Full ledgers live on the transparency page.',
        ],
      },
      {
        heading: 'Open source',
        paragraphs: [
          'Tahti is AGPL-licensed. See the AGPL notice in this app and the full source on production.',
        ],
      },
    ],
  },
  {
    slug: 'terms',
    title: 'Terms of use',
    description: 'Summary of account, streaming, and community expectations.',
    productionPath: '/terms',
    sections: [
      {
        heading: 'Using Tahti',
        paragraphs: [
          'By using Tahti you agree to follow Finnish law, respect other members, and not abuse streaming, chat, or download infrastructure.',
          'Artists remain responsible for the rights to music and media they broadcast or upload.',
        ],
      },
      {
        heading: 'Accounts & membership',
        paragraphs: [
          'Membership in Tahti ry is optional for listening; artist accounts may use free tier or paid membership for expanded live time and cooperative rights.',
          'This POC shows a condensed summary — the binding terms are on tahti.live/terms.',
        ],
      },
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy',
    description: 'What we collect and why — anonymous-first listening.',
    productionPath: '/privacy',
    sections: [
      {
        heading: 'Listening',
        paragraphs: [
          'You can listen and chat without an account. Anonymous listen metrics use rotating fingerprints, not marketing cookies.',
          'Accounts exist mainly where billing, governance, or artist tools require identity.',
        ],
      },
      {
        heading: 'Data rights',
        paragraphs: [
          'Signed-in users can export or request deletion of personal data from the production dashboard privacy tools.',
          'Full privacy policy: tahti.live/privacy.',
        ],
      },
    ],
  },
  {
    slug: 'agpl',
    title: 'AGPL notice',
    description: 'GNU Affero General Public License v3 for Tahti software.',
    productionPath: '/agpl',
    sections: [
      {
        heading: 'License',
        paragraphs: [
          'Tahti application code is licensed under the GNU Affero General Public License v3.0 or later.',
          'If you run a modified version of the network service, you must offer corresponding source to users who interact with it over a network.',
          'This Nuclear listen POC is part of exploring a production listen client; see tahti.live/agpl and the Tahti repository for the full license text and source.',
        ],
      },
    ],
  },
  {
    slug: 'what-is-it',
    title: 'What is it',
    description:
      'Broadcasting for independent artists. A nonprofit platform built to support artists, not algorithms.',
    productionPath: '/what-is-it',
    sections: [
      {
        heading: 'The hook',
        paragraphs: [
          "tahti.live is the home for your music, and your live shows. It's built on one simple belief: an artist should spend their time making art. So we've automated the tedious, mechanical work, drawn from decades of experience in streaming, so you're free to do what you're actually good at. It's two things at once: the ultimate discography and release system, and a proper broadcasting platform built for performers. Studio-quality lossless sound, publishing in one click, and live shows that practically run themselves.",
        ],
      },
      {
        heading: 'Time back for your art',
        paragraphs: [
          'Everything here is designed to take the busywork off your plate. Episode numbering, metadata, official registration, publishing to every platform, all handled for you, automatically. You just make the music; tahti.live takes care of the rest.',
        ],
      },
      {
        heading: 'Built for broadcasters',
        paragraphs: [
          "Live performance sits right at the heart of tahti.live. It's a release system for your weekly show, or your daily one, you decide. Setting up a show is effortless: you enter the name and the description, and it generates all the episode numbers and gets everything right, so all you have to do is perform. And getting connected takes seconds, not an evening of forum-diving, whatever you broadcast with: OBS, Mixxx, Traktor, or straight from your browser. For OBS you download a ready-made profile with your stream address and credentials already baked in; import it and you're live. For the others we hand you a pre-filled setup with the exact server and login details in place, so it's copy-paste, not guesswork. No hunting for mount points, no mistyped passwords. When you go live, there's a green room where you can check your levels against the station's current levels before you're on air. And shows can be handed off seamlessly, you can pick up right where another artist leaves off. Each show is its own individual thing: you front it yourself, and you run it as far as you can take it. Tahti Radio ties it all together, a twenty-four-seven stream made up of live shows, where artists book their time and go on air in the same continuous broadcast. It's a place listeners come to hear live artist performances, as they happen. And the music never stops because someone clicked a menu: no DJ ever walks off stage because someone in the crowd checked their phone. The audio never stops on navigation, the one law radio has never broken since the invention of radio.",
        ],
      },
      {
        heading: 'Listeners get the gold too',
        paragraphs: [
          "We don't pour everything into the artist and then hand the listener a watered-down version. The person listening hears it the way you made it, full, lossless quality, the real thing, the same treatment the artist gets. We only ever scale down when it's genuinely needed, like mobile on a weak connection, and even then it's a smart, gentle adjustment. And here's our golden rule: if a stream is ever degraded, we always tell you. You'll know when you're not getting the full experience, no quietly serving something lesser and pretending it's the real thing. Same respect for everyone in the chain.",
        ],
      },
      {
        heading: "Who it's for",
        paragraphs: [
          "tahti.live is built for anyone who makes something and wants a real home for it, not a profile on someone else's platform, but a stage and a discography of their own. It's for the DJ with a weekly show who's tired of re-uploading the same set to five places. It's for the producer sitting on a deep back catalogue that deserves better than a compressed stream. It's for the ambient and experimental artist who wants the sound to arrive exactly as it left the studio. It's for the talk-radio host, the podcaster, the mix-show curator, anyone whose work is as much about the live moment as the recording. And it's for collectives and crews who want to run a shared channel, hand shows off between members, and build something together under one roof. If you perform, broadcast, or release, and you want to own the whole thing rather than rent a corner of it, this is for you.",
        ],
      },
      {
        heading: 'Publishing',
        paragraphs: [
          "When you hit publish, it lands first in your own library, your discography, your control. From there you choose who sees it: specific fans, subscribers, or the world. Then there's the release system. You can schedule your drop, pick your platforms, and push it out: SoundCloud, Mixcloud, Bandcamp, Spotify, Kick, and more. Whatever you broadcast here, you can simulcast onward to every channel you're on. Fans can watch from those platforms, or come straight to the source, where the sound quality is best. We take no middleman cut. The only cost is if you push to a DSP like Spotify, there's an eight-euro fee that goes straight to Spotify, because that's what it costs them; the rest is free. All you do is hand over your API key, and you're set.",
        ],
      },
      {
        heading: 'Source, both ways, and storage',
        paragraphs: [
          "It works in both directions. Just as you push out to other services, you can pull your whole catalogue in: SoundCloud, Mixcloud, Bandcamp, most of the ones we mentioned, imported as-is. Best for talk shows or anything where you don't mind, since music is at its finest straight from the source. And you can link your Google Drive too, so if you want to publish on the go, you just connect the drive and pull material in, automated or manual, your call. Storage is practically unlimited. Keep your whole back catalogue in there without ever watching a quota. There's no visible limit at all. Behind the scenes we run some quiet safety checks, just so everything stays legitimate, but a real artist almost never brushes up against it.",
        ],
      },
      {
        heading: 'Official releases',
        paragraphs: [
          "Releasing isn't just publishing, it's made official. tahti.live hooks straight into the fingerprinting and metadata services like MusicBrainz. It automatically fingerprints your track and registers the release, so it officially becomes yours. No manual submissions, no chasing paperwork.",
        ],
      },
      {
        heading: 'The in-platform studio',
        paragraphs: [
          "tahti.live isn't just where your music lives, it's where you finish it. Built right in is a full-blown audio editor, with the professional plug-ins you'd actually reach for: compressor, limiter, the whole toolkit. You click edit, make changes, and it saves a new revision, so you can travel between versions and pick the one you love. You never lose anything. For everyday fixes like normalization and trimming, quick tools do it in one click. And for the remix crowd: you can separate stems straight from a file. Just select the parts you want, and it hands them back as clean audio. All of it runs on a local, private model, on our own hardware, so it stays yours and the results are genuinely professional. The upshot: from the moment you finish a show or upload a file, you can record, edit, master, and split stems without ever opening a separate app. You don't even need your own computer for it.",
        ],
      },
      {
        heading: 'Your own space',
        paragraphs: [
          "When you register, you don't just get an account, you get a home on the web that's truly yours. Your own domain, right off the bat: if your artist name is Baba, your channel lives at baba dot live. And it's yours to shape. You control the look at every level: the whole channel, an individual album, a single release, even one show. Different visuals, different colour schemes, whatever fits the mood of the art. Design it completely your way, or pick one of our presets if you'd rather just get on with the music. There's a live chat on your channel too, optional, and you can limit it to subscribers only if you want. On top of that, you get a dedicated artist email address on your own domain, a real inbox, so you decide who reaches you and how. Your domain, your design, your inbox, your content, with or without a twenty-four-seven stream running underneath it. Think of it as a modern space to call your own.",
        ],
      },
      {
        heading: 'Direct fan support',
        paragraphs: [
          "Your fans can back you directly: subscriptions, one-off support, fan tiers, whatever fits your world. And here's the part that matters: we take essentially nothing. The fan support is yours, there's just a tiny two-percent operational fee to cover the card processing and support, and that's it. No middleman skimming your rent money, and when we say zero cut, we mean zero, not zero-plus-hidden-fees. The support your fans give is your support. It's a real, direct line between you and the people who love what you do; you own that relationship, not a platform.",
        ],
      },
      {
        heading: 'How you get paid',
        paragraphs: [
          "Two ways money comes to you. One from your fans, one from a shared pot, and both lean your way. First: fans pay you, and it's a hundred percent yours. When a fan sends you one euro, you get one euro. We only keep two cents to cover the bank. That's it. Second: a slice of the shared pot. Every year the platform shares its spare money with artists. The more people actually grab your music, the bigger your slice. How big is your slice? Count your stars. If you give a song away, that's one star. If someone buys a song, that's five stars. If your music just plays in the background, that earns nothing. So the more stars you gather, the bigger your slice of the pot, and there's no single right way to win. Give it away, or sell it: both win. Only doing nothing earns nothing.",
        ],
      },
      {
        heading: 'Keeping it honest',
        paragraphs: [
          "Any system that pays out based on numbers invites someone to inflate the numbers. So here's how we handle it. The first defence is structural: passive listening earns nothing. The classic trick, bot farms leaving streams running around the clock, simply doesn't work here, because there's no reward for it. Stars come from downloads and from fan money, and both require a deliberate act by a real person. Paid downloads require an actual card, which makes them expensive to fake. On top of that, the obvious mechanics are in place: downloads are counted once per account, not once per click, and there are rate limits so nobody can hammer the same track a thousand times. The layer we're building next is pattern detection: real fandom is messy, while fake activity is too tidy. Accounts created in a batch that only ever engage with one artist, downloads arriving at suspiciously even intervals, clusters sharing the same network, or reciprocal rings where a group pumps each other's numbers in a closed loop. And here's the part that matters most: nothing gets docked silently by an algorithm. Anomalies get flagged for a human to review, the artist is told, and there's a right of appeal. We'd rather occasionally miss something than quietly punish someone who did nothing wrong.",
        ],
      },
      {
        heading: 'Original work, and mixes',
        paragraphs: [
          "These are two different things, and we treat them differently. For original tracks and releases, every file is fingerprinted on upload and checked against the music databases. If someone uploads a work that isn't theirs and claims it as their own, that's a warning, then a temporary suspension, and in serious cases the account goes. That protection exists for you; it's what makes a release on tahti.live mean something. Mixes and sets are a different form entirely, and they're built from other people's records by design. Nobody's pretending otherwise. What we do ask for is a tracklist, and that's less of an obligation than it sounds, because you can tag any artist who's on the platform directly in it. Their name links back to their channel. So crediting the records you played sends listeners straight to the people who made them. The tracklist isn't a compliance chore; it's how the scene lifts itself.",
        ],
      },
      {
        heading: "Open by design, you're never locked in",
        paragraphs: [
          "tahti.live is open source, all of it, under a licence called AGPL. In plain terms: the code that runs the platform is out in the open for anyone to read, and every page links straight to its own source. That's not a gimmick, it's a promise about power. Forks aren't just tolerated, they're welcomed. And it goes hand in hand with a simple rule: no lock-in, ever. Your releases, your archive, your analytics, your fan-support records, you can export all of it, any time, and that export is tested regularly to make sure it actually works. So you're never a hostage. You stay because it's good, not because leaving would cost you everything you've built.",
        ],
      },
      {
        heading: 'It can never be turned against you',
        paragraphs: [
          "Here's the guarantee that sits underneath all of it. Because AGPL covers network use, anyone running tahti.live, us included, must publish the exact source they run. There is no secret version, no quietly-worse build shipped behind your back. And if whoever runs it ever betrays the mission, the code and your data belong to the commons: the community can fork it and run it themselves. So play it out. If prices ever crept up or a paid tier appeared, you could fork it and run it your way. If ads or data-selling ever slipped in, the constitution forbids it, and the public source means it couldn't hide. If the organisation were ever sold, or folded, the platform would live on and you'd export everything. If a feature you rely on were removed, you'd keep it alive in a fork. There is no version of this where you're trapped.",
        ],
      },
      {
        heading: 'Rooted in Helsinki, independent by design',
        paragraphs: [
          "tahti.live runs on its own infrastructure in Helsinki: Finnish servers, a Finnish nonprofit, no giant foreign platform sitting underneath it. That's a deliberate choice. It means the data lives under European privacy standards, close to home, not scattered across data centres owned by companies whose business is watching people. And the privacy approach follows from the same values: listening is anonymous by default, there are no analytics cookies tracking you around, and the identifiers we do handle are scrambled and rotated daily, so we genuinely can't tell that the same listener came back yesterday. We don't sell data, because we don't even collect it in a form that would let us. It's a Nordic, independent home for the scene, quietly, structurally on your side.",
        ],
      },
      {
        heading: 'The people behind it',
        paragraphs: [
          "tahti.live was founded by Jani, who's been building software and streaming solutions since the early two-thousands. Two decades of watching how these platforms work, where they cut corners, and where they let artists down, that experience is the reason tahti.live automates the tedious parts instead of piling them on. Working alongside is a senior UX designer whose job is to keep the whole thing genuinely usable, so all that capability underneath never turns into clutter on the surface. The technical depth and the design discipline pull in the same direction: powerful, but never a chore. But here's the part that matters most: tahti.live was designed not to depend on any one person, founder included. It's run by a paid director on a fair, deliberately modest Finnish nonprofit salary, a real role with a real job description, a proper hiring process, and a documented succession plan. The founder runs it forever is explicitly not the plan. The board gains an elected artist representative from the second year and becomes artist-majority by the fourth, so over time the people governing tahti.live are the people making the music on it. It's built to outlast any of us.",
        ],
      },
      {
        heading: 'Plans: free to listen, forty euros a year to be an artist',
        paragraphs: [
          "That's the whole pricing. Listening is always free and always lossless. One membership unlocks everything an artist needs; there's no premium tier, no upsell, no features held back for a bigger plan. Free, for everyone: listen to everything in full lossless quality, follow channels and join live chat, subscribe to and support the artists you love, and start a basic channel to try broadcasting. Artist Membership, forty euros a year, everything included: broadcast live in lossless FLAC; publish and simulcast everywhere, with official releases fingerprinted and registered; keep zero percent cut on fan support, with practically unlimited storage; use the advanced audio editor, with plugins, stems, and version history; get your own domain, baba dot live, with full channel design; run live chat on your channel, plus direct fan messaging. One flat price; nothing locked away.",
        ],
      },
      {
        heading: "How it's funded",
        paragraphs: [
          "tahti.live runs on the cleanest possible money: member subscriptions, direct fan support, and cultural grants. That's it. No venture capital, no equity, no investors who need the thing sold off in five years to get their money back. That's not an accident, it's written into the constitution, precisely so no outside money can ever pull tahti.live away from artists. The break-even is modest, a few hundred members covers the first year, and from there the surplus doesn't line anyone's pockets. Ninety percent of it flows back to artists as grants; the rest builds a small safety reserve and nothing more. On top of that sits a grant pipeline aimed at the funders whose actual mission is to support exactly this kind of work. The Finnish Cultural Foundation backs cultural projects run by organisations working in Finland, which is precisely what tahti.live is. Kone Foundation funds bold, experimental cultural work that doesn't fit the usual moulds, and an artist-owned, open-source broadcasting commons is exactly that kind of unconventional bet. The Finnish Music Foundation supports the development of Finnish music and its infrastructure across every genre, which is the layer tahti.live actually builds. And at the European level, Creative Europe funds cross-border cultural cooperation, a natural fit for a platform built to connect and simulcast across scenes. None of these buy influence or equity; they simply top up the pool that flows back to artists. And to keep it clean, the grant payouts are administered by an external accounting firm and independently audited.",
        ],
      },
      {
        heading: 'Governance: you own it',
        paragraphs: [
          "tahti.live isn't a company you upload to, it's an association you own. A registered Finnish nonprofit, and every artist member is a real member. One member, one vote, and it's real power, not decoration. Here's how it works: every quarter, the features and changes people want go up as one big open list, and you vote, for or against, with real back-and-forth and honest creative criticism. The top-voted ones make the cut, and every quarter a new version ships with exactly those. The train moves four times a year: you vote, and you know when you'll get it. Whoever runs the day-to-day can't override the membership; the roadmap is set by you, not handed down. And the core promises, never taking a cut of fan support, never selling listener data, never running ads, are locked in the constitution and can only be changed by a two-thirds vote of the whole membership, with sixty days' notice. So the things that protect you can't be quietly undone. There's no exit, no acquisition, no shareholders; the surplus flows back to artists as grants, decided transparently, and the board becomes artist-majority as it matures, so the people steering it are the people making the music. You make the music, you promote the scene, and you steer the ship.",
        ],
      },
      {
        heading: 'Transparency: the books are open',
        paragraphs: [
          "A community-run thing lives or dies on trust, so tahti.live is built to be checkable, not just trusted. The rules that protect you aren't buried in a terms-of-service nobody reads; the bylaws are public and version-tagged, so you can see every change and when it happened. The annual finances are published and independently audited. What the people running it get paid is public. Board decisions are published, so if something's been decided, you can see what and why. Even the vendor contracts above a certain size are listed out in the open. And the grant pool, the money that flows back to artists, runs on a public ledger, so you can see the flows for yourself. Nothing important happens behind a curtain. You don't have to take our word for any of it; you can just look.",
        ],
      },
      {
        heading: 'Roadmap and timeline',
        paragraphs: [
          "This isn't a someday project, it's already running. The beta is live now, and the machinery underneath it works. The final interface is still taking shape and lands over the next two weeks, that's the piece being finished right now. Alongside it, the invite round opens, and that's where this community comes in: a first wave of artists getting on the platform, setting up channels, running shows, and telling us what's rough before the doors open wide. Public launch is end of September. From there the rhythm we described takes over: four releases a year, each carrying the features the membership voted up. So the honest picture is: the hard part is built, the surface is being finished as we speak, and the next stretch is about getting real artists on it. After that, the roadmap stops being ours and starts being yours.",
        ],
      },
      {
        heading: 'Honest risks',
        paragraphs: [
          "Here's what could go wrong, and what we're doing about it. First, it could stay small. A platform for artists is only worth anything if artists are actually on it, and a quiet room helps nobody. That's precisely why we're starting with communities like this one rather than shouting into the void; a scene that already talks to each other is worth more than ten thousand scattered signups. Second, funding timing. The model breaks even at a few hundred members, which is deliberately modest, but it's not zero, and grants are applications, not guarantees. If the funding comes in slower than hoped, the honest answer is that development slows down, not that the promises change, because the promises are constitutional. Third, a small team. Right now this is a small team, and small teams are fragile. That's exactly why the succession plan and the artist-majority board are written in from the start rather than bolted on later. Fourth, we will get things wrong. The beta will have rough edges, the first invite round will surface things we didn't see coming, and some feature everyone wants will take longer than it should. What we can promise isn't perfection; it's that you'll hear about it from us first, and you'll have a vote on what gets fixed next. And fifth, infrastructure. Right now the capacity, storage and the power to run it, is covered by the founding setup, and that comfortably carries the first couple of hundred members. Past that, the costs have to come from somewhere. The reassuring part is that they arrive together: at two hundred members you also have two hundred memberships coming in, and that covers the hosting step up. So it isn't a cliff, it's a handover. The strong candidate for that next tier is Nebula, Finnish, well priced, and straightforward to work with, though it isn't signed yet.",
        ],
      },
      {
        heading: 'Close',
        paragraphs: [
          "Don't imagine it, come through the door. The beta is running now; the invite round opens in weeks. Join it.",
        ],
      },
    ],
  },
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug);
}
