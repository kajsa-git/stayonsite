'use client'

import { trackMetaEvent } from '@/lib/meta-pixel'

// Bakåtkompatibel export för formulärkomponenterna. Pixeln initieras globalt
// via MetaPixelScript och laddas först efter samtycke.
export const trackFbEvent = (
  eventName: string,
  params?: Record<string, unknown>,
  eventId?: string
) => trackMetaEvent(eventName, params, eventId)
