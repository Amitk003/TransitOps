CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL,
    expense_type expense_type NOT NULL,
    amount DECIMAL(12,2) NOT NULL
        CHECK (amount >= 0),
    expense_date DATE NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses
ADD CONSTRAINT fk_expense_vehicle
FOREIGN KEY (vehicle_id)
REFERENCES vehicles(id);

CREATE INDEX idx_expense_vehicle
ON expenses(vehicle_id);
