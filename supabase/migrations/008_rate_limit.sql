-- Migratie 008: rem op het aantal reserveringen per IP en per e-mailadres
--
-- create_reservation() is publiek aanroepbaar (dat moet ook: het formulier is
-- openbaar). Zonder rem kan een script honderden boekingen plaatsen, met voor
-- elke boeking een mail. Dat kost Brevo-quota en je reputatie als afzender.
--
-- De site draait op GitHub Pages zonder proxy ervoor, dus er is geen plek
-- bóven de database waar dit kan. Daarom hier.
--
-- Grenzen (ruim genoeg voor echte gasten, krap genoeg voor een script):
--   per IP-adres:     5 per uur, 20 per etmaal
--   per e-mailadres:  3 per uur
--
-- Draai dit eenmalig in de Supabase SQL Editor, NA migratie 004.

create table if not exists reservation_attempts (
  id         bigserial primary key,
  created_at timestamptz not null default now(),
  ip         text,
  email      text
);

create index if not exists reservation_attempts_created_idx on reservation_attempts (created_at);
create index if not exists reservation_attempts_ip_idx      on reservation_attempts (ip, created_at);
create index if not exists reservation_attempts_email_idx   on reservation_attempts (email, created_at);

-- Niemand hoeft hier via de API bij te kunnen: de tabel wordt alleen gevuld en
-- gelezen door create_reservation(), die met security definer draait.
alter table reservation_attempts enable row level security;
revoke all on table reservation_attempts from anon, authenticated;

-- Het IP-adres van de bezoeker, zoals PostgREST het doorgeeft. Ontbreekt de
-- header, dan geven we null terug: dan geldt alleen de e-mailrem, zodat we
-- nooit per ongeluk álle bezoekers in één emmer gooien.
create or replace function public.client_ip()
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  hdrs json;
  fwd  text;
begin
  begin
    hdrs := current_setting('request.headers', true)::json;
  exception when others then
    return null;
  end;
  if hdrs is null then
    return null;
  end if;
  fwd := hdrs ->> 'x-forwarded-for';
  if fwd is null or fwd = '' then
    return null;
  end if;
  -- x-forwarded-for kan een lijst zijn; het eerste adres is de bezoeker.
  return split_part(fwd, ',', 1);
end;
$$;

-- ─── create_reservation met rem ───────────────────────────────────────────────
-- Gelijk aan de versie uit migratie 004, met de controle hieronder erbij.
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
  v_ip     text;
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

  -- ── Rem tegen geautomatiseerde boekingen ───────────────────────────────────
  v_ip := client_ip();

  -- Oude regels opruimen, zodat de tabel niet eindeloos groeit.
  delete from reservation_attempts where created_at < now() - interval '2 days';

  if v_ip is not null then
    if (select count(*) from reservation_attempts
        where ip = v_ip and created_at > now() - interval '1 hour') >= 5 then
      raise exception 'Te veel reserveringen achter elkaar. Probeer het over een uur opnieuw of bel ons.'
        using errcode = 'P0007';
    end if;
    if (select count(*) from reservation_attempts
        where ip = v_ip and created_at > now() - interval '1 day') >= 20 then
      raise exception 'Te veel reserveringen vandaag. Bel ons gerust.'
        using errcode = 'P0007';
    end if;
  end if;

  if (select count(*) from reservation_attempts
      where email = lower(p_email) and created_at > now() - interval '1 hour') >= 3 then
    raise exception 'Er zijn net al reserveringen met dit e-mailadres gemaakt. Probeer het later opnieuw of bel ons.'
      using errcode = 'P0007';
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

  -- Pas tellen als de boeking echt is gelukt.
  insert into reservation_attempts (ip, email) values (v_ip, lower(p_email));

  return new_id;
end;
$$;

grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to anon;
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to authenticated;
