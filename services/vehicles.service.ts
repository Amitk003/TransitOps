import { createClient } from "@/lib/supabase/client";
import type { VehicleStatus } from "@/types";

const supabase = createClient();

export async function getVehicleCountsByStatus(): Promise<Record<VehicleStatus, number>> {
  const { data, error } = await supabase.from("vehicles").select("status");
  if (error) throw error;

  const counts: Record<VehicleStatus, number> = {
    available: 0,
    on_trip: 0,
    in_shop: 0,
    retired: 0,
  };

  (data ?? []).forEach((row: any) => {
    if (row.status in counts) counts[row.status as VehicleStatus] += 1;
  });

  return counts;
}

export async function getFleetUtilizationByType() {
  const { data, error } = await supabase.from("vehicles").select("vehicle_type, status");
  if (error) throw error;

  const byType: Record<string, { total: number; onTrip: number }> = {};

  (data ?? []).forEach((row: any) => {
    if (row.status === "retired") return;
    byType[row.vehicle_type] ??= { total: 0, onTrip: 0 };
    byType[row.vehicle_type].total += 1;
    if (row.status === "on_trip") byType[row.vehicle_type].onTrip += 1;
  });

  return Object.entries(byType).map(([type, { total, onTrip }]) => ({
    type,
    utilizationPct: total === 0 ? 0 : Math.round((onTrip / total) * 100),
  }));
}
