import { describe, expect, it } from 'vitest';
import {
  isValidContact,
  isValidEmail,
  isValidPhoneNumber,
} from '@/lib/contact';

describe('contact validation', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('namn@foretag.se')).toBe(true);
    expect(isValidContact('namn@foretag.se')).toBe(true);
  });

  it('accepts Swedish mobile numbers with full length', () => {
    expect(isValidPhoneNumber('076-249 84 86')).toBe(true);
    expect(isValidPhoneNumber('070.123.45.67')).toBe(true);
    expect(isValidPhoneNumber('070–123 45 67')).toBe(true);
  });

  it('rejects Swedish mobile numbers that are too short', () => {
    expect(isValidPhoneNumber('07636363')).toBe(false);
  });

  it('accepts Swedish landlines with varying local lengths', () => {
    expect(isValidPhoneNumber('08-123 45 67')).toBe(true);
    expect(isValidPhoneNumber('031-123456')).toBe(true);
  });

  it('accepts international numbers with prefix', () => {
    expect(isValidPhoneNumber('+48 123 456 789')).toBe(true);
    expect(isValidPhoneNumber('0044 20 7946 0018')).toBe(true);
    expect(isValidPhoneNumber('+46 (0)70 123 45 67')).toBe(true);
    expect(isValidPhoneNumber('0044 (0)20 7946 0018')).toBe(true);
  });

  it('accepts country-code-first numbers without plus', () => {
    expect(isValidPhoneNumber('46762498486')).toBe(true);
  });

  it('rejects malformed international numbers', () => {
    expect(isValidPhoneNumber('+49 123')).toBe(false);
    expect(isValidPhoneNumber('12+345678')).toBe(false);
    expect(isValidPhoneNumber('070.123.45')).toBe(false);
    expect(isValidPhoneNumber('70 123 45 67')).toBe(false);
    expect(isValidPhoneNumber('70 ABC 45 67')).toBe(false);
  });
});
