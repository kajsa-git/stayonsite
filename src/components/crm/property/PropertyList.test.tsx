import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PropertyList } from './PropertyList';

const fixtures = vi.hoisted(() => ({ properties: [
  { id: 'old', address: 'Äldre objekt', postalCode: '73440', contentReviewStatus: 'approved' },
  { id: 'new', address: 'Bergslagsvägen 21', postalCode: '73440', contentReviewStatus: 'approved' },
] }));
vi.mock('swr', () => ({ default: () => ({ data: fixtures.properties, mutate: vi.fn(), isLoading: false }) }));
vi.mock('@/hooks/use-mobile', () => ({ useIsMobile: () => false }));
vi.mock('./PropertyView', () => ({ PropertyView: ({ property }: { property: { address: string } }) => <h2>{property.address}</h2> }));
vi.mock('./OwnerPicker', () => ({ OwnerPicker: () => null }));
vi.mock('./PropertyIntakeSharePanel', () => ({ PropertyIntakeSharePanel: () => null }));
afterEach(cleanup);

describe('property search navigation', () => {
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
