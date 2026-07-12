"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { ExpenseFormData } from "@/lib/services/expenses.service";
import type { Expense, Vehicle } from "@/types";

const expenseTypes = ["toll", "parking", "other"];

interface Props {
  initialData?: Expense;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export function ExpenseForm({ initialData, onSubmit, submitLabel, loading }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<ExpenseFormData>({
    vehicle_id: initialData?.vehicle_id ?? "",
    expense_type: initialData?.expense_type ?? "toll",
    amount: initialData?.amount ?? 0,
    expense_date: initialData?.expense_date ?? new Date().toISOString().slice(0, 10),
    notes: initialData?.notes ?? "",
  });

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient();
      const { data } = await supabase.from("vehicles").select("id, vehicle_name, registration_number").order("vehicle_name");
      setVehicles((data as Vehicle[]) ?? []);
    }
    loadVehicles();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  function set(field: keyof ExpenseFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Vehicle</label>
        <select
          value={form.vehicle_id}
          onChange={(e) => set("vehicle_id", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="">Select a vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicle_name} ({v.registration_number})
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Expense Type</label>
        <select
          value={form.expense_type}
          onChange={(e) => set("expense_type", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          {expenseTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <Input
        label="Amount"
        type="number"
        step="0.01"
        value={form.amount || ""}
        onChange={(e) => set("amount", Number(e.target.value))}
        required
      />

      <Input
        label="Date"
        type="date"
        value={form.expense_date}
        onChange={(e) => set("expense_date", e.target.value)}
        required
      />

      <Input
        label="Notes"
        value={form.notes || ""}
        onChange={(e) => set("notes", e.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
