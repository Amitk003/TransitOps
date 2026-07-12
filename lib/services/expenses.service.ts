import { createClient } from "@/lib/supabase/client";

export async function getExpenseBreakdown() {
  const supabase = createClient();
  const [{ data: expenseRows }, { data: fuelRows }] = await Promise.all([
    supabase.from("expenses").select("expense_type, amount"),
    supabase.from("fuel_logs").select("cost"),
  ]);
  const totals: Record<string, number> = { fuel: 0, maintenance: 0, toll: 0, parking: 0, other: 0 };
  (expenseRows ?? []).forEach((row: any) => {
    totals[row.expense_type] = (totals[row.expense_type] ?? 0) + Number(row.amount ?? 0);
  });
  (fuelRows ?? []).forEach((row: any) => {
    totals.fuel += Number(row.cost ?? 0);
  });
  return Object.entries(totals)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount }));
}
