-- ============================================================
-- Migration 016 — Database Intelligence
--
-- 1. Trigger functions for vehicle/driver status on trip changes
-- 2. Analytics SQL views
-- 3. Final RLS policy lock-down
-- ============================================================

-- -----------------------------------------------------------
-- 1. Automatically update vehicle status when trip changes
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_trip_vehicle_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'dispatched' THEN
    UPDATE vehicles SET status = 'on_trip', updated_at = NOW()
    WHERE id = NEW.vehicle_id AND status != 'on_trip';
  ELSIF NEW.status IN ('completed', 'cancelled') AND OLD.status IN ('dispatched', 'draft') THEN
    UPDATE vehicles SET status = 'available', updated_at = NOW()
    WHERE id = NEW.vehicle_id AND status = 'on_trip';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trip_vehicle_status ON trips;
CREATE TRIGGER trg_trip_vehicle_status
  AFTER UPDATE OF status ON trips
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_trip_vehicle_status();

-- -----------------------------------------------------------
-- 2. Automatically update driver status when trip changes
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_trip_driver_status()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'dispatched' THEN
    UPDATE drivers SET status = 'on_trip', updated_at = NOW()
    WHERE id = NEW.driver_id AND status != 'on_trip';
  ELSIF NEW.status IN ('completed', 'cancelled') AND OLD.status IN ('dispatched', 'draft') THEN
    UPDATE drivers SET status = 'available', updated_at = NOW()
    WHERE id = NEW.driver_id AND status = 'on_trip';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_trip_driver_status ON trips;
CREATE TRIGGER trg_trip_driver_status
  AFTER UPDATE OF status ON trips
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION handle_trip_driver_status();

-- -----------------------------------------------------------
-- 3. Analytics views
-- -----------------------------------------------------------

-- Fleet stats: vehicle counts grouped by type and status
CREATE OR REPLACE VIEW vw_fleet_stats AS
SELECT
  vehicle_type,
  status,
  COUNT(*) AS count
FROM vehicles
GROUP BY vehicle_type, status
ORDER BY vehicle_type, status;

-- Trip analytics: monthly summaries
CREATE OR REPLACE VIEW vw_trip_analytics AS
SELECT
  DATE_TRUNC('month', created_at)::DATE AS month,
  status,
  COUNT(*) AS count,
  COALESCE(SUM(planned_distance), 0) AS total_distance
FROM trips
GROUP BY DATE_TRUNC('month', created_at)::DATE, status
ORDER BY month DESC, status;

-- Cost analytics: total cost by category per month
CREATE OR REPLACE VIEW vw_cost_analytics AS
SELECT
  DATE_TRUNC('month', fuel_date)::DATE AS month,
  'fuel' AS category,
  COUNT(*) AS entries,
  COALESCE(SUM(cost), 0) AS total_cost
FROM fuel_logs
GROUP BY DATE_TRUNC('month', fuel_date)::DATE
UNION ALL
SELECT
  DATE_TRUNC('month', maintenance_date)::DATE AS month,
  'maintenance' AS category,
  COUNT(*) AS entries,
  COALESCE(SUM(cost), 0) AS total_cost
FROM maintenance_logs
GROUP BY DATE_TRUNC('month', maintenance_date)::DATE
UNION ALL
SELECT
  DATE_TRUNC('month', expense_date)::DATE AS month,
  expense_type::TEXT AS category,
  COUNT(*) AS entries,
  COALESCE(SUM(amount), 0) AS total_cost
FROM expenses
GROUP BY DATE_TRUNC('month', expense_date)::DATE, expense_type
ORDER BY month DESC, category;

-- -----------------------------------------------------------
-- 4. Final RLS lock-down
-- -----------------------------------------------------------

-- Revoke anon access to write operations on sensitive tables
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'vehicles' AND policyname = 'vehicles_policy') THEN
    ALTER TABLE vehicles DISABLE ROW LEVEL SECURITY;
    ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS vehicles_policy ON vehicles;
    CREATE POLICY vehicles_policy ON vehicles
      FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'drivers' AND policyname = 'drivers_policy') THEN
    ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
    ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS drivers_policy ON drivers;
    CREATE POLICY drivers_policy ON drivers
      FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'trips' AND policyname = 'trips_policy') THEN
    ALTER TABLE trips DISABLE ROW LEVEL SECURITY;
    ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS trips_policy ON trips;
    CREATE POLICY trips_policy ON trips
      FOR ALL USING (auth.role() = 'authenticated' OR auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
  END IF;
END $$;
