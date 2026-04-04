export type ContactFormType =
  | 'hero-intent'
  | 'inquiry'
  | 'homeowner'
  | 'lp-homeowner';

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

export async function submitContactForm(
  submission: ContactFormSubmission
): Promise<ContactFormResponse> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      ...submission,
      startedAt: Date.now(),
    }),
  });

  const result = (await response.json().catch(() => null)) as {
    success?: boolean;
    error?: string;
    provider?: string;
  } | null;

  if (!response.ok || !result?.success) {
    throw new Error(result?.error || 'contact_form_request_failed');
  }

  return { success: true, provider: result?.provider };
}

export function getContactFormErrorMessage(
  error: string | undefined,
  locale: 'sv' | 'en' | 'pl'
): string {
  if (locale === 'sv') {
    return 'Det gick inte att skicka formuläret just nu. Försök igen eller ring oss direkt.';
  }

  if (locale === 'pl') {
    return 'Nie udało się wysłać formularza. Spróbuj ponownie albo zadzwoń bezpośrednio.';
  }

  return 'The form could not be sent right now. Please try again or call us directly.';
}
