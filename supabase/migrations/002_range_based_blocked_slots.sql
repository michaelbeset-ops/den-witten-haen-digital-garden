-- Migration 002: range-based blocked_slots
-- Replaces the old per-slot table with a single row per closure (time_from / time_to).
-- Run in the Supabase SQL Editor.

-- Drop and recreate blocked_slots with the new schema
DROP TABLE IF EXISTS blocked_slots;

CREATE TABLE blocked_slots (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  date       date NOT NULL,
  time_from  text,    -- NULL = whole day blocked
  time_to    text,    -- NULL when time_from is set = from time_from until end of day
  reason     text
);

ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- Reserveringsformulier mag lezen (anoniem)
CREATE POLICY "anon_select_blocked" ON blocked_slots
  FOR SELECT TO anon USING (true);

-- Ingelogd personeel mag alles
CREATE POLICY "auth_all_blocked" ON blocked_slots
  FOR ALL TO authenticated USING (true);

-- Update create_reservation: check range-based blocked_slots
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_name    text,
  p_email   text,
  p_phone   text,
  p_date    date,
  p_time    text,
  p_guests  integer,
  p_message text DEFAULT NULL,
  p_seating text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id   uuid;
  max_load integer := 0;
  sub_load integer;
  k        integer;
BEGIN
  -- Hele dag gesloten?
  IF EXISTS (
    SELECT 1 FROM blocked_slots
    WHERE date = p_date AND time_from IS NULL
  ) THEN
    RAISE EXCEPTION 'Op deze dag zijn wij gesloten' USING errcode = 'P0002';
  END IF;

  -- Tijdslot valt binnen een geblokkeerde range?
  IF EXISTS (
    SELECT 1 FROM blocked_slots
    WHERE date = p_date
      AND time_from IS NOT NULL
      AND p_time >= time_from
      AND (time_to IS NULL OR p_time <= time_to)
  ) THEN
    RAISE EXCEPTION 'Dit tijdslot is gesloten' USING errcode = 'P0002';
  END IF;

  -- Rollend 2-uurs venster: max 48 gasten gelijktijdig
  FOR k IN 0..3 LOOP
    SELECT coalesce(sum(r.guests), 0) + p_guests
    INTO sub_load
    FROM reservations r
    WHERE r.date    = p_date
      AND r.status != 'geannuleerd'
      AND extract(epoch FROM (r.time::time - p_time::time)) / 60 >  (k - 4) * 30
      AND extract(epoch FROM (r.time::time - p_time::time)) / 60 <=  k      * 30;

    IF sub_load > max_load THEN max_load := sub_load; END IF;
  END LOOP;

  IF max_load > 48 THEN
    RAISE EXCEPTION 'Dit tijdslot heeft niet genoeg ruimte' USING errcode = 'P0001';
  END IF;

  INSERT INTO reservations (name, email, phone, date, time, guests, message, status, seating_preference)
  VALUES (p_name, p_email, p_phone, p_date, p_time, p_guests, p_message, 'aangevraagd', p_seating)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_reservation(text, text, text, date, text, integer, text, text) TO anon;
-- Remove old 7-param signature if still present
DROP FUNCTION IF EXISTS public.create_reservation(text, text, text, date, text, integer, text);
