import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { supabase, type Reservation } from '@/lib/supabase'
import { sendCancellationEmail } from '@/lib/email'

// ─── Types ───────────────────────────────────────────────────────────────────

type ActionLoading = Record<string, 'annuleren' | null>
type View = 'reserveringen' | 'sluitingen'

interface BlockedSlot {
  id: string
  date: string
  time_from: string | null
  time_to: string | null
  reason: string | null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const todayStr = () => new Date().toISOString().split('T')[0]

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' })

const fmtTimeRange = (c: BlockedSlot): React.ReactNode => {
  if (!c.time_from) return <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full">Hele dag</span>
  if (!c.time_to || c.time_to === c.time_from) return c.time_from
  return `${c.time_from} – ${c.time_to}`
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: Reservation['status'] }) => {
  const styles = { aangevraagd: 'bg-yellow-100 text-yellow-800', bevestigd: 'bg-green-100 text-green-800', geannuleerd: 'bg-gray-100 text-gray-500' }
  const labels = { aangevraagd: 'Aangevraagd', bevestigd: 'Bevestigd', geannuleerd: 'Geannuleerd' }
  return <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>{labels[status]}</span>
}

// All possible time slots (Thu–Sat range covers Mon–Wed too)
const ALL_SLOTS = [
  '10:00','10:30','11:00','11:30','12:00','12:30',
  '13:00','13:30','14:00','14:30','15:00','15:30','16:00',
]

// ─── ClosuresSection ──────────────────────────────────────────────────────────

