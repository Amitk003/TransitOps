// Shared domain types for TransitOps.
// These mirror the "Expected Database Entities" from the product brief and
// give every teammate a single, consistent shape to build against
// (Phase 3 will wire these to the real Supabase-generated types).

export type UserRole = "fleet_manager" | "driver" | "safety_officer" | "financial_analyst";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export type VehicleStatus = "available" | "on_trip" | "in_shop" | "retired";

export interface Vehicle {
  id: string;
  registrationNumber: string; // unique
  name: string;
  type: string;
  maxLoadCapacityKg: number;
  odometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region?: string;
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
  createdAt: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  description: string;
  cost: number;
  isActive: boolean;
  createdAt: string;
  closedAt?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
}

export interface Expense {
  id: string;
  vehicleId: string;
  category: "toll" | "maintenance" | "other";
  amount: number;
  date: string;
  notes?: string;
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
