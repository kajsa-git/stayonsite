const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_ALLOWED_CHARS_REGEX = /^[+\d\s()-]+$/;

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

  const digits = getDigits(trimmed);
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
