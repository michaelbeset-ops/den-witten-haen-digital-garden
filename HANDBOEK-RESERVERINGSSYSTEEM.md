# Reserveringssysteem: hoe het in elkaar zit en hoe je het opnieuw bouwt

Dit is de blauwdruk achter het reserveringssysteem van Den Witten Haen, opgeschreven
zodat je hem voor een volgende horecaklant kunt herhalen zonder opnieuw te bedenken
waarom iets zo is gedaan. Hij beschrijft de werkelijke code in deze repo, niet een
ideaalplaatje.

Reken op een halve dag voor een tweede klant: de code kopiëren en aanpassen kost
ongeveer twee uur, het wachten op DNS en domeinverificatie de rest.

---

## 1. Wat het systeem voor de klant doet

**Voor de gast**

- Reserveren voor 1 tot 8 personen: type (lunch of high tea), datum, tijdslot van
  een half uur, aantal personen, zitplaatsvoorkeur, opmerking.
- Tijdsloten die vol of gesloten zijn, zijn niet aanklikbaar. De gast ziet dat
  vóórdat hij zijn gegevens invult.
- Direct een e-mail "wij hebben uw reservering ontvangen", later een tweede mail
  zodra het restaurant bevestigt.
- Zelf annuleren via een link in die e-mail, zonder account en zonder te bellen.
- Meer dan 8 personen: geen directe boeking maar een aanvraag die als e-mail bij
  het restaurant binnenkomt. De agenda van een groep moet een mens inplannen.

**Voor het personeel**

- Een afgeschermd dashboard met de reserveringen van vandaag of van alle datums.
- Bevestigen en annuleren met één klik; de gast krijgt automatisch bericht.
- Sluitingen beheren: een hele dag of een tijdvak, met reden.
- Collega's een inlog geven of intrekken.
- Het scherm werkt realtime: een reservering die binnenkomt terwijl het dashboard
  openstaat, verschijnt vanzelf.

---

## 2. De architectuur in één blik

```
Bezoeker
   │
   ├─ website (React, statische bestanden)        → GitHub Pages
   │     │
   │     ├─ reserveren  ──rpc──►  create_reservation          ┐
   │     ├─ annuleren   ──rpc──►  cancel_reservation          │  Supabase
   │     ├─ tijdsloten  ──rpc──►  get_slot_counts             │  (Postgres)
   │     └─ dashboard   ──sql──►  reservations / blocked_slots┘
   │                      (alleen na inloggen)
   │
   └─ e-mail  ──POST──►  Edge Function send-email  ──►  Brevo  ──►  inbox gast
```

Drie onderdelen, verder niets:

| Onderdeel | Waarvoor | Kosten |
|---|---|---|
| GitHub Pages | de website zelf, statisch | gratis |
| Supabase | database, inloggen, de twee Edge Functions | gratis tot ongeveer 500 MB |
| Brevo | e-mail versturen vanaf het eigen domein | gratis tot 300 mails per dag |

Een lunchroom haalt die grenzen niet. Dat is precies waarom deze opzet is gekozen:
geen server om te beheren, geen maandrekening om aan de klant uit te leggen, en
niets dat stukgaat als je er een jaar niet naar omkijkt.

---

## 3. Waarom deze keuzes

**Geen WordPress met een reserveringsplug-in.** Die kosten per maand, sturen mail
vanaf hun eigen domein en je zit vast aan hun formulier. Hier is de gastbeleving
volledig in eigen hand en de klant betaalt niets.

**Statische site in plaats van een server.** Er is geen backend om te patchen. Dat
scheelt onderhoud én een hele categorie beveiligingsproblemen. De prijs: je kunt
geen HTTP-headers zetten op GitHub Pages (zie valkuil 6).

**De capaciteitsregel staat in de database, niet in de browser.** Dit is de
belangrijkste keuze van het hele systeem. De JavaScript in de browser is openbaar
en aanpasbaar; wie wil kan hem omzeilen. Daarom doet de database de controle nog
een keer, en die is niet te omzeilen.

