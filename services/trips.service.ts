import { createClient } from "@/lib/supabase/client";
import type { TripStatus } from "@/types";

const supabase = createClient();

export async function getTripCountsByStatus(): Promise<Record<TripStatus, number>> {
  const { data, error } = await supabase.from("trips").select("status");
  if (error) throw error;

  const counts: Record<TripStatus, number> = {
    draft: 0,
    dispatched: 0,
    completed: 0,
    cancelled: 0,
  };

  (data ?? []).forEach((row: any) => {
    if (row.status in counts) counts[row.status as TripStatus] += 1;
  });

  return counts;
}

export async function getTripStatsByDay(days = 14) {
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
