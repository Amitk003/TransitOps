"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { FuelFormData } from "@/lib/services/fuel.service";
import type { FuelLog, Vehicle } from "@/types";

interface Props {
  initialData?: FuelLog;
  onSubmit: (data: FuelFormData) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export function FuelForm({ initialData, onSubmit, submitLabel, loading }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<FuelFormData>({
    vehicle_id: initialData?.vehicle_id ?? "",
    fuel_date: initialData?.fuel_date ?? new Date().toISOString().slice(0, 10),
    liters: initialData?.liters ?? 0,
    cost: initialData?.cost ?? 0,
    odometer: initialData?.odometer ?? 0,
    fuel_station: initialData?.fuel_station ?? "",
    remarks: initialData?.remarks ?? "",
  });

  useEffect(() => {
    async function loadVehicles() {
      const supabase = createClient();
      const { data } = await supabase.from("vehicles").select("id, vehicle_name, registration_number").order("vehicle_name");
      setVehicles((data as Vehicle[]) ?? []);
    }
    loadVehicles();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  function set(field: keyof FuelFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Vehicle</label>
        <select
          value={form.vehicle_id}
          onChange={(e) => set("vehicle_id", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          <option value="">Select a vehicle</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.vehicle_name} ({v.registration_number})
            </option>
          ))}
        </select>
      </div>

      <Input
        label="Date"
        type="date"
        value={form.fuel_date}
        onChange={(e) => set("fuel_date", e.target.value)}
        required
      />

      <Input
        label="Liters"
        type="number"
        step="0.01"
        value={form.liters || ""}
        onChange={(e) => set("liters", Number(e.target.value))}
        required
      />

      <Input
        label="Cost"
        type="number"
        step="0.01"
        value={form.cost || ""}
        onChange={(e) => set("cost", Number(e.target.value))}
        required
      />

      <Input
        label="Odometer (km)"
        type="number"
        step="0.1"
        value={form.odometer || ""}
        onChange={(e) => set("odometer", Number(e.target.value))}
        required
      />

      <Input
        label="Fuel Station"
        value={form.fuel_station || ""}
        onChange={(e) => set("fuel_station", e.target.value)}
      />

      <Input
        label="Remarks"
        value={form.remarks || ""}
        onChange={(e) => set("remarks", e.target.value)}
      />

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
