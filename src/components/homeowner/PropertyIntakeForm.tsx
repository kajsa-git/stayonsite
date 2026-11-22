"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { AlertCircle, ArrowLeft, ArrowRight, Check, CheckCircle2, Home, Loader2, Phone, Upload, X } from "lucide-react";
import { PublishConsentCard } from "@/components/erbjudande/PublishConsentCard";
import { AddressAutocomplete } from "@/components/homeowner/AddressAutocomplete";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { useUtmCapture } from "@/hooks/use-utm-capture";
import { isValidEmail, isValidPhoneNumber } from "@/lib/contact";
import { trackFormPhoneError } from "@/lib/gtag";
import { compressImage } from "@/lib/image-compress";
import { clearIntakePrefill, readIntakePrefill } from "@/lib/intake-prefill";
import { getMetaTrackingContext, trackMetaEvent } from "@/lib/meta-pixel";
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
  parkingSpaces: string;
  parkingType: string[];
  parkingDetails: string;
  parkingLargeVehicle: "" | "yes" | "no" | "unsure";
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
  rentType: "" | "varm" | "kall";
  allIncluded: boolean;
  linensIncluded: boolean;
  heatWaterIncluded: boolean;
  excludedNote: string;
  specialNote: string;
  consent: boolean;
  website: string;
};

type FieldErrors = Partial<Record<keyof IntakeFormState | "images", string>>;

const MAX_IMAGE_COUNT = 10;
const MAX_UPLOAD_IMAGE_BYTES = 4 * 1024 * 1024;

const steps = [
  { title: "Kontakt", heading: "Vem hyr ut bostaden?" },
  { title: "Adress", heading: "Var ligger bostaden?" },
  { title: "Bostaden", heading: "Hur stor är bostaden?" },
  { title: "Utrustning", heading: "Vad finns i bostaden?" },
  { title: "Hyra", heading: "Hyra och tillgänglighet" },
  { title: "Bilder", heading: "Bilder och kontakt" },
] as const;

// html har scroll-behavior: smooth. Ett stegbyte ska hoppa direkt till toppen,
// annars avbryts animationen och nästa steg visas mitt på sidan.
function jumpToTop() {
  const html = document.documentElement;
  const previous = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  html.style.scrollBehavior = previous;
}

const NO_PARKING = "Ingen parkering";

