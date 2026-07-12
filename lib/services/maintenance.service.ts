import { createClient } from "@/lib/supabase/client";
import type { MaintenanceLog } from "@/types";

export interface MaintenanceFormData {
  vehicle_id: string;
  maintenance_type: string;
  description?: string;
  maintenance_date: string;
  cost: number;
  status: string;
}

export interface MaintenanceFilters {
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

export async function getMaintenanceLogs(
  filters: MaintenanceFilters = {}
): Promise<PaginatedResult<MaintenanceLog>> {
  const supabase = createClient();
  const { search, type, status, page = 1, pageSize = 10 } = filters;

  let query = supabase.from("maintenance_logs").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `maintenance_type.ilike.%${search}%,description.ilike.%${search}%`
    );
  }
  if (type) {
    query = query.eq("maintenance_type", type);
  }
  if (status) {
    query = query.eq("status", status);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("maintenance_date", { ascending: false });

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as MaintenanceLog[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    pageCount: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getMaintenanceLog(id: string): Promise<MaintenanceLog | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as MaintenanceLog | null;
}

export async function createMaintenanceLog(
  data: MaintenanceFormData
): Promise<MaintenanceLog> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("maintenance_logs")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as MaintenanceLog;
}

export async function updateMaintenanceLog(
  id: string,
  data: Partial<MaintenanceFormData>
): Promise<MaintenanceLog> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("maintenance_logs")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result as MaintenanceLog;
}

export async function deleteMaintenanceLog(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("maintenance_logs").delete().eq("id", id);
  if (error) throw error;
}

export async function getMaintenanceCostByMonth(months = 6) {
  const supabase = createClient();
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const { data, error } = await supabase
    .from("maintenance_logs")
    .select("maintenance_date, cost")
    .gte("maintenance_date", since.toISOString().slice(0, 10));
  if (error) throw error;
  const byMonth: Record<string, number> = {};
  (data ?? []).forEach((row: any) => {
    const month = row.maintenance_date.slice(0, 7);
    byMonth[month] = (byMonth[month] ?? 0) + Number(row.cost ?? 0);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, cost]) => ({ month, cost }));
}
