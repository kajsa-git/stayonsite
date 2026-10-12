import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { GlobalSearchProvider, useGlobalSearch } from './GlobalSearch';
const push = vi.hoisted(() => vi.fn());
vi.mock('next/navigation', () => ({ useRouter: () => ({ push }) }));
function OpenSearch() {
  const { open } = useGlobalSearch();
  return <button onClick={open}>Öppna sök</button>;
}
beforeEach(() => { vi.useFakeTimers(); push.mockClear(); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.unstubAllGlobals(); });
it('keeps the result available and opens it with a normal click', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ json: async () => [{
    id: 'property:new', entityType: 'property', title: 'Bergslagsvägen 21',
    subtitle: 'Hallstahammar', route: '/crm/properties?id=new',
  }] }));
  render(<GlobalSearchProvider><OpenSearch /></GlobalSearchProvider>);
  fireEvent.click(screen.getByText('Öppna sök'));
  fireEvent.change(screen.getByPlaceholderText('Sök företag, förfrågan, objekt, kontakt…'), { target: { value: 'Bergslagsvägen' } });
  await act(async () => { await vi.advanceTimersByTimeAsync(200); });
  await act(async () => { await vi.advanceTimersByTimeAsync(10000); });
  fireEvent.click(screen.getByRole('button', { name: /Bergslagsvägen 21/ }));
  expect(push).toHaveBeenCalledWith('/crm/properties?id=new');
  expect(screen.queryByPlaceholderText('Sök företag, förfrågan, objekt, kontakt…')).not.toBeInTheDocument();
});
