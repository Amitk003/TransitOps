import { createClient } from "@/lib/supabase/client";
import type { Expense } from "@/types";

export interface ExpenseFormData {
  vehicle_id: string;
  expense_type: string;
  amount: number;
  expense_date: string;
  notes?: string;
}

export interface ExpenseFilters {
  search?: string;
  type?: string;
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

export async function getExpenses(
  filters: ExpenseFilters = {}
): Promise<PaginatedResult<Expense>> {
  const supabase = createClient();
  const { search, type, page = 1, pageSize = 10 } = filters;

  let query = supabase.from("expenses").select("*", { count: "exact" });

  if (search) {
    query = query.or(
      `expense_type.ilike.%${search}%,notes.ilike.%${search}%`
    );
  }
  if (type) {
    query = query.eq("expense_type", type);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to).order("expense_date", { ascending: false });

  const { data, count, error } = await query;
  if (error) throw error;

  return {
    data: (data as Expense[]) ?? [],
    count: count ?? 0,
    page,
    pageSize,
    pageCount: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getExpense(id: string): Promise<Expense | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data as Expense | null;
}

export async function createExpense(data: ExpenseFormData): Promise<Expense> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("expenses")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result as Expense;
}

export async function updateExpense(
  id: string,
  data: Partial<ExpenseFormData>
): Promise<Expense> {
  const supabase = createClient();
  const { data: result, error } = await supabase
    .from("expenses")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result as Expense;
}

export async function deleteExpense(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("expenses").delete().eq("id", id);
  if (error) throw error;
}

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
