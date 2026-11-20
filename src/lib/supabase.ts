import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isSupabaseConfigured) {
  // Zonder configuratie zou createClient() een exception gooien en de hele
  // site een witte pagina tonen. Val terug op een placeholder zodat de site
  // blijft werken; alleen reserveren/dashboard werken dan niet.
  console.error(
    'VITE_SUPABASE_URL en/of VITE_SUPABASE_ANON_KEY ontbreken. ' +
    'Reserveringen en het dashboard werken niet totdat deze zijn ingesteld.',
  )
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
)

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
  reservation_type?: 'lunch' | 'high_tea' | null
}
