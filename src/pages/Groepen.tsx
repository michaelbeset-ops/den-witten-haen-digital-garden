import { Landmark, Users, Phone, CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

import zaalFeest from "@/assets/zaal-feest.jpg";
import zaalHighTea from "@/assets/zaal-hightea.jpg";
import zaalVergadering from "@/assets/zaal-vergadering.jpg";

const features = [
  {
    icon: Users,
    title: "High Tea",
    desc: "Geniet van een uitgebreide high tea met vriendinnen, familie of collega's in onze sfeervolle ruimtes.",
    image: zaalHighTea,
  },
  {
    icon: Landmark,
    title: "Vergaderingen",
    desc: "Vergader in een inspirerende historische omgeving met uitstekende catering en alle faciliteiten.",
    image: zaalVergadering,
  },
  {
    icon: Users,
    title: "Feesten & Partijen",
    desc: "Vier uw verjaardag, babyshower of ander feest bij ons. Wij verzorgen alles tot in de puntjes.",
    image: zaalFeest,
  },
];

const GroupsPage = () => (
  <main>
    {/* Hero – sfeervolle zaal */}
    <section className="relative min-h-[60vh] flex items-center justify-center pt-24 overflow-hidden">
      <img
        src={zaalFeest}
        alt="Feestelijk gedekte zaal bij Den Witten Haen"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-foreground/55" />
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto py-16">
        <p className="text-primary-foreground/70 font-sans text-sm tracking-widest uppercase mb-4">Uw evenement bij Den Witten Haen</p>
        <h1 className="font-serif text-4xl md:text-6xl text-primary-foreground mb-5 leading-tight">Groepen & Vergaderen</h1>
        <p className="text-primary-foreground/85 text-lg font-sans leading-relaxed max-w-xl mx-auto">
          De perfecte locatie voor grotere gezelschappen. Of het nu gaat om een vergadering,
          high tea of feest — in onze monumentale zalen maken wij er iets bijzonders van.
        </p>
      </div>
    </section>

    {/* Mogelijkheden – beeldkaarten */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={f.image}
                  alt={`${f.title} bij Den Witten Haen`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex-1">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-xl mb-2">{f.title}</h2>
                <p className="text-muted-foreground text-sm font-sans leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact / aanvraag */}
        <div className="bg-card rounded-lg p-8 border border-border text-center mt-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Phone className="w-7 h-7 text-primary" />
          </div>
          <h2 className="font-serif text-2xl mb-3">Neem contact op</h2>
          <p className="text-muted-foreground font-sans text-sm mb-2 max-w-md mx-auto">
            Voor grotere groepen, vergaderingen en feesten plannen wij de reservering persoonlijk in.
            Stuur online een vrijblijvende aanvraag via het reserveringsformulier — vul uw gegevens en
            gewenste datum in en wij nemen contact met u op. Liever direct overleggen? Bel ons gerust.
          </p>
          <p className="font-serif text-lg text-foreground mb-6">078 611 20 50</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/reserveren">
              <Button variant="hero" size="lg" className="gap-2 w-full sm:w-auto">
                <CalendarDays className="w-4 h-4" /> Aanvraag versturen
              </Button>
            </Link>
            <a href="tel:0786112050">
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <Phone className="w-4 h-4" /> Bel ons
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default GroupsPage;
