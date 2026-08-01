'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { trackPhoneClick, trackEmailClick } from '@/lib/gtag'

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
  imageUrls: string[]
}

const fetcher = (url: string) => fetch(url).then(r => r.json())

function PropertyCard({ listing, onInterest }: { listing: Listing; onInterest: (listing: Listing) => void }) {
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
        {listing.publicDescription && (
          <p className="text-sm text-nordic-600 leading-relaxed mb-4 flex-1 line-clamp-2 sm:line-clamp-3">
            {listing.publicDescription}
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

function FilterBtn({ children, active, onClick }: { children: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
        active ? 'bg-[#0f1c2e] text-white border-[#0f1c2e]' : 'bg-white text-nordic-700 border-nordic-200 hover:border-nordic-400'
      }`}
    >
      {children}
    </button>
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

export function Boenden() {
  const { data: listings = [], isLoading } = useSWR<Listing[]>('/api/listings', fetcher)
  const [selected, setSelected] = useState<Listing | null>(null)

  const cities = [...new Set(listings.map(l => l.city).filter(Boolean) as string[])].sort()
  const [cityFilter, setCityFilter] = useState<string>('alla')
  // Paginering i klienten: allt är redan hämtat, men 30+ kort i rad gör mobilsidan
  // milslång — visa 12 åt gången. Filterbyte nollställer.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  const selectCity = (city: string) => {
    setCityFilter(city)
    setVisibleCount(PAGE_SIZE)
  }

  const filtered = cityFilter === 'alla' ? listings : listings.filter(l => l.city === cityFilter)
  const visible = filtered.slice(0, visibleCount)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-[#0f1c2e] text-white pt-28 pb-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Lediga boenden</h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Möblerade hus och lägenheter för projektarbetare och företag i hela Sverige.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Stadsfilter — en skrollbar rad på mobil (chipsen åt alla håll tog två
              skärmhöjder innan första objektet), radbruten först från sm. */}
          {cities.length > 1 && (
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
              <FilterBtn active={cityFilter === 'alla'} onClick={() => selectCity('alla')}>
                Alla orter
              </FilterBtn>
              {cities.map(city => (
                <FilterBtn key={city} active={cityFilter === city} onClick={() => selectCity(city)}>
                  {city}
                </FilterBtn>
              ))}
            </div>
          )}

          {isLoading ? (
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
            <div className="text-center py-20 text-muted-foreground">
              <p className="text-lg font-medium mb-2">Inga lediga boenden just nu</p>
              <p className="text-sm">Kontakta oss — vi hittar något som passar er.</p>
              <a href="tel:+46762498486" onClick={trackPhoneClick} className="inline-block mt-4 bg-[#ff6300] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#e55a00] transition-colors">
                Ring 076-249 84 86
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
                    Visa fler boenden ({filtered.length - visibleCount} till)
                  </button>
                </div>
              )}
            </>
          )}

          {/* Inte hittat rätt? */}
          {filtered.length > 0 && (
            <div className="mt-16 text-center bg-white rounded-2xl border border-nordic-100 p-8">
              <h2 className="font-bold text-nordic-900 text-xl mb-2">Hittade du inte rätt?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto text-sm">
                Vi har tillgång till fler objekt och kan ofta hitta boenden som inte syns här. Berätta vad ni behöver.
              </p>
              <a href="/#inquiry" className="inline-block bg-[#ff6300] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#e55a00] transition-colors text-sm">
                Skicka en förfrågan
              </a>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {selected && <InterestModal listing={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
