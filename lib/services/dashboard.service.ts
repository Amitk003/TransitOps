import { getVehicleCountsByStatus } from "@/lib/services/vehicle.service";
import { getActiveDriversCount } from "@/lib/services/driver.service";
import { getTripCountsByStatus } from "@/lib/services/trip.service";
import type { DashboardKpis } from "@/types";

export async function getDashboardKpis(): Promise<DashboardKpis> {
  const [vehicleCounts, activeDrivers, tripCounts] = await Promise.all([
    getVehicleCountsByStatus(),
    getActiveDriversCount(),
    getTripCountsByStatus(),
  ]);

  const totalNonRetired = vehicleCounts.available + vehicleCounts.on_trip + vehicleCounts.in_shop;
  const fleetUtilizationPct = totalNonRetired === 0 ? 0 : Math.round((vehicleCounts.on_trip / totalNonRetired) * 100);

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
