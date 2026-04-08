import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const timeSlots = Array.from({ length: 13 }, (_, i) => {
  const hour = 10 + Math.floor(i / 2);
  const min = i % 2 === 0 ? "00" : "30";
  return `${hour}:${min}`;
});

const occasions = ["Lunch", "High Tea", "Verjaardag", "Babyshower", "Vergadering", "Bedrijfsevenement", "Anders"];

const ReservationPage = () => {
  const [date, setDate] = useState<Date>();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      toast.success("Uw reservering is verstuurd! We nemen zo snel mogelijk contact met u op.");
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      setDate(undefined);
    }, 1000);
  };

  return (
    <main className="pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-xl">
        <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Reserveren</h1>
        <p className="text-center text-muted-foreground font-sans mb-10">
          Vul het formulier in en wij bevestigen uw reservering zo snel mogelijk per e-mail of telefoon.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="name">Naam *</Label>
            <Input id="name" name="name" required maxLength={100} placeholder="Uw volledige naam" />
          </div>

          <div>
            <Label htmlFor="email">E-mailadres *</Label>
            <Input id="email" name="email" type="email" required maxLength={255} placeholder="naam@voorbeeld.nl" />
          </div>

          <div>
            <Label htmlFor="phone">Telefoonnummer *</Label>
            <Input id="phone" name="phone" type="tel" required placeholder="06 – 00 00 00 00" />
          </div>

          <div>
            <Label>Datum *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP", { locale: nl }) : "Kies een datum"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => d < new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Tijdstip *</Label>
            <Select name="time" required>
              <SelectTrigger>
                <SelectValue placeholder="Kies een tijdstip" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="guests">Aantal personen *</Label>
            <Input id="guests" name="guests" type="number" required min={1} max={50} placeholder="Aantal" />
          </div>

          <div>
            <Label>Gelegenheid</Label>
            <Select name="occasion">
              <SelectTrigger>
                <SelectValue placeholder="Selecteer een gelegenheid" />
              </SelectTrigger>
              <SelectContent>
                {occasions.map((o) => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="remarks">Dieetwensen / opmerkingen</Label>
            <Textarea id="remarks" name="remarks" maxLength={1000} placeholder="Laat ons weten als u speciale wensen heeft..." rows={4} />
          </div>

          <Button type="submit" variant="hero" size="lg" className="w-full" disabled={submitting}>
            {submitting ? "Verzenden..." : "Verstuur reservering"}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We bevestigen uw reservering zo snel mogelijk per e-mail of telefoon.
          </p>
        </form>
      </div>
    </main>
  );
};

export default ReservationPage;
