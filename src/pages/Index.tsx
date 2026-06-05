import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, TreePine, Heart, Star, ChevronRight, ArrowRight } from "lucide-react";
import { useState } from "react";
import heroImage from "@/assets/hero-interior.png";
import gardenImage from "@/assets/garden-tuin.png";
import teamImage from "@/assets/team.png";

const specialties = [
  { name: "Clubsandwich", desc: "Kip, bacon, sla, tomaat & ei", tag: "Populair" },
  { name: "High Tea Klassiek", desc: "Zoet & hartig assortiment met thee", tag: "Aanrader" },
  { name: "Quiche du Jour", desc: "Dagverse quiche met salade", tag: "Huisgemaakt" },
  { name: "Tomatensoep", desc: "Huisgemaakt met balletjes", tag: "Klassieker" },
  { name: "Broodje Carpaccio", desc: "Rucola, parmezaan, truffelmayo", tag: "Favoriet" },
  { name: "Huislimonade", desc: "Seizoensgebonden smaak", tag: "Verfrissend" },
  { name: "High Tea Deluxe", desc: "Uitgebreid, met prosecco", tag: "Premium" },
];

const reviews = [
  { quote: "Verse ingrediënten, lekkere gerechten en zeer vriendelijke mensen.", name: "Stephan D." },
  { quote: "Per toeval kwamen we hier. Wat een cadeautje deze plek.", name: "Annemarieke" },
  { quote: "Heerlijke plek voor lunch of high tea. Geweldig!", name: "Elvy B." },
  { quote: "Fijne en ongedwongen plek waar je je welkom voelt.", name: "Robert S." },
  { quote: "Babyshower met 17 mensen. Wauw, zo goed geregeld.", name: "An R." },
];

const team = [
  { name: "Het team", role: "Met hart en ziel", desc: "Ons team bestaat uit enthousiaste medewerkers die met plezier en toewijding voor u klaarstaan." },
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
      <section className="py-14 bg-card overflow-hidden">
        <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-8 px-6 pb-2 md:grid md:grid-cols-3 md:overflow-visible md:container md:mx-auto md:px-4 md:pb-0">
          {usps.map((usp) => (
            <div key={usp.title} className="text-center shrink-0 w-64 snap-center md:w-auto md:shrink">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-3">
                <usp.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-serif text-lg mb-1">{usp.title}</h3>
              <p className="text-muted-foreground text-sm font-sans">{usp.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Menu highlights – horizontaal scrollbaar */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-8">
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
                className="w-64 shrink-0 bg-card rounded-lg border border-border p-5 hover:shadow-md transition-shadow"
              >
                <span className="inline-block text-xs font-sans font-medium text-primary bg-primary/10 rounded-full px-2.5 py-0.5 mb-3">
                  {item.tag}
                </span>
                <h3 className="font-serif text-lg mb-1">{item.name}</h3>
                <p className="text-sm text-muted-foreground font-sans">{item.desc}</p>
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
      <section className="pt-20 pb-10 bg-card">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10">
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">De mensen achter</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Ons Team</h2>
            <p className="text-muted-foreground font-sans leading-relaxed max-w-2xl mx-auto">
              Bij Den Witten Haen werken mensen met een beperking met hart en ziel aan uw ervaring.
              Ons team maakt van elk bezoek iets bijzonders — met warmte, aandacht en oprechte gastvrijheid.
            </p>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-sm mb-8">
            <img src={teamImage} alt="Het team van Den Witten Haen" className="w-full h-80 object-cover" />
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

      {/* Over Den Witten Haen – kort + tabs */}
      <section id="over-ons" className="pt-10 pb-20">
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
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                In het kort
              </button>
              <button
                onClick={() => setActiveTab("meer")}
                className={`px-4 py-2 text-sm font-sans transition-colors border-b-2 -mb-px ${
                  activeTab === "meer"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                Lees meer
              </button>
            </div>

            {activeTab === "kort" ? (
              <p className="text-muted-foreground font-sans leading-relaxed">
                Den Witten Haen is een lunchroom in een monumentaal pand in het centrum van Dordrecht, 
                met een verborgen stadstuin en een warm, inclusief team.
              </p>
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
          <div className="rounded-lg overflow-hidden shadow-lg">
            <img
              src={gardenImage}
              alt="De tuin van Den Witten Haen"
              className="w-full h-80 object-cover"
              loading="lazy"
              width={800}
              height={600}
            />
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
