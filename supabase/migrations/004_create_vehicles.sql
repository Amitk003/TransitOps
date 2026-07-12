CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    vehicle_name VARCHAR(100) NOT NULL,
    vehicle_type vehicle_type NOT NULL,
    max_load_capacity DECIMAL(10,2) NOT NULL,
    odometer DECIMAL(10,2) DEFAULT 0,
    acquisition_cost DECIMAL(12,2) NOT NULL,
    status vehicle_status DEFAULT 'available',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
