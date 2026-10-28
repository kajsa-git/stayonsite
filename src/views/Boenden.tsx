'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import HeroIntentForm from '@/components/HeroIntentForm'
import { trackPhoneClick, trackEmailClick } from '@/lib/gtag'
import { useLanguage } from '@/contexts/LanguageContext'
import { localizedPropertyDescription } from '@/lib/property-description'
import { filterListings } from '@/lib/listing-search'

interface Listing {
  id: string
  name: string
  slug: string
  city: string | null
  postalCode: string | null
  squareMeters: number | null
  bedrooms: number | null
  beds: number | null
  furnished: boolean | null
  garage: boolean | null
  broadband: boolean | null
  kitchen: boolean | null
  egetBoende: boolean | null
  parkingSpaces: number | null
  publicDescription: string | null
  publicDescriptionEn: string | null
  publicDescriptionPl: string | null
  imageUrls: string[]
}

interface ListingLink {
  slug: string
  name: string
  city: string
}

const fetcher = async (url: string): Promise<Listing[]> => {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Failed to fetch listings: ${response.status}`)
  const data = await response.json()
  if (!Array.isArray(data)) throw new Error('Invalid listings response')
  return data
}

function PropertyCard({ listing, onInterest }: { listing: Listing; onInterest: (listing: Listing) => void }) {
  const { language } = useLanguage()
  const description = localizedPropertyDescription(listing, language)
  const [imgIdx, setImgIdx] = useState(0)
  const imgs = listing.imageUrls
  const hasImages = imgs.length > 0

  // Klick var som helst på kortet → detaljsidan (stretched-link-overlay, z-10).
  // Interaktiva kontroller (bildpilar, dots, intresse-knapp) ligger z-20 + preventDefault.
  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return (
    <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-nordic-100 flex flex-col">
      <Link href={`/boenden/${listing.slug}`} className="absolute inset-0 z-10" aria-label={listing.name}>
        <span className="sr-only">{listing.name}</span>
      </Link>

      {/* Bild — lägre på mobil så kortet inte äter en hel skärmhöjd */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] bg-nordic-100 overflow-hidden">
        {hasImages ? (
          <>
            <img
              src={imgs[imgIdx]}
              alt={listing.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {imgs.length > 1 && (
              <>
                <button
                  onClick={(e) => { stop(e); setImgIdx(i => Math.max(0, i - 1)) }}
                  className="absolute left-2 top-1/2 z-20 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors disabled:opacity-30"
                  disabled={imgIdx === 0}
                  aria-label="Föregående bild"
                >
                  ‹
                </button>
                <button
                  onClick={(e) => { stop(e); setImgIdx(i => Math.min(imgs.length - 1, i + 1)) }}
                  className="absolute right-2 top-1/2 z-20 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors disabled:opacity-30"
                  disabled={imgIdx === imgs.length - 1}
                  aria-label="Nästa bild"
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 z-20 -translate-x-1/2 flex gap-1">
                  {imgs.slice(0, 6).map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { stop(e); setImgIdx(i) }}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
                      aria-label={`Visa bild ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-nordic-400 text-sm">Bild saknas</div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-nordic-900 text-lg leading-tight mb-1">{listing.name}</h3>

        {/* Nyckeltal — postnumret hör hemma här med plats-ikon, inte som naken siffra vid rubriken */}
        <div className="flex flex-wrap gap-2 mb-3 text-sm text-nordic-700">
          {listing.bedrooms != null && (
            <span className="flex items-center gap-1">🛏 {listing.bedrooms} sovrum</span>
          )}
          {listing.beds != null && (
            <span className="flex items-center gap-1">👤 {listing.beds} bäddar</span>
          )}
          {listing.squareMeters != null && (
            <span className="flex items-center gap-1">📐 {listing.squareMeters} kvm</span>
          )}
          {listing.postalCode && (
            <span className="flex items-center gap-1 text-muted-foreground">📍 {listing.postalCode}</span>
          )}
        </div>

        {/* Faciliteter */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.furnished && <Chip>Möblerat</Chip>}
          {listing.kitchen && <Chip>Kök</Chip>}
          {listing.broadband && <Chip>Bredband</Chip>}
          {listing.egetBoende && <Chip>Eget boende</Chip>}
          {listing.garage && <Chip>Garage</Chip>}
          {(listing.parkingSpaces ?? 0) > 0 && <Chip>Parkering</Chip>}
        </div>

        {/* Beskrivning */}
        {description && (
          <p className="text-sm text-nordic-600 leading-relaxed mb-4 flex-1 line-clamp-2 sm:line-clamp-3">
            {description}
          </p>
        )}

        <button
          onClick={(e) => { stop(e); onInterest(listing) }}
          className="relative z-20 mt-auto w-full bg-[#ff6300] hover:bg-[#e55a00] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
        >
          Jag är intresserad
        </button>
      </div>
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] px-2 py-0.5 bg-nordic-100 text-nordic-700 rounded-full font-medium">
      {children}
    </span>
  )
}

function InterestModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
  const city = listing.city ?? 'Sverige'
  const smsText = encodeURIComponent(`Hej Kajsa! Jag är intresserad av boende i ${city}. Kan ni hjälpa mig?`)

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-nordic-900 mb-1">Intresserad av {city}?</h2>
        <p className="text-sm text-muted-foreground mb-6">Hör av dig så berättar vi mer och skickar detaljer.</p>

        <div className="space-y-3">
          <a
            href="tel:+46762498486"
            onClick={trackPhoneClick}
            className="flex items-center gap-3 w-full border border-nordic-200 rounded-xl px-4 py-3 hover:bg-nordic-50 transition-colors"
          >
            <span className="text-2xl">📞</span>
            <div>
              <div className="font-medium text-nordic-900 text-sm">Ring direkt</div>
              <div className="text-xs text-muted-foreground">076-249 84 86</div>
            </div>
          </a>

          <a
            href={`mailto:kajsa@stayonsite.se?subject=Intresserad av boende i ${encodeURIComponent(city)}`}
            onClick={trackEmailClick}
            className="flex items-center gap-3 w-full border border-nordic-200 rounded-xl px-4 py-3 hover:bg-nordic-50 transition-colors"
          >
            <span className="text-2xl">✉️</span>
            <div>
              <div className="font-medium text-nordic-900 text-sm">Mejla</div>
              <div className="text-xs text-muted-foreground">kajsa@stayonsite.se</div>
            </div>
          </a>

          <a
            href={`sms:+46762498486?body=${smsText}`}
            className="flex items-center gap-3 w-full border border-nordic-200 rounded-xl px-4 py-3 hover:bg-nordic-50 transition-colors"
          >
            <span className="text-2xl">💬</span>
            <div>
              <div className="font-medium text-nordic-900 text-sm">Skicka SMS</div>
              <div className="text-xs text-muted-foreground">Öppnar din meddelandeapp</div>
            </div>
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-4 w-full text-sm text-muted-foreground hover:text-nordic-900 transition-colors py-2"
        >
          Stäng
        </button>
      </div>
    </div>
  )
}

const PAGE_SIZE = 12

