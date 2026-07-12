CREATE TYPE vehicle_status AS ENUM (
    'available',
    'on_trip',
    'in_shop',
    'retired'
);

CREATE TYPE driver_status AS ENUM (
    'available',
    'on_trip',
    'off_duty',
    'suspended'
);

CREATE TYPE trip_status AS ENUM (
    'draft',
    'dispatched',
    'completed',
    'cancelled'
);

CREATE TYPE maintenance_status AS ENUM (
    'open',
    'closed'
);

CREATE TYPE expense_type AS ENUM (
    'fuel',
    'maintenance',
    'toll',
    'parking',
    'other'
);

CREATE TYPE vehicle_type AS ENUM (
    'van',
    'truck',
    'bus',
    'mini_truck',
    'pickup',
    'other'
);
