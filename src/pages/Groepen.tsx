import { EMAIL_ADDRESS, PHONE_HREF, PHONE_NUMBER } from "@/lib/reservations";
import { Button } from "@/components/ui/button";

import zaalFeest from "@/assets/zaal-feest.jpg";
import zaalHighTea from "@/assets/zaal-hightea.jpg";
import zaalVergadering from "@/assets/zaal-vergadering.jpg";

const features = [
  {
    title: "High tea",
    desc: "Geniet van een uitgebreide high tea met vriendinnen, familie of collega's in onze sfeervolle ruimtes.",
    image: zaalHighTea,
    alt: "Tafel gedekt voor een high tea bij Den Witten Haen",
  },
  {
    title: "Vergaderingen",
    desc: "Vergader in een inspirerende historische omgeving met uitstekende catering en alle faciliteiten.",
    image: zaalVergadering,
    alt: "Vergaderopstelling in een van de zalen van Den Witten Haen",
  },
  {
    title: "Feesten en partijen",
    desc: "Vier uw verjaardag, babyshower of ander feest bij ons. Wij verzorgen alles tot in de puntjes.",
    image: zaalFeest,
    alt: "Feestelijk gedekte zaal bij Den Witten Haen",
  },
];

const GroupsPage = () => (
  <main>
    {/* Hero */}
    <section className="relative min-h-[60vh] flex items-center justify-center pt-24 overflow-hidden">
      <img
        src={zaalFeest}
        alt="Feestelijk gedekte zaal bij Den Witten Haen"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-foreground/55" />
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto py-16">
        <p className="text-primary-foreground/70 font-sans text-sm tracking-widest uppercase mb-4">
          Uw evenement bij Den Witten Haen
        </p>
        <h1 className="font-serif text-4xl md:text-6xl text-primary-foreground mb-5 leading-tight">
          Groepen &amp; Vergaderen
        </h1>
        <p className="text-primary-foreground/85 text-lg font-sans leading-relaxed max-w-xl mx-auto">
          De perfecte locatie voor grotere gezelschappen. Of het nu gaat om een vergadering,
          high tea of feest, in onze monumentale zalen maken wij er iets bijzonders van.
        </p>
      </div>
    </section>

    {/* Mogelijkheden */}
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {features.map((f) => (
            <div key={f.title} className="bg-card rounded-xl overflow-hidden border border-border shadow-sm flex flex-col">
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={f.image}
                  alt={f.alt}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6 flex-1">
                <h2 className="font-serif text-xl mb-2">{f.title}</h2>
                <p className="text-muted-foreground text-sm font-sans leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Aanvraag: telefonisch of per e-mail */}
        <div className="bg-card rounded-lg p-6 sm:p-8 border border-border mt-12">
          <h2 className="font-serif text-2xl mb-3 text-center">Neem contact op</h2>
          <p className="text-muted-foreground font-sans text-sm leading-relaxed mb-6 max-w-lg mx-auto text-center">
            Groepen, vergaderingen en feesten plannen wij persoonlijk in. Zo kunnen we samen de
            zaal, de tijden en het eten afstemmen. Bel of mail ons gerust, dan denken wij met
            u mee.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto mb-6">
            <div className="text-center sm:text-left">
              <p className="text-xs font-sans uppercase tracking-wide text-muted-foreground mb-1">Telefonisch</p>
              <a href={PHONE_HREF} className="font-serif text-xl text-foreground hover:text-primary transition-colors">
                {PHONE_NUMBER}
              </a>
              <p className="text-xs text-muted-foreground font-sans mt-1">
                Ma t/m vr 10:00 tot 16:00, za tot 17:00
              </p>
            </div>
            <div className="text-center sm:text-left">
              <p className="text-xs font-sans uppercase tracking-wide text-muted-foreground mb-1">Per e-mail</p>
              <a
                href={`mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent('Aanvraag groep of vergadering')}`}
                className="font-sans text-sm text-foreground hover:text-primary transition-colors break-all underline underline-offset-4"
              >
                {EMAIL_ADDRESS}
              </a>
              <p className="text-xs text-muted-foreground font-sans mt-1">
                Vermeld datum, aantal personen en gelegenheid
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href={PHONE_HREF} className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto">Bel ons</Button>
            </a>
            <a
              href={`mailto:${EMAIL_ADDRESS}?subject=${encodeURIComponent('Aanvraag groep of vergadering')}`}
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="lg" className="w-full sm:w-auto">Mail ons</Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
);

export default GroupsPage;
