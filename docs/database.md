# Database

This document describes the database structure used by TransitOps.

## Enums

These are custom PostgreSQL enum types used in the database:

| Enum Name | Possible Values |
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

Stores user information linked to Supabase auth.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key, linked to auth.users |
| email | TEXT | User email |
| full_name | TEXT | User display name |
| role | user_role | Controls what the user can access |
| created_at | TIMESTAMPTZ | Auto-generated |

Created automatically when a new user signs up via a database trigger.

### vehicles

Stores fleet vehicle information.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| registration_number | TEXT | Unique vehicle plate number |
| vehicle_name | TEXT | Display name |
| vehicle_type | vehicle_type | van, truck, bus, etc. |
| max_load_capacity | INTEGER | Maximum cargo weight in kg |
| odometer | INTEGER | Current odometer reading in km |
| acquisition_cost | INTEGER | Purchase cost |
| status | vehicle_status | available, on_trip, in_shop, retired |
| current_latitude | DOUBLE PRECISION | GPS latitude for fleet tracking |
| current_longitude | DOUBLE PRECISION | GPS longitude for fleet tracking |
| created_at | TIMESTAMPTZ | Auto-generated |
| updated_at | TIMESTAMPTZ | Auto-generated |

### drivers

Stores driver information.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| full_name | TEXT | Driver name |
| license_number | TEXT | Unique license ID |
| license_category | TEXT | License class (Class 2, 3, 4) |
| license_expiry_date | DATE | When the license expires |
| contact_number | TEXT | Phone number |
| safety_score | INTEGER | 0-100 safety rating |
| status | driver_status | available, on_trip, off_duty, suspended |
| created_at | TIMESTAMPTZ | Auto-generated |
| updated_at | TIMESTAMPTZ | Auto-generated |

### trips

Stores trip records from dispatch to completion.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| source | TEXT | Pickup location |
| destination | TEXT | Dropoff location |
| vehicle_id | UUID | Foreign key to vehicles |
| driver_id | UUID | Foreign key to drivers |
| cargo_weight | INTEGER | Cargo weight in kg |
| planned_distance | INTEGER | Planned route distance in km |
| status | trip_status | draft, dispatched, completed, cancelled |
| start_time | TIMESTAMPTZ | When the trip was dispatched |
| end_time | TIMESTAMPTZ | When the trip was completed |
| created_at | TIMESTAMPTZ | Auto-generated |
| updated_at | TIMESTAMPTZ | Auto-generated |

### maintenance_logs

Stores maintenance and repair records.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key to vehicles |
| maintenance_type | VARCHAR(100) | Type of maintenance |
| description | TEXT | Details of the work done |
| maintenance_date | DATE | When the maintenance was done |
| cost | DECIMAL(12,2) | Cost of the maintenance |
| status | maintenance_status | open or closed |
| created_at | TIMESTAMPTZ | Auto-generated |
| updated_at | TIMESTAMPTZ | Auto-generated |

### fuel_logs

Stores fuel purchase records.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key to vehicles |
| fuel_date | DATE | Date of fuel purchase |
| liters | DECIMAL(10,2) | Liters of fuel |
| cost | DECIMAL(12,2) | Total cost |
| odometer | DECIMAL(10,2) | Odometer reading at time of fill |
| fuel_station | VARCHAR(100) | Station name |
| remarks | TEXT | Optional notes |
| created_at | TIMESTAMPTZ | Auto-generated |
| updated_at | TIMESTAMPTZ | Auto-generated |

### expenses

Stores non-fuel expenses.

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| vehicle_id | UUID | Foreign key to vehicles |
| expense_type | expense_type | toll, parking, other |
| amount | DECIMAL(12,2) | Amount spent |
| expense_date | DATE | Date of expense |
| notes | TEXT | Optional description |
| created_at | TIMESTAMPTZ | Auto-generated |
| updated_at | TIMESTAMPTZ | Auto-generated |

## Migrations

All migrations are in `supabase/migrations/`. Each one is idempotent, meaning you can run it multiple times without causing errors.

| Number | File Name | What It Does |
|---|---|---|
| 001 | create_user_profiles | Creates user_role enum and user_profiles table |
| 002 | fix_user_profile_trigger | Fixes the trigger that creates profiles on signup |
| 003 | create_phase3_enums | Creates all status and type enums |
| 004 | create_vehicles | Creates the vehicles table |
| 005 | create_drivers | Creates the drivers table |
| 006 | create_trips | Creates the trips table |
| 007 | create_maintenance_logs | Creates the maintenance_logs table |
| 008 | create_fuel_logs | Creates the fuel_logs table |
| 009 | create_indexes_and_foreign_keys | Adds foreign keys and indexes |
| 010 | seed_development_data | Inserts sample data |
| 011 | create_expenses | Creates the expenses table |
| 012 | configure_rls_policies | Enables Row Level Security on all tables |
| 013 | grant_service_role_access | Grants access to the service role |
| 014 | grant_anon_authenticated_access | Grants access to anon and authenticated roles |
| 015 | add_coordinates | Adds lat/lng columns to vehicles and trips |
| 016 | database_intelligence | Adds triggers and analytics views |
| 017 | seed_demo_data | Inserts comprehensive demo data |

## Database Triggers

Migration 016 adds two triggers on the trips table:

1. **Vehicle status trigger** -- When a trip status changes to dispatched, the assigned vehicle status changes to on_trip. When the trip completes or cancels, the vehicle goes back to available.

2. **Driver status trigger** -- Same logic for the driver. Dispatched = on_trip. Complete or cancel = available.

These triggers use SECURITY DEFINER so they run with full database permissions.

## Views

Migration 016 creates three views for analytics:

- **vw_fleet_stats** -- Count of vehicles grouped by type and status
- **vw_trip_analytics** -- Monthly trip counts and total distance by status
- **vw_cost_analytics** -- Monthly total costs by category (fuel, maintenance, and each expense type)

## Row Level Security

All tables have RLS enabled. The policies allow access only to authenticated users and the service role. Anonymous (not logged in) users cannot read or write any data.

## Seed Data

Migration 010 adds minimal seed data. Migration 017 adds comprehensive demo data including:

- 10 vehicles with realistic names, types, and GPS coordinates
- 8 drivers with Emirati names and license details
- 20 trips across different statuses
- 12 maintenance logs
- 15 fuel logs
- 10 expenses
