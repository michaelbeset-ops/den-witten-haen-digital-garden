import teamImage from "@/assets/team.jpg";
import { EMAIL_ADDRESS } from "@/lib/reservations";

const teamMembers = [
  {
    name: "Het keukenteam",
    role: "Onze koks",
    desc: "Met verse ingrediënten en veel liefde bereiden zij dagelijks de lekkerste gerechten.",
  },
  {
    name: "De bediening",
    role: "Uw gastheren en gastvrouwen",
    desc: "Altijd met een glimlach klaar om u een fijne ervaring te bezorgen.",
  },
  {
    name: "De begeleiders",
    role: "Coaches en ondersteuning",
    desc: "Zij zorgen ervoor dat iedereen in ons team kan groeien en het beste uit zichzelf haalt.",
  },
];

const TeamPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-5xl">
      {/* Verhaal met foto */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mb-16 md:mb-20">
        <div className="order-2 lg:order-1 text-center lg:text-left">
          <p className="text-sm text-primary font-sans uppercase tracking-wide mb-2">
            De mensen achter Den Witten Haen
          </p>
          <h1 className="font-serif text-4xl md:text-5xl mb-6 leading-tight">Ons Team</h1>
          <div className="space-y-4 text-muted-foreground font-sans leading-relaxed">
            <p>
              Een plek met karakter wordt gemaakt door de mensen die er werken. Bij Den Witten
              Haen begint dat bij ons team.
            </p>
            <p>
              Iedereen brengt zijn eigen talent, persoonlijkheid en verhaal mee. De één voelt
              zich thuis in de keuken, de ander geniet van het contact met onze gasten. Samen
              zorgen we voor iets bijzonders: niet alleen een lekkere lunch of goede koffie,
              maar vooral een warm welkom.
            </p>
            <p>
              We geven elkaar de ruimte om te ontdekken, te leren en te groeien. Door samen te
              werken en elkaar te versterken, ontstaat de bijzondere sfeer die u bij Den Witten
              Haen voelt.
            </p>
            <p className="text-foreground font-medium">
              Want de sfeer van Den Witten Haen zit niet alleen in de plek. Die zit vooral in de
              mensen.
            </p>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-xs sm:max-w-sm lg:max-w-none">
            <div className="rounded-2xl overflow-hidden border border-border shadow-lg">
              <img src={teamImage} alt="Het team van Den Witten Haen" className="w-full h-auto" />
            </div>
            <div className="absolute -bottom-4 -right-4 -z-10 w-2/3 h-2/3 rounded-2xl bg-primary/10 hidden sm:block" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Wie maken het verschil */}
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-2xl md:text-3xl mb-8">Wie maken het verschil?</h2>
        <div className="divide-y divide-border border-y border-border mb-12">
          {teamMembers.map((member) => (
            <div key={member.name} className="py-6 sm:flex sm:gap-8">
              <div className="sm:w-52 shrink-0 mb-1 sm:mb-0">
                <h3 className="font-serif text-xl leading-snug">{member.name}</h3>
                <p className="text-xs text-primary font-sans">{member.role}</p>
              </div>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed sm:pt-1">
                {member.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-primary rounded-lg p-6 sm:p-8 text-center">
          <h3 className="font-serif text-xl mb-2 text-primary-foreground">
            Werken bij Den Witten Haen?
          </h3>
          <p className="text-sm text-primary-foreground/80 font-sans leading-relaxed">
            Wij zijn altijd op zoek naar enthousiaste mensen. Neem contact met ons op via{" "}
            <a href={`mailto:${EMAIL_ADDRESS}`} className="underline text-primary-foreground break-all">
              {EMAIL_ADDRESS}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  </main>
);

export default TeamPage;
