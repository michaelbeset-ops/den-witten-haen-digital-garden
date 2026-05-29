import { Link } from "react-router-dom";

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mt-10">
    <h2 className="font-serif text-xl mb-3 text-foreground">{title}</h2>
    <div className="space-y-3 text-sm text-muted-foreground font-sans leading-relaxed">
      {children}
    </div>
  </section>
);

const CookieTable = ({
  rows,
}: {
  rows: { naam: string; doel: string; type: string; bewaartermijn: string }[];
}) => (
  <div className="overflow-x-auto mt-3">
    <table className="w-full text-xs font-sans border-collapse">
      <thead>
        <tr className="border-b border-border">
          <th className="text-left py-2 pr-4 font-semibold text-foreground">Naam</th>
          <th className="text-left py-2 pr-4 font-semibold text-foreground">Doel</th>
          <th className="text-left py-2 pr-4 font-semibold text-foreground">Type</th>
          <th className="text-left py-2 font-semibold text-foreground">Bewaartermijn</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.naam} className="border-b border-border/50">
            <td className="py-2 pr-4 font-mono">{r.naam}</td>
            <td className="py-2 pr-4">{r.doel}</td>
            <td className="py-2 pr-4">{r.type}</td>
            <td className="py-2">{r.bewaartermijn}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const ResetButton = () => {
  const reset = () => {
    localStorage.removeItem("cookie-consent");
    window.location.reload();
  };
  return (
    <button
      onClick={reset}
      className="inline-underline text-sm underline underline-offset-2 hover:text-foreground transition-colors"
    >
      Klik hier om uw cookievoorkeur opnieuw in te stellen
    </button>
  );
};

const CookiePage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-2xl">
      <h1 className="font-serif text-3xl mb-2 text-foreground">Cookiebeleid</h1>
      <p className="text-sm text-muted-foreground font-sans mb-2">Laatst bijgewerkt: mei 2026</p>
      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
        Op deze pagina leggen wij uit welke cookies wij gebruiken, waarvoor en hoe u uw voorkeuren
        kunt beheren. Dit cookiebeleid is van toepassing op de website van Den Witten Haen. Zie ook
        ons{" "}
        <Link to="/privacy" className="underline underline-offset-2 hover:text-foreground transition-colors">
          privacybeleid
        </Link>.
      </p>

      <Section id="wat-zijn-cookies" title="1. Wat zijn cookies?">
        <p>
          Cookies zijn kleine tekstbestanden die via uw browser op uw apparaat worden opgeslagen
          wanneer u onze website bezoekt. Ze zorgen ervoor dat de website correct functioneert en
          stellen ons in staat inzicht te krijgen in het gebruik van de website.
        </p>
        <p>
          Naast cookies gebruiken wij ook <em>localStorage</em> – een vergelijkbare technologie in
          uw browser – om uw cookievoorkeur op te slaan.
        </p>
      </Section>

      <Section id="functionele-cookies" title="2. Functionele cookies (noodzakelijk)">
        <p>
          Functionele cookies zijn noodzakelijk voor het correct functioneren van de website. Ze
          slaan uw cookievoorkeuren op zodat de banner niet bij elk bezoek opnieuw verschijnt. U
          kunt deze cookies niet weigeren.
        </p>
        <CookieTable
          rows={[
            {
              naam: "cookie-consent",
              doel: "Onthoudt uw cookievoorkeur",
              type: "Functioneel (localStorage)",
              bewaartermijn: "Totdat u dit wist",
            },
          ]}
        />
      </Section>

      <Section id="analytische-cookies" title="3. Analytische cookies">
        <p>
          Met uw toestemming maken wij gebruik van Google Analytics om anoniem inzicht te krijgen
          in websitebezoek: welke pagina's worden bezocht, hoe lang bezoekers blijven en via welk
          kanaal ze binnenkomen. Hiermee verbeteren wij de website.
        </p>
        <p>
          IP-adressen worden geanonimiseerd vóór verwerking. Wij hebben een verwerkersovereenkomst
          gesloten met Google. Google mag uw gegevens niet voor eigen doeleinden gebruiken.
        </p>
        <CookieTable
          rows={[
            {
              naam: "_ga",
              doel: "Onderscheidt unieke gebruikers (Google Analytics)",
              type: "Analytisch",
              bewaartermijn: "2 jaar",
            },
            {
              naam: "_ga_*",
              doel: "Slaat sessiestatus op (Google Analytics 4)",
              type: "Analytisch",
              bewaartermijn: "2 jaar",
            },
            {
              naam: "_gid",
              doel: "Onderscheidt gebruikers (Google Analytics)",
              type: "Analytisch",
              bewaartermijn: "24 uur",
            },
          ]}
        />
        <p>
          U kunt analytische cookies weigeren via onze cookiebanner bij uw eerste bezoek.
        </p>
      </Section>

      <Section id="derden" title="4. Cookies van derden">
        <p>
          Onze website maakt geen gebruik van sociale-media-knoppen of embedded content van derden
          die cookies plaatsen zonder uw toestemming.
        </p>
      </Section>

      <Section id="toestemming" title="5. Toestemming en wijzigen">
        <p>
          Bij uw eerste bezoek vragen wij via een cookiebanner om uw toestemming. U kunt kiezen
          voor:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong>Alleen functioneel</strong> – alleen de noodzakelijke cookies worden geplaatst.
          </li>
          <li>
            <strong>Alles accepteren</strong> – ook analytische cookies worden geplaatst.
          </li>
        </ul>
        <p>
          U kunt uw keuze op elk moment herzien. <ResetButton /> Dan verschijnt de cookiebanner
          opnieuw.
        </p>
      </Section>

      <Section id="browser" title="6. Cookies beheren via uw browser">
        <p>
          U kunt cookies ook beheren of verwijderen via de instellingen van uw browser. Houd er
          rekening mee dat het uitschakelen van cookies de functionaliteit van de website kan
          beïnvloeden. Instructies per browser:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <a
              href="https://support.google.com/chrome/answer/95647"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Google Chrome
            </a>
          </li>
          <li>
            <a
              href="https://support.mozilla.org/nl/kb/cookies-verwijderen-gegevens-wissen-websites-opgeslagen"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Mozilla Firefox
            </a>
          </li>
          <li>
            <a
              href="https://support.apple.com/nl-nl/guide/safari/sfri11471/mac"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Apple Safari
            </a>
          </li>
          <li>
            <a
              href="https://support.microsoft.com/nl-nl/windows/cookies-verwijderen-en-beheren-168dab11-0753-043d-7c16-ede5947fc64d"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-foreground transition-colors"
            >
              Microsoft Edge
            </a>
          </li>
        </ul>
      </Section>

      <Section id="contact" title="7. Contact">
        <p>
          Heeft u vragen over ons cookiebeleid? Neem dan contact op via{" "}
          <a
            href="mailto:info@denwittenhaen.nl"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            info@denwittenhaen.nl
          </a>.
        </p>
      </Section>
    </div>
  </main>
);

export default CookiePage;
