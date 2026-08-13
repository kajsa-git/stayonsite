"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Home, Loader2, Phone, Upload, X } from "lucide-react";
import { AgreementGate } from "@/components/erbjudande/AgreementGate";
import { PublishConsentCard } from "@/components/erbjudande/PublishConsentCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useUtmCapture } from "@/hooks/use-utm-capture";
import { isValidEmail, isValidPhoneNumber } from "@/lib/contact";
import { UTHYRNINGSUPPDRAG } from "@/lib/crm/avtal";
import { compressImage } from "@/lib/image-compress";
import { cn } from "@/lib/utils";

type IntakeFormState = {
  ownerType: "privatperson" | "foretag";
  ownerArrangement: "direkt" | "formedlare";
  ownerName: string;
  ownerOrgNr: string;
  ownerContactPerson: string;
  ownerPhone: string;
  ownerEmail: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  squareMeters: string;
  bedrooms: string;
  beds: string;
  bathrooms: string;
  washingMachines: string;
  dryers: string;
  parkingType: string[];
  furnished: boolean;
  kitchen: boolean;
  dishwasher: boolean;
  broadband: boolean;
  egetBoende: boolean;
  equipmentNote: string;
  skick: string;
  desiredRent: string;
  moveInFrom: string;
  availableTo: string;
  availableUntilFurtherNotice: boolean;
  availabilityNote: string;
  allIncluded: boolean;
  linensIncluded: boolean;
  heatWaterIncluded: boolean;
  excludedNote: string;
  specialNote: string;
  consent: boolean;
  website: string;
};

type FieldErrors = Partial<Record<keyof IntakeFormState | "images", string>>;

const steps = [
  { title: "Kontakt", eyebrow: "1" },
  { title: "Adress", eyebrow: "2" },
  { title: "Bostaden", eyebrow: "3" },
  { title: "Utrustning", eyebrow: "4" },
  { title: "Hyra", eyebrow: "5" },
  { title: "Bilder", eyebrow: "6" },
] as const;

const PARKING_OPTIONS: { value: string; description?: string }[] = [
  { value: "Garage", description: "Inomhus/låsbart." },
  { value: "Carport" },
  { value: "Egen uppfart", description: "På tomten." },
  { value: "Gatuparkering" },
  { value: "Parkeringsplats", description: "Egen p-plats i område." },
];

const initialForm: IntakeFormState = {
  ownerType: "privatperson",
  ownerArrangement: "direkt",
  ownerName: "",
  ownerOrgNr: "",
  ownerContactPerson: "",
  ownerPhone: "",
  ownerEmail: "",
  address: "",
  postalCode: "",
  city: "",
  country: "Sverige",
  squareMeters: "",
  bedrooms: "",
  beds: "",
  bathrooms: "",
  washingMachines: "",
  dryers: "",
  parkingType: [],
  furnished: true,
  kitchen: true,
  dishwasher: false,
  broadband: true,
  egetBoende: true,
  equipmentNote: "",
  skick: "",
  desiredRent: "",
  moveInFrom: "",
  availableTo: "",
  availableUntilFurtherNotice: false,
  availabilityNote: "",
  allIncluded: false,
  linensIncluded: false,
  heatWaterIncluded: true,
  excludedNote: "",
  specialNote: "",
  consent: false,
  website: "",
};

