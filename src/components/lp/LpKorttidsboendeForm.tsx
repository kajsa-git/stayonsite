'use client'

import { useState } from 'react'
import { CheckCircle2, Phone, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { trackFbEvent } from '@/hooks/use-facebook-pixel'
import { useToast } from '@/hooks/use-toast'
import { isValidEmail, isValidPhoneNumber } from '@/lib/contact'
import { getContactFormErrorMessage, submitContactForm } from '@/lib/contact-form'
import { trackFormStart, trackFormSubmit, trackPhoneClick } from '@/lib/gtag'

interface LpKorttidsboendeFormProps {
  utmParams: Record<string, string>
}

const inputClass =
  'h-12 rounded-xl border-primary/10 bg-white px-4 text-base font-medium text-primary shadow-sm placeholder:text-primary/30 focus:border-accent'

export default function LpKorttidsboendeForm({
  utmParams,
}: LpKorttidsboendeFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formSuccess, setFormSuccess] = useState(false)
  const [formStarted, setFormStarted] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [phoneError, setPhoneError] = useState('')

  const handleFormFocus = () => {
    if (formStarted) return
    setFormStarted(true)
    trackFormStart()
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const phone = String(formData.get('phone') ?? '').trim()
    setEmailError('')
    setPhoneError('')

    if (!isValidEmail(email)) {
      setEmailError('Ange en giltig e-postadress.')
      const emailInput = event.currentTarget.elements.namedItem('email')
      if (emailInput instanceof HTMLInputElement) emailInput.focus()
      return
    }

    if (phone && !isValidPhoneNumber(phone)) {
      setPhoneError('Ange ett giltigt telefonnummer eller lämna fältet tomt.')
      const phoneInput = event.currentTarget.elements.namedItem('phone')
      if (phoneInput instanceof HTMLInputElement) phoneInput.focus()
      return
    }

    setIsSubmitting(true)
    try {
      const result = await submitContactForm({
        formType: 'hero-intent',
        locale: 'sv',
        page: window.location.pathname,
        source: 'google-ads-korttid',
        fields: {
          city: String(formData.get('city') ?? '').trim(),
          people: String(formData.get('people') ?? '').trim(),
          company: String(formData.get('company') ?? '').trim(),
          email,
          ...(phone ? { phone } : {}),
        },
        utmParams,
      })

      setFormSuccess(true)
      trackFormSubmit({ email, phone: phone || undefined })
      trackFbEvent('Lead', { content_name: 'lp-korttidsboende' }, result.metaEventId)
      toast({ title: 'Tack! Vi återkommer inom 24 timmar.' })
    } catch (error) {
      toast({
        title: 'Kunde inte skicka förfrågan',
        description: getContactFormErrorMessage(
          error instanceof Error ? error.message : undefined,
          'sv'
        ),
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (formSuccess) {
    return (
      <div className="py-8 text-center" role="status" aria-live="polite">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="text-emerald-600" size={32} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-primary">Förfrågan mottagen</h2>
        <p className="text-primary/70">
          Vi går igenom ort och behov och återkommer inom 24 timmar.
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-accent to-accent/20 opacity-10 blur-xl" />
      <div className="relative rounded-3xl border border-primary/5 bg-white p-6 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] md:p-8">
        <h2 className="mb-1 text-xl font-bold text-primary">Få ett konkret boendeförslag</h2>
        <p className="mb-6 text-sm leading-relaxed text-primary/60">
          Ange fem uppgifter. Vi återkommer med vad som är möjligt inom 24 timmar.
        </p>

        <form onSubmit={handleSubmit} onFocus={handleFormFocus} className="space-y-4">
          <div>
            <Label htmlFor="shortstay-city" className="ml-1 text-xs font-bold text-primary/70">
              Ort eller område
            </Label>
            <Input
              id="shortstay-city"
              name="city"
              required
              autoComplete="address-level2"
              placeholder="t.ex. Luleå"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="shortstay-people" className="ml-1 text-xs font-bold text-primary/70">
                Antal personer
              </Label>
              <Input
                id="shortstay-people"
                name="people"
                type="number"
                min="1"
                max="9999"
                required
                inputMode="numeric"
                placeholder="t.ex. 8"
                className={inputClass}
              />
            </div>
            <div>
              <Label htmlFor="shortstay-company" className="ml-1 text-xs font-bold text-primary/70">
                Företag
              </Label>
              <Input
                id="shortstay-company"
                name="company"
                required
                autoComplete="organization"
                placeholder="Ert företag AB"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortstay-email" className="ml-1 text-xs font-bold text-primary/70">
              E-post
            </Label>
            <Input
              id="shortstay-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? 'shortstay-email-error' : undefined}
              onChange={() => emailError && setEmailError('')}
              placeholder="namn@foretag.se"
              className={`${inputClass} ${emailError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
            />
            {emailError && (
              <p id="shortstay-email-error" className="mt-1 text-sm text-red-600">
                {emailError}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="shortstay-phone" className="ml-1 text-xs font-bold text-primary/70">
              Telefon <span className="font-normal text-primary/45">(valfritt)</span>
            </Label>
            <Input
              id="shortstay-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={Boolean(phoneError)}
              aria-describedby={phoneError ? 'shortstay-phone-error' : undefined}
              onChange={() => phoneError && setPhoneError('')}
              placeholder="070-123 45 67"
              className={`${inputClass} ${phoneError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
            />
            {phoneError && (
              <p id="shortstay-phone-error" className="mt-1 text-sm text-red-600">
                {phoneError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-[#ff6300] to-[#ff8533] font-bold text-white shadow-xl transition-transform hover:scale-[1.01] active:scale-[0.99]"
          >
            <span>{isSubmitting ? 'Skickar…' : 'Få boendeförslag inom 24h'}</span>
            {!isSubmitting && <Send size={18} aria-hidden="true" />}
          </Button>

          <p className="text-center text-xs leading-relaxed text-primary/60">
            För företag och yrkesverksamma · Minsta hyrestid 3 månader
          </p>
        </form>

        <div className="mt-5 flex items-center justify-center gap-2 border-t border-primary/10 pt-5">
          <Phone size={15} className="text-accent" aria-hidden="true" />
          <a
            href="tel:+46762498486"
            onClick={trackPhoneClick}
            className="text-sm font-bold text-primary/70 transition-colors hover:text-accent"
          >
            Ring 076-249 84 86
          </a>
        </div>
      </div>
    </div>
  )
}
