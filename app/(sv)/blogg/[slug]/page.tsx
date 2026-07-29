import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { buildMetadata } from '@/lib/metadata'
import { blogPosts, getBlogPost } from '@/data/blog-posts'

import PersonalboendGuide2026 from '@/views/blogg/PersonalboendGuide2026'
import PrivatuthyrningslagenReform2026 from '@/views/blogg/PrivatuthyrningslagenReform2026'
import GronOmstallningBoende from '@/views/blogg/GronOmstallningBoende'
import InfrastrukturBoendeKarta2026 from '@/views/blogg/InfrastrukturBoendeKarta2026'
import ForsakringPersonalboendeGuide2026 from '@/views/blogg/ForsakringPersonalboendeGuide2026'
import AvtalskravPersonalboendeGuide2026 from '@/views/blogg/AvtalskravPersonalboendeGuide2026'
import ArbetstillstandJuni2026Guide from '@/views/blogg/ArbetstillstandJuni2026Guide'
import DatacenterMontorboendeGuide2026 from '@/views/blogg/DatacenterMontorboendeGuide2026'
import RegionalBostadsanalys2026 from '@/views/blogg/RegionalBostadsanalys2026'
import InfrastrukturKontraktPersonalBoendeChecklista2026 from '@/views/blogg/InfrastrukturKontraktPersonalBoendeChecklista2026'
import KompetensRekryteringByggsektornGuide2026 from '@/views/blogg/KompetensRekryteringByggsektornGuide2026'
import BlockhyraRegler2026 from '@/views/blogg/BlockhyraRegler2026'
import NewMortgageRulesGuide2026 from '@/views/blogg/NewMortgageRulesGuide2026'
import SaFungerarDetHusagare2026 from '@/views/blogg/SaFungerarDetHusagare2026'
import HyraUtJamforelse2026 from '@/views/blogg/HyraUtJamforelse2026'
import PersonalboendeVanligaFragor2026 from '@/views/blogg/PersonalboendeVanligaFragor2026'
import PersonalboendeVsHotellKostnad2026 from '@/views/blogg/PersonalboendeVsHotellKostnad2026'
import BlockhyraInfrastrukturprojekt2026 from '@/views/blogg/BlockhyraInfrastrukturprojekt2026'
import SommaruthyrningMontorerGuide2026 from '@/views/blogg/SommaruthyrningMontorerGuide2026'
import SchablonavdragSkattBlockhyraHusagare2026 from '@/views/blogg/SchablonavdragSkattBlockhyraHusagare2026'
import BostadsbyggandeAterhamtningPrognosArtikel from '@/views/blogg/BostadsbyggandeAterhamtningPrognosArtikel'
import BlockhyraPrivatuthyrningJuli2026 from '@/views/blogg/BlockhyraPrivatuthyrningJuli2026'
import InfrastrukturplanPersonalboende2026 from '@/views/blogg/InfrastrukturplanPersonalboende2026'
import KompetensbristenByggsektorn2026 from '@/views/blogg/KompetensbristenByggsektorn2026'
import NyaHyreslagenJuli2026ForetagPersonalboende from '@/views/blogg/NyaHyreslagenJuli2026ForetagPersonalboende'
import ForeberedFastighetBlockhyraInfrastruktur2026 from '@/views/blogg/ForeberedFastighetBlockhyraInfrastruktur2026'
import BlockhyraPersonalbostaderNyaReglerImplementering2026 from '@/views/blogg/BlockhyraPersonalbostaderNyaReglerImplementering2026'
import BoendeUtlandskaArbetareByggGuide2026 from '@/views/blogg/BoendeUtlandskaArbetareByggGuide2026'
import ForberedInfrastrukturkontrakt2026Guide from '@/views/blogg/ForberedInfrastrukturkontrakt2026Guide'
import ForetagsbostaderNyaReglerJuli2026Guide from '@/views/blogg/ForetagsbostaderNyaReglerJuli2026Guide'
import ElnatsutbyggnadNordSydPersonalboende from '@/views/blogg/ElnatsutbyggnadNordSydPersonalboende'
import KriminalvardenAnstaltsbyggePersonalboende from '@/views/blogg/KriminalvardenAnstaltsbyggePersonalboende'
import VadKostarPersonalboende2026 from '@/views/blogg/VadKostarPersonalboende2026'
import LagenhetshotellEllerForetagsbostad2026 from '@/views/blogg/LagenhetshotellEllerForetagsbostad2026'
import NyaByggreglerJuli2026Ombyggnad from '@/views/blogg/NyaByggreglerJuli2026Ombyggnad'

