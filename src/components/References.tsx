
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
    <section id="references" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">{t('references.title')}</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('references.subtitle')}
          </p>
        </div>
        
        <Tabs defaultValue="testimonials" className="max-w-4xl mx-auto">
          <div className="flex justify-center mb-8">
            <TabsList>
              <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="testimonials">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="overflow-hidden border-none shadow-md">
                  <CardContent className="p-6">
                    <Quote size={32} className="text-primary-300 mb-4" />
                    <p className="text-gray-600 mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="mr-4">
                        <div className="w-12 h-12 bg-gray-300 rounded-full overflow-hidden">
                          <img 
                            src={testimonial.img} 
                            alt={testimonial.author}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">{testimonial.company}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="images">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="aspect-w-16 aspect-h-9 overflow-hidden rounded-lg shadow-md">
                  <img 
                    src={image} 
                    alt={`Reference ${index + 1}`} 
                    className="w-full h-full object-cover transition-transform hover:scale-105 duration-300"
                  />
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-sm text-gray-500">
              Images from actual accommodations provided by StayOnSite
            </p>
          </TabsContent>
        </Tabs>
        
        <div className="mt-12 flex flex-wrap justify-center gap-8">
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-2">100+</div>
            <p className="text-gray-600">Nöjda kunder</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-2">1000+</div>
            <p className="text-gray-600">Ordnade boenden</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-2">24h</div>
            <p className="text-gray-600">Genomsnittlig svarstid</p>
          </div>
          <div className="text-center p-4">
            <div className="text-3xl font-bold text-primary-600 mb-2">20+</div>
            <p className="text-gray-600">Städer i Sverige</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default References;
