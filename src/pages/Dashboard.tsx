import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Reservation } from '@/lib/supabase'
import { sendCancellationEmail } from '@/lib/email'

const todayStr = () => new Date().toISOString().split('T')[0]

const fmtDate = (iso: string) =>
  new Date(iso + 'T00:00:00').toLocaleDateString('nl-NL', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

type ActionLoading = Record<string, 'annuleren' | null>

const StatusBadge = ({ status }: { status: Reservation['status'] }) => {
  const styles = {
    aangevraagd: 'bg-yellow-100 text-yellow-800',
    bevestigd: 'bg-green-100 text-green-800',
    geannuleerd: 'bg-gray-100 text-gray-500',
  }
  const labels = {
    aangevraagd: 'Aangevraagd',
    bevestigd: 'Bevestigd',
    geannuleerd: 'Geannuleerd',
  }
  return (
    <span className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
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
    if (!allDates) {
      query = query.eq('date', filterDate)
    }
    const { data, error } = await query.order('date', { ascending: true }).order('time', { ascending: true })
    setLoadingData(false)
    if (error) {
      console.error('Fout bij ophalen reserveringen:', error)
      setFetchError('Reserveringen konden niet worden geladen. Controleer uw verbinding.')
      return
    }
    setReservations((data as Reservation[]) ?? [])
  }, [filterDate, allDates])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('reservations-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reservations' }, () => {
        fetchReservations()
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchReservations])

  const handleAnnuleren = async (r: Reservation) => {
    setActionLoading((prev) => ({ ...prev, [r.id]: 'annuleren' }))
    const { error } = await supabase.from('reservations').update({ status: 'geannuleerd' }).eq('id', r.id)
    if (!error) {
      sendCancellationEmail({ name: r.name, email: r.email, date: r.date, time: r.time })
      setReservations((prev) => prev.map((item) => item.id === r.id ? { ...item, status: 'geannuleerd' } : item))
    } else {
      console.error('Fout bij annuleren:', error)
    }
    setActionLoading((prev) => ({ ...prev, [r.id]: null }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const colSpan = allDates ? 9 : 8

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-foreground text-primary-foreground flex flex-col shrink-0">
        <div className="p-6 border-b border-primary-foreground/20">
          <h1 className="font-serif text-lg leading-tight">Den Witten Haen</h1>
          <p className="font-sans text-xs opacity-60 mt-1">Reserveringsbeheer</p>
        </div>
        <nav className="flex-1 p-4">
          <div className="text-sm font-sans font-medium opacity-90 px-3 py-2 rounded bg-primary-foreground/10">
            Reserveringen
          </div>
        </nav>
        <div className="p-4 border-t border-primary-foreground/20">
          <button
            onClick={handleLogout}
            className="w-full text-left text-sm font-sans opacity-70 hover:opacity-100 px-3 py-2 transition-opacity"
          >
            Uitloggen
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">

          {/* Header row */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <h2 className="font-serif text-2xl text-foreground">Reserveringen</h2>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              {/* All-dates toggle */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={allDates}
                  onChange={(e) => setAllDates(e.target.checked)}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-sm font-sans text-muted-foreground whitespace-nowrap">Alle datums</span>
              </label>

              {/* Date picker — hidden when allDates */}
              {!allDates && (
                <>
                  <label htmlFor="filter-date" className="text-sm font-sans text-muted-foreground whitespace-nowrap">
                    Datum:
                  </label>
                  <input
                    id="filter-date"
                    type="date"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
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

          {/* Error */}
          {fetchError && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/30 text-destructive text-sm font-sans">
              {fetchError}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  {allDates && (
                    <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Datum</th>
                  )}
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
                  <tr>
                    <td colSpan={colSpan} className="px-4 py-10 text-center text-sm font-sans text-muted-foreground">
                      Laden…
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan={colSpan} className="px-4 py-10 text-center text-sm font-sans text-muted-foreground">
                      {allDates
                        ? 'Nog geen reserveringen.'
                        : `Geen reserveringen voor ${fmtDate(filterDate)}.`}
                    </td>
                  </tr>
                ) : (
                  reservations.map((r) => {
                    const busy = actionLoading[r.id]
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        {allDates && (
                          <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">
                            {fmtDate(r.date)}
                          </td>
                        )}
                        <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">{r.time}</td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground">{r.name}</td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground">
                          <a href={`mailto:${r.email}`} className="hover:underline text-primary">{r.email}</a>
                        </td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">{r.phone}</td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground text-center">{r.guests}</td>
                        <td className="px-4 py-3 text-sm font-sans text-muted-foreground max-w-[180px] truncate">
                          {r.message || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
