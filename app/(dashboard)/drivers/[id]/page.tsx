"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DriverForm } from "@/components/drivers/driver-form";
import { getDriver, updateDriver } from "@/lib/services/driver.service";
import type { DriverFormData } from "@/lib/services/driver.service";
import type { Driver } from "@/types";

export default function EditDriverPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getDriver(id);
        if (!data) {
          setNotFound(true);
        } else {
          setDriver(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(data: DriverFormData) {
    setSaving(true);
    setError("");
    try {
      await updateDriver(id, data);
      router.push("/drivers");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update driver.";
      if (msg.includes("duplicate key")) {
        setError("A driver with this license number already exists.");
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

  if (notFound || !driver) {
    return <p className="text-center text-muted-foreground">Driver not found.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Edit Driver</CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          <DriverForm
            initialData={driver}
            onSubmit={handleSubmit}
            submitLabel="Save Changes"
            loading={saving}
          />
        </CardContent>
      </Card>
    </div>
  );
}