function toNumber(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

function fieldValue(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function LabelledInput({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  required,
  placeholder,
  autoComplete,
  inputMode,
}: {
  id: keyof IntakeFormState;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "decimal" | "tel" | "email";
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-nordic-900">
        {label}{required ? " *" : ""}
      </Label>
      <Input
        id={id}
        value={value}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="min-h-11 rounded-md border-nordic-200 bg-white text-base"
      />
      {error && <p id={`${id}-error`} className="text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}

function ToggleCard({
  label,
  checked,
  onChange,
  description,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-16 cursor-pointer items-start gap-3 rounded-md border bg-white p-4 transition-colors",
        checked ? "border-nordic-800 bg-nordic-50" : "border-nordic-200 hover:border-nordic-400",
      )}
    >
      <Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} className="mt-0.5 h-5 w-5" />
      <span>
        <span className="block text-sm font-semibold text-nordic-900">{label}</span>
        {description && <span className="mt-1 block text-sm text-nordic-700">{description}</span>}
      </span>
    </label>
  );
}

function Stepper({
  id,
  label,
  value,
  onChange,
  min = 0,
}: {
  id: keyof IntakeFormState;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
}) {
  const numeric = Number(value || 0);
  const next = (delta: number) => onChange(String(Math.max(min, (Number.isFinite(numeric) ? numeric : 0) + delta)));
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-nordic-900">{label}</Label>
      <div className="flex items-center">
        <Button type="button" variant="outline" className="h-11 w-10 shrink-0 rounded-r-none p-0 text-lg" onClick={() => next(-1)} aria-label={`Minska ${label}`}>
          -
        </Button>
        <Input
          id={id}
          value={value}
          inputMode="numeric"
          onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 3))}
          className="h-11 min-w-0 flex-1 rounded-none border-x-0 text-center text-base font-semibold"
        />
        <Button type="button" variant="outline" className="h-11 w-10 shrink-0 rounded-l-none p-0 text-lg" onClick={() => next(1)} aria-label={`Öka ${label}`}>
          +
        </Button>
      </div>
    </div>
  );
}

