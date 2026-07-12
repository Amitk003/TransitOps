import { createClient } from "@/lib/supabase/client";
import type { FuelLog } from "@/types";

export interface FuelFormData {
  vehicle_id: string;
  fuel_date: string;
  liters: number;
  cost: number;
  odometer: number;
  fuel_station?: string;
  remarks?: string;
}

export interface FuelFilters {
  search?: string;
  vehicle_id?: string;
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

export async function getFuelLogs(
  filters: FuelFilters = {}
): Promise<PaginatedResult<FuelLog>> {
  const supabase = createClient();
  const { search, vehicle_id, page = 1, pageSize = 10 } = filters;

  let query = supabase.from("fuel_logs").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `fuel_station.ilike.%${search}%,remarks.ilike.%${search}%`
    );
  }
  if (vehicle_id) {
    query = query.eq("vehicle_id", vehicle_id);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("fuel_date", { ascending: false });

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as FuelLog[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    pageCount: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getFuelLog(id: string): Promise<FuelLog | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("fuel_logs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as FuelLog | null;
}

export async function createFuelLog(data: FuelFormData): Promise<FuelLog> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("fuel_logs")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as FuelLog;
}

export async function updateFuelLog(
  id: string,
  data: Partial<FuelFormData>
): Promise<FuelLog> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("fuel_logs")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result as FuelLog;
}

export async function deleteFuelLog(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("fuel_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function getFuelSpendTotal(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.from("fuel_logs").select("cost");
  if (error) throw error;
  return (data ?? []).reduce((total: number, row: any) => total + Number(row.cost ?? 0), 0);
}
