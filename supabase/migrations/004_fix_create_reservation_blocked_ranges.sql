-- Migration 004: herstel create_reservation
--
-- Migratie 003 (reservation_type) overschreef create_reservation met een oude
-- versie die nog de kolom blocked_slots.time gebruikte. Die kolom bestaat sinds
-- migratie 002 niet meer (vervangen door time_from / time_to). Gevolg: elke
-- online reservering faalt met "column time does not exist".
--
-- Deze migratie combineert beide: range-based sluitingen (002) + reservation_type (003).
-- Draai dit eenmalig in de Supabase SQL Editor.

create or replace function public.create_reservation(
  p_name    text,
  p_email   text,
  p_phone   text,
  p_date    date,
  p_time    text,
  p_guests  integer,
  p_message text    default null,
  p_seating text    default null,
  p_type    text    default 'lunch'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_id   uuid;
  max_load integer := 0;
  sub_load integer;
  k        integer;
begin
  -- Basisvalidatie (de frontend valideert ook, maar de functie is publiek aanroepbaar)
  if p_guests is null or p_guests < 1 or p_guests > 8 then
    raise exception 'Ongeldig aantal personen' using errcode = 'P0003';
  end if;
  if p_time !~ '^\d{2}:\d{2}$' then
    raise exception 'Ongeldig tijdslot' using errcode = 'P0003';
  end if;
  if p_date < current_date then
    raise exception 'Datum ligt in het verleden' using errcode = 'P0003';
  end if;

  -- Hele dag gesloten?
  if exists (
    select 1 from blocked_slots
    where date = p_date and time_from is null
  ) then
    raise exception 'Op deze dag zijn wij gesloten' using errcode = 'P0002';
  end if;

  -- Tijdslot valt binnen een geblokkeerde range?
  if exists (
    select 1 from blocked_slots
    where date = p_date
      and time_from is not null
      and p_time >= time_from
      and (time_to is null or p_time <= time_to)
  ) then
    raise exception 'Dit tijdslot is gesloten' using errcode = 'P0002';
  end if;

  -- Rollend 2-uurs venster: max 48 gasten gelijktijdig
  for k in 0..3 loop
    select coalesce(sum(r.guests), 0) + p_guests
    into sub_load
    from reservations r
    where r.date    = p_date
      and r.status != 'geannuleerd'
      and extract(epoch from (r.time::time - p_time::time)) / 60 >  (k - 4) * 30
      and extract(epoch from (r.time::time - p_time::time)) / 60 <=  k      * 30;

    if sub_load > max_load then
      max_load := sub_load;
    end if;
  end loop;

  if max_load > 48 then
    raise exception 'Dit tijdslot heeft niet genoeg ruimte' using errcode = 'P0001';
  end if;

  insert into reservations (name, email, phone, date, time, guests, message, status, seating_preference, reservation_type)
  values (p_name, p_email, p_phone, p_date, p_time, p_guests, p_message, 'aangevraagd', p_seating, coalesce(p_type, 'lunch'))
  returning id into new_id;

  return new_id;
end;
$$;

-- create or replace behoudt grants, maar expliciet is veiliger
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to anon;
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to authenticated;
