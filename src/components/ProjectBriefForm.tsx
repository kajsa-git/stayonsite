'use client'

import { useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useUtmCapture } from '@/hooks/use-utm-capture';
import { getContactFormErrorMessage, submitContactForm } from '@/lib/contact-form';
import { isValidEmail, isValidPhoneNumber } from '@/lib/contact';
import { trackFormStart, trackFormSubmit } from '@/lib/gtag';

interface ProjectBriefFormProps {
  source?: string;
  compact?: boolean;
}

const serviceOptions = [
  'Kök',
  'Tvätt',
  'Internet',
  'Städning',
  'Möblering',
  'Linne',
];

const inputClass = 'h-11 border-nordic-200 bg-white focus-visible:ring-accent';
const labelClass = 'text-sm font-semibold text-nordic-800';

export default function ProjectBriefForm({
  source = 'project-brief-form',
  compact = false,
}: ProjectBriefFormProps) {
  const pathname = usePathname();
  const { toast } = useToast();
  const utmParams = useUtmCapture();
  const formRef = useRef<HTMLFormElement>(null);
  const formStarted = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [roomPreference, setRoomPreference] = useState('');
  const [commute, setCommute] = useState('');

  const handleFormFocus = () => {
    if (formStarted.current) return;
    formStarted.current = true;
    trackFormStart();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const phone = String(formData.get('phone') ?? '').trim();

    setEmailError('');
    setPhoneError('');

    if (!isValidEmail(email)) {
      setEmailError('Ange en giltig e-postadress.');
      const input = e.currentTarget.elements.namedItem('email');
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setPhoneError('Ange ett giltigt telefonnummer.');
      const input = e.currentTarget.elements.namedItem('phone');
      if (input instanceof HTMLInputElement) input.focus();
      return;
    }

    setIsSubmitting(true);

    const includedServices = formData.getAll('includedServices').map(String).join(', ');

    try {
      await submitContactForm({
        formType: 'project-brief',
        locale: 'sv',
        page: pathname || '/for-foretag',
        source,
        fields: {
          projectLocations: String(formData.get('projectLocations') ?? '').trim(),
          people: String(formData.get('people') ?? '').trim(),
          moveInDate: String(formData.get('moveInDate') ?? '').trim(),
          endDate: String(formData.get('endDate') ?? '').trim(),
          maximumCommuteMinutes: commute,
          parking: String(formData.get('parking') ?? '').trim(),
          roomPreference,
          includedServices,
          rotation: String(formData.get('rotation') ?? '').trim(),
          budget: String(formData.get('budget') ?? '').trim(),
          legalCompany: String(formData.get('legalCompany') ?? '').trim(),
          invoiceReference: String(formData.get('invoiceReference') ?? '').trim(),
          contactName: String(formData.get('contactName') ?? '').trim(),
          email,
          phone,
          message: String(formData.get('message') ?? '').trim(),
        },
        utmParams,
      });

      setFormSuccess(true);
      trackFormSubmit({ email, phone });
      toast({
        title: 'Projektbrief skickad',
        description: 'Vi har tagit emot uppgifterna och går igenom projektets krav.',
      });

      setTimeout(() => {
        setFormSuccess(false);
        setRoomPreference('');
        setCommute('');
        formRef.current?.reset();
      }, 7000);
    } catch (error) {
      toast({
        title: 'Kunde inte skicka projektbriefen',
        description: getContactFormErrorMessage(
          error instanceof Error ? error.message : undefined,
          'sv'
        ),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (formSuccess) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-600" />
        <h3 className="text-xl font-semibold text-nordic-900">Projektbrief mottagen</h3>
        <p className="mt-2 text-sm text-nordic-700">
          Tack. Vi går igenom ort, bemanning, datum och kravbild innan vi återkommer med nästa steg.
        </p>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} onFocus={handleFormFocus} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="projectLocations" className={labelClass}>
            Arbetsplatsadress eller projektorter
          </Label>
          <Input
            id="projectLocations"
            name="projectLocations"
            required
            autoComplete="street-address"
            placeholder="t.ex. Säffle, Boden och Luleå eller exakt arbetsplatsadress"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="people" className={labelClass}>
            Antal personer
          </Label>
          <Input
            id="people"
            name="people"
            type="number"
            required
            min={1}
            max={9999}
            inputMode="numeric"
            placeholder="t.ex. 25"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="moveInDate" className={labelClass}>
            Önskat inflyttningsdatum
          </Label>
          <Input id="moveInDate" name="moveInDate" type="date" required className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="endDate" className={labelClass}>
            Preliminärt slutdatum
          </Label>
          <Input id="endDate" name="endDate" type="date" className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label className={labelClass}>Maximal pendlingstid</Label>
          <Select value={commute} onValueChange={setCommute} required>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Välj sökradie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30 minuter">30 minuter</SelectItem>
              <SelectItem value="60 minuter">60 minuter</SelectItem>
              <SelectItem value="90 minuter">90 minuter</SelectItem>
              <SelectItem value="Flexibelt efter utbud">Flexibelt efter utbud</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parking" className={labelClass}>
            Parkering och servicebilar
          </Label>
          <Input
            id="parking"
            name="parking"
            required
            placeholder="t.ex. 8 servicebilar, gärna laddning"
            className={inputClass}
          />
        </div>

        <div className="space-y-2">
          <Label className={labelClass}>Rumstyp</Label>
          <Select value={roomPreference} onValueChange={setRoomPreference} required>
            <SelectTrigger className={inputClass}>
              <SelectValue placeholder="Välj rumstyp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Enkelrum">Enkelrum</SelectItem>
              <SelectItem value="Delade rum">Delade rum</SelectItem>
              <SelectItem value="Mix av enkelrum och delat">Mix av enkelrum och delat</SelectItem>
              <SelectItem value="Ej bestämt">Ej bestämt</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className={labelClass}>Krav på boendet</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {serviceOptions.map((option) => (
            <label
              key={option}
              className="flex min-h-11 items-center gap-2 rounded-md border border-nordic-200 bg-white px-3 text-sm text-nordic-800"
            >
              <input
                type="checkbox"
                name="includedServices"
                value={option}
                className="h-4 w-4 accent-[#ff6300]"
              />
              {option}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="rotation" className={labelClass}>
            Rotation eller volymändringar
          </Label>
          <Textarea
            id="rotation"
            name="rotation"
            rows={compact ? 3 : 4}
            placeholder="t.ex. 20 personer första månaden, 35 under montage, nedtrappning efter vecka 18"
            className="border-nordic-200 bg-white focus-visible:ring-accent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="budget" className={labelClass}>
            Budget per person eller totalbudget
          </Label>
          <Textarea
            id="budget"
            name="budget"
            rows={compact ? 3 : 4}
            placeholder="t.ex. max 8 000 kr/person/mån eller totalbudget per månad"
            className="border-nordic-200 bg-white focus-visible:ring-accent"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="legalCompany" className={labelClass}>
            Juridiskt bolag
          </Label>
          <Input id="legalCompany" name="legalCompany" required autoComplete="organization" className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="invoiceReference" className={labelClass}>
            Fakturareferens
          </Label>
          <Input id="invoiceReference" name="invoiceReference" className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactName" className={labelClass}>
            Kontaktperson
          </Label>
          <Input id="contactName" name="contactName" required autoComplete="name" className={inputClass} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className={labelClass}>
            E-post
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? 'project-brief-email-error' : undefined}
            onChange={() => emailError && setEmailError('')}
            className={`${inputClass} ${emailError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
          />
          {emailError && (
            <p id="project-brief-email-error" className="text-xs text-red-500">
              {emailError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className={labelClass}>
            Telefon
          </Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            inputMode="tel"
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'project-brief-phone-error' : undefined}
            onChange={() => phoneError && setPhoneError('')}
            className={`${inputClass} ${phoneError ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
          />
          {phoneError && (
            <p id="project-brief-phone-error" className="text-xs text-red-500">
              {phoneError}
            </p>
          )}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="message" className={labelClass}>
            Övrigt som påverkar boendeplanen
          </Label>
          <Textarea
            id="message"
            name="message"
            rows={compact ? 3 : 4}
            placeholder="Säkerhetskrav, skiftgång, husdjur, språk, nyckelhantering eller andra praktiska detaljer"
            className="border-nordic-200 bg-white focus-visible:ring-accent"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-12 w-full rounded-full bg-[#ff6300] text-white hover:bg-[#e25200]"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Skickar...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              Skicka projektbrief
              <Send className="h-4 w-4" />
            </span>
          )}
        </Button>
        <p className="text-center text-xs leading-relaxed text-nordic-600">
          Flexibel hyresperiod – från 3 månader till flera år.
        </p>
      </div>
    </form>
  );
}
