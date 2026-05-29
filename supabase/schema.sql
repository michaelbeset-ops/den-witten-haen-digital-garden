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

-- RPC: slot counts for the public reservation form
-- Uses security definer so anon users get only counts, never personal data.
create or replace function public.get_slot_counts(check_date date)
returns table(slot_time text, slot_count bigint)
language sql
security definer
set search_path = public
as $$
  select time as slot_time, count(*)::bigint as slot_count
  from reservations
  where date = check_date
    and status != 'geannuleerd'
  group by time;
$$;

grant execute on function public.get_slot_counts(date) to anon;
