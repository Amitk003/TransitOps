"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VehicleFormData } from "@/lib/services/vehicle.service";
import type { Vehicle } from "@/types";

const vehicleTypes = ["van", "truck", "bus", "mini_truck", "pickup", "other"];
const statusOptions = ["available", "on_trip", "in_shop", "retired"];

interface Props {
  initialData?: Vehicle;
  onSubmit: (data: VehicleFormData) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export function VehicleForm({ initialData, onSubmit, submitLabel, loading }: Props) {
  const [form, setForm] = useState<VehicleFormData>({
    registration_number: initialData?.registration_number ?? "",
    vehicle_name: initialData?.vehicle_name ?? "",
    vehicle_type: initialData?.vehicle_type ?? "van",
    max_load_capacity: initialData?.max_load_capacity ?? 0,
    odometer: initialData?.odometer ?? 0,
    acquisition_cost: initialData?.acquisition_cost ?? 0,
    status: initialData?.status ?? "available",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  function set(field: keyof VehicleFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Registration Number"
        value={form.registration_number}
        onChange={(e) => set("registration_number", e.target.value)}
        required
      />
      <Input
        label="Vehicle Name"
        value={form.vehicle_name}
        onChange={(e) => set("vehicle_name", e.target.value)}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Vehicle Type</label>
        <select
          value={form.vehicle_type}
          onChange={(e) => set("vehicle_type", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          {vehicleTypes.map((t) => (
            <option key={t} value={t}>{t.replace("_", " ")}</option>
          ))}
        </select>
      </div>
      <Input
        label="Max Load Capacity (kg)"
        type="number"
        value={form.max_load_capacity || ""}
        onChange={(e) => set("max_load_capacity", Number(e.target.value))}
        required
      />
      <Input
        label="Odometer (km)"
        type="number"
        value={form.odometer || ""}
        onChange={(e) => set("odometer", Number(e.target.value))}
      />
      <Input
        label="Acquisition Cost"
        type="number"
        value={form.acquisition_cost || ""}
        onChange={(e) => set("acquisition_cost", Number(e.target.value))}
        required
      />
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Status</label>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s.replace("_", " ")}</option>
          ))}
        </select>
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
