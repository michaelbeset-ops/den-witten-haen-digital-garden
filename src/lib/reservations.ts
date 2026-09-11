// Gedeelde logica voor het reserveringsformulier (pagina + popup), zodat
// beide formulieren dezelfde tijdsloten, capaciteitsregels en sluitingen
// gebruiken als de database-functie `create_reservation`.
import { supabase } from '@/lib/supabase'

export type ReservationType = 'lunch' | 'high_tea'
export const RESERVATION_TYPES: { value: ReservationType; label: string }[] = [
  { value: 'lunch', label: 'Lunch' },
  { value: 'high_tea', label: 'High tea' },
]

// Ma t/m vr: geopend 10:00 – 16:00 (laatste tijdslot 15:00)
export const SLOTS_WEEKDAY = [
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
]
// Za: geopend 10:00 – 17:00 (laatste tijdslot 16:00)
export const SLOTS_SATURDAY = [
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
]

export function getSlotsForDate(dateStr: string): string[] {
  if (!dateStr) return SLOTS_WEEKDAY
  const day = new Date(dateStr + 'T12:00:00').getDay() // 0=zo, 1=ma … 6=za
  if (day === 0) return [] // zondag gesloten
  if (day === 6) return SLOTS_SATURDAY
  return SLOTS_WEEKDAY
}

export const MAX_GUESTS_PER_WINDOW = 48
export const MAX_GUESTS_PER_RESERVATION = 8
export const PHONE_NUMBER = '078 611 20 50'
export const PHONE_HREF = 'tel:0786112050'

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type SlotCounts = Record<string, number>

// Lokale datum als YYYY-MM-DD (toISOString() gebruikt UTC en geeft 's avonds
// laat / vroeg in de ochtend een verkeerde dag in Nederland).
export const localDateStr = (d: Date): string => {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}
export const todayStr = (): string => localDateStr(new Date())
export const tomorrowStr = (): string => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return localDateStr(d)
}

const toMin = (t: string): number => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const toTime = (min: number): string => {
  if (min < 0 || min >= 1440) return ''
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

// Maximale gelijktijdige bezetting in een rollend venster van 2 uur vanaf
// slotTime, inclusief `newGuests` extra personen op slotTime. Spiegelt de
// controle in de SQL-functie create_reservation.
export const windowLoad = (counts: SlotCounts, slotTime: string, newGuests = 0): number => {
  const base = toMin(slotTime)
  let maxLoad = 0
  for (let k = 0; k < 4; k++) {
    let load = newGuests
    for (let j = k - 3; j <= k; j++) {
      load += counts[toTime(base + j * 30)] ?? 0
    }
    maxLoad = Math.max(maxLoad, load)
  }
  return maxLoad
}

export type Availability = {
  counts: SlotCounts
  blockedTimes: Set<string>
  dayBlocked: boolean
}

// Haalt bezetting per tijdslot en sluitingen op voor een datum.
export async function fetchAvailability(date: string): Promise<Availability> {
  const [slotRes, blockedRes] = await Promise.all([
    supabase.rpc('get_slot_counts', { check_date: date }),
    supabase.from('blocked_slots').select('time_from, time_to').eq('date', date),
  ])

  const counts: SlotCounts = {}
  if (!slotRes.error) {
    for (const row of (slotRes.data ?? []) as { slot_time: string; slot_count: number }[]) {
      counts[row.slot_time] = row.slot_count
    }
  }

  let dayBlocked = false
  const blockedTimes = new Set<string>()
  if (!blockedRes.error) {
    const rows = (blockedRes.data ?? []) as { time_from: string | null; time_to: string | null }[]
    dayBlocked = rows.some(r => r.time_from === null)
    const ranges = rows.filter(r => r.time_from !== null)
    for (const s of SLOTS_SATURDAY) {
      if (ranges.some(r => s >= r.time_from! && (r.time_to === null || s <= r.time_to))) {
        blockedTimes.add(s)
      }
    }
  }

  return { counts, blockedTimes, dayBlocked }
}

export const isSlotFull = (a: Availability, slot: string): boolean =>
  windowLoad(a.counts, slot) >= MAX_GUESTS_PER_WINDOW

export const isSlotUnavailable = (a: Availability, slot: string): boolean =>
  a.dayBlocked || a.blockedTimes.has(slot) || isSlotFull(a, slot)

// Vertaalt een fout van create_reservation naar een nette melding.
export function reservationErrorMessage(err: { code?: string; message?: string } | null): string {
  if (err?.code === 'P0001') {
    return 'Dit tijdslot heeft niet genoeg ruimte meer voor uw gezelschap. Kies een ander tijdslot.'
  }
  if (err?.code === 'P0002') {
    return 'Dit tijdslot is helaas gesloten. Kies een andere datum of tijd.'
  }
  return `Uw reservering kon niet worden opgeslagen. Probeer het later opnieuw of bel ons op ${PHONE_NUMBER}.`
}
