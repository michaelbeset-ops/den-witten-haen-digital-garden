import { Landmark, Users, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "High Tea",
    desc: "Geniet van een uitgebreide high tea met vriendinnen, familie of collega's in onze sfeervolle ruimtes.",
  },
  {
    icon: Landmark,
    title: "Vergaderingen",
    desc: "Vergader in een inspirerende historische omgeving met uitstekende catering en alle faciliteiten.",
  },
  {
    icon: Users,
    title: "Feesten & Partijen",
    desc: "Vier uw verjaardag, babyshower of ander feest bij ons. Wij verzorgen alles tot in de puntjes.",
  },
];

const GroupsPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Groepen & Vergaderen</h1>
      <p className="text-center text-muted-foreground font-sans mb-12 max-w-xl mx-auto">
        Den Witten Haen is de perfecte locatie voor grotere gezelschappen. 
        Of het nu gaat om een vergadering, high tea of feest — wij maken er iets bijzonders van.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {features.map((f) => (
          <div key={f.title} className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <f.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-serif text-xl mb-2">{f.title}</h3>
            <p className="text-muted-foreground text-sm font-sans">{f.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-card rounded-lg p-8 border border-border text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
          <Phone className="w-7 h-7 text-primary" />
        </div>
        <h2 className="font-serif text-2xl mb-3">Neem contact op</h2>
        <p className="text-muted-foreground font-sans text-sm mb-2 max-w-md mx-auto">
          Groepen, vergaderingen en feesten gaan niet via het online reserveringssysteem.
          Bel ons voor een vrijblijvend gesprek over de mogelijkheden.
        </p>
        <p className="font-serif text-lg text-foreground mb-6">078 611 20 50</p>
        <a href="tel:0786112050">
          <Button variant="hero" size="lg" className="gap-2">
            <Phone className="w-4 h-4" /> Bel ons
          </Button>
        </a>
      </div>
    </div>
  </main>
);

export default GroupsPage;
