'use client'

import { useEffect } from 'react'
import { getStoredConsent } from '@/lib/gtag'
import { initClarity, updateClarityConsent } from '@/lib/clarity'

export default function ClarityScript() {
  useEffect(() => {
    initClarity()
    updateClarityConsent(getStoredConsent() === 'granted')
  }, [])

  return null
}
