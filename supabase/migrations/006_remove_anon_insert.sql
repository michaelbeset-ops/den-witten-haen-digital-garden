-- Migratie 006: anonieme bezoekers mogen niet langer rechtstreeks in
-- `reservations` schrijven.
--
-- Waarom
--   De policy "anon_insert" liet iedereen met de anon-sleutel (die in de
--   JavaScript van de site staat en dus openbaar is) rechtstreeks rijen in
--   `reservations` zetten via de REST-API. Daarmee omzeilt hij elke controle
--   die in `create_reservation` zit: maximaal 8 personen, geen datum in het
--   verleden, geldig tijdslot, gesloten dagen en de capaciteitsgrens van 48
--   gasten per twee uur. Ook konden zo velden worden gezet die het formulier
--   niet aanbiedt, zoals `status = 'bevestigd'`.
--
-- Waarom dit niets breekt
--   De website reserveert uitsluitend via `supabase.rpc('create_reservation', …)`
--   (zie src/components/ReservationForm.tsx). Die functie draait met
--   `security definer`, dus onder de rechten van de eigenaar van de tabel, en
--   heeft de policy niet nodig. Dat `get_slot_counts` vandaag al werkt terwijl
--   er geen select-policy voor anon bestaat, bevestigt dat.
--
-- Draai dit eenmalig in de Supabase SQL Editor.

drop policy if exists "anon_insert" on reservations;

-- Het personeel (ingelogd) schrijft ook niet rechtstreeks: bevestigen en
-- annuleren gaan via een update, en die policy blijft gewoon staan.
