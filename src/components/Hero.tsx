
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 text-white">
      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMzYgMzRoLTJsMi0yaC0ydjJoLTJ2LTJoLTJ2MmgtMnYtNGgxMHY0em0tMiAyaC0ydjJoLTJ2LTJoLTJWMzRoNnYyem0tMiA0aC0ydjJoMnYtMnoiIGZpbGw9IiNGRkYiLz48cGF0aCBkPSJNMCAwaDYwdjYwSDB6Ii8+PC9nPjwvc3ZnPg==')]"></div>
      
      <div className="container mx-auto px-4 py-20 md:py-32 relative">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Button 
              size="lg" 
              className="bg-secondary-500 hover:bg-secondary-600 text-white rounded-full"
              onClick={() => {
                document.getElementById('inquiry')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('hero.cta')}
              <ArrowRight size={18} />
            </Button>
            <Button 
              variant="outline"
              size="lg"
              className="backdrop-blur-sm bg-white/10 border-white/20 hover:bg-white/20 rounded-full"
              onClick={() => {
                document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {t('nav.services')}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Wave effect at the bottom with updated color */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" className="w-full">
          <path 
            fill="#ffffff" 
            fillOpacity="1" 
            d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z">
          </path>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
