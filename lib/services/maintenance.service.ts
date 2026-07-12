import { createClient } from "@/lib/supabase/client";

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
