import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, TreePine, Heart, Star, ChevronRight, ArrowRight, ChefHat, Coffee, Users } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-interior.jpg";
import gardenImage from "@/assets/garden.jpg";

const specialties = [
  { name: "Clubsandwich", desc: "Kip, bacon, sla, tomaat & ei", tag: "Populair", price: "€ 9,95", category: "Lunch" },
  { name: "High Tea Klassiek", desc: "Zoet & hartig assortiment met thee", tag: "Aanrader", price: "€ 24,95 p.p.", category: "High Tea" },
  { name: "Quiche du Jour", desc: "Dagverse quiche met salade & brood", tag: "Huisgemaakt", price: "€ 12,50", category: "Warm" },
  { name: "Tomatensoep", desc: "Huisgemaakt met gehaktballetjes", tag: "Klassieker", price: "€ 6,50", category: "Soep" },
  { name: "Broodje Carpaccio", desc: "Rucola, parmezaan, truffelmayonaise", tag: "Favoriet", price: "€ 10,50", category: "Lunch" },
  { name: "Uitsmijter", desc: "Met ham, kaas of beide, op ambachtelijk brood", tag: "Klassiek", price: "€ 9,95", category: "Warm" },
  { name: "Huislimonade", desc: "Vers gemaakt, seizoensgebonden smaak", tag: "Verfrissend", price: "€ 3,95", category: "Drank" },
  { name: "High Tea Deluxe", desc: "Uitgebreid assortiment met prosecco", tag: "Premium", price: "€ 32,50 p.p.", category: "High Tea" },
];

const categoryColors: Record<string, string> = {
  Lunch: "bg-amber-100 text-amber-800",
  "High Tea": "bg-rose-100 text-rose-800",
  Warm: "bg-orange-100 text-orange-800",
  Soep: "bg-red-100 text-red-800",
  Drank: "bg-sky-100 text-sky-800",
};

const reviews = [
  { quote: "Verse ingrediënten, lekkere gerechten en zeer vriendelijke mensen.", name: "Stephan D." },
  { quote: "Per toeval kwamen we hier. Wat een cadeautje deze plek.", name: "Annemarieke" },
  { quote: "Heerlijke plek voor lunch of high tea. Geweldig!", name: "Elvy B." },
  { quote: "Fijne en ongedwongen plek waar je je welkom voelt.", name: "Robert S." },
  { quote: "Babyshower met 17 mensen. Wauw, zo goed geregeld.", name: "An R." },
];

const teamRoles = [
  {
    icon: ChefHat,
    title: "Het Keukenteam",
    subtitle: "Onze koks",
    desc: "Met verse ingrediënten en veel liefde bereiden zij dagelijks de lekkerste gerechten — van ambachtelijke soep tot een rijkgevulde high tea.",
  },
  {
    icon: Coffee,
    title: "De Bediening",
    subtitle: "Uw gastheren & gastvrouwen",
    desc: "Altijd met een glimlach klaar om u te verwelkomen en een ongedwongen, hartelijke ervaring te bezorgen.",
  },
  {
    icon: Users,
    title: "De Begeleiders",
    subtitle: "Coaches & ondersteuning",
    desc: "Zij zorgen ervoor dat iedereen in ons team kan groeien, zijn talenten ontdekt en het beste uit zichzelf haalt.",
  },
];

