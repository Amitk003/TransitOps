import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getFuelSpendTotal(): Promise<number> {
  const { data, error } = await supabase.from("fuel_logs").select("cost");
  if (error) throw error;

  return (data ?? []).reduce((total: number, row: any) => total + Number(row.cost ?? 0), 0);
}
