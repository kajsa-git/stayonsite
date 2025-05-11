
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Quote } from 'lucide-react';

const References = () => {
  const { t } = useLanguage();

  const testimonials = [
    {
      quote: t('references.testimonial1.quote'),
      author: t('references.testimonial1.author'),
      company: t('references.testimonial1.company'),
      img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      quote: t('references.testimonial2.quote'),
      author: t('references.testimonial2.author'),
      company: t('references.testimonial2.company'),
      img: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
    {
      quote: t('references.testimonial3.quote'),
      author: t('references.testimonial3.author'),
      company: t('references.testimonial3.company'),
      img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
    },
  ];
  
  const images = [
    'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <section id="references" className="py-24 bg-white nordic-texture">
      <div className="container mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <span className="inline-block text-nordic-500 mb-2 text-sm uppercase tracking-wider font-heading">
            {t('references.tagline') || 'Vad våra kunder säger'}
          </span>
          <h2 className="text-3xl md:text-4xl font-normal mb-4 font-display">{t('references.title')}</h2>
          <p className="text-base md:text-lg text-nordic-800 max-w-2xl mx-auto font-light">
            {t('references.subtitle')}
          </p>
        </div>
        
        <Tabs defaultValue="testimonials" className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-12">
            <TabsList className="bg-nordic-100 p-1">
              <TabsTrigger value="testimonials" className="data-[state=active]:bg-white data-[state=active]:text-nordic-800">
                Testimonials
              </TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:bg-white data-[state=active]:text-nordic-800">
                Images
              </TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="testimonials">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="overflow-hidden border border-nordic-200 shadow-none">
                  <CardContent className="p-8">
                    <Quote size={24} className="text-nordic-400 mb-6" />
                    <p className="text-nordic-800 mb-8 leading-relaxed font-light italic">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="w-12 h-12 bg-nordic-200 rounded-full overflow-hidden">
                          <img 
                            src={testimonial.img} 
                            alt={testimonial.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-heading">{testimonial.author}</p>
                        <p className="text-sm text-nordic-600">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="images">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {images.map((image, index) => (
                <div key={index} className="overflow-hidden rounded-lg border border-nordic-200">
                  <img 
                    src={image} 
                    alt={`Reference ${index + 1}`} 
                    className="w-full aspect-[4/3] object-cover transition-transform duration-700 hover:scale-105"
                  />
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-sm text-nordic-600 font-light">
              Images from actual accommodations provided by StayOnSite
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="mt-20 flex flex-wrap justify-center gap-x-14 gap-y-8">
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">100+</div>
            <p className="text-nordic-600 font-light">Nöjda kunder</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">1000+</div>
            <p className="text-nordic-600 font-light">Ordnade boenden</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">24h</div>
            <p className="text-nordic-600 font-light">Genomsnittlig svarstid</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-light text-nordic-800 mb-2.5">20+</div>
            <p className="text-nordic-600 font-light">Städer i Sverige</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default References;
