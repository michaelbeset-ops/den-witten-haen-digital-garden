import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Landmark, TreePine, Heart, Star, ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-interior.jpg";
import gardenImage from "@/assets/garden.jpg";

const reviews = [
  { quote: "Verse ingrediënten, lekkere gerechten en zeer vriendelijke mensen.", name: "Stephan D." },
  { quote: "Per toeval kwamen we hier. Wat een cadeautje deze plek.", name: "Annemarieke" },
  { quote: "Heerlijke plek voor lunch of high tea. Geweldig!", name: "Elvy B." },
  { quote: "Fijne en ongedwongen plek waar je je welkom voelt.", name: "Robert S." },
  { quote: "Babyshower met 17 mensen. Wauw, zo goed geregeld.", name: "An R." },
];

const usps = [
  { icon: Landmark, title: "Monumentaal pand", desc: "Historisch pand in het hart van Dordrecht" },
  { icon: TreePine, title: "Verstopte stadstuin", desc: "Verborgen tuin met de oudste beuk van Dordrecht" },
  { icon: Heart, title: "Sociaal betrokken", desc: "Inclusieve werkplek met hart en ziel" },
];

const menuCategories = [
  {
    title: "High Tea",
    desc: "Een verfijnd assortiment van zoet & hartig gebak, verse thee en naar keuze een glas prosecco. Ideaal voor een bijzonder moment met vriendinnen, familie of collega's.",
    detail: "Klassiek € 24,95 · Deluxe € 32,50 p.p.",
    href: "/menu",
    accent: "border-t-rose-400",
  },
  {
    title: "Krakel- & Kraailunch",
    desc: "De perfecte groepslunch voor 10+ personen. Soep, luxe broodjes, warme snacks, onbeperkte dranken en vers fruit — perfect bij een vergadering, training of dagje uit.",
    detail: "Kakellunch € 15,00 · Kraailunch € 17,50 p.p.",
    href: "/groepen",
    accent: "border-t-amber-400",
  },
  {
    title: "Menu",
    desc: "Van verse soep en ambachtelijke broodjes tot de quiche du jour en een uitsmijter. Dagelijks vers bereid met zorg en aandacht voor elk gerecht.",
    detail: "Zie de volledige menukaart",
    href: "/menu",
    accent: "border-t-primary",
  },
  {
    title: "Dranken",
    desc: "Verse jus d'orange geperst op bestelling, huislimonade van het seizoen, diverse koffie- en theesoorten en een glas wijn. Voor elk moment de juiste dorstlesser.",
    detail: "Koffie & thee v.a. € 2,75",
    href: "/menu",
    accent: "border-t-sky-400",
  },
];

const Index = () => {
  return (
    <main>
      {/* Hero – volledig scherm, tekst linksonder */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <img
          src={heroImage}
          alt="Sfeervolle interieur van Den Witten Haen"
          className="absolute inset-0 w-full h-full object-cover"
          width={1920}
          height={1080}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/10" />
        <div className="relative z-10 w-full px-6 md:px-14 pb-14 md:pb-20 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-white leading-tight">
              Heerlijke lunch.<br />
              Verborgen tuin.<br />
              Hartelijk team.
            </h1>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/menu">
              <Button variant="hero" size="lg">Bekijk het menu</Button>
            </Link>
            <Link to="/reserveren">
              <Button variant="heroOutline" size="lg" className="border-white text-white hover:bg-white hover:text-foreground">
                Reserveer
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

      {/* Menu overzicht */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-10 text-center">
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">Wat wij aanbieden</p>
            <h2 className="font-serif text-3xl md:text-4xl">Onze menu's</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {menuCategories.map((cat) => (
              <Link
                key={cat.title}
                to={cat.href}
                className="group bg-card rounded-xl border border-border hover:shadow-lg transition-shadow flex flex-col overflow-hidden"
              >
                <div className={`h-1 w-full ${cat.accent}`} />
                <div className="p-7 flex flex-col flex-1">
                  <h3 className="font-serif text-2xl mb-3 group-hover:text-primary transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-sans leading-relaxed flex-1 mb-4">
                    {cat.desc}
                  </p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="text-xs font-sans text-muted-foreground">{cat.detail}</span>
                    <span className="flex items-center gap-1 text-xs text-primary font-sans font-medium group-hover:gap-2 transition-all">
                      Bekijk <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Over Den Witten Haen */}
      <section id="over-ons" className="py-20 bg-card">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
            <div className="absolute -bottom-4 -right-4 bg-background border border-border rounded-xl px-5 py-3 shadow-md">
              <p className="font-serif text-sm text-foreground">De verborgen stadstuin</p>
              <p className="text-xs text-muted-foreground font-sans">Oudste beuk van Dordrecht</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1">Ons verhaal</p>
            <h2 className="font-serif text-3xl md:text-4xl mb-6">Over Den Witten Haen</h2>
            <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
              <p>
                In het historische centrum van Dordrecht, verscholen achter eeuwenoude gevels,
                ligt Den Witten Haen — een lunchroom met een bijzonder verhaal. Ons monumentale
                pand herbergt een prachtig interieur én een verborgen stadstuin waar de oudste
                beuk van Dordrecht staat.
              </p>
              <p>
                Bij ons werken mensen met een beperking met hart en ziel aan uw ervaring.
                Dat maakt Den Witten Haen niet alleen een plek om te eten, maar een plek om
                u thuis te voelen. Wij zijn onderdeel van Philadelphia en geloven dat
                gastvrijheid het mooiste is wanneer het van binnenuit komt.
              </p>
            </div>
            <Link to="/reserveren" className="inline-flex items-center gap-2 mt-6 text-sm text-primary font-sans font-medium hover:underline">
              Maak een reservering <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Reviews */}
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
