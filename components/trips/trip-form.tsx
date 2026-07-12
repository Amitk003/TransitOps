"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { TripFormData } from "@/lib/services/trip.service";
import type { Vehicle, Driver } from "@/types";

interface Props {
  vehicles: Vehicle[];
  drivers: Driver[];
  onSubmit: (data: TripFormData) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export function TripForm({ vehicles, drivers, onSubmit, submitLabel, loading }: Props) {
  const [form, setForm] = useState<TripFormData>({
    source: "",
    destination: "",
    vehicle_id: "",
    driver_id: "",
    cargo_weight: 0,
    planned_distance: 0,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  function set(field: keyof TripFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const availableVehicles = vehicles.filter((v) => v.status === "available");
  const availableDrivers = drivers.filter((d) => d.status === "available");

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Source"
        placeholder="e.g. Bangalore"
        value={form.source}
        onChange={(e) => set("source", e.target.value)}
        required
      />
      <Input
        label="Destination"
        placeholder="e.g. Mysore"
        value={form.destination}
        onChange={(e) => set("destination", e.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Vehicle</label>
        <select
          value={form.vehicle_id}
          onChange={(e) => set("vehicle_id", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="">Select a vehicle</option>
          {availableVehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.registration_number} — {v.vehicle_name} ({v.max_load_capacity} kg cap.)
            </option>
          ))}
        </select>
        {availableVehicles.length === 0 && (
          <p className="text-xs text-destructive">No available vehicles.</p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Driver</label>
        <select
          value={form.driver_id}
          onChange={(e) => set("driver_id", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="">Select a driver</option>
          {availableDrivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.full_name} (Lic: {d.license_number})
            </option>
          ))}
        </select>
        {availableDrivers.length === 0 && (
          <p className="text-xs text-destructive">No available drivers.</p>
        )}
      </div>
      <Input
        label="Cargo Weight (kg)"
        type="number"
        min={1}
        placeholder="e.g. 500"
        value={form.cargo_weight || ""}
        onChange={(e) => set("cargo_weight", Number(e.target.value))}
        required
      />
      <Input
        label="Planned Distance (km)"
        type="number"
        min={1}
        placeholder="e.g. 150"
        value={form.planned_distance || ""}
        onChange={(e) => set("planned_distance", Number(e.target.value))}
        required
      />
      <Button type="submit" disabled={loading || availableVehicles.length === 0 || availableDrivers.length === 0}>
        {loading ? "Creating..." : submitLabel}
      </Button>
    </form>
  );
}
