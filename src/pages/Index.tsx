import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

import heroImage from "@/assets/hero.jpg";
import terrasImage from "@/assets/buiten-terras.jpg";
import teamImage from "@/assets/team.jpg";

const specialties = [
  { name: "Flammkuchen", desc: "Spek, roomkaas, mozzarella en rode ui" },
  { name: "High tea", desc: "Zoete en hartige lekkernijen, scones en thee" },
  { name: "Club sandwich", desc: "Spek, kip, ei en sriracha mayonaise" },
  { name: "Tosti van Gogh", desc: "Brie, walnoten en honing" },
  { name: "Tonijnsalade", desc: "Sla, cherrytomaat, ei, olijf en vinaigrette" },
  { name: "Soep van de dag", desc: "Vraag naar ons aanbod van vandaag" },
  { name: "Uitsmijter Den Witten Haen", desc: "Bruin brood, drie eieren, ham, kaas of spek" },
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

const facts = [
  { title: "Monumentaal pand", desc: "In het historische centrum van Dordrecht" },
  { title: "Verborgen stadstuin", desc: "Met de oudste beuk van de stad" },
  { title: "Sociaal betrokken", desc: "Een inclusieve werkplek, onderdeel van Philadelphia" },
];

const Index = () => (
  <main>
    {/* Hero */}
    <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroImage}
        alt="Gedekte tafels en bloemen bij Den Witten Haen"
        className="absolute inset-0 w-full h-full object-cover"
        width={1200}
        height={1600}
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-foreground/45" />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <p className="text-primary-foreground/70 font-sans text-sm tracking-widest uppercase mb-4">Welkom bij</p>
        <h1 className="font-serif text-5xl md:text-7xl text-primary-foreground mb-6 leading-tight">
          Den Witten Haen
        </h1>
        <p className="text-primary-foreground/85 text-lg md:text-xl mb-8 font-sans leading-relaxed max-w-xl mx-auto">
          Lunch, high tea en meer, in het hart van Dordrecht
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/menu">
            <Button variant="hero" size="lg" className="w-full sm:w-auto">Bekijk ons menu</Button>
          </Link>
          <Link to="/reserveren">
            <Button variant="heroOutline" size="lg" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground">
              Maak een reservering
            </Button>
          </Link>
        </div>
      </div>
    </section>

    {/* Korte kenmerken */}
    <section className="bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
          {facts.map((f) => (
            <div key={f.title} className="py-7 sm:py-9 sm:px-8 text-center">
              <h2 className="font-serif text-lg text-foreground mb-1">{f.title}</h2>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Uit de keuken */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="sm:flex sm:items-end sm:justify-between gap-6 mb-8">
          <div>
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">Uit onze keuken</p>
            <h2 className="font-serif text-3xl md:text-4xl">Proef onze specialiteiten</h2>
          </div>
          <Link
            to="/menu"
            className="hidden sm:inline-block shrink-0 text-sm text-primary font-sans underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Bekijk het volledige menu
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
          {specialties.map((item) => (
            <div key={item.name} className="border-l-2 border-primary/25 pl-4">
              <h3 className="font-serif text-lg mb-0.5 leading-snug">{item.name}</h3>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <Link
          to="/menu"
          className="sm:hidden inline-block mt-8 text-sm text-primary font-sans underline underline-offset-4"
        >
          Bekijk het volledige menu
        </Link>
      </div>
    </section>

    {/* Ons team */}
    <section className="pt-16 pb-10 md:pt-20 bg-card">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="rounded-xl overflow-hidden border border-border shadow-sm order-first">
            <img
              src={teamImage}
              alt="Het team van Den Witten Haen"
              className="w-full h-72 sm:h-[420px] object-cover object-bottom"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">De mensen achter</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-4">Ons Team</h2>
            <p className="text-muted-foreground font-sans leading-relaxed mb-6">
              Bij Den Witten Haen werken mensen met een beperking met hart en ziel aan uw ervaring.
              Ons team maakt van elk bezoek iets bijzonders, met warmte, aandacht en oprechte
              gastvrijheid.
            </p>
            <Link to="/team">
              <Button variant="outline">Ontmoet ons team</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>

    {/* Over Den Witten Haen */}
    <section id="over-ons" className="pt-10 pb-16 md:pb-20 scroll-mt-24">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center">
        <div>
          <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">Ons verhaal</p>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Over Den Witten Haen</h2>
          <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
            <p>
              Midden in het historische centrum van Dordrecht vind je Den Witten Haen. Een
              bijzondere lunchroom in een monumentaal pand, waar geschiedenis, gastvrijheid
              en ontmoeting samenkomen.
            </p>
            <p>
              Achter de deuren ligt een plek die je misschien niet direct verwacht: een
              verborgen stadstuin, omringd door groen en rust, met als bijzonder middelpunt de
              oudste beuk van Dordrecht. Een plek waar je kunt genieten en je welkom bent.
            </p>
            <p className="hidden md:block">
              Wij geloven dat gastvrijheid meer is dan een goede kop koffie of een lekkere
              lunch. Het zit in de kleine dingen.
            </p>
            <p className="hidden md:block">
              Den Witten Haen is onderdeel van Philadelphia. Vanuit die gedachte bouwen we
              samen aan een plek waar iedereen kan meedoen, zich kan ontwikkelen en van
              betekenis is.
            </p>
            <p className="text-foreground font-medium">
              Een plek met historie.<br />
              Een plek met hart.<br />
              Een plek waar iedereen welkom is.<br />
              Welkom bij Den Witten Haen.
            </p>
          </div>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={terrasImage}
            alt="Het buitenterras van Den Witten Haen"
            className="w-full h-64 sm:h-80 object-cover"
            loading="lazy"
            width={1600}
            height={900}
          />
        </div>
      </div>
    </section>

    {/* Ervaringen van gasten */}
    <section className="py-14 md:py-16 bg-card border-t border-border">
      <div className="container mx-auto px-4 max-w-5xl">
        <p className="text-xs text-muted-foreground font-sans uppercase tracking-wide mb-8">
          Wat onze gasten zeggen
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
          {reviews.map((r, i) => (
            <figure key={i} className="flex flex-col gap-2 m-0">
              <div className="flex gap-0.5" aria-label={`${r.stars} van de 5 sterren`}>
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className={`w-3 h-3 ${j < r.stars ? 'fill-primary text-primary' : 'fill-muted text-muted'}`} aria-hidden="true" />
                ))}
              </div>
              <blockquote className="text-muted-foreground font-sans text-sm leading-relaxed m-0">
                {r.quote}
              </blockquote>
              <figcaption className="font-sans text-xs text-foreground font-medium">{r.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default Index;
