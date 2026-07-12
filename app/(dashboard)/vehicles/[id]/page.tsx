"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { VehicleForm } from "@/components/vehicles/vehicle-form";
import { getVehicle, updateVehicle } from "@/lib/services/vehicle.service";
import type { VehicleFormData } from "@/lib/services/vehicle.service";
import type { Vehicle } from "@/types";

export default function EditVehiclePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getVehicle(id);
        if (!data) {
          setNotFound(true);
        } else {
          setVehicle(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(data: VehicleFormData) {
    setSaving(true);
    setError("");
    try {
      await updateVehicle(id, data);
      router.push("/vehicles");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update vehicle.";
      if (msg.includes("duplicate key")) {
        setError("A vehicle with this registration number already exists.");
      } else {
        setError(msg);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  if (notFound || !vehicle) {
    return <p className="text-center text-muted-foreground">Vehicle not found.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit Vehicle</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          <VehicleForm
            initialData={vehicle}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
