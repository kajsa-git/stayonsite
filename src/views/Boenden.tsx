'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

interface Listing {
  id: string
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

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-nordic-100 flex flex-col">
      {/* Bild */}
      <div className="relative aspect-[4/3] bg-nordic-100 overflow-hidden">
        {hasImages ? (
          <>
            <img
              src={imgs[imgIdx]}
              alt={`Boende i ${listing.city ?? ''}`}
              className="w-full h-full object-cover"
            />
            {imgs.length > 1 && (
              <>
                <button
                  onClick={() => setImgIdx(i => Math.max(0, i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors disabled:opacity-30"
                  disabled={imgIdx === 0}
                >
                  ‹
                </button>
                <button
                  onClick={() => setImgIdx(i => Math.min(imgs.length - 1, i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-7 h-7 flex items-center justify-center shadow transition-colors disabled:opacity-30"
                  disabled={imgIdx === imgs.length - 1}
                >
                  ›
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {imgs.slice(0, 6).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`}
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
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-nordic-900 text-lg leading-tight">{listing.city ?? 'Sverige'}</h3>
          {listing.postalCode && (
            <span className="text-xs text-muted-foreground shrink-0 mt-0.5">{listing.postalCode}</span>
          )}
        </div>

        {/* Nyckeltal */}
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
          <p className="text-sm text-nordic-600 leading-relaxed mb-4 flex-1 line-clamp-3">
            {listing.publicDescription}
          </p>
        )}

        <button
          onClick={() => onInterest(listing)}
          className="mt-auto w-full bg-[#ff6300] hover:bg-[#e55a00] text-white font-semibold py-2.5 rounded-xl transition-colors text-sm"
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
      className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
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

export function Boenden() {
  const { data: listings = [], isLoading } = useSWR<Listing[]>('/api/listings', fetcher)
  const [selected, setSelected] = useState<Listing | null>(null)

  const cities = [...new Set(listings.map(l => l.city).filter(Boolean) as string[])].sort()
  const [cityFilter, setCityFilter] = useState<string>('alla')

  const filtered = cityFilter === 'alla' ? listings : listings.filter(l => l.city === cityFilter)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-[#0f1c2e] text-white py-16 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">Lediga boenden</h1>
            <p className="text-white/70 text-lg max-w-xl mx-auto">
              Möblerade hus och lägenheter för projektarbetare och företag i hela Sverige.
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-10">
          {/* Stadsfilter */}
          {cities.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <FilterBtn active={cityFilter === 'alla'} onClick={() => setCityFilter('alla')}>
                Alla orter
              </FilterBtn>
              {cities.map(city => (
                <FilterBtn key={city} active={cityFilter === city} onClick={() => setCityFilter(city)}>
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
              <a href="tel:+46762498486" className="inline-block mt-4 bg-[#ff6300] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#e55a00] transition-colors">
                Ring 076-249 84 86
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(listing => (
                <PropertyCard key={listing.id} listing={listing} onInterest={setSelected} />
              ))}
            </div>
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
