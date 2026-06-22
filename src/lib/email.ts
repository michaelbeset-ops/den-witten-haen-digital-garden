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
}): Promise<void> {
  await callSendEmail({ type: 'confirmation', ...r })
}

export async function sendCancellationEmail(r: {
  name: string
  email: string
  date: string
  time: string
}): Promise<void> {
  await callSendEmail({ type: 'cancellation', ...r })
}
