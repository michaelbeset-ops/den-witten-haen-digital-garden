> **Let op (status september 2026):** op dit moment wordt de site live gezet via
> **GitHub Pages** (`.github/workflows/deploy.yml`, domein `denwittenhaen.com` via
> `public/CNAME`). De Vimexx-FTP-workflow hieronder is beschreven, maar het bestand
> `deploy-vimexx.yml` bestaat (nog) niet in deze repo.
>
> **Database:** voer na het uitrollen eenmalig
> `supabase/migrations/004_fix_create_reservation_blocked_ranges.sql` uit in de
> Supabase SQL Editor. Zonder deze migratie faalt elke online reservering
> (migratie 003 gebruikte een kolom die in migratie 002 is verwijderd).

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


## E-mail instellen (Brevo, afzender noreply@denwittenhaen.nl)

De bevestigings-, annulerings- en groepsaanvraagmails worden verstuurd door de
Supabase Edge Function `send-email` via Brevo. Afzender is
`noreply@denwittenhaen.nl`; antwoorden van gasten gaan automatisch naar
`denwittenhaen@philadelphia.nl` (reply-to).

1. **Brevo-account**: maak een gratis account op https://www.brevo.com (300 mails/dag).
2. **Domein verifiëren** (anders belanden mails in spam of worden ze geweigerd):
   Brevo → *Senders, Domains & Dedicated IPs* → *Domains* → *Add a domain* →
   `denwittenhaen.nl`. Brevo toont dan 3 DNS-records (DKIM, DMARC en een
   verificatie-record). Zet die bij de DNS-beheerder van denwittenhaen.nl en
   klik in Brevo op *Verify*.
3. **Afzender toevoegen**: Brevo → *Senders* → *Add a sender* →
   naam `Den Witten Haen`, e-mail `noreply@denwittenhaen.nl`.
4. **API-sleutel**: Brevo → *SMTP & API* → *API Keys* → *Generate a new API key*.
5. **Secrets in Supabase**: Supabase → *Edge Functions* → *Secrets*:
   - `BREVO_API_KEY` = de sleutel uit stap 4
   - `FROM_EMAIL` = `noreply@denwittenhaen.nl` (optioneel, is al de standaard)
   - `RESTAURANT_EMAIL` = `denwittenhaen@philadelphia.nl` (optioneel, is al de standaard)
6. **Function deployen**: Supabase → *Edge Functions* → `send-email` → *Deploy*
   met de inhoud van `supabase/functions/send-email/index.ts`, of via de CLI:
   `supabase functions deploy send-email`.
7. **Testen**: maak een reservering op de site met je eigen e-mailadres.

Let op: de website draait op `denwittenhaen.com`, de afzender op
`denwittenhaen.nl`. Dat is prima, zolang `denwittenhaen.nl` in Brevo is
geverifieerd. Wil je liever `noreply@denwittenhaen.com`, verifieer dan dat
domein en zet `FROM_EMAIL` daarop.
