> **Let op (status september 2026):** op dit moment wordt de site live gezet via
> **GitHub Pages** (`.github/workflows/deploy.yml`, domein `denwittenhaen.com` via
> `public/CNAME`). De Vimexx-FTP-workflow hieronder is beschreven, maar het bestand
> `deploy-vimexx.yml` bestaat (nog) niet in deze repo.
>
> **Database:** voer de migraties in `supabase/migrations/` op volgorde uit in de
> Supabase SQL Editor. Nog niet gedraaid en wel nodig:
>
> - `004_fix_create_reservation_blocked_ranges.sql` herstelt de reserveringsfunctie.
>   Zonder deze migratie faalt elke online reservering.
> - `005_guest_cancellation.sql` voegt de annuleerlink toe die in elke
>   bevestigingsmail staat. Zonder deze migratie werkt die link niet en moeten
>   gasten bellen om te annuleren.
> - `006_remove_anon_insert.sql` haalt de policy weg waarmee iedereen met de
>   publieke anon-sleutel rechtstreeks reserveringen kon wegschrijven, buiten
>   alle controles van `create_reservation` om (maximaal 8 personen, gesloten
>   dagen, capaciteit). De website reserveert alleen via die functie, dus dit
>   verandert niets aan het formulier.
>
> **Edge Functions opnieuw deployen na wijzigingen.** `send-email` en
> `manage-users` staan in deze repo, maar draaien pas in de nieuwe vorm zodra ze
> in Supabase opnieuw zijn gedeployed (*Edge Functions* → functie → *Deploy*, of
> `supabase functions deploy send-email manage-users`). Beide accepteren nu
> alleen nog aanvragen vanaf `denwittenhaen.com` (en localhost tijdens het
> ontwikkelen), en de annuleerlink in de mail moet naar het eigen domein wijzen.
> Draait de site ooit op een ander adres, pas dan `ALLOWED_ORIGINS` en
> `ALLOWED_LINK_HOSTS` boven in die bestanden aan, anders werken reserveren en
> het gebruikersbeheer niet meer.
>
> **Supabase pauzeert een gratis project na zeven dagen zonder activiteit.** De
> workflow `.github/workflows/supabase-keepalive.yml` voorkomt dat: die doet elke
> werkdag een klein leesverzoek. Daarvoor moeten de secrets `VITE_SUPABASE_URL` en
> `VITE_SUPABASE_ANON_KEY` in GitHub staan (die zijn er al voor de build).

# Reserveringssysteem herstellen na verlies van het Supabase-project

> **Wat er is gebeurd.** Op 1 oktober 2026 verdween het Supabase-project
> `raaaglsimoqkfrltilbj`. De hostnaam lost sindsdien niet meer op
> (`curl: (6) Could not resolve host`), en dat betekent iets anders dan een
> gepauzeerd project: een gepauzeerd project blijft in DNS staan. Het project
> is dus verwijderd. Gasten konden vanaf die dag niet meer online reserveren.
> De dagelijkse controle meldde het trouw, vierentwintig keer, maar zonder dat
> iemand daar bericht van kreeg. Dat laatste is nu opgelost: de workflow opent
> voortaan een issue in deze repo.

De website zelf staat er nog gewoon en hoeft niet opnieuw gebouwd te worden —
alleen de database en de e-mailfunctie moeten terug. Reken op een halfuur.

**1. Nieuw Supabase-project**

Maak een nieuw project aan in een EU-regio (Frankfurt of Ierland), zodat de
privacyverklaring blijft kloppen. Zet **zelfregistratie uit**: Authentication →
Providers → Email → *Enable signup* op uit. Anders kan iedereen een account
maken, en een account geeft toegang tot alle reserveringsgegevens.

**2. Database opzetten**

Plak `supabase/herstel.sql` in de SQL Editor en druk op Run. Dat ene bestand
zet de twee tabellen, de beveiligingsregels, de vier functies en de
realtime-koppeling in één keer goed. De losse migraties hoef je niet meer op
volgorde te draaien; die blijven alleen staan voor de geschiedenis.

**3. Sleutels bijwerken in GitHub**

Settings → Secrets and variables → Actions. Werk `VITE_SUPABASE_URL` en
`VITE_SUPABASE_ANON_KEY` bij met de waarden van het nieuwe project (Supabase →
Project Settings → API). Start daarna **Actions → Deploy to GitHub Pages → Run
workflow**, want deze twee waarden worden tijdens het bouwen in de JavaScript
gebakken. Zonder die herbouw blijft de site de oude, dode database aanroepen.

**4. Edge Functions terugzetten**

Deploy `send-email` en `manage-users` opnieuw (Supabase → Edge Functions, of
`supabase functions deploy send-email manage-users`) en zet de secret
`BREVO_API_KEY` terug onder Edge Functions → Secrets. Brevo zelf is een los
account en staat er waarschijnlijk nog; controleer of het domein
`denwittenhaen.com` nog geverifieerd is.

**5. Beheerder aanmaken**

Authentication → Users → *Add user* met het e-mailadres van het restaurant.
Laat daarna via "wachtwoord vergeten" op de inlogpagina een wachtwoord
instellen.

**6. Controleren**

Start **Actions → Supabase wakker houden → Run workflow** en kijk of hij groen
wordt. Maak daarna een testreservering met je eigen e-mailadres: komt de mail
aan, werkt de annuleerlink, en verschijnt de reservering in het dashboard?

