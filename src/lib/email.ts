import { supabase } from './supabase'

export async function sendConfirmationEmail(r: {
  name: string
  email: string
  date: string
  time: string
  guests: number
}): Promise<void> {
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'confirmation',
      name: r.name,
      email: r.email,
      date: r.date,
      time: r.time,
      guests: r.guests,
    },
  })
  if (error) {
    console.error('Bevestigingsmail kon niet worden verzonden:', error)
  }
}

export async function sendCancellationEmail(r: {
  name: string
  email: string
  date: string
  time: string
}): Promise<void> {
  const { error } = await supabase.functions.invoke('send-email', {
    body: {
      type: 'cancellation',
      name: r.name,
      email: r.email,
      date: r.date,
      time: r.time,
    },
  })
  if (error) {
    console.error('Annuleringsmail kon niet worden verzonden:', error)
  }
}
