import { createHash } from 'node:crypto'

interface MetaTrackingData {
  consent: true
  eventId: string
  eventSourceUrl: string
  fbc?: string
  fbp?: string
}

interface MetaLeadSubmission {
  formType: string
  fields: Record<string, string>
  tracking?: MetaTrackingData
}

interface MetaLeadRequestContext {
  ip?: string
  userAgent?: string
}

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex')
}

function normalizedEmail(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase()
  return normalized || undefined
}

function normalizedPhone(value?: string): string | undefined {
  if (!value) return undefined
  const trimmed = value.trim()
  const digits = trimmed.replace(/\D/g, '')
  if (!digits) return undefined
  if (digits.startsWith('00')) return digits.slice(2)
  if (digits.startsWith('0')) return `46${digits.slice(1)}`
  return digits
}

function normalizedText(value?: string): string | undefined {
  const normalized = value?.trim().toLowerCase()
  return normalized || undefined
}

function hashedList(value?: string): string[] | undefined {
  return value ? [sha256(value)] : undefined
}

function isHomeownerForm(formType: string): boolean {
  return formType.includes('homeowner') || formType === 'property-intake'
}

export function buildMetaLeadEvent(
  submission: MetaLeadSubmission,
  context: MetaLeadRequestContext,
  now = Date.now()
) {
  if (!submission.tracking?.consent) return null

  const fields = submission.fields
  const email = normalizedEmail(fields.email)
  const phone = normalizedPhone(fields.phone || fields.kontakt)
  const city = normalizedText(fields.city || fields.ort)
  const postalCode = normalizedText(fields.postalCode)?.replace(/\s/g, '')
  const fullName = normalizedText(fields.name)
  const [firstName, ...lastNameParts] = fullName?.split(/\s+/) ?? []
  const lastName = lastNameParts.join(' ') || undefined
  const externalIdSource = email || phone

  return {
    event_name: 'Lead',
    event_time: Math.floor(now / 1000),
    event_id: submission.tracking.eventId,
    action_source: 'website',
    event_source_url: submission.tracking.eventSourceUrl,
    user_data: {
      ...(hashedList(email) ? { em: hashedList(email) } : {}),
      ...(hashedList(phone) ? { ph: hashedList(phone) } : {}),
      ...(hashedList(firstName) ? { fn: hashedList(firstName) } : {}),
      ...(hashedList(lastName) ? { ln: hashedList(lastName) } : {}),
      ...(hashedList(city) ? { ct: hashedList(city) } : {}),
      ...(hashedList(postalCode) ? { zp: hashedList(postalCode) } : {}),
      ...(hashedList(externalIdSource) ? { external_id: hashedList(externalIdSource) } : {}),
      ...(context.ip ? { client_ip_address: context.ip } : {}),
      ...(context.userAgent ? { client_user_agent: context.userAgent } : {}),
      ...(submission.tracking.fbc ? { fbc: submission.tracking.fbc } : {}),
      ...(submission.tracking.fbp ? { fbp: submission.tracking.fbp } : {}),
    },
    custom_data: {
      content_category: isHomeownerForm(submission.formType) ? 'homeowner' : 'corporate',
      content_name: submission.formType,
    },
  }
}

export async function sendMetaLeadEvent(
  submission: MetaLeadSubmission,
  context: MetaLeadRequestContext
): Promise<{ sent: boolean; reason?: string }> {
  const pixelId = process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN
  const apiVersion = process.env.META_GRAPH_API_VERSION || 'v24.0'
  const event = buildMetaLeadEvent(submission, context)

  if (!event) return { sent: false, reason: 'consent_not_granted' }
  if (!pixelId || !accessToken) return { sent: false, reason: 'meta_capi_not_configured' }

  const payload: Record<string, unknown> = { data: [event] }
  if (process.env.META_CAPI_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_CAPI_TEST_EVENT_CODE
  }

  const endpoint = new URL(`https://graph.facebook.com/${apiVersion}/${pixelId}/events`)
  endpoint.searchParams.set('access_token', accessToken)

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(4000),
    })

    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500)
      console.error('Meta CAPI event failed', { status: response.status, detail })
      return { sent: false, reason: `meta_capi_http_${response.status}` }
    }

    return { sent: true }
  } catch (error) {
    console.error('Meta CAPI request failed', error)
    return { sent: false, reason: 'meta_capi_request_failed' }
  }
}
