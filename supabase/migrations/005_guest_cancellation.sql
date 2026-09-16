-- Migratie 005: gast kan zelf annuleren via een link in de bevestigingsmail
--
-- De link bevat het id van de reservering (een willekeurige uuid, niet te
-- raden). Twee functies met security definer, zodat een anonieme bezoeker
-- alleen zijn eigen reservering kan zien en annuleren en nooit de tabel kan
-- uitlezen.
--
-- Draai dit eenmalig in de Supabase SQL Editor.

-- ─── Reservering ophalen voor de annuleerpagina ───────────────────────────────
-- Geeft bewust geen e-mailadres of telefoonnummer terug: wie de link in handen
-- krijgt, hoeft die gegevens niet te kunnen lezen.
create or replace function public.get_reservation_for_cancel(p_id uuid)
returns table(
  name             text,
  date             date,
  time             text,
  guests           integer,
  status           text,
  reservation_type text,
  is_past          boolean
)
language sql
security definer
set search_path = public
as $$
  select r.name,
         r.date,
         r.time,
         r.guests,
         r.status,
         r.reservation_type,
         (r.date < current_date) as is_past
  from reservations r
  where r.id = p_id;
$$;

revoke all on function public.get_reservation_for_cancel(uuid) from public;
grant execute on function public.get_reservation_for_cancel(uuid) to anon;
grant execute on function public.get_reservation_for_cancel(uuid) to authenticated;

-- ─── Annuleren door de gast ───────────────────────────────────────────────────
-- Alleen toekomstige reserveringen die nog niet geannuleerd zijn.
create or replace function public.cancel_reservation(p_id uuid)
returns table(
  name             text,
  date             date,
  time             text,
  guests           integer,
  reservation_type text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  r reservations%rowtype;
begin
  select * into r from reservations where id = p_id;

  if not found then
    raise exception 'Reservering niet gevonden' using errcode = 'P0004';
  end if;

  if r.status = 'geannuleerd' then
    raise exception 'Deze reservering is al geannuleerd' using errcode = 'P0005';
  end if;

  if r.date < current_date then
    raise exception 'Deze reservering ligt in het verleden' using errcode = 'P0006';
  end if;

  update reservations
     set status = 'geannuleerd'
   where id = p_id;

  return query
    select r.name, r.date, r.time, r.guests, r.reservation_type;
end;
$$;

revoke all on function public.cancel_reservation(uuid) from public;
grant execute on function public.cancel_reservation(uuid) to anon;
grant execute on function public.cancel_reservation(uuid) to authenticated;
