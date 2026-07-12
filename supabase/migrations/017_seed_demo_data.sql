-- Migration 017 — Seed comprehensive demo data for judging
-- Uses DO blocks for idempotency (only inserts if tables are empty)

DO $$
DECLARE
  v_id UUID;
  d_id UUID;
  t_id UUID;
  i INT;
  v_ids UUID[] := '{}';
  d_ids UUID[] := '{}';
BEGIN

-- Only seed if vehicles table is empty
IF (SELECT COUNT(*) FROM vehicles) > 0 THEN
  RETURN;
END IF;

-- ============================================================
-- Vehicles (10)
-- ============================================================
FOR i IN 1..10 LOOP
  v_id := gen_random_uuid();
  v_ids := array_append(v_ids, v_id);
  INSERT INTO vehicles (id, registration_number, vehicle_name, vehicle_type, max_load_capacity, odometer, acquisition_cost, status, current_latitude, current_longitude)
  VALUES (
    v_id,
    CASE i
      WHEN 1 THEN 'TRK-4201'
      WHEN 2 THEN 'TRK-4202'
      WHEN 3 THEN 'VAN-2101'
      WHEN 4 THEN 'VAN-2102'
      WHEN 5 THEN 'BUS-8901'
      WHEN 6 THEN 'MINI-3301'
      WHEN 7 THEN 'MINI-3302'
      WHEN 8 THEN 'TRK-4203'
      WHEN 9 THEN 'PCK-5501'
      WHEN 10 THEN 'PCK-5502'
    END,
    CASE i
      WHEN 1 THEN 'Big Hauler'
      WHEN 2 THEN 'Highway Star'
      WHEN 3 THEN 'City Runner'
      WHEN 4 THEN 'Neighborhood Mover'
      WHEN 5 THEN 'School Special'
      WHEN 6 THEN 'Short Haul'
      WHEN 7 THEN 'Courier Pro'
      WHEN 8 THEN 'Freight Master'
      WHEN 9 THEN 'Quick Pickup'
      WHEN 10 THEN 'Load Runner'
    END,
    CASE i
      WHEN 1 THEN 'truck'
      WHEN 2 THEN 'truck'
      WHEN 3 THEN 'van'
      WHEN 4 THEN 'van'
      WHEN 5 THEN 'bus'
      WHEN 6 THEN 'mini_truck'
      WHEN 7 THEN 'mini_truck'
      WHEN 8 THEN 'truck'
      WHEN 9 THEN 'pickup'
      WHEN 10 THEN 'pickup'
    END,
    CASE i
      WHEN 1 THEN 15000
      WHEN 2 THEN 12000
      WHEN 3 THEN 3000
      WHEN 4 THEN 2500
      WHEN 5 THEN 8000
      WHEN 6 THEN 5000
      WHEN 7 THEN 4500
      WHEN 8 THEN 18000
      WHEN 9 THEN 1500
      WHEN 10 THEN 2000
    END,
    (random() * 80000 + 5000)::INT,
    (random() * 80000 + 20000)::INT * 100,
    CASE i
      WHEN 1 THEN 'available'
      WHEN 2 THEN 'on_trip'
      WHEN 3 THEN 'available'
      WHEN 4 THEN 'on_trip'
      WHEN 5 THEN 'in_shop'
      WHEN 6 THEN 'available'
      WHEN 7 THEN 'on_trip'
      WHEN 8 THEN 'available'
      WHEN 9 THEN 'on_trip'
      WHEN 10 THEN 'available'
    END,
    25.2048 + (random() - 0.5) * 0.1,
    55.2708 + (random() - 0.5) * 0.1
  );
END LOOP;

-- ============================================================
-- Drivers (8)
-- ============================================================
FOR i IN 1..8 LOOP
  d_id := gen_random_uuid();
  d_ids := array_append(d_ids, d_id);
  INSERT INTO drivers (id, full_name, license_number, license_category, license_expiry_date, contact_number, safety_score, status)
  VALUES (
    d_id,
    CASE i
      WHEN 1 THEN 'Ahmed Al Mansouri'
      WHEN 2 THEN 'Sara Khalid'
      WHEN 3 THEN 'Mohammed Obaid'
      WHEN 4 THEN 'Fatima Hassan'
      WHEN 5 THEN 'Khalid Rashid'
      WHEN 6 THEN 'Noora Ali'
      WHEN 7 THEN 'Saeed Hamdan'
      WHEN 8 THEN 'Mariam Yousef'
    END,
    CASE i
      WHEN 1 THEN 'LIC-AE-1001'
      WHEN 2 THEN 'LIC-AE-1002'
      WHEN 3 THEN 'LIC-AE-1003'
      WHEN 4 THEN 'LIC-AE-1004'
      WHEN 5 THEN 'LIC-AE-1005'
      WHEN 6 THEN 'LIC-AE-1006'
      WHEN 7 THEN 'LIC-AE-1007'
      WHEN 8 THEN 'LIC-AE-1008'
    END,
    CASE i
      WHEN 1 THEN 'Class 4'
      WHEN 2 THEN 'Class 3'
      WHEN 3 THEN 'Class 4'
      WHEN 4 THEN 'Class 2'
      WHEN 5 THEN 'Class 4'
      WHEN 6 THEN 'Class 3'
      WHEN 7 THEN 'Class 2'
      WHEN 8 THEN 'Class 3'
    END,
    (CURRENT_DATE + (random() * 365 + 30)::INT * INTERVAL '1 day')::DATE,
    CASE i
      WHEN 1 THEN '+971-50-111-1001'
      WHEN 2 THEN '+971-50-111-1002'
      WHEN 3 THEN '+971-50-111-1003'
      WHEN 4 THEN '+971-50-111-1004'
      WHEN 5 THEN '+971-50-111-1005'
      WHEN 6 THEN '+971-50-111-1006'
      WHEN 7 THEN '+971-50-111-1007'
      WHEN 8 THEN '+971-50-111-1008'
    END,
    GREATEST(70, (random() * 30 + 70)::INT),
    CASE i
      WHEN 1 THEN 'available'
      WHEN 2 THEN 'on_trip'
      WHEN 3 THEN 'available'
      WHEN 4 THEN 'on_trip'
      WHEN 5 THEN 'available'
      WHEN 6 THEN 'off_duty'
      WHEN 7 THEN 'on_trip'
      WHEN 8 THEN 'available'
    END
  );
