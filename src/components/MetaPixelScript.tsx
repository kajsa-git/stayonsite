'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { initializeMetaPixel, trackMetaPageView } from '@/lib/meta-pixel'
import { CONSENT_CHANGE_EVENT, getStoredConsent } from '@/lib/gtag'

export default function MetaPixelScript() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)
  const [consentRevision, setConsentRevision] = useState(0)

  useEffect(() => {
    const handleConsentChange = () => setConsentRevision((value) => value + 1)
    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
    initializeMetaPixel()
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
  }, [])

  useEffect(() => {
    if (getStoredConsent() !== 'granted') return
    if (lastTrackedPath.current === pathname) return
    trackMetaPageView()
    lastTrackedPath.current = pathname
  }, [consentRevision, pathname])

  return null
}
