CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    driver_id UUID NOT NULL,
    source VARCHAR(150) NOT NULL,
    destination VARCHAR(150) NOT NULL,
    cargo_weight DECIMAL(10,2) NOT NULL
        CHECK (cargo_weight > 0),
    planned_distance DECIMAL(10,2) NOT NULL
        CHECK (planned_distance > 0),
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    status trip_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
