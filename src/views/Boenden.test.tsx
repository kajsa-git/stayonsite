import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { SWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Boenden } from './Boenden';

vi.mock('next/navigation', () => ({ usePathname: () => '/boenden' }));
vi.mock('@/components/Header', () => ({ default: () => null }));
vi.mock('@/components/Footer', () => ({ default: () => null }));
vi.mock('@/components/HeroIntentForm', () => ({ default: () => <section id="hero-inquiry" /> }));

function listing(id: string, city: string | null, beds: number | null, postalCode: string | null = null) {
  return {
    id, slug: id, name: `Boende ${id}`, city, beds, postalCode, bedrooms: null,
    squareMeters: null, furnished: false, garage: false, broadband: false,
    kitchen: false, egetBoende: false, parkingSpaces: null,
    publicDescription: null, publicDescriptionEn: null, publicDescriptionPl: null,
    imageUrls: [],
  };
}

const inventory = [
  ...Array.from({ length: 14 }, (_, i) => listing(`boden-${i}`, i === 0 ? 'BODEN' : 'Boden', 8, '961 40')),
  listing('gavle', 'Gävle', 6, '804 34'),
  listing('gavle-unknown', 'Gävle', null, '80433'),
  listing('lulea', 'Luleå', 2, '973 41'),
  listing('unknown-location', null, null),
];
const fetchMock = vi.fn();

function renderListings() {
  return render(
    <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0, shouldRetryOnError: false }}>
      <LanguageProvider>
        <Boenden listingLinks={[{ slug: 'directory-only', name: 'Alla orters boenden', city: 'Säffle' }]} />
      </LanguageProvider>
    </SWRConfig>,
  );
}

const search = () => screen.getByRole('searchbox', { name: 'Sök ort, postnummer eller boende' });
const cards = () => screen.queryAllByRole('heading', { level: 3, name: /^Boende / });
const setSearch = (value: string) => fireEvent.change(search(), { target: { value } });

beforeEach(() => {
  fetchMock.mockReset().mockResolvedValue({ ok: true, json: async () => inventory });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('public accommodation search', () => {
  it('searches the entire inventory beyond the first page, ignoring case and accents', async () => {
    renderListings();
    await screen.findByRole('heading', { name: 'Boende boden-0' });
    expect(cards()).toHaveLength(12);
    setSearch('  GAVLE  ');
    expect(cards().map(card => card.textContent)).toEqual(['Boende gavle', 'Boende gavle-unknown']);
    setSearch('LULEA');
    expect(cards().map(card => card.textContent)).toEqual(['Boende lulea']);
  });

  it('accepts postal codes with or without spaces and also searches property names', async () => {
    renderListings();
    await screen.findByRole('heading', { name: 'Boende boden-0' });
    setSearch('80434');
    expect(cards().map(card => card.textContent)).toEqual(['Boende gavle']);
    setSearch('804 33');
    expect(cards().map(card => card.textContent)).toEqual(['Boende gavle-unknown']);
    setSearch('unknown-location');
    expect(cards().map(card => card.textContent)).toEqual(['Boende unknown-location']);
  });

  it('combines capacity with location and excludes unconfirmed capacity', async () => {
    renderListings();
    await screen.findByRole('heading', { name: 'Boende boden-0' });
    setSearch('Gavle');
    fireEvent.change(screen.getByRole('combobox', { name: 'Minst antal bäddar' }), { target: { value: '6' } });
    expect(cards().map(card => card.textContent)).toEqual(['Boende gavle']);
    fireEvent.click(screen.getByRole('button', { name: 'Rensa filter', exact: true }));
    expect(search()).toHaveValue('');
    expect(screen.getByRole('combobox', { name: 'Minst antal bäddar' })).toHaveValue('0');
    expect(cards()).toHaveLength(12);
  });

  it('resets pagination after changing either filter and after clearing the search', async () => {
    renderListings();
    await screen.findByRole('heading', { name: 'Boende boden-0' });
    fireEvent.click(screen.getByRole('button', { name: /Visa fler boenden/ }));
    expect(cards()).toHaveLength(18);
    setSearch('boden');
    expect(cards()).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: /Visa fler boenden/ }));
    expect(cards()).toHaveLength(14);
    fireEvent.change(screen.getByRole('combobox', { name: 'Minst antal bäddar' }), { target: { value: '8' } });
    expect(cards()).toHaveLength(12);
    fireEvent.click(screen.getByRole('button', { name: 'Rensa sökning', exact: true }));
    expect(search()).toHaveValue('');
    expect(search()).toHaveFocus();
    expect(cards()).toHaveLength(12);
  });

  it('offers a way forward for no matches and preserves the full SEO directory', async () => {
    renderListings();
    await screen.findByRole('heading', { name: 'Boende boden-0' });
    setSearch('nonexistent-city');
    expect(cards()).toHaveLength(0);
    expect(screen.getByText('Inga boenden matchar din sökning')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Få hjälp att hitta boende' })).toHaveAttribute('href', '#hero-inquiry');
    const directory = screen.getByRole('region', { name: 'Alla lediga boenden per ort' });
    expect(within(directory).getByRole('link', { name: 'Alla orters boenden', hidden: true })).toHaveAttribute('href', '/boenden/directory-only');
  });

  it('reports an API error instead of empty inventory and retries without losing the search', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 503 });
    renderListings();
    const retry = await screen.findByRole('button', { name: 'Försök igen' });
    expect(screen.queryByText('Inga lediga boenden just nu')).not.toBeInTheDocument();
    setSearch('Gavle');
    fireEvent.click(retry);
    await screen.findByRole('heading', { name: 'Boende gavle' });
    expect(search()).toHaveValue('Gavle');
    expect(cards()).toHaveLength(2);
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
  });
});
