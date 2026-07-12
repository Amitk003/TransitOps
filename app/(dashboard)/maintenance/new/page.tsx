"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import { createMaintenanceLog } from "@/lib/services/maintenance.service";
import type { MaintenanceFormData } from "@/lib/services/maintenance.service";

export default function AddMaintenancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: MaintenanceFormData) {
    setLoading(true);
    setError("");
    try {
      await createMaintenanceLog(data);
      router.push("/maintenance");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create maintenance record.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Add Maintenance Record</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          <MaintenanceForm
            onSubmit={handleSubmit}
            submitLabel="Add Record"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
