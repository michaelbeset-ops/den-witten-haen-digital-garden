-- Migratie 006: directe inserts door anonieme bezoekers intrekken
--
-- De policy "anon_insert" liet een anonieme bezoeker rechtstreeks rijen in
-- reservations schrijven. Het formulier op de site doet dat niet: dat gebruikt
-- de functie create_reservation(), die capaciteit, sluitingsdagen en het maximum
-- van 8 personen controleert. Wie de API rechtstreeks aanroept sloeg al die
-- controles over en kon boeken op een gesloten dag of een volle tafel.
--
-- create_reservation() draait met security definer en heeft deze policy niet
-- nodig; reserveren via de site blijft dus gewoon werken.
--
-- Draai dit eenmalig in de Supabase SQL Editor.
-- Test daarna een proefreservering via de site en annuleer die weer.

drop policy if exists "anon_insert" on reservations;

-- Voor de zekerheid: de anon-rol mag niet buiten de RPC om in de tabel schrijven.
revoke insert on table reservations from anon;

-- De reserveringsfunctie blijft publiek aanroepbaar.
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to anon;
