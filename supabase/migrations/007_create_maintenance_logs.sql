CREATE TABLE maintenance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    maintenance_type VARCHAR(100) NOT NULL,
    description TEXT,
    maintenance_date DATE NOT NULL,
    cost DECIMAL(12,2) NOT NULL
        CHECK (cost >= 0),
    status maintenance_status NOT NULL DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
