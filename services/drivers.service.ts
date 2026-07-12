import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export async function getActiveDriversCount(): Promise<number> {
  const { count, error } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })
    .in("status", ["available", "on_trip"]);

  if (error) throw error;
  return count ?? 0;
}
