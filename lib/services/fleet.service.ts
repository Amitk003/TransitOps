import { createClient } from "@/lib/supabase/client";

export interface FleetVehicle {
  id: string;
  registration_number: string;
  vehicle_name: string;
  vehicle_type: string;
  status: string;
  current_latitude: number;
  current_longitude: number;
}

export interface FleetTrip {
  id: string;
  source: string;
  destination: string;
  status: string;
  start_latitude: number;
  start_longitude: number;
  end_latitude: number;
  end_longitude: number;
  registration_number: string;
  driver_name: string;
  vehicle_name: string;
}

export async function getFleetVehicles(): Promise<FleetVehicle[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("id, registration_number, vehicle_name, vehicle_type, status, current_latitude, current_longitude")
    .neq("status", "retired");
  if (error) throw error;
  return (data ?? []) as FleetVehicle[];
}

export async function getActiveTripRoutes(): Promise<FleetTrip[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("id, source, destination, status, start_latitude, start_longitude, end_latitude, end_longitude, vehicles!inner(registration_number, vehicle_name), drivers!inner(full_name)")
    .in("status", ["draft", "dispatched"]);
  if (error) throw error;
  return (data ?? []).map((row: any) => ({
    ...row,
    registration_number: row.vehicles?.registration_number ?? "",
    vehicle_name: row.vehicles?.vehicle_name ?? "",
    driver_name: row.drivers?.full_name ?? "",
  })) as FleetTrip[];
}
