import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('./clarity', () => ({ clarityEvent: vi.fn(), updateClarityConsent: vi.fn() }));

import { clarityEvent } from './clarity';
import { setUserData, trackFormPhoneError } from './gtag';

describe('phone tracking', () => {
  beforeEach(() => {
    window.gtag = vi.fn();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it.each(['+46 (0)70 123 45 67', '070.123.45.67'])(
    'normalizes %s for the Google tag', (phone) => {
      setUserData({ phone });
      expect(window.gtag).toHaveBeenCalledWith('set', 'user_data', { phone_number: '+46701234567' });
    },
  );

  it('records only a static error event and does not break validation if Clarity fails', () => {
    localStorage.setItem('cookie-consent', 'granted');
    trackFormPhoneError();
    expect(clarityEvent).toHaveBeenCalledWith('form_phone_error');
    vi.mocked(clarityEvent).mockImplementationOnce(() => { throw new Error('unavailable'); });
    expect(() => trackFormPhoneError()).not.toThrow();
  });

  it.each([null, 'denied'] as const)('does not record a phone error without consent: %s', (choice) => {
    if (choice) localStorage.setItem('cookie-consent', choice);
    trackFormPhoneError();
    expect(clarityEvent).not.toHaveBeenCalled();
  });
});
