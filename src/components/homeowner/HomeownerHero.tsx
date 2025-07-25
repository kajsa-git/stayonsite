import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const HomeownerHero = () => {
  const { t } = useLanguage();

  const scrollToForm = () => {
    const formElement = document.getElementById('homeowner-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="hero" 
      className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 overflow-hidden"
      style={{
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.6)), url('/lovable-uploads/8ccebe4e-fd48-4e9f-9769-13588d98face.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Content */}
      <div className="container mx-auto px-6 md:px-8 py-24 md:py-32 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main heading */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-light text-nordic-900 mb-8 leading-tight">
            {t('homeowner.hero.title')}
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-nordic-800 font-light leading-relaxed mb-12 max-w-3xl mx-auto">
            {t('homeowner.hero.subtitle')}
          </p>

          {/* Income highlight */}
          <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-md rounded-3xl p-8 md:p-10 mb-12 max-w-2xl mx-auto border border-amber-300/40 shadow-2xl shadow-amber-500/10 hover:shadow-amber-500/20 transition-all duration-500 transform hover:scale-[1.02]">
            {/* Gradient overlay */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-amber-50/50 to-orange-50/30 pointer-events-none"></div>
            
            <div className="relative z-10 flex items-center justify-center mb-6">
              <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg mr-5">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-3xl md:text-4xl font-display text-gradient bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent font-semibold">
                {t('homeowner.hero.incomeRange')}
              </span>
            </div>
            <p className="relative z-10 text-nordic-700 font-light text-lg leading-relaxed text-center">
              {t('homeowner.hero.incomeDescription')}
            </p>
          </div>
          
          {/* CTA Button */}
          <Button 
            onClick={scrollToForm}
            size="lg"
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-light text-lg px-8 py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            {t('homeowner.hero.cta')}
          </Button>
        </div>
      </div>

      {/* Decorative wave */}
      <div className="absolute bottom-0 left-0 w-full">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 fill-white">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HomeownerHero;