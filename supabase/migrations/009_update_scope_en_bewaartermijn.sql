-- Migratie 009: twee kleinere punten uit de doorlichting
--
-- 1. Personeel kon via de policy auth_update ELK veld van elke reservering
--    wijzigen, ook naam, e-mailadres en telefoonnummer. Het dashboard doet dat
--    niet (het zet alleen status), dus we beperken het recht tot die kolom.
--    RLS werkt niet per kolom; kolomrechten wel.
--
-- 2. Er was geen bewaartermijn: persoonsgegevens van gasten bleven eeuwig
--    staan. De AVG vraagt niet langer te bewaren dan nodig.
--
-- Draai dit eenmalig in de Supabase SQL Editor.

-- ─── 1. Alleen de status mag gewijzigd worden ─────────────────────────────────

revoke update on table reservations from authenticated;
grant  update (status) on table reservations to authenticated;

-- De policy blijft nodig (RLS bepaalt WELKE rijen), het kolomrecht bepaalt
-- WELKE velden.

-- ─── 2. Bewaartermijn ─────────────────────────────────────────────────────────
-- Verwijdert reserveringen die langer dan p_maanden geleden plaatsvonden.
-- Standaard 24 maanden: ruim genoeg om terug te kijken hoe druk het vorig jaar
-- in dezelfde week was, en niet langer dan nodig.
--
-- Let op: dit verwijdert gegevens definitief. Maak eerst een back-up
-- (scripts/backup-reserveringen.mjs) en draai hem de eerste keer met de
-- select hieronder om te zien wat er weg zou gaan.

create or replace function public.purge_old_reservations(p_maanden integer default 24)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  aantal integer;
begin
  if p_maanden is null or p_maanden < 1 then
    raise exception 'Ongeldige bewaartermijn';
  end if;

  delete from reservations
   where date < (current_date - make_interval(months => p_maanden));

  get diagnostics aantal = row_count;
  return aantal;
end;
$$;

-- Niemand mag dit via de API aanroepen; alleen handmatig of via een taak.
revoke all on function public.purge_old_reservations(integer) from public, anon, authenticated;

-- Eerst kijken wat er weg zou gaan:
--   select count(*) from reservations where date < current_date - interval '24 months';
--
-- Daarna opruimen:
--   select purge_old_reservations(24);
--
-- Automatisch maandelijks (alleen als de extensie pg_cron beschikbaar is):
--   select cron.schedule('bewaartermijn-reserveringen', '0 3 1 * *',
--                        $job$ select purge_old_reservations(24) $job$);
