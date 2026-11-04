-- ╔══════════════════════════════════════════════════════════════════════════╗
-- ║  HERSTEL: de complete database in één keer                               ║
-- ╚══════════════════════════════════════════════════════════════════════════╝
--
-- Plak dit hele bestand in de SQL Editor van een nieuw, leeg Supabase-project
-- en druk op Run. Daarna staat de database er precies zoals het
-- reserveringssysteem hem verwacht: beide tabellen, de beveiligingsregels, de
-- vier functies en de realtime-koppeling voor het dashboard.
--
-- Dit vervangt het op volgorde draaien van schema.sql en de zes migraties.
-- Die bestanden blijven staan voor de geschiedenis; voor een nieuw project
-- heb je alleen dit bestand nodig.
--
-- Het script is veilig om nogmaals te draaien: het maakt niets kapot en gooit
-- geen bestaande reserveringen weg.

-- ─── Tabel: reservations ──────────────────────────────────────────────────────

create table if not exists reservations (
  id                 uuid default gen_random_uuid() primary key,
  created_at         timestamptz default now(),
  name               text not null,
  email              text not null,
  phone              text not null,
  date               date not null,
  time               text not null,
  guests             integer not null,
  message            text,
  status             text default 'aangevraagd',
  seating_preference text,
  reservation_type   text not null default 'lunch'
);

alter table reservations enable row level security;

-- Anoniem mag niets rechtstreeks met deze tabel: niet lezen (dan zouden de
-- naam, het telefoonnummer en het e-mailadres van elke gast op te vragen zijn
-- met de publieke sleutel uit de JavaScript) en niet schrijven (dan zouden de
-- controles in create_reservation te omzeilen zijn). Reserveren loopt via de
-- functie onderaan dit bestand, die met security definer draait.
drop policy if exists "anon_insert"  on reservations;
drop policy if exists "auth_select"  on reservations;
drop policy if exists "auth_update"  on reservations;

-- Ingelogd personeel ziet alle reserveringen en mag ze bevestigen of annuleren.
create policy "auth_select" on reservations
  for select to authenticated using (true);

create policy "auth_update" on reservations
  for update to authenticated using (true);

-- ─── Tabel: blocked_slots (sluitingen) ───────────────────────────────────────

create table if not exists blocked_slots (
  id         uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date       date not null,
  time_from  text,   -- leeg = de hele dag dicht
  time_to    text,   -- leeg terwijl time_from gevuld is = tot sluitingstijd
  reason     text
);

alter table blocked_slots enable row level security;

drop policy if exists "anon_select_blocked" on blocked_slots;
drop policy if exists "auth_all_blocked"    on blocked_slots;

-- Het reserveringsformulier moet kunnen zien wat gesloten is.
create policy "anon_select_blocked" on blocked_slots
  for select to anon using (true);

create policy "auth_all_blocked" on blocked_slots
  for all to authenticated using (true);

-- ─── Realtime voor het dashboard ─────────────────────────────────────────────
-- Zodat een binnenkomende reservering vanzelf op een openstaand dashboard
-- verschijnt. In een do-blok, want tweemaal toevoegen geeft een foutmelding.

do $$
begin
  alter publication supabase_realtime add table reservations;
exception
  when duplicate_object then null;
end
$$;

-- ─── Functie: bezetting per tijdslot ─────────────────────────────────────────
-- Geeft bewust alleen een optelsom terug, nooit rijen met persoonsgegevens.

create or replace function public.get_slot_counts(check_date date)
returns table(slot_time text, slot_count bigint)
language sql
security definer
set search_path = public
as $$
  select time as slot_time, sum(guests)::bigint as slot_count
  from reservations
  where date = check_date
    and status != 'geannuleerd'
  group by time;
$$;

revoke all on function public.get_slot_counts(date) from public;
grant execute on function public.get_slot_counts(date) to anon;
grant execute on function public.get_slot_counts(date) to authenticated;

-- ─── Functie: reservering aanmaken ───────────────────────────────────────────
-- Dit is de enige weg waarlangs een gast in de tabel komt. Alle regels staan
-- hier, want de JavaScript in de browser is openbaar en dus niet te vertrouwen:
-- maximaal 8 personen, geen datum in het verleden, geldig tijdslot, gesloten
-- dagen en tijdvakken, en maximaal 48 gasten gelijktijdig in een rollend
-- venster van twee uur.

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

  -- Tijdslot binnen een gesloten tijdvak?
  if exists (
    select 1 from blocked_slots
    where date = p_date
      and time_from is not null
      and p_time >= time_from
      and (time_to is null or p_time <= time_to)
  ) then
    raise exception 'Dit tijdslot is gesloten' using errcode = 'P0002';
  end if;

  -- Rollend venster van twee uur: nooit meer dan 48 gasten gelijktijdig.
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

  insert into reservations (
    name, email, phone, date, time, guests, message, status,
    seating_preference, reservation_type
  )
  values (
    p_name, p_email, p_phone, p_date, p_time, p_guests, p_message, 'aangevraagd',
    p_seating, coalesce(p_type, 'lunch')
  )
  returning id into new_id;

  return new_id;
end;
$$;

revoke all on function public.create_reservation(text, text, text, date, text, integer, text, text, text) from public;
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to anon;
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to authenticated;

-- ─── Functie: reservering tonen op de annuleerpagina ─────────────────────────
-- Geeft bewust geen e-mailadres en geen telefoonnummer terug: wie de link uit
-- de bevestigingsmail in handen krijgt, hoeft die gegevens niet te kunnen lezen.

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

-- ─── Functie: annuleren door de gast ─────────────────────────────────────────
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

-- ─── Controle ────────────────────────────────────────────────────────────────
-- Draai dit los om te zien of alles er staat. Verwacht: vier functies en
-- precies vier policies (auth_select, auth_update, anon_select_blocked,
-- auth_all_blocked).
--
--   select routine_name from information_schema.routines
--    where routine_schema = 'public' order by routine_name;
--
--   select tablename, policyname, roles from pg_policies
--    where schemaname = 'public' order by tablename, policyname;
