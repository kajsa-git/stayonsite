'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { CONSENT_CHANGE_EVENT, GA_ADS_ID, getStoredConsent, updateConsent } from '@/lib/gtag'
import { META_PIXEL_ID } from '@/lib/meta-pixel'
import { OPENAI_PIXEL_ID, OPEN_CONSENT_SETTINGS_EVENT, getStoredOpenAIConsent, storeOpenAIConsent } from '@/lib/openai-pixel'

function subscribeToConsent(callback: () => void) {
  window.addEventListener(CONSENT_CHANGE_EVENT, callback)
  window.addEventListener('storage', callback)
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, callback)
    window.removeEventListener('storage', callback)
  }
}

function shouldShowConsent(): boolean {
  if (!GA_ADS_ID && !META_PIXEL_ID && !OPENAI_PIXEL_ID) return false
  try {
    const stored = getStoredConsent()
    if (!stored) return true
    // A previous general advertising choice predates the OpenAI disclosure.
    return stored !== 'denied' && Boolean(OPENAI_PIXEL_ID) && !getStoredOpenAIConsent()
  } catch {
    return true
  }
}

export default function CookieConsent() {
  const { t } = useLanguage()
  const showNotice = useSyncExternalStore(subscribeToConsent, shouldShowConsent, () => false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    const stored = getStoredConsent()
    if (stored) updateConsent(stored)
    const openSettings = () => setSettingsOpen(true)
    window.addEventListener(OPEN_CONSENT_SETTINGS_EVENT, openSettings)
    return () => window.removeEventListener(OPEN_CONSENT_SETTINGS_EVENT, openSettings)
  }, [])

  if (!showNotice && !settingsOpen) return null

  const handleAccept = () => {
    if (OPENAI_PIXEL_ID) storeOpenAIConsent('granted')
    updateConsent('granted')
    setSettingsOpen(false)
  }

  const handleDeny = () => {
    if (OPENAI_PIXEL_ID) storeOpenAIConsent('denied')
    updateConsent('denied')
    setSettingsOpen(false)
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
      <div
        role="region"
        aria-label="Cookies"
        className="border-t border-nordic-200 bg-white px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.08)]"
      >
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1 text-[13px] leading-snug text-nordic-800 md:text-sm">
            <p>
              {t(OPENAI_PIXEL_ID ? 'cookie.openaiText' : 'cookie.text')}{' '}
              {OPENAI_PIXEL_ID && !detailsOpen && (
                <button
                  type="button"
                  aria-expanded={false}
                  onClick={() => setDetailsOpen(true)}
                  className="font-medium text-nordic-900 underline underline-offset-2"
                >
                  {t('cookie.more')}
                </button>
              )}
            </p>
            {OPENAI_PIXEL_ID && detailsOpen && <p className="mt-1 text-nordic-700">{t('cookie.openaiDetails')}</p>}
          </div>
          {/* Lika tydliga val: att neka ska vara lika enkelt som att acceptera. */}
          <div className="flex shrink-0 gap-1.5 md:gap-2">
            <button
              type="button"
              onClick={handleAccept}
              className="touch-manipulation min-h-11 rounded-full bg-[#ff6300] px-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#e25200] md:px-5 md:text-sm"
            >
              {t('cookie.accept')}
            </button>
            <button
              type="button"
              onClick={handleDeny}
              className="touch-manipulation min-h-11 rounded-full border border-nordic-300 px-3.5 text-[13px] font-semibold text-nordic-800 transition-colors hover:bg-nordic-50 md:px-5 md:text-sm"
            >
              {t('cookie.deny')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
