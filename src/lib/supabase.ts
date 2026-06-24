import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Reservation = {
  id: string
  created_at: string
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  message?: string
  status: 'aangevraagd' | 'bevestigd' | 'geannuleerd'
  seating_preference?: 'binnen' | 'buiten' | null
}
