import Clarity from '@microsoft/clarity'

// Project: stayonsite.se — https://clarity.microsoft.com
const CLARITY_PROJECT_ID = 'xj7k3w20lf'

let initialized = false

export function initClarity() {
  if (typeof window === 'undefined' || initialized) return
  Clarity.init(CLARITY_PROJECT_ID)
  initialized = true
}

export function updateClarityConsent(granted: boolean) {
  if (!initialized) return
  Clarity.consent(granted)
}

export function clarityEvent(name: string) {
  if (!initialized) return
  Clarity.event(name)
}
