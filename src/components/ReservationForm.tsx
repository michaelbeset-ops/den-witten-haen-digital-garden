import { useEffect, useId, useState } from 'react'
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
import { cancelUrl, sendReceivedEmail, sendGroupRequestEmail } from '@/lib/email'
import {
  type Availability,
  type ReservationType,
  RESERVATION_TYPES,
  MAX_GUESTS_PER_WINDOW,
  MAX_GUESTS_PER_RESERVATION,
  MAX_GUESTS_INPUT,
  PHONE_NUMBER,
  PHONE_HREF,
  EMAIL_RE,
  isPhone,
  getSlotsForDate,
  windowLoad,
  fetchAvailability,
  tomorrowStr,
  maxDateStr,
  reservationErrorMessage,
} from '@/lib/reservations'

const EMPTY_AVAILABILITY: Availability = { counts: {}, blockedTimes: new Set(), dayBlocked: false }

type FieldErrors = {
  name?: string
  email?: string
  phone?: string
  date?: string
  time?: string
  guests?: string
}

type Props = {
  /** 'page' is de volledige pagina, 'popup' het compacte paneel. */
  variant?: 'page' | 'popup'
  /** Alleen voor de popup: knop om te sluiten na een geslaagde reservering. */
  onClose?: () => void
}

/**
 * Het reserveringsformulier. Pagina en popup gebruiken exact dit component,
 * zodat beide dezelfde velden, validatie en capaciteitsregels hebben.
 */
