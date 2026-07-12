ALTER TABLE trips
ADD CONSTRAINT fk_trip_vehicle
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id);

ALTER TABLE trips
ADD CONSTRAINT fk_trip_driver
FOREIGN KEY (driver_id)
REFERENCES drivers(id);

ALTER TABLE maintenance_logs
ADD CONSTRAINT fk_maintenance_vehicle
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id);

ALTER TABLE fuel_logs
ADD CONSTRAINT fk_fuel_vehicle
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id);

CREATE INDEX idx_vehicle_registration
ON vehicles(registration_number);

CREATE INDEX idx_vehicle_status
ON vehicles(status);

CREATE INDEX idx_driver_license
ON drivers(license_number);

CREATE INDEX idx_driver_status
ON drivers(status);

CREATE INDEX idx_trip_vehicle
ON trips(vehicle_id);

CREATE INDEX idx_trip_driver
ON trips(driver_id);

CREATE INDEX idx_trip_status
ON trips(status);

CREATE INDEX idx_maintenance_vehicle
ON maintenance_logs(vehicle_id);

CREATE INDEX idx_fuel_vehicle
ON fuel_logs(vehicle_id);
