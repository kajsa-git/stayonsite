const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Accept separators commonly pasted from address books and websites. The same
// character set is used by the server so a valid client input can be received.
export const PHONE_ALLOWED_CHARS_REGEX = /^[+\d\s().\-\u2010-\u2015\u2212]+$/u;

// The parenthesized zero is a domestic trunk prefix, not part of an
// international number: +46 (0)70... and +46 70... refer to the same phone.
export function stripInternationalTrunkZero(value: string): string {
  return value.replace(
    /^((?:\+|00)[1-9]\d{0,2}[\s.\-\u2010-\u2015\u2212]*)\(0\)(?=[\s.\-\u2010-\u2015\u2212]*\d)/u,
    '$1',
  );
}

function getDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

export function isValidPhoneNumber(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed || !PHONE_ALLOWED_CHARS_REGEX.test(trimmed)) {
    return false;
  }

  const plusCount = (trimmed.match(/\+/g) || []).length;
  if (plusCount > 1 || (plusCount === 1 && !trimmed.startsWith('+'))) {
    return false;
  }

  const digits = getDigits(stripInternationalTrunkZero(trimmed));
  if (!digits) {
    return false;
  }

  if (trimmed.startsWith('+')) {
    return digits.length >= 8 && digits.length <= 15;
  }

  if (trimmed.startsWith('00')) {
    const internationalDigits = digits.slice(2);
    return internationalDigits.length >= 8 && internationalDigits.length <= 15;
  }

  if (digits.startsWith('07')) {
    return digits.length === 10;
  }

  if (digits.startsWith('0')) {
    return digits.length >= 8 && digits.length <= 11;
  }

  return digits.length >= 10 && digits.length <= 15;
}

export function isValidContact(value: string): boolean {
  return isValidEmail(value) || isValidPhoneNumber(value);
}
