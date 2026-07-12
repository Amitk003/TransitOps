"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DriverFormData } from "@/lib/services/driver.service";
import type { Driver } from "@/types";

const statusOptions = ["available", "on_trip", "off_duty", "suspended"];

interface Props {
  initialData?: Driver;
  onSubmit: (data: DriverFormData) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export function DriverForm({ initialData, onSubmit, submitLabel, loading }: Props) {
  const [form, setForm] = useState<DriverFormData>({
    full_name: initialData?.full_name ?? "",
    license_number: initialData?.license_number ?? "",
    license_category: initialData?.license_category ?? "",
    license_expiry_date: initialData?.license_expiry_date ?? "",
    contact_number: initialData?.contact_number ?? "",
    safety_score: initialData?.safety_score ?? 100,
    status: initialData?.status ?? "available",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(form);
  }

  function set(field: keyof DriverFormData, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Full Name"
        value={form.full_name}
        onChange={(e) => set("full_name", e.target.value)}
        required
      />
      <Input
        label="License Number"
        value={form.license_number}
        onChange={(e) => set("license_number", e.target.value)}
        required
      />
      <Input
        label="License Category"
        value={form.license_category}
        onChange={(e) => set("license_category", e.target.value)}
        placeholder="e.g. LMV, HMV"
        required
      />
      <Input
        label="License Expiry Date"
        type="date"
        value={form.license_expiry_date}
        onChange={(e) => set("license_expiry_date", e.target.value)}
        required
      />
      <Input
        label="Contact Number"
        value={form.contact_number}
        onChange={(e) => set("contact_number", e.target.value)}
        placeholder="e.g. 9876500001"
      />
      <Input
        label="Safety Score (0-100)"
        type="number"
        min={0}
        max={100}
        value={form.safety_score || ""}
        onChange={(e) => set("safety_score", Number(e.target.value))}
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
