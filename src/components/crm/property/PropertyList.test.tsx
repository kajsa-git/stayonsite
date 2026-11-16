import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PropertyList } from './PropertyList';

const fixtures = vi.hoisted(() => ({ properties: [
  { id: 'old', address: 'Äldre objekt', postalCode: '73440', contentReviewStatus: 'approved' },
  { id: 'new', address: 'Bergslagsvägen 21', postalCode: '73440', contentReviewStatus: 'approved' },
], owners: [{ id: 'daniel', name: 'GM Invest AB', contactPerson: 'Daniel', phone: '+46766108808', email: null, cities: ['Örebro', 'Knivsta', 'Uppsala'] }] }));
vi.mock('swr', () => ({ default: (url: string) => ({ data: url.includes('owner-search-leads') ? fixtures.owners : fixtures.properties, mutate: vi.fn(), isLoading: false }) }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));
vi.mock('./PropertyView', () => ({ PropertyView: ({ property }: { property: { address: string } }) => <h2>{property.address}</h2> }));
vi.mock('./OwnerPicker', () => ({ OwnerPicker: () => null }));
vi.mock('./PropertyIntakeSharePanel', () => ({ PropertyIntakeSharePanel: () => null }));
afterEach(cleanup);

describe('property search navigation', () => {
  it.each(['Örebro', 'Knivsta', 'Uppsala'])('shows an owner contact when searching for %s', (city) => {
    render(<PropertyList />);
    fireEvent.change(screen.getByPlaceholderText('Sök bostäder…'), { target: { value: city } });
    const section = screen.getByRole('region', { name: 'Uthyrare att kontakta' });
    expect(within(section).getByRole('link', { name: 'GM Invest AB' })).toHaveAttribute('href', '/crm/uthyrare/daniel');
    expect(within(section).getByText(/tillgänglighet behöver bekräftas/)).toBeInTheDocument();
  });
  it('allows city filtering for an owner even when no property has that city', () => {
    render(<PropertyList />);
    const citySelector = screen.getByRole('option', { name: 'Knivsta' }).parentElement as HTMLSelectElement;
    fireEvent.change(citySelector, { target: { value: 'Knivsta' } });
    expect(screen.getByRole('region', { name: 'Uthyrare att kontakta' })).toHaveTextContent('GM Invest AB');
    fireEvent.change(citySelector, { target: { value: '' } });
    fireEvent.change(screen.getByPlaceholderText('Sök bostäder…'), { target: { value: 'Boden' } });
    expect(screen.queryByRole('region', { name: 'Uthyrare att kontakta' })).not.toBeInTheDocument();
  });
  it('opens a new URL selection without remounting the property bank', () => {
    const { rerender } = render(<PropertyList propertyId="old" />);
    expect(screen.getByRole('heading', { name: 'Äldre objekt' })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Sök bostäder…'), { target: { value: 'Äldre' } });
    rerender(<PropertyList propertyId="new" />);
    expect(screen.getByRole('heading', { name: 'Bergslagsvägen 21' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sök bostäder…')).toHaveValue('');
    rerender(<PropertyList propertyId="old" />);
    expect(screen.getByRole('heading', { name: 'Äldre objekt' })).toBeInTheDocument();
  });
  it('does not undo a manual selection when the list refreshes', () => {
    const { rerender } = render(<PropertyList propertyId="old" />);
    fireEvent.click(screen.getByRole('button', { name: 'Bergslagsvägen 21' }));
    fixtures.properties = [...fixtures.properties];
    rerender(<PropertyList propertyId="old" />);
    expect(screen.getByRole('heading', { name: 'Bergslagsvägen 21' })).toBeInTheDocument();
  });
});
