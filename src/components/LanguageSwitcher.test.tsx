import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LanguageProvider } from '@/contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const routing = vi.hoisted(() => ({ pathname: '/', push: vi.fn() }));
vi.mock('next/navigation', () => ({
  usePathname: () => routing.pathname,
  useRouter: () => ({ push: routing.push }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('language navigation', () => {
  it.each([
    ['/for-foretag', 'English', '/en/corporate-housing-sweden'],
    ['/for-foretag', 'Polski', '/pl/zakwaterowanie-firmowe'],
    ['/projektboende', 'English', '/en/corporate-housing-sweden'],
    ['/projektboende', 'Polski', '/pl/zakwaterowanie-firmowe'],
    ['/om-oss', 'English', '/en/about'],
    ['/om-oss', 'Polski', '/pl/zakwaterowanie-firmowe'],
    ['/en/about', 'Svenska', '/om-oss'],
    ['/en/about', 'Polski', '/pl/zakwaterowanie-firmowe'],
    ['/stad/boden', 'English', '/en/corporate-housing/boden'],
    ['/en/corporate-housing/boden', 'Polski', '/pl/zakwaterowanie/boden'],
  ])('navigates from %s to actual translated content in %s', (pathname, language, destination) => {
    routing.pathname = pathname;
    render(<LanguageProvider><LanguageSwitcher /></LanguageProvider>);
    fireEvent.click(screen.getByRole('button', { name: language }));
    expect(routing.push).toHaveBeenCalledExactlyOnceWith(destination);
    expect(screen.getByRole('button', { name: language })).toHaveAttribute('aria-pressed', 'true');
  });
});
