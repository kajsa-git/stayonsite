export type ContactFormType =
  | 'hero-intent'
  | 'inquiry'
  | 'homeowner'
  | 'lp-homeowner';

const FORM_SUBMIT_ENDPOINT =
  'https://formsubmit.co/ajax/9d0b8777660da2c1479ca0ed3d953eb4';
const LIVE_FORM_HOSTNAMES = new Set(['www.stayonsite.se', 'stayonsite.se']);

export interface ContactFormResponse {
  success: boolean;
  provider?: string;
  error?: string;
}

export interface ContactFormSubmission {
  formType: ContactFormType;
  locale: 'sv' | 'en' | 'pl';
  page: string;
  source?: string;
  fields: Record<string, string>;
  utmParams?: Record<string, string>;
}

function getFormLabel(formType: ContactFormType): string {
  switch (formType) {
    case 'hero-intent':
      return 'Snabbförfrågan';
    case 'inquiry':
      return 'Kontaktformulär';
    case 'homeowner':
      return 'Husägarformulär';
    case 'lp-homeowner':
      return 'Husägarformulär (LP)';
  }
}

function getSubject(submission: ContactFormSubmission): string {
  switch (submission.formType) {
    case 'hero-intent':
      return `Snabbförfrågan: ${submission.fields.ort} – ${submission.fields.antal_personer} pers`;
    case 'inquiry':
      return 'Ny förfrågan från StayOnSite';
    case 'homeowner':
      return 'Ny husägare-registrering från StayOnSite';
    case 'lp-homeowner':
      return 'Ny husägare via Facebook-annons';
  }
}

function isLiveFormOrigin(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return LIVE_FORM_HOSTNAMES.has(window.location.hostname);
}

export async function submitContactForm(
  submission: ContactFormSubmission
): Promise<ContactFormResponse> {
  if (!isLiveFormOrigin()) {
    throw new Error('unsupported_origin');
  }

  const formData = new FormData();

  Object.entries(submission.fields).forEach(([key, value]) => {
    if (value) {
      formData.append(key, value);
    }
  });

  formData.append('_subject', getSubject(submission));
  formData.append('_captcha', 'false');
  formData.append('_template', 'table');
  formData.append('_next', window.location.origin);
  formData.append('formulär', getFormLabel(submission.formType));
  formData.append('sida', submission.page);
  formData.append('språk', submission.locale);

  if (submission.source) {
    formData.append('källa', submission.source);
  }

  if (submission.formType === 'inquiry' && submission.fields.email) {
    formData.append('_replyto', submission.fields.email);
  }

  if (submission.utmParams) {
    Object.entries(submission.utmParams).forEach(([key, value]) => {
      if (value) {
        formData.append(key, value);
      }
    });
  }

  const response = await fetch(FORM_SUBMIT_ENDPOINT, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
    },
    body: formData,
  });

  const result = (await response.json().catch(() => null)) as
    | { success?: string | boolean; message?: string }
    | null;

  if (!response.ok) {
    throw new Error('contact_form_request_failed');
  }

  if (result?.success === 'true' || result?.success === true) {
    return { success: true, provider: 'formsubmit' };
  }

  const providerMessage =
    typeof result?.message === 'string' ? result.message.toLowerCase() : '';

  if (providerMessage.includes('activation')) {
    throw new Error('formsubmit_activation_required');
  }

  throw new Error('contact_form_request_failed');
}

export function getContactFormErrorMessage(
  error: string | undefined,
  locale: 'sv' | 'en' | 'pl'
): string {
  if (error === 'unsupported_origin') {
    if (locale === 'sv') {
      return 'Formulärskick är avstängt här. Testa bara på www.stayonsite.se så att FormSubmit inte aktiveras för preview-domäner.';
    }

    if (locale === 'pl') {
      return 'Wysyłka formularza jest tu wyłączona. Testuj tylko na www.stayonsite.se, żeby FormSubmit nie aktywował domen preview.';
    }

    return 'Form submission is disabled here. Test only on www.stayonsite.se so FormSubmit is not activated for preview domains.';
  }

  if (error === 'formsubmit_activation_required') {
    if (locale === 'sv') {
      return 'FormSubmit kräver aktivering för den här domänen. Skicka bara från www.stayonsite.se.';
    }

    if (locale === 'pl') {
      return 'FormSubmit wymaga aktywacji dla tej domeny. Wysyłaj tylko z www.stayonsite.se.';
    }

    return 'FormSubmit requires activation for this domain. Send only from www.stayonsite.se.';
  }

  if (locale === 'sv') {
    return 'Det gick inte att skicka formuläret just nu. Försök igen eller ring oss direkt.';
  }

  if (locale === 'pl') {
    return 'Nie udało się wysłać formularza. Spróbuj ponownie albo zadzwoń bezpośrednio.';
  }

  return 'The form could not be sent right now. Please try again or call us directly.';
}
