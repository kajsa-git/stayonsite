'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from '@/contexts/LanguageContext'

const queryClient = new QueryClient()

function ScrollToTop() {
  const pathname = usePathname()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <ScrollToTop />
          <Toaster />
          <Sonner />
          {children}
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}
