-- Migratie 007: beheerdersrol voor de Edge Function manage-users
--
-- manage-users controleerde alleen of iemand ingelogd was. Elk account kon
-- daardoor met de service-role-sleutel beheeraccounts opsommen, aanmaken en
-- verwijderen. Er is nu een expliciete admins-tabel; wie daar niet in staat,
-- krijgt 403.
--
-- LET OP: deze tabel is na de migratie LEEG. Dat is bewust: dicht is de veilige
-- startstand. Zet jezelf er eenmalig in, anders werkt gebruikersbeheer niet:
--
--   insert into admins (user_id)
--   select id from auth.users where email = 'jouw@adres.nl';
--
-- Draai dit eenmalig in de Supabase SQL Editor.

create table if not exists admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  note       text
);

alter table admins enable row level security;

-- Een ingelogde gebruiker mag alleen zien of hij zelf beheerder is; niemand
-- kan via de API beheerders toevoegen of verwijderen. Dat gaat bewust
-- uitsluitend via de SQL Editor, zodat een gekaapt account zichzelf geen
-- rechten kan geven.
create policy "self_select_admin" on admins
  for select to authenticated using (user_id = auth.uid());

-- Handig in policies en functies: is de huidige gebruiker beheerder?
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to authenticated;
