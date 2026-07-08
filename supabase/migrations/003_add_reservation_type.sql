-- Migration 003: reservation type (lunch / high tea)
-- Run this in the Supabase SQL editor (once, on your existing database).

-- 1. Add reservation_type column to existing reservations table.
--    Defaults to 'lunch' so existing rows stay valid.
alter table reservations
  add column if not exists reservation_type text not null default 'lunch';

-- 2. Update create_reservation: add p_type param and store it.
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

  insert into reservations (name, email, phone, date, time, guests, message, status, seating_preference, reservation_type)
  values (p_name, p_email, p_phone, p_date, p_time, p_guests, p_message, 'aangevraagd', p_seating, coalesce(p_type, 'lunch'))
  returning id into new_id;

  return new_id;
end;
$$;

-- Re-grant execute permission (create or replace revokes it)
grant execute on function public.create_reservation(text, text, text, date, text, integer, text, text, text) to anon;

-- Revoke the previous 8-argument signature so the frontend uses the new one
drop function if exists public.create_reservation(text, text, text, date, text, integer, text, text);
