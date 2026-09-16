import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { sendCancellationEmail } from '@/lib/email'
import {
  PHONE_HREF,
  PHONE_NUMBER,
  RESERVATION_TYPES,
  cancelErrorMessage,
  formatDutchDate,
  guestsLabel,
} from '@/lib/reservations'

type Reservation = {
  name: string
  date: string
  time: string
  guests: number
  status: string
  reservation_type: string | null
  is_past: boolean
}

const typeLabel = (v: string | null) =>
  RESERVATION_TYPES.find(t => t.value === v)?.label ?? 'Lunch'

const Shell = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <main className="pt-24 pb-16 min-h-[70vh]">
    <div className="container mx-auto px-4 max-w-lg">
      <div className="bg-card border border-border rounded-lg p-5 sm:p-8 shadow-sm">
        <h1 className="font-serif text-2xl sm:text-3xl mb-4 text-foreground">{title}</h1>
        {children}
      </div>
    </div>
  </main>
)

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-4 py-2.5 border-b border-border last:border-0">
    <span className="text-sm font-sans text-muted-foreground shrink-0">{label}</span>
    <span className="text-sm font-sans text-foreground text-right">{value}</span>
  </div>
)

const AnnulerenPage = () => {
  const [params] = useSearchParams()
  const id = params.get('id') ?? ''

  const [loading, setLoading] = useState(true)
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loadError, setLoadError] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      setLoadError('Er ontbreekt een reserveringsnummer in de link. Gebruik de link uit uw bevestigingsmail.')
      return
    }
    let cancelled = false
    supabase
      .rpc('get_reservation_for_cancel', { p_id: id })
      .then(({ data, error }) => {
        if (cancelled) return
        setLoading(false)
        if (error) {
          console.error('Reservering ophalen mislukt:', error)
          setLoadError(`Wij konden uw reservering niet ophalen. Probeer het later opnieuw of bel ons op ${PHONE_NUMBER}.`)
          return
        }
        const row = (data as Reservation[] | null)?.[0]
        if (!row) {
          setLoadError('Wij konden deze reservering niet vinden. Controleer de link uit uw e-mail.')
          return
        }
        setReservation(row)
      })
    return () => { cancelled = true }
  }, [id])

  const handleCancel = async () => {
    setCancelError('')
    setCancelling(true)
    const { data, error } = await supabase.rpc('cancel_reservation', { p_id: id })
    setCancelling(false)

    if (error) {
      setCancelError(cancelErrorMessage(error))
      return
    }

    const row = (data as { name: string; date: string; time: string }[] | null)?.[0]
    if (row) {
      // Het restaurant op de hoogte brengen. Lukt dat niet, dan is de
      // reservering nog steeds geannuleerd in de agenda.
      sendCancellationEmail({ name: row.name, email: '', date: row.date, time: row.time, byGuest: true })
    }
    setDone(true)
  }

  if (loading) {
    return (
      <Shell title="Reservering ophalen">
        <p className="font-sans text-sm text-muted-foreground">Een moment geduld...</p>
      </Shell>
    )
  }

  if (loadError) {
    return (
      <Shell title="Reservering niet gevonden">
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">{loadError}</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <a href={PHONE_HREF}><Button variant="default" className="w-full sm:w-auto">Bel {PHONE_NUMBER}</Button></a>
          <Link to="/"><Button variant="outline" className="w-full sm:w-auto">Naar de homepage</Button></Link>
        </div>
      </Shell>
    )
  }

  if (done) {
    return (
      <Shell title="Reservering geannuleerd">
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
          Uw reservering is geannuleerd en wij hebben het doorgegeven aan het restaurant. Bedankt
          voor het laten weten. Graag tot een volgende keer.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Link to="/reserveren"><Button variant="default" className="w-full sm:w-auto">Nieuwe reservering maken</Button></Link>
          <Link to="/"><Button variant="outline" className="w-full sm:w-auto">Naar de homepage</Button></Link>
        </div>
      </Shell>
    )
  }

  const r = reservation!
  const alreadyCancelled = r.status === 'geannuleerd'
  const blocked = alreadyCancelled || r.is_past

  return (
    <Shell title={blocked ? 'Uw reservering' : 'Reservering annuleren'}>
      <div className="mb-6">
        <DetailRow label="Naam" value={r.name} />
        <DetailRow label="Reservering" value={typeLabel(r.reservation_type)} />
        <DetailRow label="Datum" value={formatDutchDate(r.date)} />
        <DetailRow label="Tijd" value={`${r.time} uur`} />
        <DetailRow label="Aantal personen" value={guestsLabel(r.guests)} />
      </div>

      {alreadyCancelled ? (
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
          Deze reservering is al geannuleerd. Wilt u opnieuw reserveren, dan kan dat hieronder.
        </p>
      ) : r.is_past ? (
        <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-6">
          Deze datum is al geweest, annuleren is niet meer nodig.
        </p>
      ) : (
        <>
          <p className="font-sans text-sm text-muted-foreground leading-relaxed mb-4">
            Weet u zeker dat u deze reservering wilt annuleren? Dit kan niet ongedaan worden gemaakt.
          </p>
          {r.reservation_type === 'high_tea' && (
            <div className="mb-4 p-3 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-sans leading-relaxed">
              <strong>Let op:</strong> voor een high tea geldt dat annuleren kan tot uiterlijk 48 uur
              van tevoren. Annuleert u binnen 48 uur voor aanvang, dan wordt de high tea alsnog in
              rekening gebracht.
            </div>
          )}
          {cancelError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
              {cancelError}
            </div>
          )}
        </>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        {!blocked && (
          <Button variant="default" onClick={handleCancel} disabled={cancelling} className="w-full sm:w-auto">
            {cancelling ? 'Bezig...' : 'Ja, annuleer mijn reservering'}
          </Button>
        )}
        <Link to={blocked ? '/reserveren' : '/'}>
          <Button variant="outline" className="w-full sm:w-auto">
            {blocked ? 'Nieuwe reservering maken' : 'Nee, laat staan'}
          </Button>
        </Link>
      </div>

      <p className="mt-6 text-xs text-muted-foreground font-sans leading-relaxed">
        Wilt u uw reservering liever wijzigen in plaats van annuleren? Bel ons op{' '}
        <a href={PHONE_HREF} className="underline hover:text-foreground">{PHONE_NUMBER}</a>.
      </p>
    </Shell>
  )
}

export default AnnulerenPage
