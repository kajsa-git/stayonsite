import { render, screen } from '@testing-library/react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import HomeownerHero from '../HomeownerHero';

describe('HomeownerHero layout', () => {
  it('applies the shared section spacing styles to the hero section', () => {
    render(
      <LanguageProvider>
        <HomeownerHero />
      </LanguageProvider>
    );

    const heading = screen.getByRole('heading', { name: /hyr ut ditt boende/i });
    const heroSection = heading.closest('section');

    expect(heroSection).toHaveClass('section-spacing');
    expect(heroSection?.querySelector('.container')).not.toBeNull();
  });
});
