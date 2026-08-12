export type LegalPage = {
  slug: 'about' | 'terms' | 'privacy' | 'agpl';
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
];

export function getLegalPage(slug: string): LegalPage | undefined {
  return LEGAL_PAGES.find((p) => p.slug === slug);
}
