'use client'

import { useState, useEffect } from 'react'
import { Cookie } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { GA_ADS_ID, getStoredConsent, updateConsent } from '@/lib/gtag'

export default function CookieConsent() {
  const { t } = useLanguage()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!GA_ADS_ID) return
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
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-in slide-in-from-bottom duration-500">
      <div className="mx-auto max-w-lg rounded-2xl bg-white shadow-[0_-4px_30px_rgba(0,0,0,0.12)] border border-nordic-200 p-5 md:p-6">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <Cookie size={16} className="text-accent" />
          </div>
          <p className="text-sm text-nordic-700 leading-relaxed">
            {t('cookie.text')}
          </p>
        </div>
        <div className="flex gap-3 mt-4 ml-11">
          <button
            onClick={handleAccept}
            className="rounded-full bg-[#ff6300] hover:bg-[#e25200] text-white text-sm font-semibold px-6 py-2.5 transition-colors"
          >
            {t('cookie.accept')}
          </button>
          <button
            onClick={handleDeny}
            className="rounded-full border border-nordic-300 text-nordic-600 hover:bg-nordic-50 text-sm font-semibold px-6 py-2.5 transition-colors"
          >
            {t('cookie.deny')}
          </button>
        </div>
      </div>
    </div>
  )
}
