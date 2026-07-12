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
  registrationNumber: string;
  name: string;
  type: VehicleType;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
  createdAt: string;
  updatedAt: string;
}

export type DriverStatus = "available" | "on_trip" | "off_duty" | "suspended";

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safetyScore: number;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
}

export type TripStatus = "draft" | "dispatched" | "completed" | "cancelled";

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
  status: TripStatus;
  startTime?: string;
  endTime?: string;
  createdAt: string;
  updatedAt: string;
}

export type MaintenanceStatus = "open" | "closed";

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  maintenanceType: string;
  description?: string;
  maintenanceDate: string;
  cost: number;
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  odometer: number;
  date: string;
  fuelStation?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory = "fuel" | "maintenance" | "toll" | "parking" | "other";

export interface Expense {
  id: string;
  vehicleId: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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
