"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FuelForm } from "@/components/fuel/fuel-form";
import { getFuelLog, updateFuelLog } from "@/lib/services/fuel.service";
import type { FuelFormData } from "@/lib/services/fuel.service";
import type { FuelLog } from "@/types";

export default function EditFuelPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [log, setLog] = useState<FuelLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getFuelLog(id);
        if (!data) setNotFound(true);
        else setLog(data);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(data: FuelFormData) {
    setSaving(true);
    setError("");
    try {
      await updateFuelLog(id, data);
      router.push("/fuel-expenses?tab=fuel");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update fuel log.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-center text-muted-foreground">Loading...</p>;
  if (notFound || !log) return <p className="text-center text-muted-foreground">Fuel log not found.</p>;

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit Fuel Entry</CardTitle>
        </CardHeader>
        <CardContent>
          {error && <p className="mb-4 text-sm text-destructive">{error}</p>}
          <FuelForm
            initialData={log}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