const PARKING_OPTIONS: { value: string; description?: string }[] = [
  { value: "Garage", description: "Inomhus/låsbart." },
  { value: "Carport" },
  { value: "Egen uppfart", description: "På tomten." },
  { value: "Gatuparkering" },
  { value: "Parkeringsplats", description: "Egen p-plats i område." },
  { value: NO_PARKING },
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
  parkingSpaces: "",
  parkingType: [],
  parkingDetails: "",
  parkingLargeVehicle: "",
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
  rentType: "",
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
        className={cn(
          "min-h-11 rounded-md border-nordic-200 bg-white text-base aria-[invalid=true]:border-red-600 md:text-base",
          type === "date" && "appearance-none [&::-webkit-date-and-time-value]:text-left",
        )}
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
  className,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}) {
  return (
    <label
      className={cn(
        "flex min-h-14 cursor-pointer select-none items-start gap-3 rounded-md border bg-white p-3.5 transition-colors sm:min-h-16 sm:p-4",
        checked ? "border-nordic-800 bg-nordic-50" : "border-nordic-200 hover:border-nordic-400",
        className,
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
  max,
  description,
  required,
  error,
}: {
  id: keyof IntakeFormState;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  description?: string;
  required?: boolean;
  error?: string;
}) {
  const numeric = Number(value || 0);
  const next = (delta: number) => onChange(String(Math.min(max ?? Infinity, Math.max(min, (Number.isFinite(numeric) ? numeric : 0) + delta))));
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-semibold text-nordic-900">{label}{required ? " *" : ""}</Label>
      <div className="flex items-center">
        <Button type="button" variant="outline" className="h-11 w-11 shrink-0 rounded-r-none p-0 text-lg" onClick={() => next(-1)} aria-label={`Minska ${label}`}>
          -
        </Button>
        <Input
          id={id}
          value={value}
          inputMode="numeric"
          aria-invalid={!!error}
          aria-describedby={[description && `${id}-description`, error && `${id}-error`].filter(Boolean).join(" ") || undefined}
          onChange={(event) => {
            const digits = event.target.value.replace(/\D/g, "").slice(0, 3);
            onChange(digits && max !== undefined ? String(Math.min(max, Number(digits))) : digits);
          }}
          className="h-11 min-w-0 flex-1 rounded-none border-x-0 px-1 text-center text-base font-semibold aria-[invalid=true]:border-red-600 md:text-base"
        />
        <Button type="button" variant="outline" className="h-11 w-11 shrink-0 rounded-l-none p-0 text-lg" onClick={() => next(1)} aria-label={`Öka ${label}`}>
          +
        </Button>
      </div>
      {description && <p id={`${id}-description`} className="text-sm text-nordic-800">{description}</p>}
      {error && <p id={`${id}-error`} className="text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}

export function PropertyIntakeForm({ headingLevel = "h1" }: { headingLevel?: "h1" | "h2" } = {}) {
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
  // Del 2 (publiceringsmedgivandet): null = visas just nu, annars utfallet.
  const [agreementOutcome, setAgreementOutcome] = useState<"signed" | "skipped" | null>(null);
  // Publiceringsgodkännandet — lever över båda vyerna så kortet inte nollställs
  // när man går vidare från del 2 till tack-sidan.
  const [publishConsented, setPublishConsented] = useState(false);
  // Förnamn när husägaren kommer direkt från formuläret på /for-husagare.
  const [continuedAs, setContinuedAs] = useState<string | null>(null);
  // Leadet är redan räknat i Meta när kortformuläret skickades: räkna det inte två gånger.
  const [fromLead, setFromLead] = useState(false);
  const Heading = headingLevel;

  useEffect(() => {
    const prefill = readIntakePrefill();
    if (!prefill) return;
    setFromLead(true);
    setForm((current) => ({
      ...current,
      ownerName: prefill.ownerName || current.ownerName,
      ownerPhone: prefill.ownerPhone || current.ownerPhone,
      ownerEmail: prefill.ownerEmail || current.ownerEmail,
      postalCode: prefill.postalCode || current.postalCode,
      bedrooms: prefill.bedrooms || current.bedrooms,
      city: prefill.city || current.city,
    }));
    // Kontaktsteget är redan ifyllt: börja på adressen, men låt Tillbaka visa uppgifterna.
    if (prefill.ownerName && prefill.ownerPhone && isValidPhoneNumber(prefill.ownerPhone)) {
      setStep(1);
      setContinuedAs(prefill.ownerName.split(/\s+/)[0] || null);
    }
  }, []);

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
    setForm((current) => {
      if (current.parkingType.includes(value)) {
        return { ...current, parkingType: current.parkingType.filter((v) => v !== value) };
      }
      // "Ingen parkering" utesluter övriga val och tvärtom.
      return value === NO_PARKING
        ? { ...current, parkingType: [NO_PARKING], parkingSpaces: "0", parkingDetails: "", parkingLargeVehicle: "" }
        : {
          ...current,
          parkingType: [...current.parkingType.filter((v) => v !== NO_PARKING), value],
          parkingSpaces: current.parkingType.includes(NO_PARKING) ? "" : current.parkingSpaces,
        };
    });
    setErrors((current) => ({ ...current, parkingType: undefined, parkingSpaces: undefined }));
  }

  function setRentType(rentType: "varm" | "kall") {
    setForm((current) => ({
      ...current,
      rentType,
      ...(rentType === "varm"
        ? { allIncluded: true, linensIncluded: true, heatWaterIncluded: true, excludedNote: "" }
        : { allIncluded: false, linensIncluded: false, heatWaterIncluded: true }),
    }));
    setErrors((current) => ({ ...current, rentType: undefined }));
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
      if (!isValidPhoneNumber(form.ownerPhone)) {
        trackFormPhoneError();
        next.ownerPhone = "Kontrollera numret, till exempel 070-123 45 67.";
      }
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
      if (!form.bathrooms.trim()) next.bathrooms = "Ange antal badrum.";
    }
    if (targetStep === 3) {
      if (!form.parkingType.length) next.parkingType = "Välj typ av parkering, eller Ingen parkering.";
      else if (!form.parkingType.includes(NO_PARKING) && !(Number(form.parkingSpaces) > 0)) next.parkingSpaces = "Ange antal parkeringsplatser.";
    }
    if (targetStep === 4) {
      if (!(toNumber(form.desiredRent) && Number(form.desiredRent) > 0)) next.desiredRent = "Ange ungefärlig hyra per månad.";
      if (!form.rentType) next.rentType = "Välj varmhyra eller kallhyra.";
      if (!form.moveInFrom && !form.availabilityNote.trim()) next.moveInFrom = "Ange datum eller skriv en kort notis.";
    }
    if (targetStep === 5) {
      if (!form.consent) next.consent = "Godkänn att vi kontaktar dig om bostaden.";
      const totalBytes = files.reduce((sum, file) => sum + file.size, 0);
      if (files.length > MAX_IMAGE_COUNT) next.images = "Ladda upp max 10 bilder.";
      if (totalBytes > 60 * 1024 * 1024) next.images = "Bilderna får tillsammans vara max 60 MB.";
    }
    return next;
  }

  function focusFirstError(fieldErrors: FieldErrors) {
    const first = Object.keys(fieldErrors)[0];
    if (!first) return;
    // Mitt i bilden: varken under den fasta sidhuvudet eller den fasta knappraden.
    requestAnimationFrame(() => {
      const el = document.getElementById(first);
      if (!el) return;
      el.focus({ preventScroll: true });
      el.scrollIntoView({ block: "center", behavior: "instant" as ScrollBehavior });
    });
  }

  function goNext() {
    const nextErrors = validateStep();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      focusFirstError(nextErrors);
      return;
    }
    setStep((current) => Math.min(current + 1, steps.length - 1));
    jumpToTop();
  }

  function goBack() {
    setStep((current) => Math.max(current - 1, 0));
    jumpToTop();
  }

  function collectAllErrors() {
    const all = steps.reduce((acc, _step, index) => ({ ...acc, ...validateStep(index) }), {} as FieldErrors);
    setErrors(all);
    return all;
  }

  function onFilesChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(event.target.files ?? []);
    setFiles((current) => [...current, ...selected].slice(0, MAX_IMAGE_COUNT));
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
      parkingSpaces: toNumber(form.parkingSpaces),
      parkingType: form.parkingType,
      parkingDetails: fieldValue(form.parkingDetails),
      parkingLargeVehicle: form.parkingLargeVehicle || null,
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
      rentType: form.rentType || null,
      allIncluded: form.allIncluded,
      linensIncluded: form.linensIncluded,
      heatWaterIncluded: form.heatWaterIncluded,
      excludedNote: fieldValue(form.excludedNote),
      specialNote: fieldValue(form.specialNote),
      consent: form.consent,
      website: form.website,
      page: window.location.pathname,
      source: "property-intake",
      expectedImageCount: files.length,
      startedAt: Date.now(),
      utmParams,
    };
  }

  async function uploadImages(propertyId: string, token: string | null) {
    if (!files.length) return { imageCount: 0, imageErrors: [] as string[] };
    if (!token) {
      return {
        imageCount: 0,
        imageErrors: ["Bilderna kunde inte laddas upp automatiskt eftersom uppladdningslänken saknades."],
      };
    }

    let imageCount = 0;
    const imageErrors: string[] = [];
    for (const [index, raw] of files.entries()) {
      try {
        const file = await compressImage(raw, { maxDim: 1400, quality: 0.72 });
        if (file.size > MAX_UPLOAD_IMAGE_BYTES) {
          imageErrors.push(`${raw.name || `bild ${index + 1}`}: bilden är för stor efter komprimering`);
          continue;
        }
        const body = new FormData();
        body.append("file", file);
        body.append("sortOrder", String(index));
        const response = await fetch(`/api/share/${token}/properties/${propertyId}/images`, { method: "POST", body });
        if (!response.ok) {
          const result = await response.json().catch(() => null) as { error?: string } | null;
          imageErrors.push(`${raw.name || `bild ${index + 1}`}: ${result?.error ?? `uppladdning misslyckades (${response.status})`}`);
          continue;
        }
        imageCount += 1;
      } catch {
        imageErrors.push(`${raw.name || `bild ${index + 1}`}: nätverksfel vid uppladdning`);
      }
    }

    try {
      await fetch(`/api/share/${token}/properties/${propertyId}/images`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ created: imageCount, failed: imageErrors.length }),
      });
    } catch {
      // Bildsummeringen är bara intern CRM-hjälp; själva intaget är redan sparat.
    }

    return { imageCount, imageErrors };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const allErrors = collectAllErrors();
    if (Object.keys(allErrors).length) {
      const firstStep = steps.findIndex((_, index) => Object.keys(validateStep(index)).length > 0);
      if (firstStep >= 0 && firstStep !== step) {
        setStep(firstStep);
        jumpToTop();
      } else {
        focusFirstError(allErrors);
      }
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");
    try {
      const tracking = fromLead ? null : getMetaTrackingContext("Lead");
      const body = new FormData();
      body.append("payload", JSON.stringify({
        ...payload(),
        ...(tracking ? { tracking } : {}),
      }));
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

      if (tracking) {
        trackMetaEvent("Lead", {
          content_category: "homeowner",
          content_name: "property-intake",
        }, tracking.eventId);
      }

      const uploaded = await uploadImages(result.propertyId, result.agreement?.token ?? null);
      clearIntakePrefill();
      setSuccess({
        propertyId: result.propertyId,
        imageCount: (result.imageCount ?? 0) + uploaded.imageCount,
        imageErrors: [...(result.imageErrors ?? []), ...uploaded.imageErrors],
        agreement: result.agreement ?? null,
      });
      jumpToTop();
    } catch {
      setSubmitError("Det gick inte att skicka just nu. Försök igen eller ring 076-249 84 86.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Del 2 av registreringen: publiceringsmedgivandet visas direkt efter inskicket
  // (privatpersoner som inte redan signerat). Hoppar man över mejlar vi en
  // påminnelse med samma länk — se cron:en i app/api/cron/agreement-reminders.
  if (success && success.agreement && !success.agreement.alreadySigned && agreementOutcome === null) {
    return (
      <section className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="flex items-start gap-3 rounded-md border border-green-200 bg-white p-5 shadow-sm">
            <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-green-700" />
            <div>
              <p className="text-base font-semibold text-nordic-900">Bostaden är mottagen — tack!</p>
              <p className="mt-1 text-sm leading-6 text-nordic-700">
                Läs igenom publiceringsmedgivandet och godkänn med ditt namn. Det är kostnadsfritt
                och innebär ingen skyldighet att hyra ut.
              </p>
            </div>
          </div>

          <PublishConsentCard
            token={success.agreement.token}
            properties={[{ id: success.propertyId, address: form.address, city: form.city }]}
            onConsented={() => {
              setPublishConsented(true);
              setAgreementOutcome("signed");
            }}
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
          <h1 className="mt-4 text-2xl font-semibold text-nordic-900 sm:text-3xl">Tack – vi har tagit emot din bostad!</h1>
          <p className="mt-3 text-base leading-7 text-nordic-800">
            Vi gör beskrivningen klar för våra företagskunder och kontrollerar bilderna.
            Annonsen publiceras när kontrollen är klar och du har gett ditt medgivande.
          </p>

          {agreementOutcome === "signed" && (
            <p className="mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-900">
              Publiceringsmedgivandet är godkänt. Vi kontaktar dig när vi har en förfrågan som passar din bostad.
            </p>
          )}
          {publishConsented && (
            <p className="mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-900">
              Ditt publiceringsmedgivande är sparat. Vi kontrollerar beskrivningen och bilderna före publicering.
            </p>
          )}
          {agreementOutcome === "skipped" && success.agreement && (
            <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">Publiceringsmedgivandet är inte godkänt ännu.</p>
              <p className="mt-1">
                Du kan göra det när som helst via{" "}
                <a href={`/uthyrare/${success.agreement.token}`} className="font-semibold underline">
                  din personliga sida
                </a>
                {" "}— {publishConsented ? "vi har mejlat dig länken." : "där kan du också godkänna publiceringen. Länken finns i mejlet du fått."}
              </p>
            </div>
          )}

          <div className="mt-5 space-y-1 rounded-md bg-nordic-50 p-4 text-sm text-nordic-800">
            <p>Bilder mottagna: <span className="font-semibold">{success.imageCount}</span></p>
            <p>
              Referens: <span className="font-mono font-semibold">{success.propertyId}</span>
              <span className="text-nordic-800"> – uppge den gärna om du hör av dig.</span>
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
    <section className="pb-0 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="border-y border-nordic-200 bg-white sm:rounded-md sm:border sm:shadow-sm">
          <div className="border-b border-nordic-100 px-4 pb-5 pt-4 sm:p-6">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="flex items-center gap-2 font-semibold text-[#0f766e]">
                <Home className="h-4 w-4" aria-hidden="true" />
                Registrera bostad
              </span>
              <span className="font-medium tabular-nums text-nordic-700">
                Steg {step + 1} av {steps.length}
              </span>
            </div>
            <Progress value={progress} aria-label={`Steg ${step + 1} av ${steps.length}`} className="mt-3 h-1.5 bg-nordic-100" />
            <Heading className="mt-5 text-2xl font-semibold leading-tight text-nordic-900 sm:text-3xl">{steps[step].heading}</Heading>
            {step === 0 && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-nordic-700">
                Tar några minuter. Det vi alltid behöver är markerat med *, resten kan du hoppa över om du är osäker.
              </p>
            )}
            {continuedAs && step === 1 && (
              <p className="mt-3 flex gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm leading-6 text-green-900">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-700" aria-hidden="true" />
                <span>Tack {continuedAs}! Dina kontaktuppgifter är sparade. Nu fyller du i själva bostaden.</span>
              </p>
            )}
            <div className="mt-5 hidden gap-2 sm:grid sm:grid-cols-6">
              {steps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setStep(index)}
                  aria-current={index === step ? "step" : undefined}
                  className={cn(
                    "min-h-11 rounded-md border px-2 text-left text-xs transition-colors",
                    index === step ? "border-nordic-900 bg-nordic-900 text-white" : "border-nordic-200 bg-white text-nordic-700 hover:border-nordic-500",
                  )}
                >
                  <span className="block font-semibold">{index + 1}. {item.title}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} noValidate className="px-4 pt-5 sm:px-6 sm:pt-6">
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
                  <div className="grid grid-cols-2 gap-3">
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
                  <AddressAutocomplete
                    id="address"
                    label="Adress"
                    value={form.address}
                    onChange={(value) => set("address", value)}
                    onSelect={(parts) => {
                      setForm((current) => ({
                        ...current,
                        address: parts.street || current.address,
                        postalCode: parts.postalCode || current.postalCode,
                        city: parts.city || current.city,
                        country: parts.country || current.country,
                      }));
                      setErrors((current) => ({ ...current, address: undefined, postalCode: undefined, city: undefined, country: undefined }));
                    }}
                    error={errors.address}
                    placeholder="Börja skriva, t.ex. Storgatan 10"
                  />
                </div>
                <LabelledInput id="postalCode" label="Postnummer" value={form.postalCode} onChange={(value) => set("postalCode", value)} error={errors.postalCode} required autoComplete="postal-code" inputMode="numeric" placeholder="572 95" />
                <LabelledInput id="city" label="Ort" value={form.city} onChange={(value) => set("city", value)} error={errors.city} required autoComplete="address-level2" placeholder="Figeholm" />
                <LabelledInput id="country" label="Land" value={form.country} onChange={(value) => set("country", value)} error={errors.country} required autoComplete="country-name" />
              </div>
            )}

            {step === 2 && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                  <LabelledInput id="squareMeters" label="Bostadsyta (m²)" value={form.squareMeters} onChange={(value) => set("squareMeters", value)} type="number" inputMode="decimal" />
                  <Stepper id="bedrooms" label="Sovrum" value={form.bedrooms} onChange={(value) => set("bedrooms", value)} required error={errors.bedrooms} />
                  <Stepper id="beds" label="Bäddar" value={form.beds} onChange={(value) => set("beds", value)} required error={errors.beds} />
                  <Stepper id="bathrooms" label="Badrum" value={form.bathrooms} onChange={(value) => set("bathrooms", value)} required error={errors.bathrooms} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skick" className="text-sm font-semibold text-nordic-900">Skick och standard</Label>
                  <Textarea id="skick" value={form.skick} onChange={(event) => set("skick", event.target.value)} placeholder="T.ex. lantligt men hemtrevligt, äldre standard, nyrenoverat kök..." className="min-h-28 rounded-md border-nordic-200 bg-white text-base" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Stepper id="washingMachines" label="Tvättmaskin" value={form.washingMachines} onChange={(value) => set("washingMachines", value)} />
                  <Stepper id="dryers" label="Torktumlare" value={form.dryers} onChange={(value) => set("dryers", value)} />
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  <ToggleCard label="Möblerat" checked={form.furnished} onChange={(value) => set("furnished", value)} />
                  <ToggleCard label="Kök" checked={form.kitchen} onChange={(value) => set("kitchen", value)} />
                  <ToggleCard label="Diskmaskin" checked={form.dishwasher} onChange={(value) => set("dishwasher", value)} />
                  <ToggleCard label="Bredband" checked={form.broadband} onChange={(value) => set("broadband", value)} />
                  <ToggleCard label="Hela bostaden hyrs ut" checked={form.egetBoende} onChange={(value) => set("egetBoende", value)} description="Egen bostad – inte rum delat med andra hyresgäster." className="col-span-2 lg:col-span-1" />
                </div>
                <div id="parkingType" tabIndex={-1} className="space-y-2 outline-none" aria-describedby={errors.parkingType ? "parkingType-error" : undefined}>
                  <p className="text-sm font-semibold text-nordic-900">Parkering *</p>
                  <p className="text-sm text-nordic-800">Välj det som stämmer – flera går bra.</p>
                  <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
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
                  {errors.parkingType && <p id="parkingType-error" className="text-sm font-medium text-red-700">{errors.parkingType}</p>}
                </div>
                {form.parkingType.length > 0 && !form.parkingType.includes(NO_PARKING) && (
                  <>
                    <div className="max-w-sm">
                      <Stepper
                        id="parkingSpaces"
                        label="Antal parkeringsplatser"
                        value={form.parkingSpaces}
                        onChange={(value) => set("parkingSpaces", value)}
                        max={500}
                        required
                        error={errors.parkingSpaces}
                        description="Räkna med alla platser som hyresgästerna kan använda, även i garage."
                      />
                    </div>
                    <Field>
                      <FieldLabel htmlFor="parkingDetails">Hur är platserna fördelade?</FieldLabel>
                      <Textarea
                        id="parkingDetails"
                        value={form.parkingDetails}
                        onChange={(event) => set("parkingDetails", event.target.value)}
                        maxLength={1000}
                        placeholder="T.ex. 1 i garage och 2 på uppfarten"
                        className="text-base md:text-base"
                      />
                      <FieldDescription>Du kan också nämna om någon plats har begränsad tillgång.</FieldDescription>
                    </Field>
                    <FieldSet className="gap-2">
                      <FieldLegend id="parking-large-vehicle-label" variant="label">
                        Finns plats för större arbetsfordon, till exempel en skåpbil?
                      </FieldLegend>
                      <RadioGroup
                        aria-labelledby="parking-large-vehicle-label"
                        className="flex flex-wrap gap-x-6 gap-y-1"
                        value={form.parkingLargeVehicle}
                        onValueChange={(value) => set("parkingLargeVehicle", value as IntakeFormState["parkingLargeVehicle"])}
                      >
                        {[
                          { value: "yes", label: "Ja" },
                          { value: "no", label: "Nej" },
                          { value: "unsure", label: "Osäker" },
                        ].map((option) => (
                          <Field key={option.value} orientation="horizontal" className="min-h-11 w-auto">
                            <RadioGroupItem id={`parking-large-vehicle-${option.value}`} value={option.value} />
                            <FieldLabel htmlFor={`parking-large-vehicle-${option.value}`}>{option.label}</FieldLabel>
                          </Field>
                        ))}
                      </RadioGroup>
                    </FieldSet>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="equipmentNote" className="text-sm font-semibold text-nordic-900">Övrigt om utrustning</Label>
                  <Textarea id="equipmentNote" value={form.equipmentNote} onChange={(event) => set("equipmentNote", event.target.value)} placeholder="T.ex. bastu, altan, extra förvaring, redskap, larm, laddbox..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base" />
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="max-w-sm">
                  <LabelledInput id="desiredRent" label="Ungefärlig hyra per månad (kr)" value={form.desiredRent} onChange={(value) => set("desiredRent", value.replace(/[^\d]/g, ""))} error={errors.desiredRent} required inputMode="numeric" placeholder="15000" />
                </div>

                <div id="rentType" tabIndex={-1} className="space-y-3 outline-none">
                  <div>
                    <p className="text-sm font-semibold text-nordic-900">Varmhyra eller kallhyra? *</p>
                    <p className="mt-1 text-sm leading-6 text-nordic-800">
                      Eftersom vi hyr ut till företag uppskattas varmhyra – en fast summa per månad.
                      Med varmhyra avses rimlig förbrukning.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <ToggleCard
                      label="Varmhyra"
                      description="El, vatten, sophämtning, internet och sängkläder ingår."
                      checked={form.rentType === "varm"}
                      onChange={() => setRentType("varm")}
                    />
                    <ToggleCard
                      label="Kallhyra"
                      description="Hyresgästen betalar själv för en del av driften, till exempel el."
                      checked={form.rentType === "kall"}
                      onChange={() => setRentType("kall")}
                    />
                  </div>
                  {errors.rentType && <p className="text-sm font-medium text-red-700">{errors.rentType}</p>}
                </div>

                {form.rentType === "kall" && (
                  <div className="space-y-4 rounded-md bg-nordic-50 p-4">
                    <p className="text-sm font-semibold text-nordic-900">Vad ingår i kallhyran?</p>
                    <div className="grid grid-cols-2 gap-3">
                      <ToggleCard label="Värme + varmvatten" checked={form.heatWaterIncluded} onChange={(value) => set("heatWaterIncluded", value)} />
                      <ToggleCard label="Sängkläder + handdukar" checked={form.linensIncluded} onChange={(value) => set("linensIncluded", value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="excludedNote" className="text-sm font-semibold text-nordic-900">Vad betalar hyresgästen själv?</Label>
                      <Textarea id="excludedNote" value={form.excludedNote} onChange={(event) => set("excludedNote", event.target.value)} placeholder="T.ex. el efter förbrukning, internet, sophämtning..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base md:text-base" />
                    </div>
                  </div>
                )}

                <div className="grid gap-5 border-t border-nordic-100 pt-6 sm:grid-cols-2">
                  <LabelledInput id="moveInFrom" label="Tillgänglig från" value={form.moveInFrom} onChange={(value) => set("moveInFrom", value)} error={errors.moveInFrom} required type="date" />
                  <LabelledInput id="availableTo" label="Tillgänglig till" value={form.availableTo} onChange={(value) => set("availableTo", value)} type="date" />
                  <ToggleCard label="Tillgänglig tills vidare / osäker sluttid" checked={form.availableUntilFurtherNotice} onChange={(value) => set("availableUntilFurtherNotice", value)} className="sm:col-span-2" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="availabilityNote" className="text-sm font-semibold text-nordic-900">Kommentar om tillgänglighet</Label>
                  <Textarea id="availabilityNote" value={form.availabilityNote} onChange={(event) => set("availabilityNote", event.target.value)} placeholder="T.ex. ledigt efter sommaren, bara vardagar, osäker sluttid..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base md:text-base" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="specialNote" className="text-sm font-semibold text-nordic-900">Något särskilt vi bör veta</Label>
                  <Textarea id="specialNote" value={form.specialNote} onChange={(event) => set("specialNote", event.target.value)} placeholder="T.ex. trappor, husdjur, vinterväg, säsong..." className="min-h-24 rounded-md border-nordic-200 bg-white text-base md:text-base" />
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-5">
                <div className="rounded-md border border-dashed border-nordic-300 bg-nordic-50 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <Label htmlFor="images" className="text-base font-semibold text-nordic-900">Bilder</Label>
                      <p className="mt-1 text-sm text-nordic-700">Ladda gärna upp utsida, kök, sovrum och badrum. Det går att skicka utan bilder.</p>
                    </div>
                    <label
                      htmlFor="images"
                      className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium sm:w-auto shadow-sm transition-all duration-300 hover:bg-accent hover:text-accent-foreground hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.98]"
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
                  <Checkbox id="consent" checked={form.consent} onCheckedChange={(value) => set("consent", value === true)} className="mt-0.5 h-5 w-5" />
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

            <div className="sticky bottom-0 z-10 -mx-4 mt-8 flex items-center gap-3 border-t border-nordic-100 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 sm:-mx-6 sm:justify-between sm:px-6 sm:pb-5 sm:pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={isSubmitting}
                className={cn("min-h-12 gap-2 px-3 text-nordic-800", step === 0 && "invisible")}
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                Tillbaka
              </Button>
              {step < steps.length - 1 ? (
                <Button type="button" onClick={goNext} className="min-h-12 flex-1 gap-2 bg-nordic-900 text-base hover:bg-nordic-800 sm:min-w-44 sm:flex-none">
                  Nästa
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting} className="min-h-12 flex-1 gap-2 bg-[#0f766e] text-base hover:bg-[#115e59] sm:min-w-44 sm:flex-none">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Check className="h-4 w-4" aria-hidden="true" />}
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
