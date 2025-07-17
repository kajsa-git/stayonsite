import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { getCityBySlug } from '@/data/cities';
import { useLanguage } from '@/contexts/LanguageContext';

const Breadcrumbs = () => {
  const location = useLocation();
  const { language } = useLanguage();
  const pathSegments = location.pathname.split('/').filter(Boolean);
  
  if (pathSegments.length === 0) return null;

  return (
    <nav className="bg-gray-50 border-b border-gray-200 py-3">
      <div className="container mx-auto px-4">
        <ol className="flex items-center space-x-2 text-sm">
          <li>
            <Link 
              to="/" 
              className="flex items-center text-gray-600 hover:text-nordic-600 transition-colors"
            >
              <Home className="h-4 w-4 mr-1" />
              {language === 'sv' ? 'Hem' : 'Home'}
            </Link>
          </li>
          
          {pathSegments[0] === 'stad' && pathSegments[1] && (
            <>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <span className="text-gray-600">
                  {language === 'sv' ? 'Städer' : 'Cities'}
                </span>
              </li>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <li>
                <span className="text-nordic-600 font-medium">
                  {getCityBySlug(pathSegments[1])?.name || pathSegments[1]}
                </span>
              </li>
            </>
          )}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumbs;