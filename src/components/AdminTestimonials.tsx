'use client'

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Quote, Pencil, Trash, Save, X, Plus } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

// Define a type for our testimonials
type Testimonial = {
  id: string;
  quote: string;
  author: string;
  company: string;
  img: string;
};

const AdminTestimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState<Omit<Testimonial, 'id'>>({
    quote: '',
    author: '',
    company: '',
    img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
  });
  const { toast } = useToast();

  // Load testimonials from localStorage on component mount
  useEffect(() => {
    const savedTestimonials = localStorage.getItem('testimonials');
    if (savedTestimonials) {
      setTestimonials(JSON.parse(savedTestimonials));
    } else {
      // Initialize with default testimonials if none exist
      const defaultTestimonials = [
        {
          id: '1',
          quote: 'StayOnSite löste vårt boendebekymmer på bara två dagar. Mycket imponerande service!',
          author: 'Anders Johansson',
          company: 'AB Byggbolaget',
          img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
          id: '2',
          quote: 'Vi använder alltid StayOnSite för våra projekt. Deras boenden är alltid av hög standard och personalen är mycket hjälpsam.',
          author: 'Maria Andersson',
          company: 'Konstruktion AB',
          img: 'https://images.unsplash.com/photo-1449157291145-7efd050a4d0e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
        {
          id: '3',
          quote: 'Snabb service och flexibla lösningar. Rekommenderar varmt!',
          author: 'Erik Lindberg',
          company: 'Lindberg Construction',
          img: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'
        },
      ];
      setTestimonials(defaultTestimonials);
      localStorage.setItem('testimonials', JSON.stringify(defaultTestimonials));
    }
  }, []);

  // Save testimonials to localStorage whenever they change
  useEffect(() => {
    if (testimonials.length > 0) {
      localStorage.setItem('testimonials', JSON.stringify(testimonials));
    }
  }, [testimonials]);

  const handleEdit = (id: string) => {
    setEditingId(id);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('Är du säker på att du vill ta bort detta omdöme?')) {
      const updatedTestimonials = testimonials.filter(t => t.id !== id);
      setTestimonials(updatedTestimonials);
      toast({
        title: "Omdömet har tagits bort",
        description: "Omdömet har tagits bort från webbsidan.",
      });
    }
  };

  const handleSave = (id: string) => {
    setEditingId(null);
    toast({
      title: "Ändringar sparade",
      description: "Dina ändringar har sparats och publicerats på webbsidan.",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setNewTestimonial({
      quote: '',
      author: '',
      company: '',
      img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    });
  };

  const handleChange = (id: string, field: keyof Testimonial, value: string) => {
    setTestimonials(testimonials.map(t => 
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const handleNewChange = (field: keyof Omit<Testimonial, 'id'>, value: string) => {
    setNewTestimonial({
      ...newTestimonial,
      [field]: value
    });
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
  };

  const handleSaveNew = () => {
    if (!newTestimonial.quote || !newTestimonial.author || !newTestimonial.company) {
      toast({
        title: "Alla fält måste fyllas i",
        description: "Fyll i alla obligatoriska fält för att lägga till ett nytt omdöme.",
        variant: "destructive"
      });
      return;
    }

    const newEntry = {
      ...newTestimonial,
      id: Date.now().toString(),
    };
    setTestimonials([...testimonials, newEntry]);
    setIsAdding(false);
    setNewTestimonial({
      quote: '',
      author: '',
      company: '',
      img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    });
    toast({
      title: "Nytt omdöme tillagt",
      description: "Ditt nya omdöme har lagts till på webbsidan.",
    });
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-display">Hantera omdömen</h2>
        <Button onClick={handleAdd} disabled={isAdding} className="flex items-center gap-2">
          <Plus size={16} />
          Lägg till nytt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map(testimonial => (
          <Card key={testimonial.id} className="overflow-hidden border border-nordic-200 shadow-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Quote size={20} className="text-nordic-400" />
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEdit(testimonial.id)}
                    disabled={editingId === testimonial.id || isAdding}
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleDelete(testimonial.id)}
                    disabled={editingId === testimonial.id || isAdding}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </div>
              
              {editingId === testimonial.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Omdöme</label>
                    <textarea 
                      value={testimonial.quote}
                      onChange={(e) => handleChange(testimonial.id, 'quote', e.target.value)}
                      className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                      rows={4}
                    ></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Namn</label>
                    <input 
                      type="text" 
                      value={testimonial.author}
                      onChange={(e) => handleChange(testimonial.id, 'author', e.target.value)}
                      className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Företag</label>
                    <input 
                      type="text" 
                      value={testimonial.company}
                      onChange={(e) => handleChange(testimonial.id, 'company', e.target.value)}
                      className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Bild URL</label>
                    <input 
                      type="text" 
                      value={testimonial.img}
                      onChange={(e) => handleChange(testimonial.id, 'img', e.target.value)}
                      className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-2">
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X size={16} className="mr-1" />
                      Avbryt
                    </Button>
                    <Button size="sm" onClick={() => handleSave(testimonial.id)}>
                      <Save size={16} className="mr-1" />
                      Spara
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-nordic-800 mb-6 leading-relaxed font-light italic">"{testimonial.quote}"</p>
                  <div className="flex items-center">
                    <div className="mr-3">
                      <div className="w-10 h-10 bg-nordic-200 rounded-full overflow-hidden">
                        <img 
                          src={testimonial.img} 
                          alt={testimonial.author}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-medium">{testimonial.author}</p>
                      <p className="text-sm text-nordic-600">{testimonial.company}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
        
        {isAdding && (
          <Card className="overflow-hidden border border-nordic-200 border-dashed shadow-none bg-nordic-50">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-medium text-nordic-600">Nytt omdöme</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Omdöme *</label>
                  <textarea 
                    value={newTestimonial.quote}
                    onChange={(e) => handleNewChange('quote', e.target.value)}
                    className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                    rows={4}
                    placeholder="Skriv omdömet här"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Namn *</label>
                  <input 
                    type="text" 
                    value={newTestimonial.author}
                    onChange={(e) => handleNewChange('author', e.target.value)}
                    className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                    placeholder="Fullständigt namn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Företag *</label>
                  <input 
                    type="text" 
                    value={newTestimonial.company}
                    onChange={(e) => handleNewChange('company', e.target.value)}
                    className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                    placeholder="Företagsnamn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Bild URL</label>
                  <input 
                    type="text" 
                    value={newTestimonial.img}
                    onChange={(e) => handleNewChange('img', e.target.value)}
                    className="w-full px-3 py-2 border border-nordic-200 rounded-md"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex justify-end space-x-3 mt-2">
                  <Button variant="outline" size="sm" onClick={handleCancel}>
                    <X size={16} className="mr-1" />
                    Avbryt
                  </Button>
                  <Button size="sm" onClick={handleSaveNew}>
                    <Save size={16} className="mr-1" />
                    Lägg till
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AdminTestimonials;