export function PropertyIntakeForm() {
  const utmParams = useUtmCapture();
  const [form, setForm] = useState<IntakeFormState>(initialForm);
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [success, setSuccess] = useState<{
    propertyId: string;
    imageCount: number;
    imageErrors: string[];
    agreement: { token: string; alreadySigned: boolean } | null;
  } | null>(null);
  // Del 2 (uthyrningsuppdraget): null = visas just nu, annars utfallet.
  const [agreementOutcome, setAgreementOutcome] = useState<"signed" | "skipped" | null>(null);
  // Publiceringsgodkännandet — lever över båda vyerna så kortet inte nollställs
  // när man går vidare från del 2 till tack-sidan.
  const [publishConsented, setPublishConsented] = useState(false);

  const progress = ((step + 1) / steps.length) * 100;

  const imagePreviews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  );

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [imagePreviews]);

  function set<K extends keyof IntakeFormState>(field: K, value: IntakeFormState[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function toggleParking(value: string) {
    setForm((current) => ({
      ...current,
      parkingType: current.parkingType.includes(value)
        ? current.parkingType.filter((v) => v !== value)
        : [...current.parkingType, value],
    }));
  }

  function setOwnerType(ownerType: IntakeFormState["ownerType"]) {
    setForm((current) => ({
      ...current,
      ownerType,
      ownerArrangement: ownerType === "privatperson" ? "direkt" : current.ownerArrangement,
    }));
    setErrors((current) => ({
      ...current,
      ownerType: undefined,
      ownerArrangement: undefined,
      ownerContactPerson: ownerType === "privatperson" ? undefined : current.ownerContactPerson,
    }));
  }

  function validateStep(targetStep = step): FieldErrors {
    const next: FieldErrors = {};
    if (targetStep === 0) {
      if (form.ownerName.trim().length < 2) next.ownerName = "Fyll i namn.";
      if (!isValidPhoneNumber(form.ownerPhone)) next.ownerPhone = "Fyll i ett giltigt telefonnummer.";
      if (form.ownerEmail.trim() && !isValidEmail(form.ownerEmail)) next.ownerEmail = "Fyll i en giltig e-postadress.";
      if (form.ownerType === "foretag" && !form.ownerContactPerson.trim()) next.ownerContactPerson = "Fyll i kontaktperson.";
    }
    if (targetStep === 1) {
      if (form.address.trim().length < 2) next.address = "Fyll i adress.";
      if (form.postalCode.trim().length < 3) next.postalCode = "Fyll i postnummer.";
      if (form.city.trim().length < 2) next.city = "Fyll i ort.";
      if (form.country.trim().length < 2) next.country = "Fyll i land.";
    }
    if (targetStep === 2) {
      if (!form.bedrooms.trim()) next.bedrooms = "Ange antal sovrum.";
      if (!form.beds.trim()) next.beds = "Ange antal bäddar.";
    }
    if (targetStep === 4) {
      if (!form.moveInFrom && !form.availabilityNote.trim()) next.moveInFrom = "Ange datum eller skriv en kort notis.";
    }
    if (targetStep === 5) {
      if (!form.consent) next.consent = "Godkänn att vi kontaktar dig om bostaden.";
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      if (files.length > 10) next.images = "Ladda upp max 10 bilder.";
      if (totalBytes > 60 * 1024 * 1024) next.images = "Bilderna får tillsammans vara max 60 MB.";
    }
    return next;
  }

  function goNext() {
    const nextErrors = validateStep();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function collectAllErrors() {
    const all = steps.reduce((acc, _step, index) => ({ ...acc, ...validateStep(index) }), {} as FieldErrors);
    setErrors(all);
    return all;
  }

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setFiles((current) => [...current, ...selected].slice(0, 10));
    setErrors((current) => ({ ...current, images: undefined }));
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
  }

  function payload() {
    return {
      ownerType: form.ownerType,
      ownerArrangement: form.ownerType === "privatperson" ? "direkt" : form.ownerArrangement,
      ownerName: form.ownerName.trim(),
      ownerOrgNr: fieldValue(form.ownerOrgNr),
      ownerContactPerson: fieldValue(form.ownerContactPerson),
      ownerPhone: form.ownerPhone.trim(),
      ownerEmail: fieldValue(form.ownerEmail),
      address: form.address.trim(),
      postalCode: form.postalCode.trim(),
      city: form.city.trim(),
      country: form.country.trim() || "Sverige",
      squareMeters: toNumber(form.squareMeters),
      bedrooms: toNumber(form.bedrooms),
      beds: toNumber(form.beds),
      bathrooms: toNumber(form.bathrooms),
      washingMachines: toNumber(form.washingMachines),
      dryers: toNumber(form.dryers),
      parkingType: form.parkingType,
      furnished: form.furnished,
      kitchen: form.kitchen,
      dishwasher: form.dishwasher,
      garage: form.parkingType.includes("Garage"),
      broadband: form.broadband,
      egetBoende: form.egetBoende,
      equipmentNote: fieldValue(form.equipmentNote),
      skick: fieldValue(form.skick),
      desiredRent: toNumber(form.desiredRent),
      moveInFrom: fieldValue(form.moveInFrom),
      availableTo: fieldValue(form.availableTo),
      availableUntilFurtherNotice: form.availableUntilFurtherNotice,
      availabilityNote: fieldValue(form.availabilityNote),
      allIncluded: form.allIncluded,
      linensIncluded: form.linensIncluded,
      heatWaterIncluded: form.heatWaterIncluded,
      excludedNote: fieldValue(form.excludedNote),
      specialNote: fieldValue(form.specialNote),
      consent: form.consent,
      website: form.website,
      page: window.location.pathname,
      source: "property-intake",
      startedAt: Date.now(),
      utmParams,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const allErrors = collectAllErrors();
    if (Object.keys(allErrors).length) {
      const firstStep = steps.findIndex((_, index) => Object.keys(validateStep(index)).length > 0);
      if (firstStep >= 0) setStep(firstStep);
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const body = new FormData();
      body.append("payload", JSON.stringify(payload()));
      // Alla bilder går i SAMMA request (Vercel-tak ~4,5 MB totalt) — komprimera
      // hårdare här än i CRM:et så även 10 mobilfoton ryms tillsammans.
      const compressed = await Promise.all(files.map((file) => compressImage(file, { maxDim: 1600, quality: 0.78 })));
      compressed.forEach((file) => body.append("images", file));
      const response = await fetch("/api/crm/property-intake", { method: "POST", body });
      const result = await response.json().catch(() => null) as {
        success?: boolean;
        propertyId?: string;
        imageCount?: number;
        imageErrors?: string[];
        agreement?: { token: string; alreadySigned: boolean } | null;
        error?: string;
      } | null;

      if (!response.ok || !result?.success || !result.propertyId) {
        throw new Error(result?.error ?? "property_intake_failed");
      }

      setSuccess({
        propertyId: result.propertyId,
        imageCount: result.imageCount ?? 0,
        imageErrors: result.imageErrors ?? [],
        agreement: result.agreement ?? null,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Det gick inte att skicka just nu. Försök igen eller ring 076-249 84 86.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Del 2 av registreringen: uthyrningsuppdraget visas direkt efter inskicket
  // (privatpersoner som inte redan signerat). Hoppar man över mejlar vi en
  // påminnelse med samma länk — se cron:en i app/api/cron/agreement-reminders.
  if (success && success.agreement && !success.agreement.alreadySigned && agreementOutcome === null) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex items-start gap-3 rounded-md border border-green-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-700" />
            <div>
              <p className="text-base font-semibold text-nordic-950">Bostaden är mottagen — tack!</p>
              <p className="mt-1 text-sm leading-6 text-nordic-700">
                Två snabba steg kvar, båda tar under en minut: godkänn att annonsen får visas online,
                och signera uthyrningsuppdraget — kostnadsfritt och inte exklusivt.
              </p>
            </div>
          </div>

          <PublishConsentCard
            token={success.agreement.token}
            addresses={[[form.address, form.city].filter(Boolean).join(", ")].filter(Boolean)}
            initiallyConsented={publishConsented}
            onConsented={() => setPublishConsented(true)}
          />

          <AgreementGate
            token={success.agreement.token}
            title={UTHYRNINGSUPPDRAG.title}
            intro={UTHYRNINGSUPPDRAG.intro}
            points={UTHYRNINGSUPPDRAG.points}
            version={UTHYRNINGSUPPDRAG.version}
            submitLabel="Godkänn uthyrningsuppdraget"
            lang="sv"
            onAccepted={() => setAgreementOutcome("signed")}
          />

          <div className="flex flex-col gap-3 rounded-md border border-nordic-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-nordic-700">
              Vill du läsa i lugn och ro? Du kan godkänna senare — vi skickar en påminnelse med länken.
            </p>
            <Button type="button" variant="outline" className="min-h-11 shrink-0" onClick={() => setAgreementOutcome("skipped")}>
              Hoppa över just nu
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (success) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-md border border-green-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-7 w-7 text-green-700" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-nordic-950 sm:text-3xl">Tack – vi har tagit emot din bostad!</h1>
          <p className="mt-3 text-base leading-7 text-nordic-800">
            Vi går igenom uppgifter och bilder i lugn och ro — <strong>inget visas online utan ditt
            godkännande</strong>, och du behöver inte göra något mer just nu.
          </p>

          {agreementOutcome === "signed" && (
            <p className="mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-900">
              Uthyrningsuppdraget är godkänt — allt är klart från din sida.
            </p>
          )}
          {publishConsented && (
            <p className="mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-900">
              Publiceringen är godkänd — vi lägger ut annonsen efter granskning och skickar länken.
            </p>
          )}
          {agreementOutcome === "skipped" && success.agreement && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">Uthyrningsuppdraget är inte godkänt ännu.</p>
              <p className="mt-1">
                Du kan göra det när som helst via{" "}
                <a href={`/uthyrare/${success.agreement.token}`} className="font-semibold underline">
                  din personliga sida
                </a>
                {" "}— {publishConsented ? "vi har mejlat dig länken." : "där kan du också godkänna publiceringen. Länken finns i mejlet du fått."}
              </p>
            </div>
          )}

          {/* Redan signerade ägare hoppar över del 2-vyn — publiceringsfrågan
              ska ändå ställas för det nya objektet. */}
          {success.agreement && !publishConsented && agreementOutcome === null && (
            <div className="mt-5">
              <PublishConsentCard
                token={success.agreement.token}
                addresses={[[form.address, form.city].filter(Boolean).join(", ")].filter(Boolean)}
                initiallyConsented={false}
                onConsented={() => setPublishConsented(true)}
              />
            </div>
          )}

          <div className="mt-5 space-y-1 rounded-md bg-nordic-50 p-4 text-sm text-nordic-800">
            <p>Bilder mottagna: <span className="font-semibold">{success.imageCount}</span></p>
            <p>
              Referens: <span className="font-mono font-semibold">{success.propertyId}</span>
              <span className="text-nordic-600"> – uppge den gärna om du hör av dig.</span>
            </p>
            {success.imageErrors.length > 0 && (
              <p className="pt-1 text-amber-800">
                Några bilder kunde inte laddas upp, men bostaden är sparad – vi återkommer om komplettering.
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="tel:+46762498486"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-[#0f766e] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#115e59]"
            >
              <Phone className="h-4 w-4" />
              Har du frågor? Ring 076-249 84 86
            </a>
            <a
              href="https://www.stayonsite.se"
              className="inline-flex min-h-11 items-center justify-center rounded-md border border-nordic-200 px-5 text-sm font-semibold text-nordic-800 transition-colors hover:border-nordic-400"
            >
              Till stayonsite.se
            </a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-md border border-nordic-200 bg-white shadow-sm">
          <div className="border-b border-nordic-100 p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-[#0f766e]">
                  <Home className="h-4 w-4" />
                  {/* Privatpersoner får uthyrningsuppdraget som del 2 direkt efter inskicket. */}
                  {form.ownerType === "privatperson" ? "Registrera bostad · Del 1 av 2" : "Registrera bostad"}
                </div>
                <h1 className="mt-2 text-2xl font-semibold text-nordic-950 sm:text-3xl">Fyll i bostadsuppgifter</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-nordic-700">
                  Tar några minuter att fylla i. Du kan hoppa över sådant du är osäker på, men adress, kontakt och antal sovrum/bäddar behövs för att vi ska kunna bedöma bostaden snabbt.
                </p>
              </div>
            </div>
            <Progress value={progress} className="mt-5 h-2 bg-nordic-100" />
            <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {steps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setStep(index)}
                  className={cn(
                    "min-h-11 rounded-md border px-2 text-left text-xs transition-colors",
                    index === step ? "border-nordic-900 bg-nordic-900 text-white" : "border-nordic-200 bg-white text-nordic-700 hover:border-nordic-500",
                  )}
                >
                  <span className="block font-semibold">{item.eyebrow}. {item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 sm:p-6">
            <input
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              value={form.website}
              onChange={(event) => set("website", event.target.value)}
              aria-hidden="true"
            />

            {step === 0 && (
              <div className="space-y-5">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-nordic-900">Vem fyller i uppgifterna?</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ToggleCard label="Jag är privatperson" checked={form.ownerType === "privatperson"} onChange={() => setOwnerType("privatperson")} />
                    <ToggleCard label="Jag representerar ett företag" checked={form.ownerType === "foretag"} onChange={() => setOwnerType("foretag")} />
                  </div>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <LabelledInput id="ownerName" label={form.ownerType === "foretag" ? "Företagsnamn" : "Namn"} value={form.ownerName} onChange={(value) => set("ownerName", value)} error={errors.ownerName} required autoComplete="name" />
                  {form.ownerType === "foretag" && (
                    <LabelledInput id="ownerContactPerson" label="Kontaktperson" value={form.ownerContactPerson} onChange={(value) => set("ownerContactPerson", value)} error={errors.ownerContactPerson} required autoComplete="name" />
                  )}
                  {form.ownerType === "foretag" && (
                    <LabelledInput id="ownerOrgNr" label="Org.nr" value={form.ownerOrgNr} onChange={(value) => set("ownerOrgNr", value)} />
                  )}
                  <LabelledInput id="ownerPhone" label="Telefon" value={form.ownerPhone} onChange={(value) => set("ownerPhone", value)} error={errors.ownerPhone} required autoComplete="tel" inputMode="tel" />
                  <LabelledInput id="ownerEmail" label="E-post" value={form.ownerEmail} onChange={(value) => set("ownerEmail", value)} error={errors.ownerEmail} type="email" autoComplete="email" inputMode="email" />
                </div>
                {form.ownerType === "foretag" && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-nordic-900">Hyr företaget ut direkt eller förmedlar ni bostaden?</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <ToggleCard label="Företaget hyr ut direkt" checked={form.ownerArrangement === "direkt"} onChange={() => set("ownerArrangement", "direkt")} />
                      <ToggleCard label="Företaget är förmedlare" checked={form.ownerArrangement === "formedlare"} onChange={() => set("ownerArrangement", "formedlare")} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <LabelledInput id="address" label="Adress" value={form.address} onChange={(value) => set("address", value)} error={errors.address} required autoComplete="street-address" placeholder="Adriansnäs gård 2" />
                </div>
                <LabelledInput id="postalCode" label="Postnummer" value={form.postalCode} onChange={(value) => set("postalCode", value)} error={errors.postalCode} required autoComplete="postal-code" placeholder="572 95" />
                <LabelledInput id="city" label="Ort" value={form.city} onChange={(value) => set("city", value)} error={errors.city} required autoComplete="address-level2" placeholder="Figeholm" />
                <LabelledInput id="country" label="Land" value={form.country} onChange={(value) => set("country", value)} error={errors.country} required autoComplete="country-name" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <LabelledInput id="squareMeters" label="Bostadsyta (m²)" value={form.squareMeters} onChange={(value) => set("squareMeters", value)} type="number" inputMode="decimal" />
                  <Stepper id="bedrooms" label="Sovrum" value={form.bedrooms} onChange={(value) => set("bedrooms", value)} />
                  <Stepper id="beds" label="Bäddar" value={form.beds} onChange={(value) => set("beds", value)} />
                  <Stepper id="bathrooms" label="Badrum" value={form.bathrooms} onChange={(value) => set("bathrooms", value)} />
                </div>
                {(errors.bedrooms || errors.beds) && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                    {errors.bedrooms || errors.beds}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="skick" className="text-sm font-semibold text-nordic-900">Skick och standard</Label>
                  <Textarea id="skick" value={form.skick} onChange={(event) => set("skick", event.target.value)} placeholder="T.ex. lantligt men hemtrevligt, äldre standard, nyrenoverat kök..." className="min-h-28 rounded-md border-nordic-200 bg-white text-base" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Stepper id="washingMachines" label="Tvättmaskin" value={form.washingMachines} onChange={(value) => set("washingMachines", value)} />
                  <Stepper id="dryers" label="Torktumlare" value={form.dryers} onChange={(value) => set("dryers", value)} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <ToggleCard label="Möblerat" checked={form.furnished} onChange={(value) => set("furnished", value)} />
                  <ToggleCard label="Kök" checked={form.kitchen} onChange={(value) => set("kitchen", value)} />
                  <ToggleCard label="Diskmaskin" checked={form.dishwasher} onChange={(value) => set("dishwasher", value)} />
                  <ToggleCard label="Bredband" checked={form.broadband} onChange={(value) => set("broadband", value)} />
                  <ToggleCard label="Hela bostaden hyrs ut" checked={form.egetBoende} onChange={(value) => set("egetBoende", value)} description="Egen bostad – inte rum delat med andra hyresgäster." />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-nordic-900">Parkering</p>
                  <p className="text-sm text-nordic-600">Välj det som stämmer – flera går bra.</p>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {PARKING_OPTIONS.map((option) => (
                      <ToggleCard
                        key={option.value}
                        label={option.value}
                        description={option.description}
                        checked={form.parkingType.includes(option.value)}
                        onChange={() => toggleParking(option.value)}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="equipmentNote" className="text-sm font-semibold text-nordic-900">Övrigt om utrustning</Label>
                  <Textarea id="equipmentNote" value={form.equipmentNote} onChange={(event) => set("equipmentNote", event.target.value)} placeholder="T.ex. bastu, altan, extra förvaring, redskap, larm, laddbox..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <LabelledInput id="desiredRent" label="Önskad hyra per månad" value={form.desiredRent} onChange={(value) => set("desiredRent", value)} type="number" inputMode="decimal" placeholder="15000" />
                  <LabelledInput id="moveInFrom" label="Tillgänglig från" value={form.moveInFrom} onChange={(value) => set("moveInFrom", value)} error={errors.moveInFrom} type="date" />
                  <LabelledInput id="availableTo" label="Tillgänglig till" value={form.availableTo} onChange={(value) => set("availableTo", value)} type="date" />
                  <ToggleCard label="Tillgänglig tills vidare / osäker sluttid" checked={form.availableUntilFurtherNotice} onChange={(value) => set("availableUntilFurtherNotice", value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availabilityNote" className="text-sm font-semibold text-nordic-900">Kommentar om tillgänglighet</Label>
                  <Textarea id="availabilityNote" value={form.availabilityNote} onChange={(event) => set("availabilityNote", event.target.value)} placeholder="T.ex. ledigt efter sommaren, bara vardagar, osäker sluttid..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-nordic-900">Vad ingår i hyran?</p>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <ToggleCard label="Allt ingår i hyran" checked={form.allIncluded} onChange={(value) => set("allIncluded", value)} />
                    <ToggleCard label="Sängkläder + handdukar" checked={form.linensIncluded} onChange={(value) => set("linensIncluded", value)} />
                    <ToggleCard label="Värme + varmvatten" checked={form.heatWaterIncluded} onChange={(value) => set("heatWaterIncluded", value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="excludedNote" className="text-sm font-semibold text-nordic-900">Om något inte ingår, vad?</Label>
                  <Textarea id="excludedNote" value={form.excludedNote} onChange={(event) => set("excludedNote", event.target.value)} placeholder="T.ex. el, internet, sophämtning, trädgårdsskötsel..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialNote" className="text-sm font-semibold text-nordic-900">Något särskilt vi bör veta</Label>
                  <Textarea id="specialNote" value={form.specialNote} onChange={(event) => set("specialNote", event.target.value)} placeholder="T.ex. trappor, husdjur, parkering, vinterväg, säsong..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="rounded-md border border-dashed border-nordic-300 bg-nordic-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label htmlFor="images" className="text-base font-semibold text-nordic-950">Bilder</Label>
                      <p className="mt-1 text-sm text-nordic-700">Ladda gärna upp utsida, kök, sovrum och badrum. Det går att skicka utan bilder.</p>
                    </div>
                    <label
                      htmlFor="images"
                      className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
                    >
                      <Upload className="h-4 w-4" />
                      Välj bilder
                    </label>
                  </div>
                  <input id="images" type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic" multiple onChange={onFilesChange} className="sr-only" />
                  {errors.images && <p className="mt-3 text-sm font-medium text-red-700">{errors.images}</p>}
                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {imagePreviews.map(({ file, url }, index) => (
                        <div key={`${file.name}-${index}`} className="relative overflow-hidden rounded-md border bg-white">
                          <img src={url} alt={`Vald bild ${index + 1}`} className="aspect-square w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            aria-label={`Ta bort ${file.name}`}
                            className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-nordic-900 shadow"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <label className="flex cursor-pointer gap-3 rounded-md border border-nordic-200 bg-white p-4">
                  <Checkbox checked={form.consent} onCheckedChange={(value) => set("consent", value === true)} className="mt-0.5 h-5 w-5" />
                  <span>
                    <span className="block text-sm font-semibold text-nordic-900">StayOnSite får kontakta mig om bostaden *</span>
                    <span className="mt-1 block text-sm text-nordic-700">Uppgifterna används för att bedöma bostaden och matcha mot företagskunder.</span>
                    {errors.consent && <span className="mt-2 block text-sm font-medium text-red-700">{errors.consent}</span>}
                  </span>
                </label>
              </div>
            )}

            {submitError && (
              <div className="mt-5 flex gap-3 rounded-md border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800" role="alert">
                <AlertCircle className="h-5 w-5 shrink-0" />
                {submitError}
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-nordic-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button type="button" variant="outline" onClick={goBack} disabled={step === 0 || isSubmitting} className="min-h-11 gap-2">
                <ArrowLeft className="h-4 w-4" />
                Tillbaka
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={goNext} className="min-h-11 gap-2 bg-nordic-900 hover:bg-nordic-800">
                  Nästa
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="min-h-11 gap-2 bg-[#0f766e] hover:bg-[#115e59]">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {isSubmitting ? "Skickar in..." : "Skicka in bostaden"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