> **De oude reserveringen zijn weg.** Met het project is ook de inhoud van de
> database verdwenen; die is hiermee niet terug te halen. Reserveringen van na
> 1 oktober zijn er sowieso niet, want boeken lukte toen al niet meer. Vraag
> het restaurant of zij nog een papieren of telefonische agenda hebben van de
> afgelopen weken die erin moet.

# Live zetten via Vimexx

De site bouwt naar statische bestanden (`npm run build` → map `dist/`) en wordt via
FTP naar je Vimexx-hosting geüpload. Dit gebeurt automatisch bij elke push naar
`main` via `.github/workflows/deploy-vimexx.yml`.

## 1. FTP-gegevens ophalen bij Vimexx

1. Log in op het [Vimexx klantenpaneel](https://mijn.vimexx.nl).
2. Ga naar je hostingpakket → **FTP-accounts** (of **Bestandsbeheer**).
3. Noteer of maak een FTP-account met schrijftoegang tot de map waar de site moet
   komen (meestal `public_html/` voor het hoofddomein, of
   `public_html/subdomein/` voor een subdomein).
4. Noteer de FTP-hostnaam (meestal je domeinnaam of iets als `ftp.jouwdomein.nl`).

## 2. Secrets toevoegen in GitHub

Ga naar **Settings → Secrets and variables → Actions** in deze repo en voeg toe:

| Secret | Waarde |
|---|---|
| `VIMEXX_FTP_SERVER` | FTP-hostnaam, bv. `ftp.denwittenhaen.nl` |
| `VIMEXX_FTP_USERNAME` | FTP-gebruikersnaam |
| `VIMEXX_FTP_PASSWORD` | FTP-wachtwoord |
| `VIMEXX_FTP_SERVER_DIR` | Doelmap op de server, bv. `public_html/` |
| `VITE_SUPABASE_URL` | Al aanwezig (gebruikt voor GitHub Pages build) |
| `VITE_SUPABASE_ANON_KEY` | Al aanwezig (gebruikt voor GitHub Pages build) |

Let op: `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` worden tijdens het builden in
de JS-bundle gebakken — dit zijn geen geheime server-only sleutels, de anon key is
bedoeld om publiek in de frontend te staan (Supabase Row Level Security regelt de
beveiliging).

## 3. Deployen

Push naar `main`, of start de workflow handmatig via **Actions → Deploy to Vimexx
(FTP) → Run workflow**. De workflow bouwt de site en synct de inhoud van `dist/`
naar de opgegeven map op je Vimexx-hosting.

## 4. Domein koppelen

Zorg dat je domein bij Vimexx naar de map wijst waar je hebt geüpload
(DNS/hosting-koppeling regel je in het Vimexx-paneel onder **Domeinen**). Dat is
verder onafhankelijk van deze workflow.

## Wat is er verder aangepast voor Vimexx-hosting

- `vite.config.ts`: het basispad is nu instelbaar via `VITE_BASE_PATH` (standaard
  `/`, zodat de build werkt op de root van je Vimexx-domein). De GitHub Pages
  workflow zet deze expliciet op `/den-witten-haen-digital-garden/`.
- `public/.htaccess`: zorgt dat client-side routing (React Router) werkt op
  Apache-hosting zoals Vimexx, plus compressie en caching van assets.

## Handmatig uploaden (alternatief)

Wil je niet via GitHub Actions werken, dan kan het ook handmatig:

```bash
npm ci
VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npm run build
```

Upload daarna de volledige inhoud van `dist/` (inclusief het verborgen bestand
`.htaccess`) via FTP of het Vimexx-bestandsbeheer naar `public_html/`.


## E-mail instellen (Brevo, afzender noreply@denwittenhaen.com)

De bevestigings-, annulerings- en groepsaanvraagmails worden verstuurd door de
Supabase Edge Function `send-email` via Brevo. Afzender is
`noreply@denwittenhaen.com`; antwoorden van gasten gaan automatisch naar
`denwittenhaen@philadelphia.nl` (reply-to).

1. **Brevo-account**: maak een gratis account op https://www.brevo.com (300 mails/dag).
2. **Domein verifiëren** (anders belanden mails in spam of worden ze geweigerd):
   Brevo → *Senders, Domains & Dedicated IPs* → *Domains* → *Add a domain* →
   `denwittenhaen.com`. Brevo toont dan 4 DNS-records (DKIM, DMARC en een
   verificatie-record). Zet die bij de DNS-beheerder van denwittenhaen.com en
   klik in Brevo op *Verify*.
3. **Afzender toevoegen**: Brevo → *Senders* → *Add a sender* →
   naam `Den Witten Haen`, e-mail `noreply@denwittenhaen.com`.
4. **API-sleutel**: Brevo → *SMTP & API* → *API Keys* → *Generate a new API key*.
5. **Secrets in Supabase**: Supabase → *Edge Functions* → *Secrets*:
   - `BREVO_API_KEY` = de sleutel uit stap 4
   - `FROM_EMAIL` = `noreply@denwittenhaen.com` (optioneel, is al de standaard)
   - `RESTAURANT_EMAIL` = `denwittenhaen@philadelphia.nl` (optioneel, is al de standaard)
6. **Function deployen**: Supabase → *Edge Functions* → `send-email` → *Deploy*
   met de inhoud van `supabase/functions/send-email/index.ts`, of via de CLI:
   `supabase functions deploy send-email`.
7. **Testen**: maak een reservering op de site met je eigen e-mailadres.

Het domein in Brevo is `denwittenhaen.com` (zelfde als de website). Wil je een
ander afzenderadres, verifieer dat domein dan in Brevo en zet `FROM_EMAIL` erop.
