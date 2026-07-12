"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";
import {
  getMaintenanceLog,
  updateMaintenanceLog,
} from "@/lib/services/maintenance.service";
import type { MaintenanceFormData } from "@/lib/services/maintenance.service";
import type { MaintenanceLog } from "@/types";

const statusVariant: Record<string, "success" | "secondary" | "warning" | "outline" | "destructive"> = {
  open: "warning",
  closed: "success",
};

export default function EditMaintenancePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [log, setLog] = useState<MaintenanceLog | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getMaintenanceLog(id);
        if (!data) {
          setNotFound(true);
        } else {
          setLog(data);
        }
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleSubmit(data: MaintenanceFormData) {
    setSaving(true);
    setError("");
    try {
      await updateMaintenanceLog(id, data);
      router.push("/maintenance");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update maintenance record.";
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus() {
    if (!log) return;
    const newStatus = log.status === "open" ? "closed" : "open";
    setSaving(true);
    try {
      await updateMaintenanceLog(id, { status: newStatus } as MaintenanceFormData);
      setLog({ ...log, status: newStatus });
    } catch (err) {
      console.error("Failed to update status", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  if (notFound || !log) {
    return <p className="text-center text-muted-foreground">Maintenance record not found.</p>;
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Maintenance Record</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {log.maintenance_type} on {log.maintenance_date}
            </p>
          </div>
          <Badge variant={statusVariant[log.status] || "outline"} className="text-sm">
            {log.status}
          </Badge>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex gap-2">
            <Button
              variant={log.status === "open" ? "default" : "outline"}
              size="sm"
              onClick={toggleStatus}
              disabled={saving}
            >
              {log.status === "open" ? "Close Record" : "Reopen Record"}
            </Button>
          </div>

          {error && (
            <p className="mb-4 text-sm text-destructive">{error}</p>
          )}
          <MaintenanceForm
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
