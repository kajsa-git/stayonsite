
import { useState, useEffect } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminTestimonials from '@/components/AdminTestimonials';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Admin = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  // Very basic authentication - in a real app, this would use proper auth
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple password for demo purposes
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      toast({
        title: "Fel lösenord",
        description: "Vänligen försök igen.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (localStorage.getItem('adminAuth') === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  return (
    <LanguageProvider>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow py-10">
          <div className="container mx-auto px-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-display">Admin Panel</h1>
              {isAuthenticated && (
                <Button variant="outline" onClick={handleLogout}>
                  Logga ut
                </Button>
              )}
            </div>

            {!isAuthenticated ? (
              <div className="max-w-md mx-auto mt-16 p-8 border border-nordic-200 rounded-lg">
                <h2 className="text-xl font-display mb-6">Login</h2>
                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium mb-2" htmlFor="password">
                      Lösenord
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-nordic-200 rounded-md focus:outline-none focus:ring-2 focus:ring-nordic-300"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Logga in
                  </Button>
                </form>
              </div>
            ) : (
              <AdminTestimonials />
            )}
          </div>
        </main>
        <Footer />
      </div>
    </LanguageProvider>
  );
};

export default Admin;
