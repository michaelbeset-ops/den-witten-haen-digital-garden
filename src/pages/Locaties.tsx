import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ADDRESS_CITY,
  ADDRESS_STREET,
  EMAIL_ADDRESS,
  MAPS_URL,
  PHONE_HREF,
  PHONE_NUMBER,
} from "@/lib/reservations";

import gevelImage from "@/assets/pand-groenmarkt.jpg";

const spaces = [
  {
    name: "De lunchroom",
    desc: "Onze gezellige lunchroom in een monumentaal pand, waar u terecht kunt voor koffie, lunch en high tea.",
  },
  {
    name: "De stadstuin en het terras",
    desc: "Een verborgen tuin achter het pand, met de oudste beuk van Dordrecht. Bij mooi weer zit u hier buiten.",
  },
  {
    name: "De zalen",
    desc: "Drie monumentale zalen voor groepen, vergaderingen en feesten, inclusief catering.",
  },
];

const LocationsPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl mb-3">Waar u ons vindt</h1>
      <p className="text-muted-foreground font-sans leading-relaxed mb-10 max-w-xl">
        Den Witten Haen ligt aan de Groenmarkt, midden in het historische centrum van Dordrecht.
        Alles zit onder één dak: de lunchroom, de zalen en de stadstuin.
      </p>

      <div className="rounded-lg overflow-hidden shadow-lg mb-10">
        <img
          src={gevelImage}
          alt="Het pand van Den Witten Haen aan de Groenmarkt in Dordrecht"
          className="w-full h-56 sm:h-72 md:h-96 object-cover"
          width={1600}
          height={1200}
        />
      </div>

      {/* Praktische gegevens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 border-y border-border py-8 mb-10">
        <div>
          <h2 className="text-xs font-sans uppercase tracking-wide text-muted-foreground mb-2">Adres</h2>
          <p className="font-sans text-sm text-foreground leading-relaxed">
            {ADDRESS_STREET}
            <br />
            {ADDRESS_CITY}
          </p>
          <a
            href={MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-sm text-primary font-sans underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Routebeschrijving
          </a>
        </div>

        <div>
          <h2 className="text-xs font-sans uppercase tracking-wide text-muted-foreground mb-2">Openingstijden</h2>
          <p className="font-sans text-sm text-foreground leading-relaxed">
            Maandag t/m vrijdag 10:00 tot 16:00
            <br />
            Zaterdag 10:00 tot 17:00
            <br />
            Zondag gesloten
          </p>
        </div>

        <div>
          <h2 className="text-xs font-sans uppercase tracking-wide text-muted-foreground mb-2">Contact</h2>
          <p className="font-sans text-sm text-foreground leading-relaxed">
            <a href={PHONE_HREF} className="hover:text-primary transition-colors">{PHONE_NUMBER}</a>
            <br />
            <a href={`mailto:${EMAIL_ADDRESS}`} className="hover:text-primary transition-colors break-all">
              {EMAIL_ADDRESS}
            </a>
          </p>
        </div>
      </div>

      {/* Wat u bij ons vindt */}
      <h2 className="font-serif text-2xl md:text-3xl mb-6">Wat u bij ons vindt</h2>
      <div className="divide-y divide-border border-y border-border mb-10">
        {spaces.map((s) => (
          <div key={s.name} className="py-6 sm:flex sm:gap-8">
            <h3 className="font-serif text-xl leading-snug sm:w-56 shrink-0 mb-1 sm:mb-0">{s.name}</h3>
            <p className="text-sm text-muted-foreground font-sans leading-relaxed sm:pt-1">{s.desc}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/reserveren" className="w-full sm:w-auto">
          <Button variant="hero" size="lg" className="w-full sm:w-auto">Reserveren</Button>
        </Link>
        <Link to="/groepen" className="w-full sm:w-auto">
          <Button variant="outline" size="lg" className="w-full sm:w-auto">Groepen &amp; Vergaderen</Button>
        </Link>
      </div>
    </div>
  </main>
);

export default LocationsPage;
