"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TripForm } from "@/components/trips/trip-form";
import { createTrip } from "@/lib/services/trip.service";
import { getVehicles } from "@/lib/services/vehicle.service";
import { getDrivers } from "@/lib/services/driver.service";
import type { TripFormData } from "@/lib/services/trip.service";
import type { Vehicle, Driver } from "@/types";

export default function AddTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [vResult, dResult] = await Promise.all([
          getVehicles(),
          getDrivers(),
        ]);
        setVehicles(vResult.data);
        setDrivers(dResult.data);
      } catch {
        setError("Failed to load vehicles or drivers.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSubmit(data: TripFormData) {
    setSaving(true);
    setError("");
    try {
      await createTrip(data);
      router.push("/trips");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create trip.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Create Trip</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading vehicles and drivers...</p>
          ) : (
            <>
              {error && (
                <p className="mb-4 whitespace-pre-wrap text-sm text-destructive">{error}</p>
              )}
              <TripForm
                vehicles={vehicles}
                drivers={drivers}
                onSubmit={handleSubmit}
                submitLabel="Create Trip"
                loading={saving}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
