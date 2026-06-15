import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, TreePine, Heart, Star, ChevronRight, ArrowRight } from "lucide-react";

import heroImage from "@/assets/hero-interior.png";
import gardenImage from "@/assets/garden-tuin.png";
import teamImage from "@/assets/team.png";

const specialties = [
  { name: "Flammkuchen", desc: "Spek · roomkaas · mozzarella · rode ui", tag: "Populair" },
  { name: "High Tea", desc: "Zoete & hartige lekkernijen, scones & thee", tag: "Aanrader" },
  { name: "Club Sandwich", desc: "Spek · kip · ei · sriracha mayo", tag: "Favoriet" },
  { name: "Tosti van Gogh", desc: "Brie · walnoten · honing", tag: "Vega" },
  { name: "Tonijn Salade", desc: "Sla · cherry tomaat · ei · olijf · vinaigrette", tag: "Vers" },
  { name: "Soep van de dag", desc: "Vraag naar ons aanbod van de dag", tag: "Huisgemaakt" },
  { name: "Uitsmijter Den Witten Haen", desc: "Bruin brood · 3 eieren · ham, kaas of spek", tag: "Klassiek" },
];

const reviews = [
  { quote: "Wij hadden een baby shower met 17 mensen. Wauw het was zoo goed geregeld. Een aparte ruimte, authentiek zaaltje, erg mooi aangekleed.", name: "An Rijswijk", stars: 5 },
  { quote: "Verse ingrediënten, lekkere gerechten en zeer vriendelijke mensen vind je in dit Sociaal restaurant.", name: "Stephan Dijkstra", stars: 5 },
  { quote: "Per toeval kwamen we hier tijdens ons zussendagje. En wat een cadeautje deze plek. Personeel is top en ook de gerechten en heerlijke cappuccino.", name: "Annemarieke", stars: 5 },
  { quote: "Fijne en ongedwongen plek waar je je welkom voelt. Gewoon lekker eten, veel variatie op de lunchkaart in hartje binnenstad.", name: "Robert Snel", stars: 5 },
  { quote: "Heerlijke plek voor lunch of high tea.", name: "Elvy Barbar", stars: 5 },
  { quote: "Fijne locatie om te vergaderen en lunchen. Mooie toegevoegde waarde is het personeel!", name: "Edwin Buwalda", stars: 5 },
  { quote: "Hier heerlijk gegeten. Mooie tuin/terras. Binnen is er een prachtig interieur.", name: "Virginia Freeth", stars: 4 },
  { quote: "Ik ga hier regelmatig eten. Het eten is echt heerlijk, ben verkocht!", name: "Angelique Van der Schulp", stars: 5 },
  { quote: "We hebben een leuk feest gegeven in één van de mooie zalen. De vegetarische hapjes waren heerlijk en de bediening was voortreffelijk.", name: "Wytske de Haan", stars: 5 },
  { quote: "Vanmiddag een high tea afgehaald voor 5 personen waarvan 1 glutenvrij. Vers, lekker en ook de glutenvrije hapjes waren gevarieerd. Erg genoten!", name: "Y. Worms", stars: 5 },
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
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="rounded-xl overflow-hidden border border-border shadow-sm order-first">
              <img src={teamImage} alt="Het team van Den Witten Haen" className="w-full h-[420px] object-cover object-bottom" />
            </div>
            <div>
              <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">De mensen achter</p>
              <h2 className="font-serif text-3xl md:text-4xl mb-4">Ons Team</h2>
              <p className="text-muted-foreground font-sans leading-relaxed mb-6">
                Bij Den Witten Haen werken mensen met een beperking met hart en ziel aan uw ervaring.
                Ons team maakt van elk bezoek iets bijzonders — met warmte, aandacht en oprechte gastvrijheid.
              </p>
              <Link to="/team">
                <Button variant="outline" className="rounded-full gap-2">
                  Ontmoet ons team <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Over Den Witten Haen */}
      <section id="over-ons" className="pt-10 pb-20">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">Ons verhaal</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Over Den Witten Haen</h2>
            <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
              <p>
                In het historische centrum van Dordrecht ligt Den Witten Haen — een lunchroom
                in een monumentaal pand met een verborgen stadstuin en de oudste beuk van Dordrecht.
              </p>
              <p className="hidden md:block">
                Bij ons werken mensen met een beperking met hart en ziel aan uw ervaring.
                Dat maakt Den Witten Haen niet alleen een plek om te eten, maar een plek om u
                thuis te voelen. Wij geloven dat gastvrijheid het mooiste is wanneer het van
                binnenuit komt.
              </p>
              <p className="hidden md:block">
                Den Witten Haen is onderdeel van Philadelphia, een organisatie die mensen met een
                beperking ondersteunt om het beste uit zichzelf te halen. Samen creëren wij een
                plek waar iedereen welkom is.
              </p>
            </div>
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
                    <Star key={j} className={`w-3 h-3 ${j < r.stars ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} />
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
