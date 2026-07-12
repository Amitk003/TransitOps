import { createClient } from "@/lib/supabase/client";
import type { Driver } from "@/types";

export interface DriverFormData {
  full_name: string;
  license_number: string;
  license_category: string;
  license_expiry_date: string;
  contact_number: string;
  safety_score: number;
  status: string;
}

export interface DriverFilters {
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

export async function getDrivers(
  filters: DriverFilters = {}
): Promise<PaginatedResult<Driver>> {
  const supabase = createClient();
  const { search, status, page = 1, pageSize = 10 } = filters;

  let query = supabase.from("drivers").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,license_number.ilike.%${search}%`
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

  return {
    data: (data as Driver[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    pageCount: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getDriver(id: string): Promise<Driver | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Driver | null;
}

export async function createDriver(
  data: DriverFormData
): Promise<Driver> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("drivers")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Driver;
}

export async function updateDriver(
  id: string,
  data: Partial<DriverFormData>
): Promise<Driver> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("drivers")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result as Driver;
}

export async function updateDriverStatus(
  id: string,
  status: string
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("drivers")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteDriver(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("drivers").delete().eq("id", id);
  if (error) throw error;
}
