import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, type Reservation } from '@/lib/supabase'
import { sendConfirmationEmail, sendCancellationEmail } from '@/lib/email'

const todayStr = () => new Date().toISOString().split('T')[0]

type ActionLoading = Record<string, 'bevestigen' | 'annuleren' | null>

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
    <span
      className={`text-xs font-sans font-medium px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {labels[status]}
    </span>
  )
}

const Dashboard = () => {
  const navigate = useNavigate()
  const [filterDate, setFilterDate] = useState(todayStr())
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const [actionLoading, setActionLoading] = useState<ActionLoading>({})

  const fetchReservations = useCallback(async () => {
    setLoadingData(true)
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('date', filterDate)
      .order('time')
    setLoadingData(false)
    if (error) {
      console.error('Fout bij ophalen reserveringen:', error)
      return
    }
    setReservations((data as Reservation[]) ?? [])
  }, [filterDate])

  useEffect(() => {
    fetchReservations()
  }, [fetchReservations])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('reservations-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reservations' },
        () => {
          fetchReservations()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchReservations])

  const handleBevestigen = async (r: Reservation) => {
    setActionLoading((prev) => ({ ...prev, [r.id]: 'bevestigen' }))
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'bevestigd' })
      .eq('id', r.id)
    if (!error) {
      sendConfirmationEmail({
        name: r.name,
        email: r.email,
        date: r.date,
        time: r.time,
        guests: r.guests,
      })
      setReservations((prev) =>
        prev.map((item) =>
          item.id === r.id ? { ...item, status: 'bevestigd' } : item
        )
      )
    } else {
      console.error('Fout bij bevestigen:', error)
    }
    setActionLoading((prev) => ({ ...prev, [r.id]: null }))
  }

  const handleAnnuleren = async (r: Reservation) => {
    setActionLoading((prev) => ({ ...prev, [r.id]: 'annuleren' }))
    const { error } = await supabase
      .from('reservations')
      .update({ status: 'geannuleerd' })
      .eq('id', r.id)
    if (!error) {
      sendCancellationEmail({
        name: r.name,
        email: r.email,
        date: r.date,
        time: r.time,
      })
      setReservations((prev) =>
        prev.map((item) =>
          item.id === r.id ? { ...item, status: 'geannuleerd' } : item
        )
      )
    } else {
      console.error('Fout bij annuleren:', error)
    }
    setActionLoading((prev) => ({ ...prev, [r.id]: null }))
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

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
          <div className="flex items-center gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl text-foreground">Reserveringen</h2>
            </div>
            <div className="ml-auto flex items-center gap-3">
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
              {!loadingData && (
                <span className="text-sm font-sans text-muted-foreground whitespace-nowrap">
                  {reservations.length} {reservations.length === 1 ? 'reservering' : 'reserveringen'}
                </span>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Tijd</th>
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Naam</th>
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">E-mail</th>
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Telefoon</th>
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Personen</th>
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Opmerking</th>
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Status</th>
                  <th className="text-xs font-sans uppercase text-muted-foreground text-left px-4 py-3">Acties</th>
                </tr>
              </thead>
              <tbody>
                {loadingData ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm font-sans text-muted-foreground">
                      Laden...
                    </td>
                  </tr>
                ) : reservations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm font-sans text-muted-foreground">
                      Geen reserveringen voor deze datum.
                    </td>
                  </tr>
                ) : (
                  reservations.map((r) => {
                    const busy = actionLoading[r.id]
                    return (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">
                          {r.time}
                        </td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground">
                          {r.name}
                        </td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground">
                          <a
                            href={`mailto:${r.email}`}
                            className="hover:underline text-primary"
                          >
                            {r.email}
                          </a>
                        </td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground whitespace-nowrap">
                          {r.phone}
                        </td>
                        <td className="px-4 py-3 text-sm font-sans text-foreground text-center">
                          {r.guests}
                        </td>
                        <td className="px-4 py-3 text-sm font-sans text-muted-foreground max-w-[200px] truncate">
                          {r.message || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={r.status} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {r.status !== 'bevestigd' && r.status !== 'geannuleerd' && (
                              <button
                                onClick={() => handleBevestigen(r)}
                                disabled={!!busy}
                                className="text-xs font-sans font-medium px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                              >
                                {busy === 'bevestigen' ? 'Bezig...' : 'Bevestigen'}
                              </button>
                            )}
                            {r.status !== 'geannuleerd' && (
                              <button
                                onClick={() => handleAnnuleren(r)}
                                disabled={!!busy}
                                className="text-xs font-sans font-medium px-3 py-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                              >
                                {busy === 'annuleren' ? 'Bezig...' : 'Annuleren'}
                              </button>
                            )}
                          </div>
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
