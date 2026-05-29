import { Link } from "react-router-dom";

const Section = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section id={id} className="mt-10">
    <h2 className="font-serif text-xl mb-3 text-foreground">{title}</h2>
    <div className="space-y-3 text-sm text-muted-foreground font-sans leading-relaxed">
      {children}
    </div>
  </section>
);

const PrivacyPage = () => (
  <main className="pt-24 pb-20">
    <div className="container mx-auto px-4 max-w-2xl">
      <h1 className="font-serif text-3xl mb-2 text-foreground">Privacybeleid</h1>
      <p className="text-sm text-muted-foreground font-sans mb-2">Laatst bijgewerkt: mei 2026</p>
      <p className="text-sm text-muted-foreground font-sans leading-relaxed">
        Den Witten Haen respecteert uw privacy en gaat zorgvuldig om met uw persoonsgegevens. In dit
        privacybeleid leggen wij uit welke gegevens wij verzamelen, waarom, en wat uw rechten zijn.
        Wij handelen in overeenstemming met de Algemene Verordening Gegevensbescherming (AVG).
      </p>

      <Section id="verantwoordelijke" title="1. Verwerkingsverantwoordelijke">
        <p>
          Den Witten Haen<br />
          Groenmarkt 1, 3311 BD Dordrecht<br />
          E-mail: <a href="mailto:info@denwittenhaen.nl" className="underline underline-offset-2 hover:text-foreground transition-colors">info@denwittenhaen.nl</a><br />
          Telefoon: <a href="tel:+31781234567" className="underline underline-offset-2 hover:text-foreground transition-colors">078 – 123 45 67</a>
        </p>
        <p>
          Heeft u vragen over dit beleid? Neem dan gerust contact met ons op via bovenstaande gegevens.
        </p>
      </Section>

      <Section id="gegevens" title="2. Welke gegevens verzamelen wij?">
        <p>
          Wij verzamelen uitsluitend persoonsgegevens die u zelf aan ons verstrekt. Dit gebeurt via
          ons reserveringsformulier en/of bij contact per e-mail of telefoon. Het gaat om de volgende
          gegevens:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Voor- en achternaam</li>
          <li>E-mailadres</li>
          <li>Telefoonnummer</li>
          <li>Datum, tijdstip en aantal personen van de reservering</li>
          <li>Gelegenheid (verjaardag, zakelijk, etc.)</li>
          <li>Eventuele dieetwensen of opmerkingen die u zelf invult</li>
        </ul>
        <p>
          Wij vragen u nadrukkelijk geen bijzondere persoonsgegevens te vermelden in het opmerkingenveld
          (zoals medische informatie).
        </p>
      </Section>

      <Section id="doel" title="3. Waarvoor gebruiken wij uw gegevens?">
        <p>Wij verwerken uw gegevens uitsluitend voor de volgende doeleinden:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Het verwerken en bevestigen van uw reservering</li>
          <li>Contact opnemen bij wijziging of annulering</li>
          <li>Het nakomen van wettelijke verplichtingen</li>
        </ul>
        <p>
          <strong>Rechtsgrondslag:</strong> De verwerking is gebaseerd op uw toestemming (art. 6 lid 1
          sub a AVG) bij het invullen van het reserveringsformulier, en op de uitvoering van een
          overeenkomst (art. 6 lid 1 sub b AVG).
        </p>
      </Section>

      <Section id="delen" title="4. Delen van gegevens">
        <p>
          Wij verkopen of verhuren uw persoonsgegevens nooit aan derden. Uw gegevens kunnen worden
          gedeeld met:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>
            <strong>Hostingprovider</strong> – voor het opslaan en verzenden van formuliergegevens,
            uitsluitend binnen de EU.
          </li>
          <li>
            <strong>Google Analytics</strong> – indien u analytische cookies accepteert, worden
            geanonimiseerde websitebezoekgegevens verwerkt. Zie ons{" "}
            <Link to="/cookies" className="underline underline-offset-2 hover:text-foreground transition-colors">
              cookiebeleid
            </Link>.
          </li>
        </ul>
        <p>
          Met verwerkers hebben wij verwerkersovereenkomsten gesloten conform art. 28 AVG.
        </p>
      </Section>

      <Section id="bewaartermijn" title="5. Bewaartermijn">
        <p>
          Wij bewaren uw gegevens niet langer dan noodzakelijk voor het doel waarvoor ze zijn
          verzameld:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li>Reserveringsgegevens: maximaal 12 maanden na de reserveringsdatum</li>
          <li>E-mailcorrespondentie: maximaal 2 jaar</li>
        </ul>
        <p>
          Na afloop van de bewaartermijn worden uw gegevens veilig verwijderd.
        </p>
      </Section>

      <Section id="beveiliging" title="6. Beveiliging">
        <p>
          Wij nemen passende technische en organisatorische maatregelen om uw persoonsgegevens te
          beschermen tegen verlies, misbruik of onbevoegde toegang. Onze website maakt gebruik van
          een beveiligde HTTPS-verbinding.
        </p>
      </Section>

      <Section id="rechten" title="7. Uw rechten">
        <p>Op grond van de AVG heeft u de volgende rechten:</p>
        <ul className="list-disc list-inside space-y-1 pl-2">
          <li><strong>Inzage</strong> – u mag opvragen welke gegevens wij van u hebben.</li>
          <li><strong>Rectificatie</strong> – u mag onjuiste gegevens laten corrigeren.</li>
          <li><strong>Verwijdering</strong> – u kunt verzoeken uw gegevens te wissen ("recht op vergetelheid").</li>
          <li><strong>Bezwaar</strong> – u kunt bezwaar maken tegen verwerking.</li>
          <li><strong>Beperking</strong> – u kunt vragen de verwerking te beperken.</li>
          <li><strong>Overdraagbaarheid</strong> – u kunt uw gegevens in een gangbaar formaat opvragen.</li>
          <li><strong>Intrekking toestemming</strong> – u kunt eerder gegeven toestemming altijd intrekken.</li>
        </ul>
        <p>
          Stuur uw verzoek naar{" "}
          <a href="mailto:info@denwittenhaen.nl" className="underline underline-offset-2 hover:text-foreground transition-colors">
            info@denwittenhaen.nl
          </a>. Wij reageren binnen 30 dagen.
        </p>
      </Section>

      <Section id="klachten" title="8. Klachten">
        <p>
          Heeft u een klacht over de manier waarop wij uw persoonsgegevens verwerken? Neem dan eerst
          contact met ons op. U heeft ook het recht een klacht in te dienen bij de Autoriteit
          Persoonsgegevens:
        </p>
        <p>
          Autoriteit Persoonsgegevens<br />
          Postbus 93374, 2509 AJ Den Haag<br />
          <a
            href="https://www.autoriteitpersoonsgegevens.nl"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-foreground transition-colors"
          >
            www.autoriteitpersoonsgegevens.nl
          </a>
        </p>
      </Section>

      <Section id="cookies" title="9. Cookies">
        <p>
          Wij maken gebruik van cookies op onze website. Lees meer in ons{" "}
          <Link to="/cookies" className="underline underline-offset-2 hover:text-foreground transition-colors">
            cookiebeleid
          </Link>.
        </p>
      </Section>

      <Section id="wijzigingen" title="10. Wijzigingen">
        <p>
          Dit privacybeleid kan worden aangepast. Controleer deze pagina regelmatig voor de meest
          actuele versie. Bij ingrijpende wijzigingen informeren wij u via de website.
        </p>
      </Section>
    </div>
  </main>
);

export default PrivacyPage;
