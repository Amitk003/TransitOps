-- Migration 018 — Revert RLS policies back to permissive
-- The auth.role() based policies in 016 caused dashboard loading to hang
-- because the Supabase client session isn't always ready when queries run.

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'vehicles_policy') THEN
    ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS vehicles_policy ON vehicles;
    CREATE POLICY vehicles_policy ON vehicles FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drivers' AND policyname = 'drivers_policy') THEN
    ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
    ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS drivers_policy ON drivers;
    CREATE POLICY drivers_policy ON drivers FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'trips' AND policyname = 'trips_policy') THEN
    ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
    ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS trips_policy ON trips;
    CREATE POLICY trips_policy ON trips FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
