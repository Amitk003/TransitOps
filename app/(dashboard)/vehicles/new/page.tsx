"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { createVehicle } from "@/lib/services/vehicle.service";
import type { VehicleFormData } from "@/lib/services/vehicle.service";

export default function AddVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(data: VehicleFormData) {
    setLoading(true);
    setError("");
    try {
      await createVehicle(data);
      router.push("/vehicles");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create vehicle.";
      if (msg.includes("duplicate key")) {
        setError("A vehicle with this registration number already exists.");
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
          <CardTitle>Add Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          <VehicleForm
            onSubmit={handleSubmit}
            submitLabel="Add Vehicle"
            loading={loading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
