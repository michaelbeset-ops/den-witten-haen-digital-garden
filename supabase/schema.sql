-- Den Witten Haen: reservations schema
-- Run this in the Supabase SQL editor to set up the database schema from scratch.
-- For an existing database, run the files in supabase/migrations/ in order instead.
-- This file reflects the state after migrations 004 and 006.
-- Let op: migratie 005 (annuleren door de gast) staat hier NIET in; draai die
-- apart uit supabase/migrations/.

create table if not exists reservations (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  phone text not null,
  date date not null,
  time text not null,
  guests integer not null,
  message text,
  status text default 'aangevraagd',
  seating_preference text,
  reservation_type text not null default 'lunch'
);

-- Row Level Security
alter table reservations enable row level security;

-- Anonieme bezoekers mogen NIET rechtstreeks in de tabel schrijven: het
-- reserveringsformulier gaat via create_reservation() hieronder, dat met
-- security definer draait en capaciteit en sluitingsdagen controleert.
-- (Zie migratie 006; een directe insert-policy omzeilt al die controles.)
revoke insert on table reservations from anon;

-- Authenticated users (staff) may read all reservations
create policy "auth_select" on reservations
  for select to authenticated using (true);

-- Authenticated users may update status (confirm / cancel)
create policy "auth_update" on reservations
  for update to authenticated using (true);

-- Enable realtime updates for the dashboard
alter publication supabase_realtime add table reservations;

-- ─── blocked_slots ────────────────────────────────────────────────────────────

create table if not exists blocked_slots (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date date not null,
  time_from text,  -- null = whole day blocked
  time_to text,    -- null (with time_from set) = from time_from until end of day
  reason text
);

alter table blocked_slots enable row level security;

-- Anyone (incl. anon) may read blocked slots (to show closed slots on form)
create policy "anon_select_blocked" on blocked_slots
  for select to anon using (true);

-- Authenticated staff may manage closures
create policy "auth_all_blocked" on blocked_slots
  for all to authenticated using (true);

-- ─── RPC: slot guest totals ───────────────────────────────────────────────────
-- Returns sum of guests per slot (not count of reservations).
-- Uses security definer so anon users get only counts, never personal data.
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

grant execute on function public.get_slot_counts(date) to anon;

-- ─── RPC: create reservation ──────────────────────────────────────────────────
-- Rolling 2-hour window capacity check (max 48 concurrent guests).
-- Also checks blocked_slots (range-based) so a closed day/slot cannot be booked.
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