const ReservationForm = ({ variant = 'page', onClose }: Props) => {
  const uid = useId()
  const fid = (name: string) => `${uid}-${name}`
  const isPopup = variant === 'popup'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState('')
  const [message, setMessage] = useState('')
  const [seating, setSeating] = useState<'geen' | 'binnen' | 'buiten'>('geen')
  const [reservationType, setReservationType] = useState<ReservationType>('lunch')

  const [availability, setAvailability] = useState<Availability>(EMPTY_AVAILABILITY)
  const [loadingSlots, setLoadingSlots] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successType, setSuccessType] = useState<'reservation' | 'group'>('reservation')
  const [mailFailed, setMailFailed] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const guestsNum = parseInt(guests, 10)
  // Groepen boven 8 personen kunnen niet direct online boeken; zij sturen een
  // aanvraag die naar het restaurant wordt gemaild.
  const isGroup = !isNaN(guestsNum) && guestsNum > MAX_GUESTS_PER_RESERVATION
  const slots = getSlotsForDate(date)

  // Beschikbaarheid en sluitingen ophalen zodra er een datum gekozen is.
  useEffect(() => {
    if (!date) {
      setAvailability(EMPTY_AVAILABILITY)
      return
    }
    let cancelled = false
    setLoadingSlots(true)
    fetchAvailability(date).then((a) => {
      if (cancelled) return
      setLoadingSlots(false)
      setAvailability(a)
      if (time && (a.dayBlocked || a.blockedTimes.has(time) || windowLoad(a.counts, time) >= MAX_GUESTS_PER_WINDOW)) {
        setTime('')
      }
    })
    return () => { cancelled = true }
  }, [date]) // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (): boolean => {
    const errors: FieldErrors = {}
    if (!name.trim()) errors.name = 'Naam is verplicht.'
    if (!email.trim()) errors.email = 'E-mailadres is verplicht.'
    else if (!EMAIL_RE.test(email.trim())) errors.email = 'Voer een geldig e-mailadres in.'
    if (!phone.trim()) errors.phone = 'Telefoonnummer is verplicht.'
    else if (!isPhone(phone)) errors.phone = 'Voer een geldig telefoonnummer in.'
    if (!date) errors.date = 'Datum is verplicht.'
    else if (date < tomorrowStr()) errors.date = 'Reserveren kan vanaf morgen.'
    else if (date > maxDateStr()) errors.date = 'Kies een datum binnen een half jaar.'
    else if (availability.dayBlocked) errors.date = 'Op deze dag zijn wij gesloten.'
    else if (!isGroup && slots.length === 0) errors.date = 'Op zondag zijn wij gesloten.'
    if (!guests) errors.guests = 'Aantal personen is verplicht.'
    else if (isNaN(guestsNum) || guestsNum < 1) errors.guests = 'Voer een geldig aantal in.'
    else if (guestsNum > MAX_GUESTS_INPUT) errors.guests = `Voor meer dan ${MAX_GUESTS_INPUT} personen belt u ons even op ${PHONE_NUMBER}.`
    // Een tijdslot is alleen nodig voor directe reserveringen (t/m 8 personen).
    // Groepsaanvragen worden telefonisch of per e-mail ingepland.
    if (!isGroup) {
      if (!time) errors.time = 'Tijdslot is verplicht.'
      else if (availability.blockedTimes.has(time)) errors.time = 'Dit tijdslot is gesloten.'
    }

    setFieldErrors(errors)
    const first = (['name', 'email', 'phone', 'date', 'guests', 'time'] as const).find(k => errors[k])
    if (first) {
      const el = document.getElementById(fid(first === 'time' ? 'time-select' : first))
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.focus({ preventScroll: true })
    }
    return Object.keys(errors).length === 0
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
    setAvailability(EMPTY_AVAILABILITY)
    setFieldErrors({})
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGeneralError('')
    setMailFailed(false)

    if (!validate()) return

    // Groepen boven 8 personen: de aanvraag bestaat alleen als e-mail naar het
    // restaurant. Mislukt het versturen, dan mogen we niet "gelukt" tonen.
    if (isGroup) {
      setSubmitting(true)
      const sent = await sendGroupRequestEmail({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        date,
        guests: guestsNum,
        message: message.trim() || null,
        reservationType,
      })
      setSubmitting(false)
      if (!sent) {
        setGeneralError(`Uw aanvraag kon niet worden verstuurd. Probeer het opnieuw of bel ons op ${PHONE_NUMBER}.`)
        return
      }
      setSuccessType('group')
      setSuccess(true)
      resetForm()
      return
    }

    setSubmitting(true)

    // Beschikbaarheid nog eens ophalen vlak voor het opslaan, zodat twee gasten
    // die tegelijk boeken niet allebei het laatste plekje krijgen. De database
    // controleert het daarna nogmaals; dit is puur voor een nettere melding.
    const fresh = await fetchAvailability(date)
    setAvailability(fresh)
    if (fresh.dayBlocked || fresh.blockedTimes.has(time)) {
      setSubmitting(false)
      setFieldErrors(prev => ({ ...prev, time: 'Dit tijdslot is inmiddels gesloten. Kies een ander tijdslot.' }))
      setTime('')
      return
    }
    if (windowLoad(fresh.counts, time, guestsNum) > MAX_GUESTS_PER_WINDOW) {
      setSubmitting(false)
      setFieldErrors(prev => ({ ...prev, time: 'Dit tijdslot heeft niet genoeg ruimte meer voor uw gezelschap. Kies een ander tijdslot.' }))
      setTime('')
      return
    }

    const { data: newId, error: insertError } = await supabase.rpc('create_reservation', {
      p_name: name.trim(),
      p_email: email.trim(),
      p_phone: phone.trim(),
      p_date: date,
      p_time: time,
      p_guests: guestsNum,
      p_message: message.trim() || null,
      p_seating: seating === 'geen' ? null : seating,
      p_type: reservationType,
    })

    if (insertError || !newId) {
      setSubmitting(false)
      if (insertError?.code === 'P0001' || insertError?.code === 'P0002') {
        setFieldErrors(prev => ({ ...prev, time: reservationErrorMessage(insertError) }))
        setTime('')
      } else {
        setGeneralError(reservationErrorMessage(insertError))
      }
      console.error('Reservering opslaan mislukt:', insertError)
      return
    }

    // De reservering staat nu vast. De e-mail is prettig maar niet kritiek:
    // lukt hij niet, dan melden we dat op het scherm.
    const sent = await sendReceivedEmail({
      name: name.trim(),
      email: email.trim(),
      date,
      time,
      guests: guestsNum,
      reservationType,
      seating: seating === 'geen' ? null : seating,
      message: message.trim() || null,
      cancelUrl: cancelUrl(newId as string),
    })

    setSubmitting(false)
    setMailFailed(!sent)
    setSuccessType('reservation')
    setSuccess(true)
    resetForm()
  }

  // ─── Bedankscherm ───────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className={isPopup ? 'text-center py-6' : 'text-center'}>
        <h2 className={`font-serif text-foreground ${isPopup ? 'text-xl mb-2' : 'text-2xl sm:text-3xl mb-3 sm:mb-4'}`}>
          {successType === 'group' ? 'Aanvraag ontvangen' : 'Reservering ontvangen'}
        </h2>
        <p className={`font-sans text-muted-foreground leading-relaxed ${isPopup ? 'text-sm mb-5' : 'text-base mb-5 sm:mb-6'}`}>
          {successType === 'group'
            ? 'Bedankt voor uw aanvraag. Wij nemen zo snel mogelijk contact met u op om de details door te nemen.'
            : 'Bedankt voor uw reservering. U ontvangt een e-mail met de gegevens. Wij bevestigen uw reservering zo snel mogelijk.'}
        </p>
        {mailFailed && (
          <p className="mb-5 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed text-left">
            Uw reservering is genoteerd, maar de e-mail kon niet worden verstuurd. Controleer uw
            e-mailadres of bel ons op{' '}
            <a href={PHONE_HREF} className="underline">{PHONE_NUMBER}</a> als u een bevestiging wilt ontvangen.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          <Button variant={isPopup ? 'outline' : 'default'} onClick={() => { setSuccess(false); setMailFailed(false) }}>
            Nieuwe reservering maken
          </Button>
          {isPopup && onClose && (
            <Button variant="default" onClick={onClose}>Sluiten</Button>
          )}
        </div>
      </div>
    )
  }

  // ─── Formulier ──────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit} className={isPopup ? 'space-y-4' : 'space-y-4 sm:space-y-5'} noValidate>
      {generalError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
          {generalError}
        </div>
      )}

      {/* Naam */}
      <div>
        <Label htmlFor={fid('name')}>Naam *</Label>
        <Input
          id={fid('name')}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Uw volledige naam"
          autoComplete="name"
          maxLength={100}
          aria-invalid={!!fieldErrors.name}
        />
        {fieldErrors.name && <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.name}</p>}
      </div>

      {/* E-mailadres */}
      <div>
        <Label htmlFor={fid('email')}>E-mailadres *</Label>
        <Input
          id={fid('email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="naam@voorbeeld.nl"
          autoComplete="email"
          inputMode="email"
          maxLength={255}
          aria-invalid={!!fieldErrors.email}
        />
        {fieldErrors.email && <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.email}</p>}
      </div>

      {/* Telefoonnummer */}
      <div>
        <Label htmlFor={fid('phone')}>Telefoonnummer *</Label>
        <Input
          id={fid('phone')}
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
          autoComplete="tel"
          inputMode="tel"
          maxLength={25}
          aria-invalid={!!fieldErrors.phone}
        />
        {fieldErrors.phone && <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.phone}</p>}
      </div>

      {/* Type reservering */}
      <div>
        <Label>Wat wilt u reserveren? *</Label>
        <div className="flex gap-6 mt-2">
          {RESERVATION_TYPES.map((opt) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name={fid('type')}
                value={opt.value}
                checked={reservationType === opt.value}
                onChange={() => setReservationType(opt.value)}
                className="accent-primary w-4 h-4"
              />
              <span className="text-sm font-sans text-foreground">{opt.label}</span>
            </label>
          ))}
        </div>
        {reservationType === 'high_tea' && (
          <div className="mt-3 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed">
            <strong>Annuleringsvoorwaarde high tea:</strong> annuleren kan tot uiterlijk 48 uur van
            tevoren. Bij annulering binnen 48 uur voor aanvang wordt de high tea alsnog in rekening
            gebracht.
          </div>
        )}
      </div>

      {/* Datum en aantal personen */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={fid('date')}>Datum *</Label>
          <div className="relative">
            <Input
              id={fid('date')}
              type="date"
              value={date}
              min={tomorrowStr()}
              max={maxDateStr()}
              onChange={(e) => { setDate(e.target.value); setTime('') }}
              aria-invalid={!!fieldErrors.date}
            />
            {!date && (
              <span className="date-placeholder-ios pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base md:text-sm text-muted-foreground">
                dd-mm-jjjj
              </span>
            )}
          </div>
          {fieldErrors.date && <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.date}</p>}
        </div>

        <div>
          <Label htmlFor={fid('guests')}>Personen *</Label>
          <Input
            id={fid('guests')}
            type="number"
            value={guests}
            onChange={(e) => setGuests(e.target.value)}
            min={1}
            max={MAX_GUESTS_INPUT}
            inputMode="numeric"
            placeholder="Aantal"
            aria-invalid={!!fieldErrors.guests}
          />
          {fieldErrors.guests && <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.guests}</p>}
        </div>
      </div>

      {!fieldErrors.guests && !isGroup && (
        <p className="text-xs text-muted-foreground font-sans leading-relaxed">
          Groep van meer dan {MAX_GUESTS_PER_RESERVATION} personen? Vul het aantal in, dan sturen wij
          uw aanvraag door en nemen wij contact met u op.
        </p>
      )}
      {isGroup && (
        <div className="p-3 rounded-md bg-primary/5 border border-primary/20 text-foreground text-xs font-sans leading-relaxed">
          Voor groepen van meer dan {MAX_GUESTS_PER_RESERVATION} personen plannen wij de reservering
          persoonlijk in. Vul uw gegevens en gewenste datum in en verstuur uw aanvraag, dan nemen wij
          zo snel mogelijk contact met u op. Liever direct bellen? Dat kan op{' '}
          <a href={PHONE_HREF} className="underline">{PHONE_NUMBER}</a>.
        </div>
      )}

      {/* Tijdslot, alleen voor directe reserveringen */}
      {!isGroup && (
        <div>
          <Label htmlFor={fid('time-select')}>Tijdslot *</Label>
          <Select value={time} onValueChange={setTime} disabled={!date || loadingSlots}>
            <SelectTrigger id={fid('time-select')} aria-invalid={!!fieldErrors.time}>
              <SelectValue
                placeholder={
                  loadingSlots ? 'Beschikbaarheid laden...' : !date ? 'Kies eerst een datum' : 'Kies een tijdslot'
                }
              />
            </SelectTrigger>
            <SelectContent>
              {availability.dayBlocked ? (
                <SelectItem value="__dayblocked__" disabled>Op deze dag zijn wij gesloten</SelectItem>
              ) : slots.length === 0 ? (
                <SelectItem value="__closed__" disabled>Op zondag zijn wij gesloten</SelectItem>
              ) : slots.map((slot) => {
                const blocked = availability.blockedTimes.has(slot)
                const full = !blocked && windowLoad(availability.counts, slot) >= MAX_GUESTS_PER_WINDOW
                return (
                  <SelectItem key={slot} value={slot} disabled={blocked || full}>
                    {slot}{blocked ? ' (gesloten)' : full ? ' (volgeboekt)' : ''}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
          {!date && <p className="mt-1 text-xs text-muted-foreground font-sans">Kies eerst een datum.</p>}
          {date && availability.dayBlocked && (
            <p className="mt-1 text-xs text-destructive font-sans">Op deze dag zijn wij gesloten.</p>
          )}
          {date && !availability.dayBlocked && slots.length === 0 && (
            <p className="mt-1 text-xs text-destructive font-sans">Op zondag zijn wij gesloten.</p>
          )}
          {fieldErrors.time && <p className="mt-1 text-xs text-destructive font-sans">{fieldErrors.time}</p>}
        </div>
      )}

      {/* Zitplaatsvoorkeur, niet relevant voor groepsaanvragen */}
      {!isGroup && (
        <div>
          <Label>Zitplaatsvoorkeur</Label>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2">
            {(['geen', 'binnen', 'buiten'] as const).map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name={fid('seating')}
                  value={opt}
                  checked={seating === opt}
                  onChange={() => setSeating(opt)}
                  className="accent-primary w-4 h-4"
                />
                <span className="text-sm font-sans text-foreground">
                  {opt === 'geen' ? 'Geen voorkeur' : opt.charAt(0).toUpperCase() + opt.slice(1)}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-1.5 text-xs text-muted-foreground font-sans">
            Wij houden er rekening mee, maar kunnen een plek niet garanderen.
          </p>
        </div>
      )}

      {/* Opmerking */}
      <div>
        <Label htmlFor={fid('message')}>Opmerking</Label>
        <Textarea
          id={fid('message')}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Dieetwensen, bijzondere gelegenheden of andere opmerkingen..."
          maxLength={1000}
          rows={isPopup ? 3 : 4}
        />
      </div>

      <Button type="submit" variant="default" size="lg" className="w-full" disabled={submitting}>
        {submitting ? 'Versturen...' : isGroup ? 'Groepsaanvraag versturen' : 'Reservering versturen'}
      </Button>

      <p className="text-xs text-muted-foreground text-center font-sans leading-relaxed">
        {isGroup
          ? 'Wij nemen zo snel mogelijk contact met u op over uw aanvraag.'
          : 'U ontvangt direct een e-mail met de gegevens van uw reservering.'}
      </p>
    </form>
  )
}

export default ReservationForm
