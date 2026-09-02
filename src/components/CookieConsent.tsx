'use client'

import { useState, useEffect } from 'react'
import { Cookie } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { GA_ADS_ID, getStoredConsent, updateConsent } from '@/lib/gtag'
import { META_PIXEL_ID } from '@/lib/meta-pixel'

export default function CookieConsent() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!GA_ADS_ID && !META_PIXEL_ID) return
    const stored = getStoredConsent()
    if (stored) {
      updateConsent(stored)
    } else {
      setVisible(true)
    }
  }, [])

  if (!visible) return null

  const handleAccept = () => {
    updateConsent('granted')
    setVisible(false)
  }

  const handleDeny = () => {
    updateConsent('denied')
    setVisible(false)
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-1 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-lg rounded-2xl bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.12)] border border-nordic-200 p-1.5 md:p-6 flex items-center gap-2 md:block">
        <div className="flex min-w-0 flex-1 items-center gap-2 md:items-start md:gap-3">
          <div className="w-7 h-7 md:mt-0.5 md:w-8 md:h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Cookie size={16} className="text-accent" />
          </div>
          <p className="text-xs md:text-sm text-nordic-700 leading-[1.15] md:leading-relaxed">
            {t('cookie.text')}
          </p>
        </div>
        <div className="flex flex-shrink-0 gap-1 md:gap-3 md:mt-4 md:ml-11">
          <button
            onClick={handleAccept}
            className="touch-manipulation min-h-10 rounded-full bg-[#ff6300] hover:bg-[#e25200] text-white text-xs md:text-sm font-semibold px-3 md:px-6 py-2 transition-colors"
          >
            {t('cookie.accept')}
          </button>
          <button
            onClick={handleDeny}
            className="touch-manipulation min-h-10 rounded-full border border-nordic-300 text-nordic-600 hover:bg-nordic-50 text-xs md:text-sm font-semibold px-3 md:px-6 py-2 transition-colors"
          >
            {t('cookie.deny')}
          </button>
        </div>
      </div>
    </div>
  )
}
