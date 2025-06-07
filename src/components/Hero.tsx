import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
const Hero = () => {
  const {
    t
  } = useLanguage();
  return <section id="home" className="relative bg-cover bg-center text-nordic-900 pt-36 pb-24 md:pb-36 overflow-hidden nordic-texture" style={{
    backgroundImage: "url('https://images.unsplash.com/photo-1604014237800-1c9102c219da?ixlib=rb-4.0.3&auto=format&fit=crop&w=2670&q=80')"
  }}>
      {/* Subtle overlay for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/70 to-white/30"></div>
      
      <div className="container mx-auto px-6 md:px-8 relative">
        <div className="max-w-2xl nordic-card p-8 md:p-10 border border-nordic-200">
          <span className="inline-block text-nordic-500 mb-3 text-sm uppercase tracking-wider font-heading">
            {t('hero.tagline') || 'Lugnt. Enkelt. Effektivt.'}
          </span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-normal mb-6 leading-tight text-nordic-900">
            {t('hero.title')}
          </h1>
          <p className="text-base md:text-lg text-nordic-800 mb-10 leading-relaxed font-light">
            {t('hero.subtitle')}
          </p>
          <div className="flex flex-wrap gap-6">
            <Button size="lg" className="bg-nordic-500 hover:bg-nordic-600 text-white rounded-md px-6 py-2.5 h-auto font-light transition-colors duration-500" onClick={() => {
            document.getElementById('inquiry')?.scrollIntoView({
              behavior: 'smooth'
            });
          }}>
              {t('hero.cta')}
              <ArrowRight size={16} className="ml-2 opacity-70" />
            </Button>
            
          </div>
        </div>
      </div>
      
      {/* Subtle wave effect at the bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 80" className="w-full">
          <path fill="#ffffff" fillOpacity="1" d="M0,32L48,37.3C96,43,192,53,288,53.3C384,53,480,43,576,37.3C672,32,768,32,864,32C960,32,1056,32,1152,37.3C1248,43,1344,53,1392,58.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z">
          </path>
        </svg>
      </div>
    </section>;
};
export default Hero;