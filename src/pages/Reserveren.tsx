import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { sendConfirmationEmail, sendGroupRequestEmail } from '@/lib/email'

type ReservationType = 'lunch' | 'high_tea'
const RESERVATION_TYPES: { value: ReservationType; label: string }[] = [
  { value: 'lunch', label: 'Lunch' },
  { value: 'high_tea', label: 'High tea' },
]

// Ma t/m vr: geopend 10:00 – 16:00 (laatste tijdslot 15:00)
const SLOTS_WEEKDAY = [
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
]
// Za: geopend 10:00 – 17:00 (laatste tijdslot 16:00)
const SLOTS_SATURDAY = [
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
]

function getSlotsForDate(dateStr: string): string[] {
  if (!dateStr) return SLOTS_WEEKDAY
  const day = new Date(dateStr + 'T12:00:00').getDay() // 0=zo, 1=ma … 6=za
  if (day === 0) return [] // zondag gesloten
  if (day === 6) return SLOTS_SATURDAY // zaterdag tot 17:00
  return SLOTS_WEEKDAY // ma t/m vr tot 16:00
}

const MAX_GUESTS_PER_WINDOW = 48
const MAX_GUESTS_PER_RESERVATION = 8
const PHONE_NUMBER = '078 611 20 50'

// Rolling 2-hour window helpers
const toMin = (t: string): number => {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
const toTime = (min: number): string => {
  if (min < 0 || min >= 1440) return ''
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}
// Returns max concurrent guests in any 30-min sub-window during [slotTime, slotTime+2h)
// counting existing slotCounts + newGuests additional people booking at slotTime
const windowLoad = (counts: SlotCounts, slotTime: string, newGuests = 0): number => {
  const base = toMin(slotTime)
  let maxLoad = 0
  for (let k = 0; k < 4; k++) {
    // At sub-time base+k*30, the occupied slots are base+(k-3)*30 … base+k*30
    let load = newGuests // new guests at slotTime appear in every sub-window
    for (let j = k - 3; j <= k; j++) {
      load += counts[toTime(base + j * 30)] ?? 0
    }
    maxLoad = Math.max(maxLoad, load)
  }
  return maxLoad
}

const tomorrowStr = (): string => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

type SlotCounts = Record<string, number>

type FieldErrors = {
  name?: string
  email?: string
  phone?: string
  date?: string
  time?: string
  guests?: string
}

const ReservationPage = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState('')
  const [message, setMessage] = useState('')
  const [seating, setSeating] = useState<'geen' | 'binnen' | 'buiten'>('geen')
  const [reservationType, setReservationType] = useState<ReservationType>('lunch')

  const [slotCounts, setSlotCounts] = useState<SlotCounts>({})
  const [blockedTimes, setBlockedTimes] = useState<Set<string>>(new Set())
  const [dayBlocked, setDayBlocked] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successType, setSuccessType] = useState<'reservation' | 'group'>('reservation')
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const guestsNum = parseInt(guests, 10)
  // Groepen boven 8 personen kunnen niet direct online boeken; zij sturen een
  // aanvraag die naar het restaurant wordt gemaild.
  const isGroup = !isNaN(guestsNum) && guestsNum > MAX_GUESTS_PER_RESERVATION

  // Fetch slot availability + blocked days/times
  useEffect(() => {
    if (!date) {
      setSlotCounts({})
      setBlockedTimes(new Set())
      setDayBlocked(false)
      return
    }
    setLoadingSlots(true)
    Promise.all([
      supabase.rpc('get_slot_counts', { check_date: date }),
      supabase.from('blocked_slots').select('time_from, time_to').eq('date', date),
    ]).then(([slotRes, blockedRes]) => {
      setLoadingSlots(false)

      if (!slotRes.error) {
        const counts: SlotCounts = {}
        for (const row of (slotRes.data ?? []) as { slot_time: string; slot_count: number }[]) {
          counts[row.slot_time] = row.slot_count
        }
        setSlotCounts(counts)
        if (time && windowLoad(counts, time) >= MAX_GUESTS_PER_WINDOW) setTime('')
      }

      if (!blockedRes.error) {
        const rows = (blockedRes.data ?? []) as { time_from: string | null; time_to: string | null }[]
        const fullDay = rows.some(r => r.time_from === null)
        setDayBlocked(fullDay)
        // Expand each range to the concrete slots it covers
        const ranges = rows.filter(r => r.time_from !== null)
        const blocked = new Set<string>(
          SLOTS_SATURDAY.filter(s =>
            ranges.some(r => s >= r.time_from! && (r.time_to === null || s <= r.time_to))
          )
        )
        setBlockedTimes(blocked)
        if (fullDay || (time && blocked.has(time))) setTime('')
      }
    })
  }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!name.trim()) errors.name = 'Naam is verplicht.'
    if (!email.trim()) errors.email = 'E-mailadres is verplicht.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Voer een geldig e-mailadres in.'
    if (!phone.trim()) errors.phone = 'Telefoonnummer is verplicht.'
    if (!date) errors.date = 'Datum is verplicht.'
    if (date && dayBlocked) errors.date = 'Op deze dag zijn wij gesloten.'
    if (!guests) errors.guests = 'Aantal personen is verplicht.'
    else if (isNaN(guestsNum) || guestsNum < 1) errors.guests = 'Voer een geldig aantal in.'
    // Een tijdslot is alleen nodig voor directe reserveringen (t/m 8 personen).
    // Groepsaanvragen worden telefonisch/per e-mail ingepland.
    if (!isGroup) {
      if (!time) errors.time = 'Tijdslot is verplicht.'
      else if (blockedTimes.has(time)) errors.time = 'Dit tijdslot is gesloten.'
    }
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGeneralError('')

    if (!validate()) return

    // Groepen > 8 personen: aanvraag naar het restaurant mailen i.p.v. direct boeken.
    if (isGroup) {
      setSubmitting(true)
      await sendGroupRequestEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date,
        guests: guestsNum,
        message: message.trim() || undefined,
        reservationType,
      })
      setSubmitting(false)
      setSuccessType('group')
      setSuccess(true)
      resetForm()
      return
    }

    // Double-check slot availability (race condition guard)
    // If the RPC fails for any reason, we skip the check and let the insert proceed.
    const { data: freshData, error: checkError } = await supabase
      .rpc('get_slot_counts', { check_date: date })

    if (checkError) {
      console.warn('Slot-check RPC niet beschikbaar, insert wordt toch geprobeerd:', checkError.message)
    } else {
      const freshCounts: SlotCounts = {}
      for (const row of (freshData ?? []) as { slot_time: string; slot_count: number }[]) {
        freshCounts[row.slot_time] = row.slot_count
      }
      setSlotCounts(freshCounts)

      const requestedGuests = parseInt(guests, 10)
      if (windowLoad(freshCounts, time, requestedGuests) > MAX_GUESTS_PER_WINDOW) {
        setFieldErrors((prev) => ({ ...prev, time: 'Dit tijdslot heeft niet genoeg ruimte meer voor uw gezelschap. Kies een ander tijdslot.' }))
        setTime('')
        setSubmitting(false)
        return
      }
    }

    setSubmitting(true)

    const { data: newId, error: insertError } = await supabase.rpc('create_reservation', {
      p_name: name.trim(),
      p_email: email.trim(),
      p_phone: phone.trim(),
      p_date: date,
      p_time: time,
      p_guests: parseInt(guests, 10),
      p_message: message.trim() || null,
      p_seating: seating === 'geen' ? null : seating,
      p_type: reservationType,
    })

    if (insertError || !newId) {
      setSubmitting(false)
      if (insertError?.code === 'P0001') {
        setFieldErrors((prev) => ({ ...prev, time: 'Dit tijdslot heeft niet genoeg ruimte meer voor uw gezelschap. Kies een ander tijdslot.' }))
      } else {
        setGeneralError(`Uw reservering kon niet worden opgeslagen. (${insertError?.code}: ${insertError?.message})`)
      }
      console.error('Insert fout:', insertError)
      return
    }

    // Non-blocking confirmation email
    sendConfirmationEmail({
      name: name.trim(),
      email: email.trim(),
      date,
      time,
      guests: parseInt(guests, 10),
      reservationType,
    })

    setSubmitting(false)
    setSuccessType('reservation')
    setSuccess(true)
    resetForm()
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPhone('')
    setDate('')
    setTime('')
    setGuests('')
    setMessage('')
    setSeating('geen')
    setReservationType('lunch')
    setSlotCounts({})
    setBlockedTimes(new Set())
    setDayBlocked(false)
    setFieldErrors({})
  }

  if (success) {
    return (
      <main className="pt-24 pb-10 sm:pb-20">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-card border border-border rounded-lg p-5 sm:p-8 shadow-sm text-center">
            <h1 className="font-serif text-2xl sm:text-3xl mb-3 sm:mb-4 text-foreground">
              {successType === 'group' ? 'Aanvraag ontvangen' : 'Reservering ontvangen'}
            </h1>
            <p className="font-sans text-base text-muted-foreground mb-5 sm:mb-6">
              {successType === 'group'
                ? 'Bedankt voor uw aanvraag! Wij hebben uw gegevens ontvangen en nemen zo snel mogelijk contact met u op om de details door te nemen.'
                : 'Bedankt voor uw reservering! U ontvangt een bevestiging per e-mail.'}
            </p>
            <Button variant="default" onClick={() => setSuccess(false)}>
              Nieuwe reservering maken
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="pt-24 pb-10 sm:pb-20">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-card border border-border rounded-lg p-5 sm:p-8 shadow-sm">
          <h1 className="font-serif text-2xl sm:text-3xl mb-1.5 sm:mb-2 text-foreground">Reserveren</h1>
          <p className="font-sans text-sm text-muted-foreground mb-4 sm:mb-6">
            Vul het formulier in en wij bevestigen uw reservering per e-mail.
          </p>

          {generalError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            {/* Naam */}
            <div>
              <Label htmlFor="name">Naam *</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Uw volledige naam"
                maxLength={100}
                aria-invalid={!!fieldErrors.name}
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.name}</p>
              )}
            </div>

            {/* E-mailadres */}
            <div>
              <Label htmlFor="email">E-mailadres *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="naam@voorbeeld.nl"
                maxLength={255}
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && (
                <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.email}</p>
              )}
            </div>

            {/* Telefoonnummer */}
            <div>
              <Label htmlFor="phone">Telefoonnummer *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="06 – 00 00 00 00"
                aria-invalid={!!fieldErrors.phone}
              />
              {fieldErrors.phone && (
                <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Type reservering */}
            <div>
              <Label>Wat wilt u reserveren? *</Label>
              <div className="flex gap-6 mt-2">
                {RESERVATION_TYPES.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="reservationType"
                      value={opt.value}
                      checked={reservationType === opt.value}
                      onChange={() => setReservationType(opt.value)}
                      className="accent-primary"
                    />
                    <span className="text-sm font-sans text-foreground">{opt.label}</span>
                  </label>
                ))}
              </div>
              {reservationType === 'high_tea' && (
                <div className="mt-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed">
                  <strong>Annuleringsvoorwaarde high tea:</strong> annuleren kan tot uiterlijk
                  48 uur van tevoren. Bij annulering binnen 48 uur voor aanvang wordt de betaling
                  alsnog in rekening gebracht.
                </div>
              )}
            </div>

            {/* Datum + Aantal personen */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Datum *</Label>
                <div className="relative">
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    min={tomorrowStr()}
                    onChange={(e) => {
                      setDate(e.target.value)
                      setTime('')
                    }}
                    aria-invalid={!!fieldErrors.date}
                  />
                  {!date && (
                    <span className="date-placeholder-ios pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-sm text-muted-foreground">
                      dd-mm-jjjj
                    </span>
                  )}
                </div>
                {fieldErrors.date && (
                  <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.date}</p>
                )}
              </div>

              {/* Aantal personen */}
              <div>
                <Label htmlFor="guests">Personen *</Label>
                <Input
                  id="guests"
                  type="number"
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  min={1}
                  max={20}
                  placeholder="Aantal"
                  aria-invalid={!!fieldErrors.guests}
                />
                {fieldErrors.guests && (
                  <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.guests}</p>
                )}
              </div>
            </div>
            {!fieldErrors.guests && !isGroup && (
              <p className="text-xs text-muted-foreground font-sans">
                Groep van meer dan {MAX_GUESTS_PER_RESERVATION} personen? Vul het aantal in — dan
                sturen wij uw aanvraag door en nemen wij contact met u op.
              </p>
            )}
            {isGroup && (
              <div className="p-3 rounded-md bg-primary/5 border border-primary/20 text-foreground text-xs font-sans leading-relaxed">
                Voor groepen van meer dan {MAX_GUESTS_PER_RESERVATION} personen plannen wij de
                reservering persoonlijk in. Vul uw gegevens en gewenste datum in en verstuur uw
                aanvraag; wij nemen zo snel mogelijk contact met u op. Liever direct bellen? Dat kan
                op{' '}
                <a href={`tel:${PHONE_NUMBER.replace(/\s|–/g, '')}`} className="underline">{PHONE_NUMBER}</a>.
              </div>
            )}

            {/* Tijdslot — alleen voor directe reserveringen (t/m 8 personen) */}
            {!isGroup && (
            <div>
              <Label htmlFor="time-select">Tijdslot *</Label>
              <Select
                value={time}
                onValueChange={setTime}
                disabled={!date || loadingSlots}
              >
                <SelectTrigger id="time-select" aria-invalid={!!fieldErrors.time}>
                  <SelectValue placeholder={loadingSlots ? 'Beschikbaarheid laden...' : 'Kies een tijdslot'} />
                </SelectTrigger>
                <SelectContent>
                  {dayBlocked ? (
                    <SelectItem value="__dayblocked__" disabled>Op deze dag zijn wij gesloten</SelectItem>
                  ) : getSlotsForDate(date).length === 0 ? (
                    <SelectItem value="__closed__" disabled>Zondag gesloten</SelectItem>
                  ) : getSlotsForDate(date).map((slot) => {
                    const blocked = blockedTimes.has(slot)
                    const full = !blocked && windowLoad(slotCounts, slot) >= MAX_GUESTS_PER_WINDOW
                    return (
                      <SelectItem key={slot} value={slot} disabled={blocked || full}>
                        {slot}{blocked ? ' (Gesloten)' : full ? ' (Volgeboekt)' : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {!date && (
                <p className="mt-1 text-xs text-muted-foreground font-sans">Kies eerst een datum.</p>
              )}
              {date && dayBlocked && (
                <p className="mt-1 text-xs text-destructive font-sans">Op deze dag zijn wij gesloten.</p>
              )}
              {date && !dayBlocked && getSlotsForDate(date).length === 0 && (
                <p className="mt-1 text-xs text-destructive font-sans">Op zondag zijn wij gesloten.</p>
              )}
              {fieldErrors.time && (
                <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.time}</p>
              )}
            </div>
            )}

            {/* Zitplaatsvoorkeur — niet relevant voor groepsaanvragen */}
            {!isGroup && (
            <div>
              <Label>Zitplaatsvoorkeur</Label>
              <div className="flex gap-6 mt-2">
                {(['geen', 'binnen', 'buiten'] as const).map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="seating"
                      value={opt}
                      checked={seating === opt}
                      onChange={() => setSeating(opt)}
                      className="accent-primary"
                    />
                    <span className="text-sm font-sans text-foreground">
                      {opt === 'geen' ? 'Geen voorkeur' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            )}

            {/* Opmerking */}
            <div>
              <Label htmlFor="message">Opmerking</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Dieetwensen, bijzondere gelegenheden of andere opmerkingen..."
                maxLength={1000}
                rows={4}
              />
            </div>

            <Button
              type="submit"
              variant="default"
              size="lg"
              className="w-full"
              disabled={submitting}
            >
              {submitting
                ? 'Versturen...'
                : isGroup
                  ? 'Groepsaanvraag versturen'
                  : 'Reservering versturen'}
            </Button>

            <p className="text-xs text-muted-foreground text-center font-sans">
              {isGroup
                ? 'Wij nemen zo snel mogelijk contact met u op over uw aanvraag.'
                : 'We bevestigen uw reservering zo snel mogelijk per e-mail.'}
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ReservationPage
