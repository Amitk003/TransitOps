// Shared domain types for TransitOps.
// These mirror the "Expected Database Entities" from the product brief and
// give every teammate a single, consistent shape to build against
// (Phase 3 will wire these to the real Supabase-generated types).

export type UserRole = "fleet_manager" | "driver" | "safety_officer" | "financial_analyst";

export interface AppUser {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type VehicleStatus = "available" | "on_trip" | "in_shop" | "retired";

export type VehicleType = "van" | "truck" | "bus" | "mini_truck" | "pickup" | "other";

export interface Vehicle {
  id: string;
  registration_number: string;
  vehicle_name: string;
  vehicle_type: VehicleType;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: VehicleStatus;
  created_at: string;
  updated_at: string;
}

export type DriverStatus = "available" | "on_trip" | "off_duty" | "suspended";

export interface Driver {
  id: string;
  full_name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: DriverStatus;
  created_at: string;
  updated_at: string;
}

export type TripStatus = "draft" | "dispatched" | "completed" | "cancelled";

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
  status: TripStatus;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export type MaintenanceStatus = "open" | "closed";

export interface MaintenanceLog {
  id: string;
  vehicle_id: string;
  maintenance_type: string;
  description?: string;
  maintenance_date: string;
  cost: number;
  status: MaintenanceStatus;
  created_at: string;
  updated_at: string;
}

export interface FuelLog {
  id: string;
  vehicle_id: string;
  liters: number;
  cost: number;
  odometer: number;
  fuel_date: string;
  fuel_station?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export type ExpenseCategory = "fuel" | "maintenance" | "toll" | "parking" | "other";

export interface Expense {
  id: string;
  vehicle_id: string;
  expense_type: ExpenseCategory;
  amount: number;
  expense_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardKpis {
  activeVehicles: number;
  availableVehicles: number;
  vehiclesInMaintenance: number;
  activeTrips: number;
  pendingTrips: number;
  driversOnDuty: number;
  fleetUtilizationPct: number;
}
