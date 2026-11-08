'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { CONSENT_CHANGE_EVENT } from '@/lib/gtag'
import { initializeOpenAIPixel, suspendOpenAIMeasurement, trackOpenAIPageView } from '@/lib/openai-pixel'

export default function OpenAIPixelScript() {
  const pathname = usePathname()
  const lastTrackedPath = useRef<string | null>(null)
  const [consentRevision, setConsentRevision] = useState(0)

  useEffect(() => {
    const handleConsentChange = () => setConsentRevision((value) => value + 1)
    window.addEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, handleConsentChange)
  }, [])

  useEffect(() => {
    if (!initializeOpenAIPixel()) {
      suspendOpenAIMeasurement()
      lastTrackedPath.current = null
      return
    }
    if (lastTrackedPath.current === pathname) return
    trackOpenAIPageView()
    lastTrackedPath.current = pathname
  }, [consentRevision, pathname])

  return null
}
