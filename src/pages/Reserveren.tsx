import ReservationForm from '@/components/ReservationForm'
import { PHONE_HREF, PHONE_NUMBER } from '@/lib/reservations'

const ReservationPage = () => (
  <main className="pt-24 pb-10 sm:pb-20">
    <div className="container mx-auto px-4 max-w-lg">
      <div className="bg-card border border-border rounded-lg p-5 sm:p-8 shadow-sm">
        <h1 className="font-serif text-2xl sm:text-3xl mb-1.5 sm:mb-2 text-foreground">Reserveren</h1>
        <p className="font-sans text-sm text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
          Vul het formulier in en wij bevestigen uw reservering per e-mail. Liever even bellen? Dat
          kan op <a href={PHONE_HREF} className="underline hover:text-foreground">{PHONE_NUMBER}</a>.
        </p>
        <ReservationForm variant="page" />
      </div>
    </div>
  </main>
)

export default ReservationPage
