# Beveiliging — denwittenhaen.com

Status: september 2026. Hosting: GitHub Pages (statisch), database en e-mail via
Supabase + Brevo. Geen Cloudflare of andere proxy ervoor.

Dit bestand beschrijft wat er in de repo is opgelost en wat je **zelf** nog moet
doen. De stappen hieronder zijn niet optioneel: zonder de migraties en de deploy
verandert er niets aan de live situatie.

## 1. Draai de migraties (Supabase → SQL Editor)

Op volgorde, en controleer na elke stap of reserveren nog werkt:

| Migratie | Waarom |
|---|---|
| `004_fix_create_reservation_blocked_ranges.sql` | Zonder deze faalt elke online reservering |
| `005_guest_cancellation.sql` | Annuleerlink in de bevestigingsmail |
| `006_remove_anon_insert.sql` | Anonieme bezoekers kunnen niet meer langs de controles heen boeken |
| `007_admins.sql` | Beheerdersrol voor `manage-users` |
| `008_rate_limit.sql` | Rem op geautomatiseerde boekingen |
| `009_update_scope_en_bewaartermijn.sql` | Personeel mag alleen nog `status` wijzigen; bewaartermijn toegevoegd |

Na `007` moet je jezelf eenmalig als beheerder aanzetten, anders werkt
gebruikersbeheer voor niemand meer:

```sql
insert into admins (user_id)
select id from auth.users where email = 'jouw@adres.nl';
```

Dat de tabel leeg begint is bewust: dicht is de veilige startstand.

## 2. Deploy in deze volgorde: eerst de site, dan de Edge Functions

**De volgorde is belangrijk.** `send-email` haalt de gegevens van de gast
voortaan uit de database en verwacht een `reservationId` in het verzoek. De
nieuwe site stuurt dat mee, de oude niet.

1. Eerst de site: merge naar `main` (de GitHub Action deployt naar Pages).
   De oude Edge Function negeert `reservationId` en blijft gewoon werken.
2. Daarna de functies:

```bash
supabase functions deploy send-email
supabase functions deploy manage-users
```

Andersom (eerst de functie) stoppen de bevestigingsmails totdat de site live
staat. Test na stap 2 een proefreservering en controleer of de mail aankomt.

## 3. Zet self-signup uit (Supabase → Authentication → Providers → Email)

Zet **"Allow new users to sign up"** uit. Staat die aan, dan kan een willekeurige
bezoeker een account aanmaken. Sinds migratie 007 levert dat geen beheerrechten
meer op, maar een account geeft via de policy `auth_select` wel toegang tot alle
reserveringen — dus naam, e-mail en telefoon van je gasten.

Zet ook 2FA aan op je eigen beheeraccount als Supabase dat voor je plan biedt.

## 4. E-mail: SPF, DKIM, DMARC (bij je DNS-provider)

**Nog niet gecontroleerd en nog niet aangepast.** Controleer eerst wat er staat:

```bash
dig +short TXT denwittenhaen.com
dig +short TXT _dmarc.denwittenhaen.com
```

- **SPF** — er mag er maar **één** zijn. Bestaat er al een record, voeg dan
  alleen `include:spf.brevo.com` toe aan het bestaande record; maak er geen
  tweede bij. Zonder bestaand record:
  `v=spf1 include:spf.brevo.com ~all`
- **DKIM** — laat Brevo je domein verifiëren (Brevo → Senders & IP → Domains).
  Brevo geeft de exacte records; die neem je letterlijk over.
- **DMARC** — begin altijd met observeren, nooit met blokkeren:
  `v=DMARC1; p=none; rua=mailto:jouw@adres.nl`
  Kijk een paar weken naar de rapporten. Pas als je zeker weet dat alle
  legitieme mail (Brevo én eventuele mail via Philadelphia of je hosting)
  doorkomt, verscherp je naar `p=quarantine` en later eventueel `p=reject`.

Zet DMARC **nooit** in één keer op `p=reject`. Je bevestigingsmails belanden dan
stilletjes in de spambox en je merkt het pas als een gast belt.

## 5. Back-up

```bash
SUPABASE_URL=https://xxx.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=... \
node scripts/backup-reserveringen.mjs
```

Bewaar de map buiten je computer. Zet minstens één keer een back-up terug om te
controleren dat het werkt — een back-up die nooit is teruggezet is een aanname.

Dit draait bewust **niet** als GitHub Action: de export bevat persoonsgegevens
van gasten en die horen niet als build-artifact in GitHub te staan.

## Wat op deze hosting niet kan

GitHub Pages laat geen eigen HTTP-headers toe. Daarom:

- **CSP** staat als `<meta>`-tag in de pagina (zie `vite.config.ts`), zowel in
  `index.html` als in `404.html`. Geverifieerd in Chromium: alle pagina's
  renderen en de SPA-redirect van GitHub Pages blijft werken.
- **X-Frame-Options / frame-ancestors** kan niet via een meta-tag. De site is
  dus niet beschermd tegen inbedding in een frame op een andere site. Voor een
  lunchroomsite met een losse beheerlogin is dat een klein risico; wil je het
  echt dicht, dan is Cloudflare ervoor zetten de oplossing.
- `public/.htaccess` doet op GitHub Pages **niets**. Dat bestand is alleen
  relevant als de site ooit op Apache-hosting (Vimexx) draait.

## Bewaartermijn gebruiken (migratie 009)

Migratie 009 voegt een functie toe, maar ruimt niets automatisch op. Kijk eerst
wat er weg zou gaan, maak een back-up, en draai hem dan:

```sql
select count(*) from reservations where date < current_date - interval '24 months';
select purge_old_reservations(24);
```

## Openstaand

- **Clickjacking.** `frame-ancestors` / `X-Frame-Options` kan niet via een
  meta-tag en GitHub Pages laat geen headers toe. Klein risico voor deze site;
  alleen op te lossen door Cloudflare ervoor te zetten.
- **`manage-users` bestaat nog** terwijl de site de functie nergens gebruikt.
  Hij is nu afgeschermd met de admins-tabel, maar het schoonste is hem
  weghalen: `supabase functions delete manage-users` en het bestand
  verwijderen.
- Gebruik SFTP, niet FTP, als je ooit naar Vimexx deployt (zie `DEPLOYMENT.md`).
