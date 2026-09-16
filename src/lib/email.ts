const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export type ReservationType = 'lunch' | 'high_tea'

/**
 * Roept de Edge Function aan. Geeft `true` terug als de mail is geaccepteerd.
 * Fouten worden niet doorgegooid: de aanroeper beslist zelf of een mislukte
 * mail erg genoeg is om aan de gast te tonen.
 */
async function callSendEmail(body: object): Promise<boolean> {
  try {
    const res = await fetch(FUNCTIONS_URL, {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('E-mail kon niet worden verzonden:', res.status, err)
      return false
    }
    return true
  } catch (e) {
    console.error('E-mail kon niet worden verzonden:', e)
    return false
  }
}

/** Absolute link naar de annuleerpagina, inclusief het id van de reservering. */
export function cancelUrl(reservationId: string): string {
  const base = `${window.location.origin}${import.meta.env.BASE_URL}`.replace(/\/+$/, '')
  return `${base}/annuleren?id=${encodeURIComponent(reservationId)}`
}

type ReservationMail = {
  name: string
  email: string
  date: string
  time: string
  guests: number
  reservationType?: ReservationType
  seating?: 'binnen' | 'buiten' | null
  message?: string | null
  cancelUrl?: string
}

/**
 * "Wij hebben uw reservering ontvangen", direct na het boeken. De reservering
 * staat dan op 'aangevraagd'; het restaurant bevestigt hem daarna in het
 * dashboard.
 */
export function sendReceivedEmail(r: ReservationMail): Promise<boolean> {
  return callSendEmail({ type: 'received', ...r })
}

/** "Uw reservering is bevestigd", verstuurd als het personeel bevestigt. */
export function sendConfirmedEmail(r: ReservationMail): Promise<boolean> {
  return callSendEmail({ type: 'confirmed', ...r })
}

/**
 * Groepsaanvraag (> 8 personen): gaat alleen naar het restaurant. De gast
 * krijgt geen automatische bevestiging, want de datum moet nog worden
 * afgestemd.
 */
export function sendGroupRequestEmail(r: {
  name: string
  email: string
  phone: string
  date: string
  guests: number
  message?: string | null
  reservationType?: ReservationType
}): Promise<boolean> {
  return callSendEmail({ type: 'group_request', ...r })
}

export function sendCancellationEmail(r: {
  name: string
  email: string
  date: string
  time: string
  byGuest?: boolean
}): Promise<boolean> {
  return callSendEmail({ type: 'cancellation', ...r })
}
