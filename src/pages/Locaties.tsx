import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Den+Witten+Haen+Groenmarkt+19-B+Dordrecht";

const locations = [
  {
    name: "Den Witten Haen – Lunchroom & stadstuin",
    desc: "Onze gezellige lunchroom in een monumentaal pand in het hart van Dordrecht, met een verborgen stadstuin en terras.",
  },
  {
    name: "Den Witten Haen – Zalen voor groepen & vergaderen",
    desc: "Inspirerende zalen in historische sfeer voor vergaderingen, high tea's en feesten, inclusief catering. In hetzelfde pand.",
  },
];

const LocationsPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Onze Locatie in Dordrecht</h1>
      <p className="text-center text-muted-foreground font-sans mb-10 max-w-xl mx-auto">
        U vindt ons aan de Groenmarkt, midden in het historische centrum van Dordrecht.
      </p>

      <div className="bg-card rounded-lg p-6 border border-border mb-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm font-sans">
        <div className="flex gap-3 items-start">
          <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Adres</p>
            <p className="text-muted-foreground">Groenmarkt 19-B<br />3311 BD Dordrecht</p>
            <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline mt-2">
              Routebeschrijving <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <Clock className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Openingstijden</p>
            <p className="text-muted-foreground">Ma t/m vr: 10:00 – 16:00<br />Za: 10:00 – 17:00<br />Zo: gesloten</p>
          </div>
        </div>
        <div className="flex gap-3 items-start">
          <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-foreground mb-1">Contact</p>
            <p className="text-muted-foreground">
              <a href="tel:0786112050" className="hover:text-foreground">078 611 20 50</a><br />
              <a href="mailto:denwittenhaen@philadelphia.nl" className="hover:text-foreground break-all">denwittenhaen@philadelphia.nl</a>
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {locations.map((loc) => (
          <div key={loc.name} className="bg-card rounded-lg p-6 border border-border flex gap-4 items-start">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-xl mb-1">{loc.name}</h2>
              <p className="text-sm text-muted-foreground font-sans">{loc.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
        <Link to="/reserveren"><Button variant="hero" size="lg" className="w-full sm:w-auto">Reserveren</Button></Link>
        <Link to="/groepen"><Button variant="outline" size="lg" className="w-full sm:w-auto">Groepen & Vergaderen</Button></Link>
      </div>
    </div>
  </main>
);

export default LocationsPage;
