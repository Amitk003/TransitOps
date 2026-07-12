"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getExpense, updateExpense } from "@/lib/services/expenses.service";
import type { ExpenseFormData } from "@/lib/services/expenses.service";
import type { Expense } from "@/types";

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getExpense(id);
        if (!data) setNotFound(true);
        else setExpense(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(data: ExpenseFormData) {
    setSaving(true);
    setError("");
    try {
      await updateExpense(id, data);
      router.push("/fuel-expenses?tab=expenses");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update expense.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-center text-muted-foreground">Loading...</p>;
  if (notFound || !expense) return <p className="text-center text-muted-foreground">Expense not found.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit Expense</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <ExpenseForm
            initialData={expense}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
