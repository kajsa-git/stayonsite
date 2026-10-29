'use client'

import Image from 'next/image'
import {
  ArrowUp,
  CalendarClock,
  Check,
  FileText,
  MapPin,
  MessageCircle,
  Phone,
  Sofa,
} from 'lucide-react'

import LpKorttidsboendeForm from '@/components/lp/LpKorttidsboendeForm'
import { Button } from '@/components/ui/button'
import { COMPANY_FACTS, RATING_VALUE } from '@/data/constants'
import { useTranslation } from '@/hooks/use-translation'
import { useUtmCapture } from '@/hooks/use-utm-capture'
import { trackPhoneClick, trackWhatsAppClick } from '@/lib/gtag'

const BENEFITS = [
  {
    icon: Sofa,
    title: 'Möblerat och klart',
    text: 'lp.projectHousing.furnished',
  },
  {
    icon: FileText,
    title: 'En kontakt och en faktura',
    text: 'lp.projectHousing.oneContact',
  },
  {
    icon: CalendarClock,
    title: 'Flexibelt från 3 månader',
    text: 'lp.projectHousing.term',
  },
  {
    icon: MapPin,
    title: 'I hela Sverige',
    text: 'lp.projectHousing.locations',
  },
] as const

export default function LpKorttidsboende() {
  const { t } = useTranslation()
  const utmParams = useUtmCapture()
  const steps = [
    ['1', 'Beskriv behovet', 'Ange ort, antal personer och företag i formuläret.'],
    ['2', 'Vi kontrollerar utbudet', t('lp.projectHousing.process')],
    ['3', 'Flytta in', 'Vi samordnar avtal och praktiska detaljer inför inflyttningen.'],
  ]

  const scrollToForm = () => {
    document.getElementById('korttid-form')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="flex h-16 items-center justify-center border-b border-primary/5 bg-white">
        <Image
          src="/stayonsite-logo.png"
          alt="StayOnSite"
          width={182}
          height={48}
          className="h-9 w-auto"
          priority
        />
      </div>

      <main>
        <section className="px-4 pb-12 pt-7 md:px-8 md:pb-16 md:pt-12">
          <div className="mx-auto grid max-w-5xl items-center gap-9 md:grid-cols-2 md:gap-12">
            <div className="text-center md:text-left">
              <div className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent">
                <span className="h-px w-6 bg-accent" />
                {t('lp.projectHousing.eyebrow')}
              </div>
              <h1 className="mb-5 text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
                {t('lp.projectHousing.title')}
              </h1>
              <p className="mb-6 text-base font-light leading-relaxed text-primary/70 md:text-lg">
                {t('lp.projectHousing.intro')}
              </p>

              <div className="mx-auto mb-6 max-w-md space-y-3 text-left md:mx-0">
                {[
                  'Från 5 900 kr per person och månad',
                  t('lp.projectHousing.response'),
                  t('lp.projectHousing.flexibility'),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-sm font-medium text-primary/75">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                      <Check size={13} strokeWidth={3} aria-hidden="true" />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <p className="text-sm font-semibold text-primary/55">
                <a
                  href={COMPANY_FACTS.googleBusinessProfile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-primary/25 underline-offset-4 hover:text-primary"
                >
                  {t('lp.projectHousing.googleRating').replace('{rating}', RATING_VALUE.replace('.', ','))}
                </a>
              </p>
            </div>

            <div id="korttid-form" className="scroll-mt-4">
              <LpKorttidsboendeForm utmParams={utmParams} />
            </div>
          </div>
        </section>

        <section className="border-y border-primary/5 bg-nordic-50 px-4 py-12">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map(({ icon: Icon, title, text }) => (
              <div key={title} className="text-center sm:text-left">
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon size={20} aria-hidden="true" />
                </div>
                <h2 className="mb-1 text-base font-bold text-primary">{title}</h2>
                <p className="text-sm leading-relaxed text-primary/60">{t(text)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-4 py-14 md:py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-9 text-center">
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-accent">
                Så fungerar det
              </p>
              <h2 className="text-2xl font-bold text-primary md:text-3xl">
                Från behov till inflyttningsklart boende
              </h2>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {steps.map(([number, title, text]) => (
                <div key={number} className="rounded-2xl border border-primary/10 bg-white p-6">
                  <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {number}
                  </div>
                  <h3 className="mb-2 font-bold text-primary">{title}</h3>
                  <p className="text-sm leading-relaxed text-primary/60">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-12">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="mb-3 text-2xl font-bold text-white md:text-3xl">
              Behöver ni boende i minst 3 månader?
            </h2>
            <p className="mb-7 text-sm leading-relaxed text-white/65">
              Skicka ort och antal personer så kontrollerar vi vad som är möjligt.
            </p>
            <Button
              onClick={scrollToForm}
              className="mx-auto flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ff6300] to-[#ff8533] px-10 font-bold text-white shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
            >
              <span>Få ett boendeförslag</span>
              <ArrowUp size={18} aria-hidden="true" />
            </Button>
            <div className="mt-6 flex flex-col items-center gap-3">
              <a
                href="tel:+46762498486"
                onClick={trackPhoneClick}
                className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                <Phone size={14} aria-hidden="true" />
                076-249 84 86
              </a>
              <a
                href={COMPANY_FACTS.whatsappUrl}
                onClick={trackWhatsAppClick}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
              >
                <MessageCircle size={14} aria-hidden="true" />
                {t('lp.projectHousing.whatsapp')}
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
