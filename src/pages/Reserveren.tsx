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
import { sendConfirmationEmail } from '@/lib/email'

const TIME_SLOTS = [
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
]

const MAX_PER_SLOT = 8

const todayStr = (): string => new Date().toISOString().split('T')[0]

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

  const [slotCounts, setSlotCounts] = useState<SlotCounts>({})
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  // Fetch slot availability via RPC (anon-safe: returns counts only, no personal data)
  useEffect(() => {
    if (!date) {
      setSlotCounts({})
      return
    }
    setLoadingSlots(true)
    supabase
      .rpc('get_slot_counts', { check_date: date })
      .then(({ data, error }) => {
        setLoadingSlots(false)
        if (error) {
          console.error('Fout bij ophalen beschikbaarheid:', error)
          return
        }
        const counts: SlotCounts = {}
        for (const row of (data ?? []) as { slot_time: string; slot_count: number }[]) {
          counts[row.slot_time] = row.slot_count
        }
        setSlotCounts(counts)
        // Reset time if selected slot became full
        if (time && (counts[time] ?? 0) >= MAX_PER_SLOT) {
          setTime('')
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
    if (!time) errors.time = 'Tijdslot is verplicht.'
    const guestsNum = parseInt(guests, 10)
    if (!guests) errors.guests = 'Aantal personen is verplicht.'
    else if (isNaN(guestsNum) || guestsNum < 1 || guestsNum > 30) errors.guests = 'Voer een geldig aantal in (1–30).'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGeneralError('')

    if (!validate()) return

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

      if ((freshCounts[time] ?? 0) >= MAX_PER_SLOT) {
        setFieldErrors((prev) => ({ ...prev, time: 'Dit tijdslot is helaas volgeboekt. Kies een ander tijdslot.' }))
        setTime('')
        setSubmitting(false)
        return
      }
    }

    setSubmitting(true)

    const { error: insertError } = await supabase.from('reservations').insert({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      date,
      time,
      guests: parseInt(guests, 10),
      message: message.trim() || null,
      status: 'aangevraagd',
    })

    if (insertError) {
      setSubmitting(false)
      setGeneralError(`Uw reservering kon niet worden opgeslagen. (${insertError.code}: ${insertError.message})`)
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
    })

    setSubmitting(false)
    setSuccess(true)

    // Reset form
    setName('')
    setEmail('')
    setPhone('')
    setDate('')
    setTime('')
    setGuests('')
    setMessage('')
    setSlotCounts({})
    setFieldErrors({})
  }

  if (success) {
    return (
      <main className="pt-24 pb-20">
        <div className="container mx-auto px-4 max-w-lg">
          <div className="bg-card border border-border rounded-lg p-8 shadow-sm text-center">
            <h1 className="font-serif text-3xl mb-4 text-foreground">Reservering ontvangen</h1>
            <p className="font-sans text-base text-muted-foreground mb-6">
              Bedankt voor uw reservering! U ontvangt een bevestiging per e-mail.
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
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-lg">
        <div className="bg-card border border-border rounded-lg p-8 shadow-sm">
          <h1 className="font-serif text-3xl mb-2 text-foreground">Reserveren</h1>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            Vul het formulier in en wij bevestigen uw reservering per e-mail.
          </p>

          {generalError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

            {/* Datum */}
            <div>
              <Label htmlFor="date">Datum *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                min={todayStr()}
                onChange={(e) => {
                  setDate(e.target.value)
                  setTime('')
                }}
                aria-invalid={!!fieldErrors.date}
              />
              {fieldErrors.date && (
                <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.date}</p>
              )}
            </div>

            {/* Tijdslot */}
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
                  {TIME_SLOTS.map((slot) => {
                    const count = slotCounts[slot] ?? 0
                    const full = count >= MAX_PER_SLOT
                    return (
                      <SelectItem key={slot} value={slot} disabled={full}>
                        {slot}{full ? ' (Volgeboekt)' : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {!date && (
                <p className="mt-1 text-xs text-muted-foreground font-sans">Kies eerst een datum.</p>
              )}
              {fieldErrors.time && (
                <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.time}</p>
              )}
            </div>

            {/* Aantal personen */}
            <div>
              <Label htmlFor="guests">Aantal personen *</Label>
              <Input
                id="guests"
                type="number"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                min={1}
                max={30}
                placeholder="Aantal"
                aria-invalid={!!fieldErrors.guests}
              />
              {fieldErrors.guests && (
                <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.guests}</p>
              )}
            </div>

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
              {submitting ? 'Reservering versturen...' : 'Reservering versturen'}
            </Button>

            <p className="text-xs text-muted-foreground text-center font-sans">
              We bevestigen uw reservering zo snel mogelijk per e-mail.
            </p>
          </form>
        </div>
      </div>
    </main>
  )
}

export default ReservationPage
