-- Den Witten Haen — reservations table
-- Run this in the Supabase SQL editor to set up the database schema.

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
  status text default 'aangevraagd'
);

-- Row Level Security
alter table reservations enable row level security;

-- Anonymous users may insert (public reservation form)
create policy "anon_insert" on reservations
  for insert to anon with check (true);

-- Authenticated users (staff) may read all reservations
create policy "auth_select" on reservations
  for select to authenticated using (true);

-- Authenticated users may update status (confirm / cancel)
create policy "auth_update" on reservations
  for update to authenticated using (true);

-- Enable realtime updates for the dashboard
alter publication supabase_realtime add table reservations;

-- RPC: slot guest totals for the public reservation form
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

-- RPC: create reservation with rolling 2-hour window capacity check (max 48 concurrent guests)
create or replace function public.create_reservation(
  p_name    text,
  p_email   text,
  p_phone   text,
  p_date    date,
  p_time    text,
  p_guests  integer,
  p_message text default null
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

  insert into reservations (name, email, phone, date, time, guests, message, status)
  values (p_name, p_email, p_phone, p_date, p_time, p_guests, p_message, 'aangevraagd')
  returning id into new_id;

  return new_id;
end;
$$;

grant execute on function public.create_reservation(text, text, text, date, text, integer, text) to anon;
