import { useState, useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { CalendarDays, X } from 'lucide-react'
import ReservationForm from '@/components/ReservationForm'

/**
 * Zwevende reserveerknop met een paneel. Het paneel toont exact hetzelfde
 * formulier als de pagina /reserveren.
 */
const ReservationPopup = () => {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  // Sluiten met Escape.
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  // Sluiten zodra er genavigeerd wordt.
  useEffect(() => { setOpen(false) }, [location.pathname])

  // Achtergrond vastzetten zolang het paneel open is. Alleen `overflow: hidden`
  // op <body> is onbetrouwbaar in Safari op iOS, dus pinnen we de pagina vast
  // en zetten we de scrollpositie bij het sluiten terug.
  // Bewust tijdens de render bijgewerkt: het opruimen van het effect hieronder
  // loopt vóór de effecten van de nieuwe render.
  const pathRef = useRef(location.pathname)
  pathRef.current = location.pathname

  useEffect(() => {
    if (!open) return
    const lockedPath = location.pathname
    const scrollY = window.scrollY
    const { style } = document.body
    const prev = { position: style.position, top: style.top, left: style.left, right: style.right, width: style.width }
    style.position = 'fixed'
    style.top = `-${scrollY}px`
    style.left = '0'
    style.right = '0'
    style.width = '100%'
    return () => {
      const html = document.documentElement
      const vorigeBehavior = html.style.scrollBehavior
      html.style.scrollBehavior = 'auto'

      style.position = prev.position
      style.top = prev.top
      style.left = prev.left
      style.right = prev.right
      style.width = prev.width

      // Niet terugspringen naar de oude positie als je inmiddels op een andere
      // pagina bent: dan hoor je bovenaan te beginnen.
      if (pathRef.current === lockedPath) {
        void document.body.offsetHeight
        window.scrollTo(0, scrollY)
      }
      html.style.scrollBehavior = vorigeBehavior
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Op de reserveringspagina zelf heeft de knop geen functie.
  if (location.pathname.replace(/\/+$/, '').endsWith('/reserveren')) return null

  return (
    <>
      {/* Zwevende knop: alleen op desktop. Op mobiel staat er al een
          reserveerknop in de balk bovenaan. */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Reservering maken"
        className="fixed bottom-6 right-6 z-40 hidden md:flex items-center gap-2 bg-primary text-primary-foreground px-5 py-3 rounded-full shadow-lg hover:bg-primary/90 transition-all hover:scale-105 font-sans font-medium text-sm"
      >
        <CalendarDays size={18} />
        Reserveren
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-foreground/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reservering maken"
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-50 w-full sm:w-[420px] h-full sm:h-auto sm:max-h-[90vh] bg-card border-0 sm:border border-border rounded-none sm:rounded-2xl shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
            <div>
              <h2 className="font-serif text-xl text-foreground">Reserveren</h2>
              <p className="font-sans text-xs text-muted-foreground mt-0.5">Den Witten Haen, Dordrecht</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5">
            <ReservationForm variant="popup" onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}

export default ReservationPopup
