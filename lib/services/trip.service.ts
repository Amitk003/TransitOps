import { createClient } from "@/lib/supabase/client";
import type { Trip, Vehicle, Driver } from "@/types";

export interface TripFormData {
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
}

export interface TripFilters {
  search?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface TripValidation {
  valid: boolean;
  errors: string[];
}

export async function getTrips(
  filters: TripFilters = {}
): Promise<PaginatedResult<Trip>> {
  const supabase = createClient();
  const { search, status, page = 1, pageSize = 10 } = filters;

  let query = supabase
    .from("trips")
    .select("*, vehicles!inner(registration_number, vehicle_name), drivers!inner(full_name)", { count: "exact" });

  if (search) {
    query = query.or(
      `source.ilike.%${search}%,destination.ilike.%${search}%`
    );
  }
  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, count, error } = await query;
  if (error) throw error;

  const enriched = (data as any[]).map((row) => ({
    ...row,
    registration_number: row.vehicles?.registration_number ?? "",
    vehicle_name: row.vehicles?.vehicle_name ?? "",
    driver_name: row.drivers?.full_name ?? "",
  }));

  return {
    data: (enriched as Trip[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    pageCount: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getTrip(id: string): Promise<Trip | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("*, vehicles(registration_number, vehicle_name), drivers(full_name)")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  const row = data as any;
  return {
    ...row,
    registration_number: row.vehicles?.registration_number ?? "",
    vehicle_name: row.vehicles?.vehicle_name ?? "",
    driver_name: row.drivers?.full_name ?? "",
  } as Trip;
}

export async function validateTrip(
  data: TripFormData
): Promise<TripValidation> {
  const supabase = createClient();
  const errors: string[] = [];

  if (!data.source.trim()) errors.push("Source is required.");
  if (!data.destination.trim()) errors.push("Destination is required.");
  if (data.cargo_weight <= 0) errors.push("Cargo weight must be greater than 0.");
  if (data.planned_distance <= 0) errors.push("Planned distance must be greater than 0.");

  const { data: vehicle, error: ve } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", data.vehicle_id)
    .single();

  if (ve || !vehicle) {
    errors.push("Selected vehicle not found.");
  } else {
    const v = vehicle as Vehicle;
    if (v.status !== "available") {
      errors.push(`Vehicle "${v.vehicle_name}" is ${v.status.replace("_", " ")} and cannot be assigned.`);
    }
    if (data.cargo_weight > v.max_load_capacity) {
      errors.push(`Cargo weight exceeds vehicle capacity of ${v.max_load_capacity} kg.`);
    }
  }

  const { data: driver, error: de } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", data.driver_id)
    .single();

  if (de || !driver) {
    errors.push("Selected driver not found.");
  } else {
    const d = driver as Driver;
    if (d.status !== "available") {
      errors.push(`Driver "${d.full_name}" is currently ${d.status.replace("_", " ")}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export async function createTrip(data: TripFormData): Promise<Trip> {
  const supabase = createClient();

  const validation = await validateTrip(data);
  if (!validation.valid) {
    throw new Error(validation.errors.join("\n"));
  }

  const { data: result, error } = await supabase
    .from("trips")
    .insert({
      source: data.source,
      destination: data.destination,
      vehicle_id: data.vehicle_id,
      driver_id: data.driver_id,
      cargo_weight: data.cargo_weight,
      planned_distance: data.planned_distance,
      status: "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return result as Trip;
}

export async function dispatchTrip(id: string): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: trip, error: getErr } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (getErr) throw getErr;
  if (!trip) throw new Error("Trip not found.");
  if (trip.status !== "draft") throw new Error("Only draft trips can be dispatched.");

  const { error } = await supabase
    .from("trips")
    .update({ status: "dispatched", start_time: now, updated_at: now })
    .eq("id", id);

  if (error) throw error;
}

export async function completeTrip(id: string): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: trip, error: getErr } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (getErr) throw getErr;
  if (!trip) throw new Error("Trip not found.");
  if (trip.status !== "dispatched") throw new Error("Only dispatched trips can be completed.");

  const { error } = await supabase
    .from("trips")
    .update({ status: "completed", end_time: now, updated_at: now })
    .eq("id", id);

  if (error) throw error;
}

export async function cancelTrip(id: string): Promise<void> {
  const supabase = createClient();
  const now = new Date().toISOString();

  const { data: trip, error: getErr } = await supabase
    .from("trips")
    .select("*")
    .eq("id", id)
    .single();

  if (getErr) throw getErr;
  if (!trip) throw new Error("Trip not found.");
  if (trip.status === "completed" || trip.status === "cancelled") {
    throw new Error("Trip is already completed or cancelled.");
  }

  const { error } = await supabase
    .from("trips")
    .update({ status: "cancelled", updated_at: now })
    .eq("id", id);

  if (error) throw error;
}

export async function deleteTrip(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) throw error;
}

export async function getTripCountsByStatus(): Promise<Record<string, number>> {
  const supabase = createClient();
  const { data, error } = await supabase.from("trips").select("status");
  if (error) throw error;
  const counts: Record<string, number> = { draft: 0, dispatched: 0, completed: 0, cancelled: 0 };
  (data ?? []).forEach((row: any) => { if (row.status in counts) counts[row.status] += 1; });
  return counts;
}

export async function getTripStatsByDay(days = 14) {
  const supabase = createClient();
  const since = new Date();
  since.setDate(since.getDate() - days);
  const { data, error } = await supabase
    .from("trips")
    .select("created_at, status")
    .gte("created_at", since.toISOString());
  if (error) throw error;
  const byDay: Record<string, { completed: number; cancelled: number; dispatched: number }> = {};
  (data ?? []).forEach((row: any) => {
    const day = row.created_at.slice(0, 10);
    byDay[day] ??= { completed: 0, cancelled: 0, dispatched: 0 };
    if (row.status === "completed") byDay[day].completed += 1;
    if (row.status === "cancelled") byDay[day].cancelled += 1;
    if (row.status === "dispatched") byDay[day].dispatched += 1;
  });
  return Object.entries(byDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));
}