**Reserveren gaat via een functie, niet via een INSERT.** De website roept
`create_reservation` aan, een Postgres-functie met `security definer`. Die functie
controleert alles en schrijft zelf de rij weg. De bezoeker heeft dus nergens
schrijfrechten op de tabel. Zonder die functie zou iedereen met de publieke sleutel
een reservering voor 500 personen op eerste kerstdag kunnen wegschrijven.

**De gast krijgt geen account.** Annuleren gaat via een link met het id van de
reservering erin: een willekeurige uuid, niet te raden. Vraag een gast om een
wachtwoord en hij belt liever.

---

## 4. De database

Twee tabellen, meer is het niet.

```sql
reservations   id · created_at · name · email · phone · date · time · guests
               message · status · seating_preference · reservation_type

blocked_slots  id · created_at · date · time_from · time_to · reason
               -- time_from leeg = hele dag dicht
               -- time_to leeg = vanaf time_from tot sluitingstijd
```

`status` is `aangevraagd`, `bevestigd` of `geannuleerd`. Geannuleerde reserveringen
worden niet verwijderd; ze tellen alleen niet meer mee voor de capaciteit. Zo kan
het personeel altijd terugkijken wat er gebeurd is.

### Row Level Security

RLS staat op beide tabellen aan. De regels zijn kort:

- Anoniem mag `blocked_slots` **lezen** (het formulier moet weten wat dicht is).
- Ingelogd personeel mag alles op beide tabellen.
- Anoniem mag **niets** rechtstreeks in `reservations`: niet lezen, niet schrijven.

Dat laatste is belangrijk. Zou anoniem mogen lezen, dan kan iedereen met de publieke
sleutel de naam, het telefoonnummer en het e-mailadres van elke gast ophalen. Zou
anoniem mogen schrijven, dan zijn alle controles van `create_reservation` voor niets.
In deze repo stond die schrijf-policy er aanvankelijk wel; migratie 006 haalt hem weg.

### De vier functies

Alle vier draaien met `security definer`: ze werken onder de rechten van de eigenaar
en omzeilen RLS. Daarom kunnen ze precies één ding, en niets meer.

| Functie | Wie mag hem aanroepen | Wat hij teruggeeft |
|---|---|---|
| `get_slot_counts(datum)` | iedereen | per tijdslot het aantal gasten — geen namen |
| `create_reservation(…)` | iedereen | het id van de nieuwe reservering |
| `get_reservation_for_cancel(id)` | iedereen | naam, datum, tijd, status — **geen e-mail of telefoon** |
| `cancel_reservation(id)` | iedereen | de geannuleerde reservering |

Let op wat er *niet* in staat. `get_slot_counts` geeft een som terug, geen rijen.
`get_reservation_for_cancel` laat het e-mailadres en telefoonnummer weg: wie de
annuleerlink onderschept hoeft die niet te kunnen lezen. Dat soort weglatingen is
het halve beveiligingswerk.

### De capaciteitsregel

De regel gaat uit van 48 gelijktijdige gasten en een zitting van ongeveer twee uur.
Hij luidt dus niet "48 per tijdslot" maar "nooit meer dan 48 gelijktijdig aanwezig". De
functie schuift daarvoor een venster van twee uur (vier stappen van een half uur)
over het tijdslot heen en kijkt naar de zwaarste stand:

```sql
for k in 0..3 loop
  -- alle reserveringen die tussen (k-4)*30 en k*30 minuten hiervandaan vallen
  -- optellen, plus de nieuwe gasten
end loop;
if max_load > 48 then raise exception ... end if;
```

Diezelfde berekening staat ook in `src/lib/reservations.ts` (`windowLoad`), zodat
de gast een vol tijdslot al grijs ziet voordat hij iets invult. **Beide moeten
kloppen.** Verandert de zaalgrootte, dan pas je twee plekken aan.

### Nette foutmeldingen

De functie werpt fouten met een eigen code, die de frontend vertaalt:

