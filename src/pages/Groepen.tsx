import { Landmark, Users, PartyPopper, UtensilsCrossed, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const GroupsPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-4xl">
      <p className="text-sm text-primary font-sans uppercase tracking-wide mb-2 text-center">Voor groepen & evenementen</p>
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Groepen & Vergaderen</h1>
      <p className="text-center text-muted-foreground font-sans mb-14 max-w-xl mx-auto leading-relaxed">
        Den Witten Haen is de perfecte locatie voor grotere gezelschappen.
        Of het nu gaat om een vergadering, high tea of feest — wij maken er iets bijzonders van.
      </p>

      {/* Krakel- & Kraailunch */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h2 className="font-serif text-2xl">Krakel- & Kraailunch</h2>
            <p className="text-xs text-amber-700 font-sans uppercase tracking-wide">Voor groepen vanaf 10 personen</p>
          </div>
        </div>
        <p className="text-muted-foreground font-sans leading-relaxed mb-8">
          Voor groepen groter dan 10 personen hebben wij een aangepast assortiment. Een heerlijke lunch
          tijdens uw training of vergadering, of gewoon lekker na een wandeling door het prachtige Dordrecht.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-amber-200 p-7">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-serif text-xl">Kakellunch</h3>
              <span className="font-serif text-xl font-semibold text-amber-700">€ 15,00 <span className="text-sm font-sans font-normal text-muted-foreground">p.p.</span></span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground font-sans">
              <li className="flex gap-2"><span className="text-amber-600">•</span> Vooraf een kop verse soep</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Diverse luxe belegde broodjes & sandwiches</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Onbeperkt melk, karnemelk & jus d'orange</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Vers fruit als afsluiter</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Koffie of thee</li>
            </ul>
          </div>
          <div className="bg-card rounded-xl border border-amber-200 p-7">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-serif text-xl">Kraailunch</h3>
              <span className="font-serif text-xl font-semibold text-amber-700">€ 17,50 <span className="text-sm font-sans font-normal text-muted-foreground">p.p.</span></span>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground font-sans">
              <li className="flex gap-2"><span className="text-amber-600">•</span> Vooraf een kop soep</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Diverse luxe belegde broodjes & sandwiches</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Een warme snack</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Onbeperkt melk, karnemelk & jus d'orange</li>
              <li className="flex gap-2"><span className="text-amber-600">•</span> Vers fruit & koffie of thee</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Overige opties */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 mb-4">
            <Users className="w-6 h-6 text-rose-600" />
          </div>
          <h3 className="font-serif text-lg mb-2">High Tea</h3>
          <p className="text-muted-foreground text-sm font-sans leading-relaxed">
            Uitgebreide high tea voor groepen — zoet, hartig en met een glas prosecco.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
            <Landmark className="w-6 h-6 text-primary" />
          </div>
          <h3 className="font-serif text-lg mb-2">Vergaderingen</h3>
          <p className="text-muted-foreground text-sm font-sans leading-relaxed">
            Vergader in een inspirerende historische omgeving met uitstekende catering.
          </p>
        </div>
        <div className="bg-card rounded-xl border border-border p-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-100 mb-4">
            <PartyPopper className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="font-serif text-lg mb-2">Feesten & Partijen</h3>
          <p className="text-muted-foreground text-sm font-sans leading-relaxed">
            Verjaardagen, babyshowers, jubilea — wij verzorgen alles tot in de puntjes.
          </p>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-primary/5 rounded-2xl p-8 border border-primary/15 text-center">
        <h2 className="font-serif text-2xl mb-2">Meer informatie of reserveren?</h2>
        <p className="text-muted-foreground font-sans text-sm mb-6 max-w-sm mx-auto">
          Neem vrijblijvend contact met ons op of maak direct een reservering.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="rounded-full gap-2">
            <a href="tel:0786112050"><Phone className="w-4 h-4" /> 078 – 611 20 50</a>
          </Button>
          <Button asChild variant="outline" className="rounded-full gap-2">
            <a href="mailto:denwittenhaen@philadelphia.nl"><Mail className="w-4 h-4" /> denwittenhaen@philadelphia.nl</a>
          </Button>
          <Link to="/reserveren">
            <Button variant="hero" className="rounded-full">Reservering aanvragen</Button>
          </Link>
        </div>
      </div>
    </div>
  </main>
);

export default GroupsPage;