END LOOP;

-- ============================================================
-- Trips (20)
-- ============================================================
FOR i IN 1..20 LOOP
  t_id := gen_random_uuid();
  INSERT INTO trips (id, source, destination, vehicle_id, driver_id, cargo_weight, planned_distance, status, start_time, end_time, created_at)
  VALUES (
    t_id,
    (ARRAY['Dubai Port', 'Abu Dhabi Warehouse', 'Sharjah Depot', 'Al Ain Hub', 'Ras Al Khaimah Terminal', 'Fujairah Dock', 'Ajman Storage', 'Umm Al Quwain Yard'])[ceil(random()*8)]::TEXT,
    (ARRAY['Dubai Port', 'Abu Dhabi Warehouse', 'Sharjah Depot', 'Al Ain Hub', 'Ras Al Khaimah Terminal', 'Fujairah Dock', 'Ajman Storage', 'Umm Al Quwain Yard'])[ceil(random()*8)]::TEXT,
    v_ids[ceil(random()*array_length(v_ids, 1))],
    d_ids[ceil(random()*array_length(d_ids, 1))],
    (random() * 10000 + 100)::INT,
    (random() * 300 + 20)::INT,
    CASE
      WHEN i <= 7 THEN 'completed'
      WHEN i <= 12 THEN 'dispatched'
      WHEN i <= 16 THEN 'draft'
      ELSE 'cancelled'
    END,
    CASE WHEN i <= 12 THEN NOW() - (random() * 7 + 1)::INT * INTERVAL '1 day' ELSE NULL END,
    CASE WHEN i <= 7 THEN NOW() - (random() * 3)::INT * INTERVAL '1 day' ELSE NULL END,
    NOW() - (random() * 30)::INT * INTERVAL '1 day'
  );
END LOOP;

-- ============================================================
-- Maintenance Logs (12)
-- ============================================================
FOR i IN 1..12 LOOP
  INSERT INTO maintenance_logs (vehicle_id, maintenance_type, description, maintenance_date, cost, status)
  VALUES (
    v_ids[ceil(random()*array_length(v_ids, 1))],
    (ARRAY['engine', 'transmission', 'brakes', 'tires', 'electrical', 'body', 'inspection'])[ceil(random()*7)]::TEXT,
    (ARRAY['Routine checkup', 'Oil change and filter', 'Brake pad replacement', 'Tire rotation', 'AC repair', 'Battery replacement', 'Suspension work', 'Full service'])[ceil(random()*8)]::TEXT,
    CURRENT_DATE - (random() * 90)::INT,
    (random() * 5000 + 200)::INT * 100,
    CASE WHEN random() < 0.3 THEN 'open' ELSE 'closed' END
  );
END LOOP;

-- ============================================================
-- Fuel Logs (15)
-- ============================================================
FOR i IN 1..15 LOOP
  INSERT INTO fuel_logs (vehicle_id, fuel_date, liters, cost, odometer, fuel_station, remarks)
  VALUES (
    v_ids[ceil(random()*array_length(v_ids, 1))],
    CURRENT_DATE - (random() * 30)::INT,
    (random() * 80 + 20)::INT,
    (random() * 300 + 50)::INT * 100,
    (random() * 50000 + 10000)::INT,
    (ARRAY['ADNOC Downtown', 'ENOC Al Wasl', 'Emarat Al Barsha', 'Shell Jebel Ali', 'Eppco Deira'])[ceil(random()*5)]::TEXT,
    NULL
  );
END LOOP;

-- ============================================================
-- Expenses (10)
-- ============================================================
FOR i IN 1..10 LOOP
  INSERT INTO expenses (vehicle_id, expense_type, amount, expense_date, notes)
  VALUES (
    v_ids[ceil(random()*array_length(v_ids, 1))],
    (ARRAY['toll', 'parking', 'other'])[ceil(random()*3)]::expense_type,
    (random() * 500 + 20)::INT * 100,
    CURRENT_DATE - (random() * 60)::INT,
    (ARRAY['Salik toll', 'Parking fee', 'Car wash', 'Towing service', 'Permit fee'])[ceil(random()*5)]::TEXT
  );
END LOOP;

END $$;
