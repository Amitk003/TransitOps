"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DriverForm } from "@/components/drivers/driver-form";
import { createDriver } from "@/lib/services/driver.service";
import type { DriverFormData } from "@/lib/services/driver.service";

export default function AddDriverPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: DriverFormData) {
    setLoading(true);
    setError("");
    try {
      await createDriver(data);
      router.push("/drivers");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create driver.";
      if (msg.includes("duplicate key")) {
        setError("A driver with this license number already exists.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Add Driver</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          <DriverForm
            onSubmit={handleSubmit}
            submitLabel="Add Driver"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
