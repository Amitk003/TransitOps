"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FuelForm } from "@/components/fuel/fuel-form";
import { createFuelLog } from "@/lib/services/fuel.service";
import type { FuelFormData } from "@/lib/services/fuel.service";

export default function AddFuelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: FuelFormData) {
    setLoading(true);
    setError("");
    try {
      await createFuelLog(data);
      router.push("/fuel-expenses?tab=fuel");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create fuel log.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Add Fuel Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <FuelForm
            onSubmit={handleSubmit}
            submitLabel="Add Fuel Entry"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
