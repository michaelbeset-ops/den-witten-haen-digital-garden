import { ChefHat, Coffee, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

const teamMembers = [
  {
    icon: ChefHat,
    name: "Het Keukenteam",
    role: "Onze koks",
    desc: "Met verse, lokale ingrediënten en veel liefde bereiden zij dagelijks de lekkerste gerechten. Van huisgemaakte tomatensoep tot een verfijnde quiche du jour — alles met aandacht voor detail.",
    accent: "bg-amber-50 border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-700",
  },
  {
    icon: Coffee,
    name: "De Bediening",
    role: "Uw gastheren & gastvrouwen",
    desc: "Altijd met een glimlach klaar om u te verwelkomen. Zij zorgen voor een warme, ongedwongen sfeer en maken elk bezoek tot een fijne herinnering.",
    accent: "bg-rose-50 border-rose-200",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-700",
  },
  {
    icon: Users,
    name: "De Begeleiders",
    role: "Coaches & ondersteuning",
    desc: "Zij staan dag in dag uit klaar om elk teamlid te begeleiden, te coachen en te laten groeien. Samen zorgen zij ervoor dat iedereen het beste uit zichzelf haalt.",
    accent: "bg-emerald-50 border-emerald-200",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-700",
  },
];

const values = [
  { title: "Gastvrijheid", desc: "Iedereen is welkom — dat voelt u zodra u binnenstapt." },
  { title: "Groei", desc: "Elk teamlid krijgt de ruimte om zichzelf te ontwikkelen." },
  { title: "Kwaliteit", desc: "Verse ingrediënten en aandacht voor elk gerecht." },
  { title: "Verbinding", desc: "Medewerkers, gasten en buurt — samen één gemeenschap." },
];

const TeamPage = () => (
  <main className="pt-24 pb-20">
    {/* Header */}
    <div className="bg-card border-b border-border py-16 mb-12">
      <div className="container mx-auto px-4 text-center max-w-2xl">
        <p className="text-sm text-primary font-sans uppercase tracking-wide mb-2">De mensen achter Den Witten Haen</p>
        <h1 className="font-serif text-4xl md:text-5xl mb-4">Ons Team</h1>
        <p className="text-muted-foreground font-sans leading-relaxed text-base">
          Bij Den Witten Haen werken mensen met een beperking met hart en ziel.
          Samen met onze begeleiders vormen zij een hecht team dat gastvrijheid op de eerste
          plaats zet. Iedereen draagt op zijn eigen manier bij aan de warme sfeer.
        </p>
      </div>
    </div>

    <div className="container mx-auto px-4 max-w-5xl">
      {/* Team role cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {teamMembers.map((member) => (
          <div
            key={member.name}
            className={`rounded-xl border p-7 flex flex-col gap-4 hover:shadow-md transition-shadow ${member.accent}`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center ${member.iconBg}`}>
              <member.icon className={`w-7 h-7 ${member.iconColor}`} />
            </div>
            <div>
              <h2 className="font-serif text-xl mb-0.5">{member.name}</h2>
              <p className={`text-xs font-sans font-semibold uppercase tracking-wide mb-3 ${member.iconColor}`}>
                {member.role}
              </p>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">{member.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Waarden */}
      <div className="mb-16">
        <h2 className="font-serif text-2xl md:text-3xl text-center mb-8">Waar wij voor staan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {values.map((v) => (
            <div key={v.title} className="bg-card rounded-xl border border-border p-5 text-center">
              <h3 className="font-serif text-lg mb-2">{v.title}</h3>
              <p className="text-xs text-muted-foreground font-sans leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-primary/5 rounded-2xl p-10 text-center border border-primary/15">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
          <Mail className="w-6 h-6 text-primary" />
        </div>
        <h3 className="font-serif text-2xl mb-2">Werken bij Den Witten Haen?</h3>
        <p className="text-sm text-muted-foreground font-sans mb-6 max-w-sm mx-auto">
          Wij zijn altijd op zoek naar enthousiaste mensen die met hart en ziel willen werken.
          Neem gerust contact met ons op.
        </p>
        <Button asChild variant="outline" className="rounded-full gap-2">
          <a href="mailto:info@denwittenhaen.nl">
            <Mail className="w-4 h-4" /> info@denwittenhaen.nl
          </a>
        </Button>
      </div>
    </div>
  </main>
);

export default TeamPage;
