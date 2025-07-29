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
      <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-white/10"></div>
      
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
    </section>;
};
export default Hero;