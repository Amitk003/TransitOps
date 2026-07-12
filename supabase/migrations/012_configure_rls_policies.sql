    ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
    ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
    ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE fuel_logs ENABLE ROW LEVEL SECURITY;
    ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

    CREATE POLICY vehicles_policy
    ON vehicles
    FOR ALL
    USING (true)
    WITH CHECK (true);

    CREATE POLICY drivers_policy
    ON drivers
    FOR ALL
    USING (true)
    WITH CHECK (true);

    CREATE POLICY trips_policy
    ON trips
    FOR ALL
    USING (true)
    WITH CHECK (true);

    CREATE POLICY maintenance_policy
    ON maintenance_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

    CREATE POLICY fuel_policy
    ON fuel_logs
    FOR ALL
    USING (true)
    WITH CHECK (true);

    CREATE POLICY expenses_policy
    ON expenses
    FOR ALL
    USING (true)
    WITH CHECK (true);