| Code | Betekenis | Wat de gast leest |
|---|---|---|
| P0001 | te vol | "Dit tijdslot heeft niet genoeg ruimte meer voor uw gezelschap." |
| P0002 | gesloten | "Dit tijdslot is helaas gesloten." |
| P0003 | ongeldige invoer | "Controleer de datum, tijd en het aantal personen." |
| P0004/5/6 | annuleren: onbekend / al geannuleerd / verleden | idem, per geval |

Kleine moeite, groot verschil. Zonder die codes krijgt de gast een databasefout te
zien of een nietszeggend "er ging iets mis".

---

## 5. Dubbele controle bij het boeken

Twee gasten die tegelijk het laatste plekje pakken, is het klassieke probleem. De
oplossing hier heeft twee lagen:

1. Vlak voor het opslaan haalt de frontend de beschikbaarheid nóg eens op. Is het
   tijdslot inmiddels vol, dan krijgt de gast een nette melding en kan hij een ander
   tijdslot kiezen. Dit is puur voor de beleving.
2. De database controleert het daarna opnieuw, in de functie zelf. Dit is de
   controle die telt.

De eerste laag mag je weglaten, de tweede nooit.

---

## 6. E-mail

Eén Edge Function, `send-email`, die vier soorten berichten kent:

| Type | Naar wie | Wanneer |
|---|---|---|
| `received` | de gast | direct na het boeken |
| `confirmed` | de gast | als het personeel op bevestigen klikt |
| `cancellation` | de gast, of het restaurant | wie annuleert bepaalt de ontvanger |
| `group_request` | het restaurant | aanvraag voor meer dan 8 personen |

De mails zijn HTML-tabellen in de huisstijl, met een platte-tekstversie erbij.
Ouderwets, maar tabellen zijn het enige dat in Outlook, Gmail en Apple Mail
hetzelfde oogt.

Drie dingen die je niet moet overslaan:

- **Alles wat een gast intypt gaat door `escape()`** voordat het in de HTML komt.
  Een naam als `<b>Jan` mag de opmaak van de mail niet kapotmaken, en een gast
  mag geen HTML in een mail naar het restaurant kunnen smokkelen.
- **`replyTo` wijst naar de juiste partij.** De gast antwoordt op het restaurant,
  het restaurant antwoordt bij een groepsaanvraag rechtstreeks op de gast. De
  afzender blijft `noreply@`.
- **Een mislukte mail mag de reservering niet ongedaan maken.** De reservering
  staat vast in de database; lukt de mail niet, dan krijgt de gast op het scherm
  te zien dat hij moet bellen. Bij een groepsaanvraag is het andersom: die
  bestáát alleen als e-mail, dus daar is een mislukte verzending wél een fout.

Verificatie van het domein bij Brevo (DKIM en DMARC in de DNS) is geen bijzaak.
Zonder die records komt de post in de spammap of wordt hij geweigerd.

---

## 7. Beheer en inloggen

Het personeel logt in met e-mail en wachtwoord via Supabase Auth. Er is bewust
**geen registratieformulier**: nieuwe collega's worden toegevoegd vanuit het
dashboard door iemand die al binnen is. Die toevoeg-actie loopt via de Edge
Function `manage-users`, omdat daar de service-sleutel voor nodig is en die nooit
in de browser mag staan.

> **Zet zelfregistratie uit in Supabase** (Authentication → Providers → Email →
> Enable signup). Staat die aan, dan kan iedereen een account maken, en een account
> geeft toegang tot alle reserveringsgegevens. Dit is de eerste instelling die je
> bij een nieuwe klant controleert.

---

## 8. Uitrol

Push naar `main` → GitHub Actions bouwt de site → GitHub Pages serveert hem op het
eigen domein (`public/CNAME`). De twee sleutels van Supabase komen als GitHub
Secrets de build in.

