# Database Architecture

## Enums

| Enum | Values |
|---|---|
| user_role | fleet_manager, driver, safety_officer, financial_analyst |
| vehicle_status | available, on_trip, in_shop, retired |
| driver_status | available, on_trip, off_duty, suspended |
| trip_status | draft, dispatched, completed, cancelled |
| maintenance_status | open, closed |
| expense_type | fuel, maintenance, toll, parking, other |
| vehicle_type | van, truck, bus, mini_truck, pickup, other |

## Tables

### user_profiles
- Linked to `auth.users` via foreign key
- Created on signup via trigger (`handle_new_user`)
- Columns: id, email, full_name, role, created_at

### vehicles
- Columns: id, registration_number, vehicle_name, vehicle_type, max_load_capacity, odometer, acquisition_cost, status, created_at, updated_at

### drivers
- Columns: id, full_name, license_number, license_category, license_expiry_date, contact_number, safety_score, status, created_at, updated_at

### trips
- Columns: id, vehicle_id (FK), driver_id (FK), source, destination, cargo_weight, planned_distance, start_time, end_time, status, created_at, updated_at

### maintenance_logs
- Columns: id, vehicle_id (FK), maintenance_type, description, maintenance_date, cost, status, created_at, updated_at

### fuel_logs
- Columns: id, vehicle_id (FK), fuel_date, liters, cost, odometer, fuel_station, remarks, created_at, updated_at

### expenses
- Columns: id, vehicle_id (FK), expense_type, amount, expense_date, notes, created_at, updated_at

## Migrations

| # | File | Purpose |
|---|---|---|
| 001 | create_user_profiles | user_role enum, user_profiles table, trigger, RLS |
| 002 | fix_user_profile_trigger | Robust trigger with null handling |
| 003 | create_phase3_enums | All status/type enums |
| 004 | create_vehicles | vehicles table |
| 005 | create_drivers | drivers table |
| 006 | create_trips | trips table |
| 007 | create_maintenance_logs | maintenance_logs table |
| 008 | create_fuel_logs | fuel_logs table |
| 009 | create_indexes_and_foreign_keys | FKs + indexes |
| 010 | seed_development_data | Sample vehicles, drivers, trips |
| 011 | create_expenses | expenses table with FK + index |
| 012 | configure_rls_policies | RLS on all tables (permissive) |
| 013 | grant_service_role_access | Grant all to service_role |
| 014 | grant_anon_authenticated_access | Grant schema/table access to anon/authenticated |

All migrations are idempotent (use DO blocks with IF NOT EXISTS checks).

## RLS Policies

Currently permissive (`USING (true) WITH CHECK (true)`) on all tables except user_profiles (user can only see own profile).

## Key Grants

- `service_role`: Full access to all tables (bypasses RLS)
- `anon`, `authenticated`: Schema USAGE + ALL on tables (RLS enforces row-level restrictions)

## Seed Data

Migration 010 inserts:
- 3 vehicles (Tata Ace, Ashok Leyland Truck, Eicher Pro)
- 3 drivers (Alex, Rahul Kumar, Priya Sharma)
- 1 trip (Bangalore to Mysore)
- 1 maintenance log (Oil change for Eicher Pro)
- 1 fuel log (Indian Oil fill for Tata Ace)

All seed statements use `ON CONFLICT DO NOTHING` or `NOT EXISTS` checks.
