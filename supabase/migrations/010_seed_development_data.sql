INSERT INTO vehicles (
    registration_number,
    vehicle_name,
    vehicle_type,
    max_load_capacity,
    odometer,
    acquisition_cost,
    status
)
VALUES
('KA01AB1234', 'Tata Ace', 'mini_truck', 750, 25000, 650000, 'available'),
('KA02CD5678', 'Ashok Leyland Truck', 'truck', 5000, 80000, 3200000, 'available'),
('KA03EF9012', 'Eicher Pro', 'truck', 7000, 45000, 4100000, 'in_shop')
ON CONFLICT (registration_number) DO NOTHING;

INSERT INTO drivers (
    full_name,
    license_number,
    license_category,
    license_expiry_date,
    contact_number,
    safety_score,
    status
)
VALUES
('Alex', 'DL123456', 'LMV', '2028-12-31', '9876500001', 98, 'available'),
('Rahul Kumar', 'DL654321', 'HMV', '2027-08-15', '9876500002', 95, 'available'),
('Priya Sharma', 'DL789456', 'HMV', '2029-04-20', '9876500003', 99, 'off_duty')
ON CONFLICT (license_number) DO NOTHING;

INSERT INTO trips (
    vehicle_id,
    driver_id,
    source,
    destination,
    cargo_weight,
    planned_distance,
    status
)
SELECT v.id, d.id, 'Bangalore', 'Mysore', 450, 145, 'dispatched'
FROM vehicles v, drivers d
WHERE v.registration_number = 'KA01AB1234'
  AND d.license_number = 'DL123456'
  AND NOT EXISTS (
    SELECT 1 FROM trips WHERE source = 'Bangalore' AND destination = 'Mysore'
  );

INSERT INTO maintenance_logs (
    vehicle_id,
    maintenance_type,
    description,
    maintenance_date,
    cost,
    status
)
SELECT id, 'Oil Change', 'Engine oil replaced', CURRENT_DATE, 4500, 'open'
FROM vehicles
WHERE registration_number = 'KA03EF9012'
  AND NOT EXISTS (
    SELECT 1 FROM maintenance_logs WHERE maintenance_type = 'Oil Change'
  );

INSERT INTO fuel_logs (
    vehicle_id,
    fuel_date,
    liters,
    cost,
    odometer,
    fuel_station
)
SELECT id, CURRENT_DATE, 35, 3500, 25200, 'Indian Oil'
FROM vehicles
WHERE registration_number = 'KA01AB1234'
  AND NOT EXISTS (
    SELECT 1 FROM fuel_logs WHERE fuel_station = 'Indian Oil'
  );
