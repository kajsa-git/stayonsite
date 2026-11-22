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
    expect(screen.getByRole('link', { name: 'About us' })).toHaveAttribute('href', '/en/about');
    expect(screen.getByRole('link', { name: 'StayOnSite' })).toHaveAttribute('href', '/en/corporate-housing-sweden');
  });

  it.each([
    ['/', ['För företag', 'För husägare', 'Om oss', 'Kontakt']],
    ['/en/about', ['For companies', 'For Homeowners', 'About us', 'Contact']],
  ])('keeps the desktop top menu to the main paths from %s', (path, labels) => {
    renderHeader(path);
    const nav = screen.getAllByRole('navigation')[0];
    expect(within(nav).getAllByRole('link').map((link) => link.textContent)).toEqual(expect.arrayContaining(labels));
    for (const hidden of ['Projektboende', 'Boenden', 'Våra orter', 'Datacenter', 'Locations']) {
      expect(within(nav).queryByRole('link', { name: hidden })).not.toBeInTheDocument();
    }
  });

  it.each([
    ['/', 'Boende vid datacenter', '/datacenter-boende'],
    ['/en/about', 'Data centre accommodation', '/en/data-centre-accommodation-sweden'],
  ])('keeps secondary pages in the mobile menu from %s', (path, dataCentreLabel, dataCentreHref) => {
    renderHeader(path);
    fireEvent.click(screen.getByRole('button', { name: /Öppna menyn|Open menu/ }));
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByRole('link', { name: dataCentreLabel })).toHaveAttribute('href', dataCentreHref);
    expect(within(dialog).getByRole('link', { name: /^(Boenden|Accommodation)$/ })).toHaveAttribute('href', '/boenden');
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