Die sleutels zijn geen geheim: de anon-sleutel is bedoeld om in de browser te staan
en wordt beschermd door RLS. Ze staan als secret ingesteld omdat je ze per klant
wilt wisselen, niet omdat ze gevoelig zijn.

**De keepalive-workflow is geen luxe.** Supabase pauzeert een gratis project na
zeven dagen zonder activiteit, en een gepauzeerd project betekent: niemand kan meer
reserveren, totdat iemand het handmatig hervat. Een rustige januari is genoeg. De
workflow `supabase-keepalive.yml` doet daarom elke werkdag één klein leesverzoek.

---

## 9. Stappenplan voor een nieuwe klant

**Voorbereiding (vraag dit vóór je begint)**

1. Domeinnaam, en waar de DNS wordt beheerd.
2. Adres, telefoonnummer, e-mailadres van de zaak.
3. Openingstijden per dag, en de duur van een zitting.
4. Aantal stoelen, en of binnen en buiten los geteld moeten worden.
5. Welke reserveringstypen (lunch, diner, high tea) en vanaf welk aantal personen
   het een aanvraag wordt in plaats van een boeking.
6. Wie de mails ontvangt en wie er in het dashboard moet kunnen.

**Bouwen**

7. Repo kopiëren, `git remote` naar de nieuwe repo zetten.
8. Supabase-project aanmaken in een EU-regio. **Zelfregistratie uitzetten.**
9. `supabase/schema.sql` draaien in de SQL Editor, daarna de migraties op volgorde.
   Op een nieuw project is `schema.sql` plus migratie 005 en 006 genoeg.
10. Openingstijden, tijdsloten en capaciteit aanpassen in `src/lib/reservations.ts`
    én in `create_reservation`. Twee plekken, dezelfde regel.
11. Klantgegevens vervangen (zie de tabel hieronder).
12. Brevo-account, domein verifiëren, DNS-records zetten, API-sleutel als secret in
    Supabase. Beide Edge Functions deployen.
13. `ALLOWED_ORIGINS` en `ALLOWED_LINK_HOSTS` in de Edge Functions op het nieuwe
    domein zetten.
14. CNAME, sitemap, robots.txt en de CSP-hashes in `index.html` bijwerken.
15. GitHub Secrets zetten, Pages aanzetten, custom domain + "Enforce HTTPS".
16. Eerste beheerder aanmaken in Supabase, wachtwoord laten instellen via
    "wachtwoord vergeten".

**Opleveren**

17. Testreservering maken met je eigen e-mailadres. Mail aangekomen? Annuleerlink
    werkt? Dashboard toont hem? Bevestigen stuurt de tweede mail?
18. De beveiligingschecklist in paragraaf 11 aflopen.
19. Het restaurant laten zien hoe sluitingen werken. Dat is het enige onderdeel dat
    ze zelf structureel gebruiken.

### Wat je per klant moet aanpassen

| Waar | Wat |
|---|---|
| `supabase/functions/send-email/index.ts` | naam, adres, telefoon, openingstijden, afzender, toegestane domeinen |
| `src/lib/reservations.ts` | tijdsloten, capaciteit, maximum per reservering, contactgegevens |
| `index.html` | titel, omschrijving, structured data, CSP-hashes |
| `src/pages/Index.tsx`, `Team.tsx`, `Menu.tsx`, `Locaties.tsx`, `Groepen.tsx` | teksten en foto's |
| `src/pages/Privacy.tsx`, `Cookies.tsx` | verwerkers en contactgegevens |
| `public/CNAME`, `sitemap.xml`, `robots.txt`, `404.html` | het domein |
| `src/components/Footer.tsx`, `Navbar.tsx` | contact en sociale media |
| `supabase/functions/manage-users/index.ts` | toegestane domeinen |

Wil je het echt herhaalbaar maken, trek die waarden dan eerst uit elkaar naar één
`src/config/klant.ts` en één instellingenblok bovenin de Edge Function. Dat is het
eerste dat ik zou doen voor klant nummer drie.

---

## 10. Valkuilen, uit ervaring

