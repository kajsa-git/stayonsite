import type { Metadata } from 'next';
import EditorialGuidelines from '@/views/blogg/EditorialGuidelines';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Redaktionella riktlinjer för bloggen | StayOnSite',
  description: 'Så arbetar StayOnSite med erfarenhet, primärkällor, AI-stöd, uppdateringar och rättelser i bloggen.',
  canonical: 'https://www.stayonsite.se/blogg/redaktionella-riktlinjer',
  hreflangs: [
    { lang: 'sv', href: 'https://www.stayonsite.se/blogg/redaktionella-riktlinjer' },
  ],
  locale: 'sv',
});

export default function Page() {
  return <EditorialGuidelines />;
}
