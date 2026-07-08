import { Heart } from "lucide-react";
import teamImage from "@/assets/team.png";

const teamMembers = [
  { name: "Het Keukenteam", role: "Onze koks", desc: "Met verse ingrediënten en veel liefde bereiden zij dagelijks de lekkerste gerechten." },
  { name: "De Bediening", role: "Uw gastheren & gastvrouwen", desc: "Altijd met een glimlach klaar om u een fijne ervaring te bezorgen." },
  { name: "De Begeleiders", role: "Coaches & ondersteuning", desc: "Zij zorgen ervoor dat iedereen in ons team kan groeien en het beste uit zichzelf haalt." },
];

const TeamPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Hero: verhaal links, foto rechts (op mobiel gestapeld) */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-16 md:mb-20">
        {/* Verhaal */}
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <p className="text-sm text-primary font-sans uppercase tracking-wide mb-2">De mensen achter Den Witten Haen</p>
          <h1 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">Ons Team</h1>
          <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
            <p>
              Achter elke kop koffie en elk bord bij Den Witten Haen staat een team dat er met
              hart en ziel voor gaat. Mensen met een beperking werken hier zij aan zij met hun
              begeleiders — en dat proeft u. Niet alleen in het eten, maar vooral in de warme,
              ongedwongen sfeer die u meteen voelt als u binnenstapt.
            </p>
            <p>
              Bij ons mag iedereen groeien op zijn eigen tempo en op zijn eigen manier. De één
              schittert in de keuken, de ander in het contact met de gasten. Samen maken zij van
              elk bezoek net dat beetje extra.
            </p>
            <p className="text-foreground font-medium">
              Kom gerust langs, maak kennis met het team en ervaar zelf waarom Den Witten Haen
              zo bijzonder is.
            </p>
          </div>
        </div>

        {/* Foto */}
        <div className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img
                src={teamImage}
                alt="Het team van Den Witten Haen"
                className="w-full h-auto"
              />
            </div>
            {/* Decoratief accent achter de foto */}
            <div className="absolute -bottom-4 -right-4 -z-10 w-2/3 h-2/3 rounded-2xl bg-primary/10 hidden sm:block" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Wie maken het verschil */}
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">Wie maken het verschil?</h2>
        <div className="space-y-6 mb-12">
          {teamMembers.map((member) => (
            <div key={member.name} className="bg-card rounded-lg border border-border p-6 flex gap-4 items-start">
              <div className="shrink-0 mt-1">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Heart className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="font-serif text-xl mb-0.5">{member.name}</h3>
                <p className="text-xs text-primary font-sans mb-2">{member.role}</p>
                <p className="text-sm text-muted-foreground font-sans leading-relaxed">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-primary rounded-lg p-8 text-center">
          <h3 className="font-serif text-xl mb-2 text-primary-foreground">Werken bij Den Witten Haen?</h3>
          <p className="text-sm text-primary-foreground/80 font-sans">
            Wij zijn altijd op zoek naar enthousiaste mensen. Neem contact met ons op via{' '}
            <a href="mailto:denwittenhaen@philadelphia.nl" className="underline text-primary-foreground">denwittenhaen@philadelphia.nl</a>.
          </p>
        </div>
      </div>
    </div>
  </main>
);

export default TeamPage;