const componentMap: Record<string, React.ComponentType> = {
  'personalboende-guide-2026': PersonalboendGuide2026,
  'privatuthyrningslagen-reform-2026': PrivatuthyrningslagenReform2026,
  'gron-omstallning-norr-boende': GronOmstallningBoende,
  'infrastruktur-personalboende-karta-2026': InfrastrukturBoendeKarta2026,
  'forsakring-ansvar-personalboende-guide-2026': ForsakringPersonalboendeGuide2026,
  'avtalskrav-personalboende-guide-2026': AvtalskravPersonalboendeGuide2026,
  'arbetskraftsinvandring-juni-2026-guide-byggforetag': ArbetstillstandJuni2026Guide,
  'datacenter-montorboende-guide-2026': DatacenterMontorboendeGuide2026,
  'regional-bostadsanalys-2026-var-finns-boende-montorer': RegionalBostadsanalys2026,  'infrastrukturkontrakt-personalboende-checklista-2026': InfrastrukturKontraktPersonalBoendeChecklista2026,  'kompetens-rekrytering-byggsektorn-guide-2026': KompetensRekryteringByggsektornGuide2026,  'blockhyra-nya-regler-juli-2026-guide-foretag': BlockhyraRegler2026,  'nya-bolaneregler-april-2026-personalboende-guide': NewMortgageRulesGuide2026,
  'sa-fungerar-det-fran-intresse-till-forsta-hyran': SaFungerarDetHusagare2026,
  'hyra-ut-jamforelse-stayonsite-vs-andra-2026': HyraUtJamforelse2026,
  'personalboende-vanliga-fragor-byggforetag': PersonalboendeVanligaFragor2026,
  'personalboende-vs-hotell-kostnad-jamforelse': PersonalboendeVsHotellKostnad2026,  'blockhyra-infrastrukturprojekt-ostlanken-norrbotnibanan-2026': BlockhyraInfrastrukturprojekt2026,  'sommaruthyrning-montorer-guide-2026': SommaruthyrningMontorerGuide2026,  'schablonavdrag-skatt-blockhyra-husagare-2026': SchablonavdragSkattBlockhyraHusagare2026,  'var-aterhamtar-bostadsbyggandet-montorboende-prognos-2026': BostadsbyggandeAterhamtningPrognosArtikel,  'hyra-ut-blockhyra-privatuthyrningslagen-juli-2026-husagare': BlockhyraPrivatuthyrningJuli2026,  'infrastrukturplan-2026-2037-personalboende-guide': InfrastrukturplanPersonalboende2026,  'kompetensbristen-byggsektorn-2026-praktisk-rekryteringsguide': KompetensbristenByggsektorn2026,  'nya-hyreslagen-juli-2026-foretag-personalboende-guide': NyaHyreslagenJuli2026ForetagPersonalboende,  'forbered-fastighet-blockhyra-infrastruktursatsning-2026': ForeberedFastighetBlockhyraInfrastruktur2026,  'blockhyra-personalbostader-nya-regler-implementering-2026': BlockhyraPersonalbostaderNyaReglerImplementering2026,  'boende-utlandska-arbetare-bygg-praktisk-guide-2026': BoendeUtlandskaArbetareByggGuide2026,  'forbered-infrastrukturkontrakt-2026-boende-entreprenorer-guide': ForberedInfrastrukturkontrakt2026Guide,  'foretagsbostader-nya-regler-juli-2026-guide': ForetagsbostaderNyaReglerJuli2026Guide,  'elnatsutbyggnad-nordsyd-personalboende-guide-2026': ElnatsutbyggnadNordSydPersonalboende,  'kriminalvarden-anstaltsbygge-personalboende-2026': KriminalvardenAnstaltsbyggePersonalboende,
  'vad-kostar-personalboende-sverige-2026-verkliga-priser': VadKostarPersonalboende2026,
  'lagenhetshotell-eller-foretagsbostad-2026': LagenhetshotellEllerForetagsbostad2026,  'nya-byggregler-juli-2026-ombyggnad-personalboende': NyaByggreglerJuli2026Ombyggnad,
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return {}

  const articleUrl = `https://www.stayonsite.se/blogg/${post.slug}`
  return buildMetadata({
    title: `${post.title.sv} | StayOnSite`,
    description: post.description.sv,
    canonical: articleUrl,
    type: 'article',
    articlePublishedTime: `${post.publishedDate}T00:00:00Z`,
    articleModifiedTime: `${post.updatedDate || post.publishedDate}T00:00:00Z`,
    articleAuthor: 'https://www.stayonsite.se',
    articleSection: post.category,
    articleTags: post.tags,
    hreflangs: [
      { lang: 'sv', href: articleUrl },
      ...(post.en ? [{ lang: 'en', href: `https://www.stayonsite.se/en/blog/${post.en.slug}` }] : []),
      { lang: 'x-default', href: articleUrl },
    ],
    locale: 'sv',
  })
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const Component = componentMap[slug]
  if (!Component) notFound()
  return <Component />
}
