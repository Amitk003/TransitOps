"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { createExpense } from "@/lib/services/expenses.service";
import type { ExpenseFormData } from "@/lib/services/expenses.service";

export default function AddExpensePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: ExpenseFormData) {
    setLoading(true);
    setError("");
    try {
      await createExpense(data);
      router.push("/fuel-expenses?tab=expenses");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create expense.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Add Expense</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <ExpenseForm
            onSubmit={handleSubmit}
            submitLabel="Add Expense"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
