import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from './Header';

const routing = vi.hoisted(() => ({ pathname: '/' }));
vi.mock('next/navigation', () => ({
  usePathname: () => routing.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

function renderHeader(pathname: string) {
  routing.pathname = pathname;
  return render(<LanguageProvider><Header /></LanguageProvider>);
}

afterEach(cleanup);

describe('public navigation', () => {
  it.each([
    ['/', 'Skicka förfrågan', '#hero-inquiry'],
    ['/for-foretag', 'Skicka förfrågan', '#hero-inquiry'],
    ['/projektboende', 'Skicka förfrågan', '#hero-inquiry'],
    ['/stad/boden', 'Skicka förfrågan', '#hero-inquiry'],
    ['/boenden', 'Skicka förfrågan', '#hero-inquiry'],
    ['/kontakt', 'Skicka förfrågan', '#inquiry'],
    ['/en/corporate-housing/boden', 'Send inquiry', '#hero-inquiry'],
    ['/pl/zakwaterowanie/boden', 'Wyślij zapytanie', '#hero-inquiry'],
    ['/datacenter-boende', 'Skicka förfrågan', '#hero-inquiry'],
    ['/for-husagare/boden', 'Hyr ut din bostad', '#homeowner-inquiry'],
    ['/blogg/example', 'Skicka förfrågan', '/#hero-inquiry'],
    ['/en/about', 'Send inquiry', '/en/corporate-housing-sweden#hero-inquiry'],
    ['/pl/blog/example', 'Wyślij zapytanie', '/pl/zakwaterowanie-firmowe#hero-inquiry'],
  ])('takes the inquiry action from %s to the relevant form', (path, label, href) => {
    renderHeader(path);
    expect(screen.getByRole('link', { name: label })).toHaveAttribute('href', href);
  });

  it('keeps English company, locations, about and logo navigation in English', () => {
    renderHeader('/en/corporate-housing/boden');
    expect(screen.getByRole('link', { name: 'For companies' })).toHaveAttribute('href', '/en/corporate-housing-sweden');
    expect(screen.getByRole('link', { name: 'Locations' })).toHaveAttribute('href', '/en/corporate-housing-sweden#cities');
    expect(screen.getByRole('link', { name: 'About us' })).toHaveAttribute('href', '/en/about');
    expect(screen.getByRole('link', { name: 'StayOnSite' })).toHaveAttribute('href', '/en/corporate-housing-sweden');
  });

  it.each([
    ['/', 'Mer', 'Boende vid datacenter', '/datacenter-boende', '/kontakt'],
    ['/en/about', 'More', 'Data centre accommodation', '/en/data-centre-accommodation-sweden', '/en/corporate-housing-sweden#inquiry'],
    ['/pl/zakwaterowanie-firmowe', 'Więcej', 'Zakwaterowanie przy centrach danych', '/pl/zakwaterowanie-centra-danych-szwecja', '/pl/zakwaterowanie-firmowe#inquiry'],
  ])('makes secondary desktop pages available from %s', (path, label, dataCentreLabel, dataCentreHref, contactHref) => {
    renderHeader(path);
    fireEvent.keyDown(screen.getByRole('button', { name: label }), { key: 'Enter' });
    const menu = screen.getByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: dataCentreLabel })).toHaveAttribute('href', dataCentreHref);
    expect(within(menu).getByRole('menuitem', { name: /Kontakt|Contact/ })).toHaveAttribute('href', contactHref);
    if (path === '/') {
      expect(within(menu).getByRole('menuitem', { name: 'Projektboende' })).toHaveAttribute('href', '/projektboende');
    }
    fireEvent.keyDown(menu, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens a named, keyboard-dismissable mobile menu and closes it after selecting a page', () => {
    renderHeader('/');
    fireEvent.click(screen.getByRole('button', { name: 'Öppna menyn' }));
    const dialog = screen.getByRole('dialog', { name: 'Meny' });
    expect(within(dialog).getByRole('link', { name: 'Projektboende' })).toHaveAttribute('href', '/projektboende');
    expect(within(dialog).getByRole('link', { name: 'Ring oss' })).toHaveAttribute('href', 'tel:+46762498486');
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Öppna menyn' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('link', { name: 'Våra orter' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