export function Boenden({ listingLinks = [] }: { listingLinks?: ListingLink[] }) {
  const { t } = useLanguage()
  const { data: listings = [], isLoading, isValidating, error, mutate } = useSWR<Listing[]>('/api/listings', fetcher)
  const [selected, setSelected] = useState<Listing | null>(null)

  const listingLinksByCity = listingLinks.reduce<Record<string, ListingLink[]>>((groups, listing) => {
    const cityListings = groups[listing.city] ?? []
    cityListings.push(listing)
    groups[listing.city] = cityListings
    return groups
  }, {})

  const searchInputRef = useRef<HTMLInputElement>(null)
  const [search, setSearch] = useState('')
  const [minimumBeds, setMinimumBeds] = useState(0)
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const hasFilters = search.trim().length > 0 || minimumBeds > 0

  const clearSearch = () => {
    setSearch('')
    setVisibleCount(PAGE_SIZE)
    searchInputRef.current?.focus()
  }

  const resetFilters = () => {
    setMinimumBeds(0)
    clearSearch()
  }

  const filtered = filterListings(listings, search, minimumBeds)
  const visible = filtered.slice(0, visibleCount)
  const resultStatus = error
    ? t('listingSearch.errorTitle')
    : isLoading ? t('listingSearch.loading')
      : t('listingSearch.results').replace('{shown}', String(visible.length)).replace('{total}', String(filtered.length))

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-[#0f1c2e] text-white pt-28 pb-16 px-4">
          <div className="max-w-6xl mx-auto grid items-center gap-8 lg:grid-cols-2">
            <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Lediga boenden</h1>
            <p className="text-white/70 text-lg max-w-xl">
              Möblerade hus och lägenheter för projektarbetare och företag i hela Sverige.
            </p>
            <a href="#available-homes" className="mt-5 inline-flex min-h-11 items-center font-semibold underline underline-offset-4">{t('navigation.availableHomes')}</a>
            </div>
            <HeroIntentForm />
          </div>
        </div>

        <div id="available-homes" className="scroll-mt-24 max-w-6xl mx-auto px-4 py-10">
          <section aria-labelledby="listing-search-heading" className="mb-6 rounded-2xl border border-nordic-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 id="listing-search-heading" className="mb-5 text-xl font-semibold text-nordic-900">
              {t('listingSearch.title')}
            </h2>
            <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
              <div className="flex flex-col gap-2">
                <label htmlFor="listing-search" className="text-sm font-medium text-nordic-900">
                  {t('listingSearch.label')}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    ref={searchInputRef}
                    id="listing-search"
                    type="search"
                    value={search}
                    placeholder={t('listingSearch.placeholder')}
                    onChange={(event) => { setSearch(event.target.value); setVisibleCount(PAGE_SIZE) }}
                    className="h-12 pl-11 pr-14 [&::-webkit-search-cancel-button]:appearance-none"
                  />
                  {search.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label={t('listingSearch.clearSearch')}
                      className="absolute right-0.5 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-md text-nordic-700 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <X className="size-5" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label htmlFor="listing-minimum-beds" className="text-sm font-medium text-nordic-900">
                  {t('listingSearch.minimumBeds')}
                </label>
                <select
                  id="listing-minimum-beds"
                  value={minimumBeds}
                  onChange={(event) => { setMinimumBeds(Number(event.target.value)); setVisibleCount(PAGE_SIZE) }}
                  aria-describedby="listing-minimum-beds-description"
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:text-sm"
                >
                  <option value={0}>{t('listingSearch.allSizes')}</option>
                  {[2, 4, 6, 8, 10].map((beds) => <option key={beds} value={beds}>{beds}+</option>)}
                </select>
                <p id="listing-minimum-beds-description" className="text-xs text-muted-foreground">{t('listingSearch.perProperty')}</p>
              </div>
            </div>
            <div className="mt-3 flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <p role="status" aria-live="polite" aria-atomic="true" className="text-sm text-muted-foreground">{resultStatus}</p>
              {hasFilters && (
                <button type="button" onClick={resetFilters} className="min-h-11 rounded-md px-3 text-sm font-medium text-nordic-700 underline underline-offset-4 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  {t('listingSearch.reset')}
                </button>
              )}
            </div>
          </section>

          {error ? (
            <div role="alert" className="rounded-2xl border border-nordic-200 bg-white px-6 py-12 text-center">
              <h3 className="mb-2 text-lg font-semibold text-nordic-900">{t('listingSearch.errorTitle')}</h3>
              <p className="text-sm text-muted-foreground">{t('listingSearch.errorDescription')}</p>
              <button
                type="button"
                onClick={() => { void mutate().catch(() => undefined) }}
                disabled={isValidating}
                className="mt-5 min-h-11 rounded-xl bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
              >
                {isValidating ? t('listingSearch.retrying') : t('listingSearch.retry')}
              </button>
            </div>
          ) : isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-nordic-100">
                  <div className="aspect-[4/3] bg-nordic-100 animate-pulse" />
                  <div className="p-4 space-y-2">
                    <div className="h-5 w-1/2 bg-nordic-100 rounded animate-pulse" />
                    <div className="h-4 w-2/3 bg-nordic-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-nordic-200 bg-white px-6 py-12 text-center">
              <h3 className="mb-2 text-lg font-semibold text-nordic-900">
                {hasFilters ? t('listingSearch.noResultsTitle') : t('listingSearch.emptyTitle')}
              </h3>
              <p className="mx-auto max-w-lg text-sm text-muted-foreground">
                {hasFilters ? t('listingSearch.noResultsDescription') : t('listingSearch.emptyDescription')}
              </p>
              <a href="#hero-inquiry" className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-accent px-6 font-semibold text-accent-foreground hover:bg-accent/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                {t('listingSearch.help')}
              </a>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map(listing => (
                  <PropertyCard key={listing.id} listing={listing} onInterest={setSelected} />
                ))}
              </div>
              {filtered.length > visibleCount && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setVisibleCount(count => count + PAGE_SIZE)}
                    className="min-h-11 rounded-xl border border-nordic-300 bg-white px-6 text-sm font-semibold text-nordic-800 transition-colors hover:border-nordic-500"
                  >
                    {t('listingSearch.showMore').replace('{count}', String(filtered.length - visibleCount))}
                  </button>
                </div>
              )}
            </>
          )}

          {/* Server-renderad länkförteckning: gör alla publicerade detaljsidor
              nåbara utan att besökaren eller sökroboten måste klicka paginering. */}
          {listingLinks.length > 0 && (
            <section className="mt-16" aria-labelledby="all-listings-heading">
              <div className="mb-6">
                <h2 id="all-listings-heading" className="text-2xl font-bold text-nordic-900">
                  Alla lediga boenden per ort
                </h2>
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  Öppna en ort för att se samtliga publicerade företagsboenden. Tillgängligheten kan ändras snabbt.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Object.entries(listingLinksByCity).map(([city, cityListings]) => (
                  <details key={city} className="group rounded-xl border border-nordic-200 bg-white p-4">
                    <summary className="cursor-pointer list-none font-semibold text-nordic-900 marker:hidden">
                      <span className="flex items-center justify-between gap-3">
                        <span>{city}</span>
                        <span className="text-xs font-medium text-nordic-500">
                          {cityListings.length} {cityListings.length === 1 ? 'boende' : 'boenden'}
                        </span>
                      </span>
                    </summary>
                    <ul className="mt-3 space-y-2 border-t border-nordic-100 pt-3">
                      {cityListings.map((listing) => (
                        <li key={listing.slug}>
                          <Link
                            href={`/boenden/${listing.slug}`}
                            className="text-sm text-nordic-700 underline decoration-nordic-300 underline-offset-4 transition-colors hover:text-[#e55a00]"
                          >
                            {listing.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Inte hittat rätt? */}
          {!error && filtered.length > 0 && (
            <div className="mt-16 text-center bg-white rounded-2xl border border-nordic-100 p-8">
              <h2 className="font-bold text-nordic-900 text-xl mb-2">Hittade du inte rätt?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                Vi har tillgång till fler objekt och kan ofta hitta boenden som inte syns här. Berätta vad ni behöver.
              </p>
              <Link href="/#inquiry" className="inline-block bg-[#ff6300] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#e55a00] transition-colors text-sm">
                Skicka en förfrågan
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {selected && <InterestModal listing={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
