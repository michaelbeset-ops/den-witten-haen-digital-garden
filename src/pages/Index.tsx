import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, TreePine, Heart, Star } from "lucide-react";
import heroImage from "@/assets/hero-interior.jpg";
import gardenImage from "@/assets/garden.jpg";

const reviews = [
  { quote: "Verse ingrediënten, lekkere gerechten en zeer vriendelijke mensen vind je in dit sociaal betrokken restaurant.", name: "Stephan D." },
  { quote: "Per toeval kwamen we hier tijdens ons zussendagje. En wat een cadeautje deze plek.", name: "Annemarieke" },
  { quote: "Heerlijke plek voor lunch of high tea. Geweldig!", name: "Elvy B." },
  { quote: "Fijne en ongedwongen plek waar je je welkom voelt.", name: "Robert S." },
  { quote: "Wij hadden een babyshower met 17 mensen. Wauw, het was zo goed geregeld.", name: "An R." },
];

const usps = [
  { icon: Landmark, title: "Monumentaal pand", desc: "Gevestigd in een prachtig historisch pand in het hart van Dordrecht" },
  { icon: TreePine, title: "Verstopte stadstuin", desc: "Ontdek onze verborgen binnentuin met de oudste beuk van Dordrecht" },
  { icon: Heart, title: "Sociaal betrokken", desc: "Een inclusieve werkplek waar iedereen met hart en ziel bijdraagt" },
];

const Index = () => (
  <main>
    {/* Hero */}
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <img
        src={heroImage}
        alt="Sfeervolle interieur van Den Witten Haen"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />
      <div className="absolute inset-0 bg-foreground/40" />
      <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl md:text-6xl text-primary-foreground mb-4 leading-tight">
          Lunch, high tea & meer — in het hart van Dordrecht
        </h1>
        <p className="text-primary-foreground/90 text-lg md:text-xl mb-8 font-sans leading-relaxed">
          Welkom bij Den Witten Haen, waar mensen met een beperking u met hart en ziel verwelkomen
          in een bijzondere historische sfeer.
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
    <section className="py-16 bg-card">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {usps.map((usp) => (
          <div key={usp.title} className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
              <usp.icon className="w-7 h-7 text-primary" />
            </div>
            <h3 className="font-serif text-xl mb-2">{usp.title}</h3>
            <p className="text-muted-foreground text-sm font-sans">{usp.desc}</p>
          </div>
        ))}
      </div>
    </section>

    {/* Over ons */}
    <section id="over-ons" className="py-20">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl mb-6">Over Den Witten Haen</h2>
          <p className="text-muted-foreground font-sans leading-relaxed mb-4">
            In het historische centrum van Dordrecht, verscholen achter eeuwenoude gevels, ligt Den Witten Haen — 
            een lunchroom met een bijzonder verhaal. Ons monumentale pand herbergt niet alleen een prachtig interieur, 
            maar ook een verborgen stadstuin waar u in alle rust kunt genieten.
          </p>
          <p className="text-muted-foreground font-sans leading-relaxed">
            Bij ons werken mensen met een beperking met hart en ziel aan uw ervaring. 
            Dat maakt Den Witten Haen niet alleen een plek om te eten, maar een plek om u thuis te voelen. 
            Wij geloven dat gastvrijheid het mooiste is wanneer het van binnenuit komt.
          </p>
        </div>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <img
            src={gardenImage}
            alt="De verborgen stadstuin van Den Witten Haen"
            className="w-full h-80 object-cover"
            loading="lazy"
            width={800}
            height={600}
          />
        </div>
      </div>
    </section>

    {/* Reviews */}
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">Wat onze gasten zeggen</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <div
              key={i}
              className="bg-background rounded-lg p-6 shadow-sm border border-border flex flex-col justify-between"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-muted-foreground font-sans text-sm italic leading-relaxed mb-4">"{r.quote}"</p>
              <p className="font-serif text-sm font-semibold">— {r.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </main>
);

export default Index;
