import { createClient } from "@/lib/supabase/client";
import type { Vehicle } from "@/types";

export interface VehicleFormData {
  registration_number: string;
  vehicle_name: string;
  vehicle_type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: string;
}

export interface VehicleFilters {
  search?: string;
  type?: string;
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

export async function getVehicles(
  filters: VehicleFilters = {}
): Promise<PaginatedResult<Vehicle>> {
  const supabase = createClient();
  const { search, type, status, page = 1, pageSize = 10 } = filters;

  let query = supabase.from("vehicles").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `registration_number.ilike.%${search}%,vehicle_name.ilike.%${search}%`
    );
  }
  if (type) {
    query = query.eq("vehicle_type", type);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("created_at", { ascending: false });

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as Vehicle[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    pageCount: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("vehicles")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Vehicle | null;
}

export async function createVehicle(
  data: VehicleFormData
): Promise<Vehicle> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("vehicles")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Vehicle;
}

export async function updateVehicle(
  id: string,
  data: Partial<VehicleFormData>
): Promise<Vehicle> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("vehicles")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result as Vehicle;
}

export async function deleteVehicle(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("vehicles").delete().eq("id", id);
  if (error) throw error;
}
