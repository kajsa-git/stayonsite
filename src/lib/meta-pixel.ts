'use client'

import { CONSENT_CHANGE_EVENT, getStoredConsent } from '@/lib/gtag'

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_FB_PIXEL_ID ?? ''
export const META_CONSENT_EVENT = CONSENT_CHANGE_EVENT

type MetaPixelFunction = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void
  loaded?: boolean
  queue?: unknown[][]
  version?: string
}

declare global {
  interface Window {
    fbq?: MetaPixelFunction
    _fbq?: MetaPixelFunction
    __stayOnSiteMetaPixelId?: string
  }
}

export interface MetaTrackingContext {
  consent: true
  eventId: string
  eventSourceUrl: string
  fbc?: string
  fbp?: string
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined
  const prefix = `${name}=`
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
  return entry ? decodeURIComponent(entry.slice(prefix.length)) : undefined
}

function createEventId(eventName: string): string {
  const suffix = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `${eventName.toLowerCase()}-${suffix}`
}

function createFbq(): MetaPixelFunction {
  const fbq = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args)
      return
    }
    fbq.queue?.push(args)
  } as MetaPixelFunction
  fbq.loaded = true
  fbq.version = '2.0'
  fbq.queue = []
  return fbq
}

export function initializeMetaPixel(): boolean {
  if (
    typeof window === 'undefined' ||
    !META_PIXEL_ID ||
    getStoredConsent() !== 'granted'
  ) {
    return false
  }

  if (!window.fbq) {
    window.fbq = createFbq()
    window._fbq = window.fbq
  }

  if (!document.querySelector('script[data-stayonsite-meta-pixel]')) {
    const script = document.createElement('script')
    script.async = true
    script.dataset.stayonsiteMetaPixel = 'true'
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    document.head.appendChild(script)
  }

  if (window.__stayOnSiteMetaPixelId !== META_PIXEL_ID) {
    window.fbq('init', META_PIXEL_ID)
    window.__stayOnSiteMetaPixelId = META_PIXEL_ID
  }

  return true
}

export function trackMetaPageView(): void {
  if (!initializeMetaPixel() || !window.fbq) return
  window.fbq('track', 'PageView')
}

export function trackMetaEvent(
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
): void {
  if (!initializeMetaPixel() || !window.fbq) return
  if (eventId) {
    window.fbq('track', eventName, params ?? {}, { eventID: eventId })
    return
  }
  window.fbq('track', eventName, params ?? {})
}

export function getMetaTrackingContext(eventName = 'Lead'): MetaTrackingContext | undefined {
  if (
    typeof window === 'undefined' ||
    !META_PIXEL_ID ||
    getStoredConsent() !== 'granted'
  ) {
    return undefined
  }

  const fbp = readCookie('_fbp')
  const cookieFbc = readCookie('_fbc')
  const fbclid = new URLSearchParams(window.location.search).get('fbclid')
  const fbc = cookieFbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined)

  return {
    consent: true,
    eventId: createEventId(eventName),
    eventSourceUrl: window.location.href.slice(0, 1000),
    ...(fbc ? { fbc } : {}),
    ...(fbp ? { fbp } : {}),
  }
}
