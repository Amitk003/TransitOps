ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_latitude DECIMAL(10,7) DEFAULT 12.9716;
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS current_longitude DECIMAL(10,7) DEFAULT 77.5946;

ALTER TABLE trips ADD COLUMN IF NOT EXISTS start_latitude DECIMAL(10,7);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS start_longitude DECIMAL(10,7);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS end_latitude DECIMAL(10,7);
ALTER TABLE trips ADD COLUMN IF NOT EXISTS end_longitude DECIMAL(10,7);

UPDATE vehicles SET current_latitude = 12.9716, current_longitude = 77.5946 WHERE registration_number = 'KA01AB1234';
UPDATE vehicles SET current_latitude = 13.0827, current_longitude = 80.2707 WHERE registration_number = 'KA02CD5678';
UPDATE vehicles SET current_latitude = 12.2958, current_longitude = 76.6394 WHERE registration_number = 'KA03EF9012';

UPDATE trips SET start_latitude = 12.9716, start_longitude = 77.5946, end_latitude = 12.2958, end_longitude = 76.6394 WHERE source = 'Bangalore' AND destination = 'Mysore';
