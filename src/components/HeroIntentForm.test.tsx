import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  submit: vi.fn(),
  trackStart: vi.fn(),
  trackSubmit: vi.fn(),
  trackPhoneError: vi.fn(),
}));

vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'sv',
    t: (key: string) => ({
      'inquiry.title': 'Skicka en förfrågan',
      'heroForm.city': 'Ort',
      'heroForm.people': 'Antal personer',
      'heroForm.email': 'E-post',
      'heroForm.phone': 'Telefon',
      'heroForm.submit': 'Få boendeförslag',
      'homeowner.form.phoneError': 'Kontrollera numret, till exempel 070-123 45 67 eller +48 123 456 789.',
    } as Record<string, string>)[key] ?? key,
  }),
}));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/hooks/use-utm-capture', () => ({ useUtmCapture: () => ({}) }));
vi.mock('@/lib/gtag', () => ({
  trackFormStart: mocks.trackStart,
  trackFormSubmit: mocks.trackSubmit,
  trackFormPhoneError: mocks.trackPhoneError,
}));
vi.mock('@/lib/contact-form', () => ({
  submitContactForm: mocks.submit,
  getContactFormErrorMessage: () => 'Fel',
}));

import HeroIntentForm from './HeroIntentForm';

describe('HeroIntentForm phone validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.submit.mockResolvedValue({ success: true });
  });
  afterEach(cleanup);

  function fillForm(phone: string) {
    render(<HeroIntentForm defaultCity="Luleå" />);
    fireEvent.change(screen.getByLabelText('Antal personer'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('E-post'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText('Telefon'), { target: { value: phone } });
    const form = screen.getByRole('button', { name: 'Få boendeförslag' }).closest('form');
    if (!form) throw new Error('Form missing');
    fireEvent.submit(form);
  }

  it('shows an actionable error without sending an incomplete number', () => {
    fillForm('070123');
    expect(screen.getByRole('alert')).toHaveTextContent('070-123 45 67');
    expect(screen.getByLabelText('Telefon')).toHaveAttribute('aria-invalid', 'true');
    expect(mocks.trackPhoneError).toHaveBeenCalledTimes(1);
    expect(mocks.submit).not.toHaveBeenCalled();
  });

  it('submits a commonly pasted number and records success only after the response', async () => {
    fillForm('+46 (0)70 123 45 67');
    expect(mocks.submit).toHaveBeenCalledWith(expect.objectContaining({
      fields: expect.objectContaining({ phone: '+46 (0)70 123 45 67' }),
    }));
    await waitFor(() => expect(mocks.trackSubmit).toHaveBeenCalledTimes(1));
    expect(mocks.trackPhoneError).not.toHaveBeenCalled();
  });
});
