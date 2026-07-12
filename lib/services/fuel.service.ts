import { createClient } from "@/lib/supabase/client";

export async function getFuelSpendTotal(): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase.from("fuel_logs").select("cost");
  if (error) throw error;
  return (data ?? []).reduce((total: number, row: any) => total + Number(row.cost ?? 0), 0);
}