const usps = [
  { icon: Landmark, title: "Monumentaal pand", desc: "Historisch pand in het hart van Dordrecht" },
  { icon: TreePine, title: "Verstopte stadstuin", desc: "Verborgen tuin met de oudste beuk van Dordrecht" },
  { icon: Heart, title: "Sociaal betrokken", desc: "Inclusieve werkplek met hart en ziel" },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState<"kort" | "meer">("kort");

  return (
    <main>
      {/* Hero – sfeer */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <img
          src={heroImage}
          alt="Sfeervolle interieur van Den Witten Haen"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-foreground/45" />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-primary-foreground/70 font-sans text-sm tracking-widest uppercase mb-4">Welkom bij</p>
          <h1 className="font-serif text-5xl md:text-7xl text-primary-foreground mb-6 leading-tight">
            Den Witten Haen
          </h1>
          <p className="text-primary-foreground/85 text-lg md:text-xl mb-8 font-sans leading-relaxed max-w-xl mx-auto">
            Lunch, high tea & meer — in het hart van Dordrecht
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/menu">
              <Button variant="hero" size="lg">Bekijk ons menu</Button>
            </Link>
            <Link to="/reserveren">
              <Button variant="heroOutline" size="lg" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
                Maak een reservering
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="py-14 bg-card">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          {usps.map((usp) => (
            <div key={usp.title} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <usp.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-1">{usp.title}</h3>
              <p className="text-muted-foreground text-sm font-sans">{usp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu highlights */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">Uit onze keuken</p>
              <h2 className="font-serif text-3xl md:text-4xl">Proef onze specialiteiten</h2>
            </div>
            <Link to="/menu" className="hidden sm:flex items-center gap-1 text-sm text-primary font-sans hover:underline">
              Volledig menu <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-5 px-4 md:px-[max(1rem,calc((100%-1400px)/2+1rem))] pb-4" style={{ minWidth: "max-content" }}>
            {specialties.map((item) => (
              <div
                key={item.name}
                className="w-72 shrink-0 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
              >
                <div className="px-5 pt-5 pb-4 flex-1">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="inline-block text-xs font-sans font-semibold text-primary bg-primary/10 rounded-full px-2.5 py-0.5">
                      {item.tag}
                    </span>
                    <span className={`inline-block text-xs font-sans font-medium rounded-full px-2.5 py-0.5 ${categoryColors[item.category] ?? "bg-muted text-muted-foreground"}`}>
                      {item.category}
                    </span>
                  </div>
                  <h3 className="font-serif text-xl mb-1.5">{item.name}</h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
                </div>
                <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                  <span className="font-serif text-lg font-semibold text-foreground">{item.price}</span>
                  <Link to="/menu">
                    <Button variant="ghost" size="sm" className="text-primary text-xs h-7 px-2 gap-1">
                      Meer info <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="container mx-auto px-4 mt-4 sm:hidden">
          <Link to="/menu" className="flex items-center gap-1 text-sm text-primary font-sans hover:underline">
            Bekijk het volledige menu <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Ons Team */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">De mensen achter</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Ons Team</h2>
            <p className="text-muted-foreground font-sans leading-relaxed max-w-xl mx-auto">
              Bij Den Witten Haen werken mensen met een beperking met hart en ziel.
              Samen vormen zij een hecht team dat gastvrijheid op de eerste plaats zet.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-10">
            {teamRoles.map((role) => (
              <div key={role.title} className="bg-background rounded-xl border border-border p-7 text-center hover:shadow-md transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
                  <role.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-serif text-xl mb-1">{role.title}</h3>
                <p className="text-xs text-primary font-sans uppercase tracking-wide mb-3">{role.subtitle}</p>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{role.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <Link to="/team">
              <Button variant="outline" className="rounded-full gap-2">
                Ontmoet ons team <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Over Den Witten Haen */}
      <section id="over-ons" className="py-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">Ons verhaal</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Over Den Witten Haen</h2>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 border-b border-border">
              <button
                onClick={() => setActiveTab("kort")}
                className={`px-4 py-2 text-sm font-sans transition-colors border-b-2 -mb-px ${
                  activeTab === "kort"
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                In het kort
              </button>
              <button
                onClick={() => setActiveTab("meer")}
                className={`px-4 py-2 text-sm font-sans transition-colors border-b-2 -mb-px ${
                  activeTab === "meer"
                    ? "border-primary text-foreground font-medium"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Lees meer
              </button>
            </div>

            {activeTab === "kort" ? (
              <div>
                <p className="text-4xl font-serif text-primary/30 leading-none mb-2">"</p>
                <p className="text-muted-foreground font-sans leading-relaxed text-base">
                  Den Witten Haen is een lunchroom in een monumentaal pand in het centrum van Dordrecht,
                  met een verborgen stadstuin en een warm, inclusief team.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3">
                  {usps.map((usp) => (
                    <div key={usp.title} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <usp.icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-sans font-medium">{usp.title}</span>
                        <span className="text-sm text-muted-foreground font-sans"> — {usp.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
                <p>
                  In het historische centrum van Dordrecht, verscholen achter eeuwenoude gevels,
                  ligt Den Witten Haen — een lunchroom met een bijzonder verhaal. Ons monumentale
                  pand herbergt niet alleen een prachtig interieur, maar ook een verborgen stadstuin
                  waar u in alle rust kunt genieten. De oudste beuk van Dordrecht is zelfs zichtbaar
                  vanuit onze binnentuin.
                </p>
                <p>
                  Bij ons werken mensen met een beperking met hart en ziel aan uw ervaring.
                  Dat maakt Den Witten Haen niet alleen een plek om te eten, maar een plek om u
                  thuis te voelen. Wij geloven dat gastvrijheid het mooiste is wanneer het van
                  binnenuit komt.
                </p>
                <p>
                  Den Witten Haen is onderdeel van Philadelphia, een organisatie die mensen met een
                  beperking ondersteunt om het beste uit zichzelf te halen. Samen creëren wij een
                  plek waar iedereen welkom is.
                </p>
              </div>
            )}
          </div>

          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img
                src={gardenImage}
                alt="De verborgen stadstuin van Den Witten Haen"
                className="w-full h-96 object-cover"
                loading="lazy"
                width={800}
                height={600}
              />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-card border border-border rounded-xl px-5 py-3 shadow-md">
              <p className="font-serif text-sm text-foreground">De verborgen stadstuin</p>
              <p className="text-xs text-muted-foreground font-sans">Oudste beuk van Dordrecht</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews – subtiel */}
      <section className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <p className="text-center text-xs text-muted-foreground font-sans uppercase tracking-wide mb-6">Ervaringen van onze gasten</p>
          <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-2">
            {reviews.map((r, i) => (
              <div key={i} className="shrink-0 w-72 flex flex-col gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-3 h-3 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground font-sans text-xs italic leading-relaxed">"{r.quote}"</p>
                <p className="font-sans text-xs font-medium">— {r.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;
