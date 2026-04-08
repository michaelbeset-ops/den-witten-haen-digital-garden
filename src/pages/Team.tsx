import { Heart } from "lucide-react";

const teamMembers = [
  { name: "Het Keukenteam", role: "Onze koks", desc: "Met verse ingrediënten en veel liefde bereiden zij dagelijks de lekkerste gerechten." },
  { name: "De Bediening", role: "Uw gastheren & gastvrouwen", desc: "Altijd met een glimlach klaar om u een fijne ervaring te bezorgen." },
  { name: "De Begeleiders", role: "Coaches & ondersteuning", desc: "Zij zorgen ervoor dat iedereen in ons team kan groeien en het beste uit zichzelf haalt." },
];

const TeamPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-3xl">
      <p className="text-sm text-primary font-sans uppercase tracking-wide mb-1 text-center">De mensen achter Den Witten Haen</p>
      <h1 className="font-serif text-4xl md:text-5xl text-center mb-4">Ons Team</h1>
      <p className="text-center text-muted-foreground font-sans mb-12 max-w-xl mx-auto leading-relaxed">
        Bij Den Witten Haen werken mensen met een beperking met hart en ziel. 
        Samen met onze begeleiders vormen zij een hecht team dat gastvrijheid op de eerste plaats zet. 
        Iedereen draagt op zijn eigen manier bij aan de warme sfeer.
      </p>

      <div className="space-y-6 mb-12">
        {teamMembers.map((member) => (
          <div key={member.name} className="bg-card rounded-lg border border-border p-6 flex gap-4 items-start">
            <div className="shrink-0 mt-1">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="font-serif text-xl mb-0.5">{member.name}</h2>
              <p className="text-xs text-primary font-sans mb-2">{member.role}</p>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed">{member.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-primary/5 rounded-lg p-8 text-center border border-primary/10">
        <h3 className="font-serif text-xl mb-2">Werken bij Den Witten Haen?</h3>
        <p className="text-sm text-muted-foreground font-sans">
          Wij zijn altijd op zoek naar enthousiaste mensen. Neem contact met ons op via info@denwittenhaen.nl.
        </p>
      </div>
    </div>
  </main>
);

export default TeamPage;
