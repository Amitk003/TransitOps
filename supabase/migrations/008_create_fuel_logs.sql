CREATE TABLE IF NOT EXISTS fuel_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    fuel_date DATE NOT NULL,
    liters DECIMAL(10,2) NOT NULL
        CHECK (liters > 0),
    cost DECIMAL(12,2) NOT NULL
        CHECK (cost >= 0),
    odometer DECIMAL(10,2) NOT NULL
        CHECK (odometer >= 0),
    fuel_station VARCHAR(100),
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
