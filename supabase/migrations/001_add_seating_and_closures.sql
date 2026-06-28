-- Migration 001: seating preference + closures
-- Run this in the Supabase SQL editor (once, on your existing database).

-- 1. Add seating_preference column to existing reservations table
alter table reservations
  add column if not exists seating_preference text;

-- 2. Create blocked_slots table for closures management
create table if not exists blocked_slots (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  date date not null,
  time text,       -- null = whole day blocked
  reason text
);

alter table blocked_slots enable row level security;

create policy "anon_select_blocked" on blocked_slots
  for select to anon using (true);

create policy "auth_all_blocked" on blocked_slots
  for all to authenticated using (true);

-- 3. Update create_reservation: add p_seating param + blocked_slots check
create or replace function public.create_reservation(
  p_name    text,
  p_email   text,
  p_phone   text,
  p_date    date,
  p_time    text,
  p_guests  integer,
  p_message text    default null,
  p_seating text    default null
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
  -- Check if the whole day is blocked
  if exists (
    select 1 from blocked_slots
    where date = p_date and time is null
  ) then
    raise exception 'Op deze dag zijn wij gesloten' using errcode = 'P0002';
  end if;

  -- Check if the specific time slot is blocked (left() guards against HH:MM:SS in old data)
  if exists (
    select 1 from blocked_slots
    where date = p_date and left(time, 5) = left(p_time, 5)
  ) then
    raise exception 'Dit tijdslot is gesloten' using errcode = 'P0002';
  end if;

  -- Rolling window: check 4 sub-windows (T+0, T+30, T+60, T+90 min)
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

  insert into reservations (name, email, phone, date, time, guests, message, status, seating_preference)
  values (p_name, p_email, p_phone, p_date, p_time, p_guests, p_message, 'aangevraagd', p_seating)
  returning id into new_id;

  return new_id;
end;
$$;

-- Re-grant execute permission (create or replace revokes it)
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text) to anon;

-- Revoke the old 7-argument signature so the frontend must use the new one
drop function if exists public.create_reservation(text, text, text, date, text, integer, text);
