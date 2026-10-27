import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { updateConsent } from '@/lib/gtag';
import { useUtmCapture } from './use-utm-capture';

describe('advertising attribution consent', () => {
  beforeEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/?gclid=test-click&utm_source=google');
    window.gtag = vi.fn();
  });

  afterEach(() => {
    localStorage.clear();
    window.history.replaceState({}, '', '/');
  });

  it('stores identifiers only after consent and clears them on denial', () => {
    const { result } = renderHook(() => useUtmCapture());
    expect(result.current).toEqual({});
    expect(localStorage.getItem('stayonsite_utm_consented_v2')).toBeNull();

    act(() => updateConsent('granted'));
    expect(result.current).toEqual({ gclid: 'test-click', utm_source: 'google' });
    expect(JSON.parse(localStorage.getItem('stayonsite_utm_consented_v2')!).params.gclid).toBe('test-click');

    act(() => updateConsent('denied'));
    expect(result.current).toEqual({});
    expect(localStorage.getItem('stayonsite_utm_consented_v2')).toBeNull();
  });

  it('does not reuse an old stored click whose consent provenance is unknown', () => {
    localStorage.setItem('cookie-consent', 'granted');
    window.history.replaceState({}, '', '/');
    localStorage.setItem('stayonsite_utm', JSON.stringify({
      params: { gclid: 'old-click' }, ts: Date.now(),
    }));
    const { result } = renderHook(() => useUtmCapture());
    expect(result.current).toEqual({});
    expect(localStorage.getItem('stayonsite_utm')).toBeNull();
  });
});
