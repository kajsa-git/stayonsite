import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import CityPage from '../CityPage';
import { LanguageProvider } from '@/contexts/LanguageContext';

const renderCityPage = () => {
  return render(
    <LanguageProvider>
      <MemoryRouter initialEntries={['/stad/stockholm']}>
        <Routes>
          <Route path="/stad/:citySlug" element={<CityPage />} />
        </Routes>
      </MemoryRouter>
    </LanguageProvider>
  );
};

describe('CityPage layout alignment', () => {
  it('wraps the reasons section with shared section spacing styles', () => {
    renderCityPage();
    const heading = screen.getByRole('heading', {
      name: /varför välja stayonsite för personalboende i stockholm/i,
    });
    const section = heading.closest('section');
    expect(section).toHaveClass('section-spacing');
    expect(section?.querySelector('.container')).not.toBeNull();
  });

  it('uses shared spacing styles for the CTA section', () => {
    renderCityPage();
    const heading = screen.getByRole('heading', {
      name: /behöver ert företag boende för personal i stockholm/i,
    });
    const section = heading.closest('section');
    expect(section).toHaveClass('section-spacing');
    expect(section?.querySelector('.container')).not.toBeNull();
  });
});
