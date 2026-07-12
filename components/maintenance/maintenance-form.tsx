"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type { MaintenanceFormData } from "@/lib/services/maintenance.service";
import type { MaintenanceLog, Vehicle } from "@/types";

const maintenanceTypes = ["engine", "transmission", "brakes", "tires", "electrical", "body", "inspection", "other"];
const statusOptions = ["open", "closed"];

interface Props {
  initialData?: MaintenanceLog;
  onSubmit: (data: MaintenanceFormData) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export function MaintenanceForm({ initialData, onSubmit, submitLabel, loading }: Props) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<MaintenanceFormData>({
    vehicle_id: initialData?.vehicle_id ?? "",
    maintenance_type: initialData?.maintenance_type ?? "engine",
    description: initialData?.description ?? "",
    maintenance_date: initialData?.maintenance_date ?? new Date().toISOString().slice(0, 10),
    cost: initialData?.cost ?? 0,
    status: initialData?.status ?? "open",
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

  function set(field: keyof MaintenanceFormData, value: string | number) {
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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Maintenance Type</label>
        <select
          value={form.maintenance_type}
          onChange={(e) => set("maintenance_type", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          required
        >
          {maintenanceTypes.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <Input
        label="Description"
        value={form.description || ""}
        onChange={(e) => set("description", e.target.value)}
      />

      <Input
        label="Date"
        type="date"
        value={form.maintenance_date}
        onChange={(e) => set("maintenance_date", e.target.value)}
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

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium">Status</label>
        <select
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : submitLabel}
      </Button>
    </form>
  );
}