1. **Migraties op volgorde draaien, en controleren dát ze gedraaid zijn.** Een
   overgeslagen migratie laat het formulier stukgaan zonder dat iemand het merkt,
   want de fout verschijnt pas bij de eerste echte reservering.
2. **Supabase pauzeert een stil project.** Zie de keepalive-workflow.
3. **Tijdzones.** `toISOString()` rekent in UTC en geeft 's avonds laat de
   verkeerde dag in Nederland. Daarom bouwt `localDateStr()` de datum met de hand
   op uit jaar, maand en dag.
4. **De capaciteitsregel staat op twee plekken.** Pas je er één aan, dan ziet de
   gast een vrij tijdslot dat de database weigert.
5. **Een Edge Function is openbaar zodra hij gedeployed is.** De anon-sleutel staat
   in de JavaScript van de site, dus iedereen kan hem meesturen. Controleer aan de
   serverkant, en ga er niet van uit dat alleen jouw formulier belt. In deze opzet
   betekent dat concreet: de annuleerlink in een mail mag alleen naar het eigen
   domein wijzen, anders kun je er phishingmail mee laten versturen met de
   afzender van de klant.
6. **Op GitHub Pages kun je geen HTTP-headers zetten.** De Content-Security-Policy
   staat daarom als meta-tag in `index.html`, met sha256-hashes voor de twee inline
   scripts. Wijzig je zo'n script, ook maar één spatie, dan moet de hash mee.
   `frame-ancestors` werkt niet in een meta-tag; clickjacking-bescherming krijg je
   pas op hosting waar headers wél kunnen.
7. **`securityheaders.com` geeft zo'n site altijd een F.** Die scanner kijkt alleen
   naar headers. Leg dat uit voordat de klant het zelf ontdekt en schrikt.

---

## 11. Beveiligingschecklist bij oplevering

- [ ] Zelfregistratie uit in Supabase Auth.
- [ ] Anoniem kan `reservations` niet lezen en niet schrijven (migratie 006).
- [ ] Alle publieke functies `security definer`, en geen van alle geeft meer terug
      dan strikt nodig.
- [ ] `ALLOWED_ORIGINS` en `ALLOWED_LINK_HOSTS` op het juiste domein.
- [ ] Service-sleutel alleen als secret in Supabase, nergens in de repo.
- [ ] `.env` in `.gitignore`.
- [ ] Alle gastinvoer in mails door `escape()`.
- [ ] SPF, DKIM en DMARC gezet en geverifieerd; een testmail komt in de inbox,
      niet in spam.
- [ ] HTTPS afgedwongen, http leidt door naar https.
- [ ] Privacyverklaring noemt de échte verwerkers bij naam, met de juiste regio.
- [ ] Dependabot staat aan.
- [ ] `npm audit`: niets kritieks in wat de bezoeker laadt. Lekken in
      bouwgereedschap (vite, vitest, eslint) zijn minder dringend — die code komt
      nooit in de browser van een gast.

---

## 12. Wat ik een volgende keer anders zou doen

- **Alle klantgegevens in één configuratiebestand.** Nu staan ze verspreid over
  ruim twintig bestanden. Dat is de grootste tijdvreter bij het kopiëren.
- **Rollen in het gebruikersbeheer.** Nu mag iedereen die kan inloggen ook
  collega's toevoegen en verwijderen. Bij een grotere zaak wil je onderscheid
  tussen bediening en beheer.
- **Een rem op het reserveringsformulier.** Er zit geen snelheidsbegrenzing op.
  Eén iemand met een script kan de agenda volzetten met nepreserveringen. Voor een
  lunchroom is dat theoretisch, maar het is wel het eerste dat ik zou toevoegen als
  het ooit gebeurt.
- **Automatisch opschonen na de bewaartermijn.** De privacyverklaring belooft dat
  gegevens na twaalf maanden weg zijn. Nu moet iemand dat handmatig doen; een
  geplande taak die oude rijen opruimt, maakt die belofte waar.