const ClosuresSection = () => {
  const [closures, setClosures] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState('')
  const [timeFrom, setTimeFrom] = useState('')
  const [timeTo, setTimeTo] = useState('')
  const [reason, setReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchClosures = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('blocked_slots')
      .select('id, date, time_from, time_to, reason')
      .order('date', { ascending: true })
      .order('time_from', { ascending: true, nullsFirst: true })
    setLoading(false)
    setClosures((data as BlockedSlot[]) ?? [])
  }, [])

  useEffect(() => { fetchClosures() }, [fetchClosures])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date) return
    setSaving(true)
    await supabase.from('blocked_slots').insert({
      date,
      time_from: timeFrom || null,
      time_to: timeFrom && timeTo ? timeTo : null,
      reason: reason.trim() || null,
    })
    setSaving(false)
    setDate('')
    setTimeFrom('')
    setTimeTo('')
    setReason('')
    fetchClosures()
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    await supabase.from('blocked_slots').delete().eq('id', id)
    setDeletingId(null)
    fetchClosures()
  }

  const toSlots = timeFrom ? ALL_SLOTS.slice(ALL_SLOTS.indexOf(timeFrom)) : []

  return (
    <div className="p-6 max-w-2xl">
      <h2 className="font-serif text-2xl text-foreground mb-6">Sluitingen</h2>

      <div className="bg-card border border-border rounded-lg p-5 mb-6">
        <h3 className="font-sans text-sm font-semibold text-foreground mb-1">Dag of tijdslot sluiten</h3>
        <p className="text-xs text-muted-foreground font-sans mb-4">
          Laat "Van" leeg om een <strong>hele dag</strong> te blokkeren.
          Kies "Van" zonder "Tot" om alles vanaf dat tijdstip te sluiten.
        </p>
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="text-xs font-sans text-muted-foreground mb-1 block">Datum *</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
              className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-sans text-muted-foreground mb-1 block">Van tijdslot</label>
              <select
                value={timeFrom}
                onChange={e => { setTimeFrom(e.target.value); setTimeTo('') }}
                className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">— Hele dag —</option>
                {ALL_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {timeFrom && (
              <div className="flex-1">
                <label className="text-xs font-sans text-muted-foreground mb-1 block">Tot tijdslot</label>
                <select
                  value={timeTo}
                  onChange={e => setTimeTo(e.target.value)}
                  className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">— Einde dag —</option>
                  {toSlots.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-sans text-muted-foreground mb-1 block">Reden (optioneel)</label>
            <input
              type="text"
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="bijv. Bruiloft, Personeel vrij, Feestdag…"
              className="w-full font-sans text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !date}
            className="font-sans text-sm font-medium px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Opslaan…' : 'Sluiting toevoegen'}
          </button>
        </form>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Datum</th>
              <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Tijdslot</th>
              <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Reden</th>
              <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm font-sans text-muted-foreground">Laden…</td></tr>
            ) : closures.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-sm font-sans text-muted-foreground">Geen sluitingen gepland.</td></tr>
            ) : closures.map(c => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">{fmtDate(c.date)}</td>
                <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">{fmtTimeRange(c)}</td>
                <td className="px-4 py-3 text-sm font-sans text-muted-foreground">{c.reason ?? '—'}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(c.id)}
                    disabled={deletingId === c.id}
                    className="text-xs font-sans font-medium px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 transition-colors"
                  >
                    {deletingId === c.id ? 'Bezig…' : 'Verwijderen'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <p className="text-center py-8 text-sm font-sans text-muted-foreground">Laden…</p>
        ) : closures.length === 0 ? (
          <p className="text-center py-8 text-sm font-sans text-muted-foreground">Geen sluitingen gepland.</p>
        ) : closures.map(c => (
          <div key={c.id} className="rounded-lg border border-border bg-card shadow-sm p-4">
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-serif text-lg text-foreground">{fmtDate(c.date)}</p>
              <div>{fmtTimeRange(c)}</div>
            </div>
            {c.reason && <p className="text-sm font-sans text-muted-foreground mb-3">{c.reason}</p>}
            <button
              onClick={() => handleDelete(c.id)}
              disabled={deletingId === c.id}
              className="text-xs font-sans font-medium px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-red-100 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
              {deletingId === c.id ? 'Bezig…' : 'Verwijderen'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const navigate = useNavigate()
  const [view, setView] = useState<View>('reserveringen')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [filterDate, setFilterDate] = useState(todayStr())
  const [allDates, setAllDates] = useState(false)
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [actionLoading, setActionLoading] = useState<ActionLoading>({})

  const fetchReservations = useCallback(async () => {
    setLoadingData(true)
    setFetchError('')
    let query = supabase.from('reservations').select('*')
    if (!allDates) query = query.eq('date', filterDate)
    const { data, error } = await query.order('date', { ascending: true }).order('time', { ascending: true })
    setLoadingData(false)
    if (error) { setFetchError('Reserveringen konden niet worden geladen. Controleer uw verbinding.'); return }
    setReservations((data as Reservation[]) ?? [])
  }, [filterDate, allDates])

  useEffect(() => { fetchReservations() }, [fetchReservations])

  // Lock body scroll while the mobile menu is open (position: fixed, not
  // `overflow: hidden`, since the latter is unreliable on iOS Safari).
  useEffect(() => {
    if (!mobileMenuOpen) return
    const scrollY = window.scrollY
    const { style } = document.body
    const prev = { position: style.position, top: style.top, left: style.left, right: style.right, width: style.width }
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.width = '100%'
    return () => {
      style.position = prev.position
      style.top = prev.top
      style.left = prev.left
      style.right = prev.right
      style.width = prev.width
      window.scrollTo(0, scrollY)
    }
  }, [mobileMenuOpen])

  useEffect(() => {
    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => { fetchReservations() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchReservations])

  const handleAnnuleren = async (r: Reservation) => {
    setActionLoading(prev => ({ ...prev, [r.id]: 'annuleren' }))
    const { error } = await supabase.from('reservations').update({ status: 'geannuleerd' }).eq('id', r.id)
    if (!error) {
      sendCancellationEmail({ name: r.name, email: r.email, date: r.date, time: r.time })
      setReservations(prev => prev.map(item => item.id === r.id ? { ...item, status: 'geannuleerd' } : item))
    }
    setActionLoading(prev => ({ ...prev, [r.id]: null }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const colSpan = allDates ? 9 : 8

  return (
    <div className="flex flex-col md:flex-row md:h-screen bg-background md:overflow-hidden">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-foreground text-primary-foreground shrink-0">
        <div>
          <h1 className="font-serif text-lg leading-tight">Den Witten Haen</h1>
          <p className="font-sans text-xs opacity-60 mt-0.5">Reserveringsbeheer</p>
        </div>
        <button onClick={() => setMobileMenuOpen(true)} aria-label="Menu openen" className="p-2">
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-foreground text-primary-foreground flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-primary-foreground/20">
            <div>
              <h1 className="font-serif text-lg leading-tight">Den Witten Haen</h1>
              <p className="font-sans text-xs opacity-60 mt-0.5">Reserveringsbeheer</p>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} aria-label="Sluiten" className="p-2">
              <X size={22} />
            </button>
          </div>
          <nav className="flex-1 p-4 flex flex-col gap-1">
            <button
              onClick={() => { setView('reserveringen'); setMobileMenuOpen(false) }}
              className={`text-lg font-sans font-medium text-left px-3 py-3 rounded transition-colors ${view === 'reserveringen' ? 'bg-primary-foreground/10 opacity-100' : 'opacity-60 hover:opacity-90'}`}
            >
              Reserveringen
            </button>
            <button
              onClick={() => { setView('sluitingen'); setMobileMenuOpen(false) }}
              className={`text-lg font-sans font-medium text-left px-3 py-3 rounded transition-colors ${view === 'sluitingen' ? 'bg-primary-foreground/10 opacity-100' : 'opacity-60 hover:opacity-90'}`}
            >
              Sluitingen
            </button>
          </nav>
          <div className="p-4 border-t border-primary-foreground/20">
            <button onClick={handleLogout} className="w-full text-left text-sm font-sans opacity-70 hover:opacity-100 px-3 py-2 transition-opacity">
              Uitloggen
            </button>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 bg-foreground text-primary-foreground flex-col shrink-0">
        <div className="p-6 border-b border-primary-foreground/20">
          <h1 className="font-serif text-lg leading-tight">Den Witten Haen</h1>
          <p className="font-sans text-xs opacity-60 mt-1">Reserveringsbeheer</p>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-1">
          <button
            onClick={() => setView('reserveringen')}
            className={`text-sm font-sans font-medium text-left px-3 py-2 rounded transition-colors ${view === 'reserveringen' ? 'bg-primary-foreground/10 opacity-100' : 'opacity-60 hover:opacity-90'}`}
          >
            Reserveringen
          </button>
          <button
            onClick={() => setView('sluitingen')}
            className={`text-sm font-sans font-medium text-left px-3 py-2 rounded transition-colors ${view === 'sluitingen' ? 'bg-primary-foreground/10 opacity-100' : 'opacity-60 hover:opacity-90'}`}
          >
            Sluitingen
          </button>
        </nav>
        <div className="p-4 border-t border-primary-foreground/20">
          <button onClick={handleLogout} className="w-full text-left text-sm font-sans opacity-70 hover:opacity-100 px-3 py-2 transition-opacity">
            Uitloggen
          </button>
        </div>
      </aside>

      <main className="flex-1 md:overflow-auto">
        {view === 'sluitingen' ? <ClosuresSection /> : (
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <h2 className="font-serif text-2xl text-foreground">Reserveringen</h2>
              <div className="ml-auto flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={allDates} onChange={e => setAllDates(e.target.checked)} className="w-4 h-4 accent-primary" />
                  <span className="text-sm font-sans text-muted-foreground whitespace-nowrap">Alle datums</span>
                </label>
                {!allDates && (
                  <>
                    <label htmlFor="filter-date" className="text-sm font-sans text-muted-foreground whitespace-nowrap">Datum:</label>
                    <input
                      id="filter-date"
                      type="date"
                      value={filterDate}
                      onChange={e => setFilterDate(e.target.value)}
                      className="font-sans text-sm border border-border rounded px-3 py-2 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </>
                )}
                {!loadingData && (
                  <span className="text-sm font-sans text-muted-foreground whitespace-nowrap">
                    {reservations.length} {reservations.length === 1 ? 'reservering' : 'reserveringen'}
                  </span>
                )}
              </div>
            </div>

            {fetchError && (
              <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">{fetchError}</div>
            )}

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-border">
                    {allDates && <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Datum</th>}
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Tijd</th>
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Naam</th>
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">E-mail</th>
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Telefoon</th>
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Pers.</th>
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Opmerking</th>
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Status</th>
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Acties</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingData ? (
                    <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-sm font-sans text-muted-foreground">Laden…</td></tr>
                  ) : reservations.length === 0 ? (
                    <tr><td colSpan={colSpan} className="px-4 py-10 text-center text-sm font-sans text-muted-foreground">
                      {allDates ? 'Nog geen reserveringen.' : `Geen reserveringen voor ${fmtDate(filterDate)}.`}
                    </td></tr>
                  ) : reservations.map(r => {
                    const busy = actionLoading[r.id]
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        {allDates && <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">{fmtDate(r.date)}</td>}
                        <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">{r.time}</td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground">{r.name}</td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground">
                          <a href={`mailto:${r.email}`} className="hover:underline text-primary">{r.email}</a>
                        </td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">{r.phone}</td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground text-center">{r.guests}</td>
                        <td className="px-4 py-3 text-sm font-sans text-muted-foreground max-w-[200px]">
                          {r.reservation_type === 'high_tea' && (
                            <span className="inline-block text-xs font-sans font-medium px-2 py-0.5 rounded-full mr-1 mb-0.5 bg-rose-100 text-rose-800">
                              High tea
                            </span>
                          )}
                          {r.seating_preference && (
                            <span className={`inline-block text-xs font-sans font-medium px-2 py-0.5 rounded-full mr-1 mb-0.5 ${r.seating_preference === 'buiten' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                              {r.seating_preference.charAt(0).toUpperCase() + r.seating_preference.slice(1)}
                            </span>
                          )}
                          <span className="truncate block">{r.message || (r.seating_preference || r.reservation_type === 'high_tea' ? '' : '—')}</span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3">
                          {r.status !== 'geannuleerd' && (
                            <button
                              onClick={() => handleAnnuleren(r)}
                              disabled={!!busy}
                              className="text-xs font-sans font-medium px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                            >
                              {busy === 'annuleren' ? 'Bezig…' : 'Annuleren'}
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {loadingData ? (
                <p className="text-center py-10 text-sm font-sans text-muted-foreground">Laden…</p>
              ) : reservations.length === 0 ? (
                <p className="text-center py-10 text-sm font-sans text-muted-foreground">
                  {allDates ? 'Nog geen reserveringen.' : `Geen reserveringen voor ${fmtDate(filterDate)}.`}
                </p>
              ) : reservations.map(r => {
                const busy = actionLoading[r.id]
                return (
                  <div key={r.id} className="rounded-lg border border-border bg-card shadow-sm p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="font-serif text-lg text-foreground leading-tight">{r.name}</p>
                        <p className="text-sm font-sans text-muted-foreground mt-0.5">
                          {allDates ? `${fmtDate(r.date)} · ` : ''}{r.time} · {r.guests} {r.guests === 1 ? 'persoon' : 'personen'}
                        </p>
                      </div>
                      <StatusBadge status={r.status} />
                    </div>
                    <div className="space-y-1 text-sm font-sans mb-3">
                      <p><a href={`mailto:${r.email}`} className="text-primary hover:underline break-all">{r.email}</a></p>
                      <p className="text-muted-foreground">{r.phone}</p>
                      {r.reservation_type === 'high_tea' && (
                        <span className="inline-block text-xs font-sans font-medium px-2 py-0.5 rounded-full mt-1 mr-1 bg-rose-100 text-rose-800">
                          High tea
                        </span>
                      )}
                      {r.seating_preference && (
                        <span className={`inline-block text-xs font-sans font-medium px-2 py-0.5 rounded-full mt-1 ${r.seating_preference === 'buiten' ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                          {r.seating_preference.charAt(0).toUpperCase() + r.seating_preference.slice(1)}
                        </span>
                      )}
                      {r.message && <p className="text-muted-foreground">{r.message}</p>}
                    </div>
                    {r.status !== 'geannuleerd' && (
                      <button
                        onClick={() => handleAnnuleren(r)}
                        disabled={!!busy}
                        className="text-xs font-sans font-medium px-3 py-1.5 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {busy === 'annuleren' ? 'Bezig…' : 'Annuleren'}
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default Dashboard
