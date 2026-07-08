const FUNCTIONS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

async function callSendEmail(body: object): Promise<void> {
  try {
    const res = await fetch(FUNCTIONS_URL, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error('E-mail kon niet worden verzonden:', err)
    }
  } catch (e) {
    console.error('E-mail kon niet worden verzonden:', e)
  }
}

export async function sendConfirmationEmail(r: {
  name: string
  email: string
  date: string
  time: string
  guests: number
  reservationType?: 'lunch' | 'high_tea'
}): Promise<void> {
  await callSendEmail({ type: 'confirmation', ...r })
}

// Group inquiry (> 8 guests): emailed to the restaurant only, no automatic
// confirmation to the customer. The customer's e-mail is included so staff
// can reply directly.
export async function sendGroupRequestEmail(r: {
  name: string
  email: string
  phone: string
  date: string
  guests: number
  message?: string
  reservationType?: 'lunch' | 'high_tea'
}): Promise<void> {
  await callSendEmail({ type: 'group_request', ...r })
}

export async function sendCancellationEmail(r: {
  name: string
  email: string
  date: string
  time: string
}): Promise<void> {
  await callSendEmail({ type: 'cancellation', ...r })
}
