import { createClient } from "@/lib/supabase/client";

export interface DateRange {
  start: string;
  end: string;
}

export interface ReportKpis {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalOtherCost: number;
  totalCost: number;
  totalDistance: number;
}

export interface TripTrend {
  date: string;
  completed: number;
  cancelled: number;
  dispatched: number;
}

export interface DriverStat {
  driver_id: string;
  driver_name: string;
  trip_count: number;
  total_distance: number;
}

export interface VehicleCost {
  vehicle_id: string;
  vehicle_name: string;
  registration_number: string;
  fuel_cost: number;
  maintenance_cost: number;
  total_cost: number;
}

function defaultRange(): DateRange {
  const end = new Date().toISOString().slice(0, 10);
  const start = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
  return { start, end };
}

export async function getReportKpis(range: DateRange = defaultRange()): Promise<ReportKpis> {
  const supabase = createClient();
  const r = range;

  const tripsPromise = supabase
    .from("trips")
    .select("status, planned_distance")
    .gte("created_at", r.start)
    .lte("created_at", r.end + "T23:59:59");

  const fuelPromise = supabase
    .from("fuel_logs")
    .select("cost")
    .gte("fuel_date", r.start)
    .lte("fuel_date", r.end);

  const maintPromise = supabase
    .from("maintenance_logs")
    .select("cost")
    .gte("maintenance_date", r.start)
    .lte("maintenance_date", r.end);

  const otherPromise = supabase
    .from("expenses")
    .select("amount")
    .gte("expense_date", r.start)
    .lte("expense_date", r.end);

  const [{ data: trips }, { data: fuel }, { data: maint }, { data: other }] = await Promise.all([
    tripsPromise, fuelPromise, maintPromise, otherPromise,
  ]);

  const totalTrips = (trips ?? []).length;
  const completedTrips = (trips ?? []).filter((t: any) => t.status === "completed").length;
  const cancelledTrips = (trips ?? []).filter((t: any) => t.status === "cancelled").length;
  const totalDistance = (trips ?? []).reduce((s: number, t: any) => s + Number(t.planned_distance ?? 0), 0);
  const totalFuelCost = (fuel ?? []).reduce((s: number, f: any) => s + Number(f.cost ?? 0), 0);
  const totalMaintenanceCost = (maint ?? []).reduce((s: number, m: any) => s + Number(m.cost ?? 0), 0);
  const totalOtherCost = (other ?? []).reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0);
  const totalCost = totalFuelCost + totalMaintenanceCost + totalOtherCost;

  return { totalTrips, completedTrips, cancelledTrips, totalFuelCost, totalMaintenanceCost, totalOtherCost, totalCost, totalDistance };
}

export async function getTripTrends(range: DateRange = defaultRange()): Promise<TripTrend[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("created_at, status")
    .gte("created_at", range.start)
    .lte("created_at", range.end + "T23:59:59");

  if (error) throw error;

  const byDay: Record<string, TripTrend> = {};
  const end = new Date(range.end);
  const start = new Date(range.start);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { date: key, completed: 0, cancelled: 0, dispatched: 0 };
  }

  (data ?? []).forEach((row: any) => {
    const day = row.created_at.slice(0, 10);
    if (byDay[day]) {
      if (row.status === "completed") byDay[day].completed += 1;
      else if (row.status === "cancelled") byDay[day].cancelled += 1;
      else if (row.status === "dispatched") byDay[day].dispatched += 1;
    }
  });

  return Object.values(byDay).sort((a, b) => a.date.localeCompare(b.date));
}

export async function getDriverStats(range: DateRange = defaultRange()): Promise<DriverStat[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("trips")
    .select("driver_id, drivers!inner(full_name), planned_distance")
    .gte("created_at", range.start)
    .lte("created_at", range.end + "T23:59:59");

  if (error) throw error;

  const byDriver: Record<string, { name: string; trips: number; distance: number }> = {};
  (data as any[] ?? []).forEach((row: any) => {
    const id = row.driver_id;
    byDriver[id] ??= { name: row.drivers?.full_name ?? "Unknown", trips: 0, distance: 0 };
    byDriver[id].trips += 1;
    byDriver[id].distance += Number(row.planned_distance ?? 0);
  });

  return Object.entries(byDriver)
    .map(([driver_id, s]) => ({ driver_id, driver_name: s.name, trip_count: s.trips, total_distance: s.distance }))
    .sort((a, b) => b.trip_count - a.trip_count);
}

export async function getVehicleCosts(range: DateRange = defaultRange()): Promise<VehicleCost[]> {
  const supabase = createClient();

  const [fuelRows, maintRows, expenseRows, vehicleRows] = await Promise.all([
    supabase.from("fuel_logs").select("vehicle_id, cost").gte("fuel_date", range.start).lte("fuel_date", range.end),
    supabase.from("maintenance_logs").select("vehicle_id, cost").gte("maintenance_date", range.start).lte("maintenance_date", range.end),
    supabase.from("expenses").select("vehicle_id, amount").gte("expense_date", range.start).lte("expense_date", range.end),
    supabase.from("vehicles").select("id, vehicle_name, registration_number"),
  ]);

  const vehicles = (vehicleRows.data as any[] ?? []).reduce((acc: Record<string, any>, v: any) => {
    acc[v.id] = v;
    return acc;
  }, {} as Record<string, any>);

  const costMap: Record<string, { fuel: number; maint: number; other: number }> = {};

  (fuelRows.data ?? []).forEach((r: any) => {
    costMap[r.vehicle_id] ??= { fuel: 0, maint: 0, other: 0 };
    costMap[r.vehicle_id].fuel += Number(r.cost ?? 0);
  });
  (maintRows.data ?? []).forEach((r: any) => {
    costMap[r.vehicle_id] ??= { fuel: 0, maint: 0, other: 0 };
    costMap[r.vehicle_id].maint += Number(r.cost ?? 0);
  });
  (expenseRows.data ?? []).forEach((r: any) => {
    costMap[r.vehicle_id] ??= { fuel: 0, maint: 0, other: 0 };
    costMap[r.vehicle_id].other += Number(r.amount ?? 0);
  });

  return Object.entries(costMap)
    .filter(([vid]) => vehicles[vid])
    .map(([vehicle_id, c]) => {
      const v = vehicles[vehicle_id];
      return {
        vehicle_id,
        vehicle_name: v.vehicle_name,
        registration_number: v.registration_number,
        fuel_cost: c.fuel,
        maintenance_cost: c.maint,
        total_cost: c.fuel + c.maint + c.other,
      };
    })
    .sort((a, b) => b.total_cost - a.total_cost);
}
