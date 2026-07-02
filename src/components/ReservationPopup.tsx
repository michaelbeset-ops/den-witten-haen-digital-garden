import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarDays, X } from 'lucide-react'
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

const SLOTS_MON_WED = [
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00',
]
const SLOTS_THU_SAT = [
  '10:00', '10:30', '11:00', '11:30', '12:00',
  '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00',
]
function getSlotsForDate(dateStr: string): string[] {
  if (!dateStr) return SLOTS_MON_WED
  const day = new Date(dateStr + 'T12:00:00').getDay()
  if (day === 0) return []
  if (day >= 4) return SLOTS_THU_SAT
  return SLOTS_MON_WED
}
const MAX_GUESTS_PER_SLOT = 48
const MAX_GUESTS_PER_RESERVATION = 8
const PHONE_NUMBER = '078 611 20 50'
const tomorrowStr = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}
type SlotCounts = Record<string, number>

const ReservationPopup = () => {
  const location = useLocation()
  const [open, setOpen] = useState(false)
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
  const [error, setError] = useState('')

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Slot availability
  useEffect(() => {
    if (!date) { setSlotCounts({}); return }
    setLoadingSlots(true)
    supabase.rpc('get_slot_counts', { check_date: date }).then(({ data }) => {
      setLoadingSlots(false)
      const counts: SlotCounts = {}
      for (const row of (data ?? []) as { slot_time: string; slot_count: number }[]) {
        counts[row.slot_time] = row.slot_count
      }
      setSlotCounts(counts)
      if (time && (counts[time] ?? 0) >= MAX_GUESTS_PER_SLOT) setTime('')
    })
  }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  const reset = () => {
    setName(''); setEmail(''); setPhone(''); setDate('')
    setTime(''); setGuests(''); setMessage('')
    setSlotCounts({}); setError(''); setSuccess(false)
  }

  const handleClose = () => { setOpen(false); reset() }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !phone || !date || !time || !guests) {
      setError('Vul alle verplichte velden in.')
      return
    }
    const guestsNum = parseInt(guests, 10)
    if (guestsNum > MAX_GUESTS_PER_RESERVATION) {
      setError(`Voor groepen van meer dan ${MAX_GUESTS_PER_RESERVATION} personen kunt u niet online reserveren — bel ons op ${PHONE_NUMBER}.`)
      return
    }
    setSubmitting(true)
    const { data: newId, error: rpcError } = await supabase.rpc('create_reservation', {
      p_name: name.trim(),
      p_email: email.trim(),
      p_phone: phone.trim(),
      p_date: date,
      p_time: time,
      p_guests: parseInt(guests, 10),
      p_message: message.trim() || null,
    })
    setSubmitting(false)
    if (rpcError || !newId) {
      if (rpcError?.code === 'P0001') {
        setError('Dit tijdslot heeft niet genoeg ruimte meer voor uw gezelschap. Kies een ander tijdslot.')
      } else {
        setError(`Kon niet opslaan. (${rpcError?.code}: ${rpcError?.message})`)
      }
      return
    }
    sendConfirmationEmail({ name: name.trim(), email: email.trim(), date, time, guests: parseInt(guests, 10) })
    setSuccess(true)
  }

  if (location.pathname.replace(/\/+$/, '').endsWith('/reserveren')) {
    return null
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Reservering maken"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 font-sans font-medium text-sm"
      >
        <CalendarDays size={18} />
        Reserveren
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
          onClick={handleClose}
          aria-hidden="true"
        />
      )}

      {/* Panel */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reservering maken"
          className="fixed bottom-0 right-0 sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] max-h-[90vh] bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div>
              <h2 className="font-serif text-xl text-foreground">Reserveren</h2>
              <p className="font-sans text-xs text-muted-foreground mt-0.5">Den Witten Haen, Dordrecht</p>
            </div>
            <button
              onClick={handleClose}
              aria-label="Sluiten"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {success ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="text-primary" size={24} />
                </div>
                <h3 className="font-serif text-lg mb-2">Bedankt!</h3>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">
                  Uw reservering is ontvangen. U ontvangt een bevestiging per e-mail.
                </p>
                <Button className="mt-6 w-full" variant="outline" onClick={handleClose}>
                  Sluiten
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {error && (
                  <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-xs font-sans">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="pop-name">Naam *</Label>
                    <Input id="pop-name" value={name} onChange={e => setName(e.target.value)} placeholder="Uw naam" />
                  </div>
                  <div>
                    <Label htmlFor="pop-email">E-mailadres *</Label>
                    <Input id="pop-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="naam@voorbeeld.nl" />
                  </div>
                  <div>
                    <Label htmlFor="pop-phone">Telefoonnummer *</Label>
                    <Input id="pop-phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="06 – 00 00 00 00" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="pop-date">Datum *</Label>
                      <div className="relative">
                        <Input
                          id="pop-date"
                          type="date"
                          value={date}
                          min={tomorrowStr()}
                          onChange={e => { setDate(e.target.value); setTime('') }}
                        />
                        {!date && (
                          <span className="date-placeholder-ios pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-sm text-muted-foreground">
                            dd-mm-jjjj
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pop-guests">Personen *</Label>
                      <Input
                        id="pop-guests"
                        type="number"
                        value={guests}
                        onChange={e => setGuests(e.target.value)}
                        min={1} max={20}
                        placeholder="Aantal"
                      />
                      {parseInt(guests, 10) > MAX_GUESTS_PER_RESERVATION && (
                        <p className="mt-1 text-xs text-destructive font-sans">
                          Bel ons op {PHONE_NUMBER} voor grote groepen.
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="pop-time">Tijdslot *</Label>
                    <Select value={time} onValueChange={setTime} disabled={!date || loadingSlots}>
                      <SelectTrigger id="pop-time">
                        <SelectValue placeholder={loadingSlots ? 'Laden...' : !date ? 'Kies eerst een datum' : 'Kies een tijdslot'} />
                      </SelectTrigger>
                      <SelectContent>
                        {getSlotsForDate(date).length === 0
                          ? <SelectItem value="__closed__" disabled>Zondag gesloten</SelectItem>
                          : getSlotsForDate(date).map(slot => {
                              const full = (slotCounts[slot] ?? 0) >= MAX_GUESTS_PER_SLOT
                              return (
                                <SelectItem key={slot} value={slot} disabled={full}>
                                  {slot}{full ? ' (Volgeboekt)' : ''}
                                </SelectItem>
                              )
                            })
                        }
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pop-message">Opmerking</Label>
                    <Textarea
                      id="pop-message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Dieetwensen, gelegenheid..."
                      rows={3}
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? 'Versturen...' : 'Reservering versturen'}
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default ReservationPopup
