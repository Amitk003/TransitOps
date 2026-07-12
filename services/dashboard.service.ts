import { getVehicleCountsByStatus } from "@/services/vehicles.service";
import { getActiveDriversCount } from "@/services/drivers.service";
import { getTripCountsByStatus } from "@/services/trips.service";
import type { DashboardKpis } from "@/types";

// Aggregates the top-level KPI row: Active Vehicles, Available Vehicles,
// Vehicles in Maintenance, Active Trips, Pending Trips, Active Drivers,
// Fleet Utilization (%).
export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [vehicleCounts, activeDrivers, tripCounts] = await Promise.all([
    getVehicleCountsByStatus(),
    getActiveDriversCount(),
    getTripCountsByStatus(),
  ]);

  const totalNonRetired =
    vehicleCounts.available + vehicleCounts.on_trip + vehicleCounts.in_shop;
  const fleetUtilizationPct =
    totalNonRetired === 0 ? 0 : Math.round((vehicleCounts.on_trip / totalNonRetired) * 100);

  return {
    activeVehicles: vehicleCounts.available + vehicleCounts.on_trip,
    availableVehicles: vehicleCounts.available,
    vehiclesInMaintenance: vehicleCounts.in_shop,
    activeTrips: tripCounts.dispatched,
    pendingTrips: tripCounts.draft,
    activeDrivers,
    fleetUtilizationPct,
  };
}
