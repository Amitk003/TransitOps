DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_trip_vehicle' AND table_name = 'trips') THEN
    ALTER TABLE trips ADD CONSTRAINT fk_trip_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_trip_driver' AND table_name = 'trips') THEN
    ALTER TABLE trips ADD CONSTRAINT fk_trip_driver FOREIGN KEY (driver_id) REFERENCES drivers(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_maintenance_vehicle' AND table_name = 'maintenance_logs') THEN
    ALTER TABLE maintenance_logs ADD CONSTRAINT fk_maintenance_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_fuel_vehicle' AND table_name = 'fuel_logs') THEN
    ALTER TABLE fuel_logs ADD CONSTRAINT fk_fuel_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicle_registration' AND tablename = 'vehicles') THEN
    CREATE INDEX idx_vehicle_registration ON vehicles(registration_number);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_vehicle_status' AND tablename = 'vehicles') THEN
    CREATE INDEX idx_vehicle_status ON vehicles(status);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_driver_license' AND tablename = 'drivers') THEN
    CREATE INDEX idx_driver_license ON drivers(license_number);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_driver_status' AND tablename = 'drivers') THEN
    CREATE INDEX idx_driver_status ON drivers(status);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trip_vehicle' AND tablename = 'trips') THEN
    CREATE INDEX idx_trip_vehicle ON trips(vehicle_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trip_driver' AND tablename = 'trips') THEN
    CREATE INDEX idx_trip_driver ON trips(driver_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_trip_status' AND tablename = 'trips') THEN
    CREATE INDEX idx_trip_status ON trips(status);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_maintenance_vehicle' AND tablename = 'maintenance_logs') THEN
    CREATE INDEX idx_maintenance_vehicle ON maintenance_logs(vehicle_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_fuel_vehicle' AND tablename = 'fuel_logs') THEN
    CREATE INDEX idx_fuel_vehicle ON fuel_logs(vehicle_id);
  END IF;
END $$;
