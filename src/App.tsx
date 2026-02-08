import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { Analytics } from '@vercel/analytics/react'

const queryClient = new QueryClient()

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Sonner />
          <Outlet />
          <Analytics />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default App
