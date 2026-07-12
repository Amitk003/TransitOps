"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogCloseButton,
} from "@/components/ui/dialog";
import {
  getTrips,
  createTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  getAvailableVehiclesForTrip,
  getAvailableDriversForTrip,
  type TripWithDetails,
  type CreateTripInput,
  type ValidationError,
} from "@/lib/services/trip.service";
import type { Vehicle, Driver } from "@/types";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  draft: "default",
  dispatched: "secondary",
  completed: "success",
  cancelled: "outline",
};

export default function TripsPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<TripWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<CreateTripInput>({
    source: "",
    destination: "",
    vehicleId: "",
    driverId: "",
    cargoWeightKg: 0,
    plannedDistanceKm: 0,
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [availableVehicles, setAvailableVehicles] = useState<Vehicle[]>([]);
  const [availableDrivers, setAvailableDrivers] = useState<Driver[]>([]);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    const data = await getTrips();
    setTrips(data);
    setLoading(false);
  }, []);

  const loadFormData = useCallback(async () => {
    const [vehicles, drivers] = await Promise.all([
      getAvailableVehiclesForTrip(),
      getAvailableDriversForTrip(),
    ]);
    setAvailableVehicles(vehicles);
    setAvailableDrivers(drivers);
  }, []);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  function openCreate() {
    setForm({ source: "", destination: "", vehicleId: "", driverId: "", cargoWeightKg: 0, plannedDistanceKm: 0 });
    setErrors([]);
    loadFormData();
    setCreateOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setErrors([]);
    const result = await createTrip(form);
    if (result.errors) {
      setErrors(result.errors);
      setSubmitting(false);
      return;
    }
    setCreateOpen(false);
    setSubmitting(false);
    loadTrips();
  }

  async function handleDispatch(id: string) {
    await dispatchTrip(id);
    loadTrips();
  }

  async function handleComplete(id: string) {
    await completeTrip(id);
    loadTrips();
  }

  async function handleCancel(id: string) {
    await cancelTrip(id);
    loadTrips();
  }

  function fieldError(field: string): string | undefined {
    return errors.find((e) => e.field === field)?.message;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Trips</h1>
          <p className="text-sm text-muted-foreground">Manage and monitor all trips.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Create Trip
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Driver</TableHead>
            <TableHead>Cargo</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">Loading...</TableCell>
            </TableRow>
          ) : trips.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center text-muted-foreground">No trips found.</TableCell>
            </TableRow>
          ) : (
            trips.map((trip) => (
              <TableRow key={trip.id} className="cursor-pointer" onClick={() => router.push(`/trips/${trip.id}`)}>
                <TableCell className="font-mono text-xs">{trip.id}</TableCell>
                <TableCell>{trip.source}</TableCell>
                <TableCell>{trip.destination}</TableCell>
                <TableCell className="text-xs">{trip.vehicleReg} - {trip.vehicleName}</TableCell>
                <TableCell>{trip.driverName}</TableCell>
                <TableCell className="tabular-nums">{trip.cargoWeightKg} kg</TableCell>
                <TableCell className="tabular-nums">{trip.plannedDistanceKm} km</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[trip.status]}>{trip.status.replace("_", " ")}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                    {trip.status === "draft" && (
                      <>
                        <Button size="sm" variant="secondary" onClick={() => handleDispatch(trip.id)}>Dispatch</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCancel(trip.id)}>Cancel</Button>
                      </>
                    )}
                    {trip.status === "dispatched" && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleComplete(trip.id)}>Complete</Button>
                        <Button size="sm" variant="ghost" onClick={() => handleCancel(trip.id)}>Cancel</Button>
                      </>
                    )}
                    {trip.status === "completed" && (
                      <span className="text-xs text-muted-foreground">Completed</span>
                    )}
                    {trip.status === "cancelled" && (
                      <span className="text-xs text-muted-foreground">Cancelled</span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogHeader>
          <DialogTitle>Create Trip</DialogTitle>
          <DialogDescription>Fill in the trip details below.</DialogDescription>
          <DialogCloseButton onClick={() => setCreateOpen(false)} />
        </DialogHeader>
        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <Input
            label="Source"
            placeholder="e.g. Bangalore"
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
            error={fieldError("source")}
            required
          />
          <Input
            label="Destination"
            placeholder="e.g. Mysore"
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
            error={fieldError("destination")}
            required
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Vehicle</label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.vehicleId}
              onChange={(e) => setForm({ ...form, vehicleId: e.target.value })}
              required
            >
              <option value="">Select a vehicle</option>
              {availableVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.registrationNumber} - {v.name} ({v.maxLoadCapacityKg} kg cap.)
                </option>
              ))}
            </select>
            {fieldError("vehicleId") && <p className="text-xs text-destructive">{fieldError("vehicleId")}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Driver</label>
            <select
              className="flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={form.driverId}
              onChange={(e) => setForm({ ...form, driverId: e.target.value })}
              required
            >
              <option value="">Select a driver</option>
              {availableDrivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} (License: {d.licenseNumber})
                </option>
              ))}
            </select>
            {fieldError("driverId") && <p className="text-xs text-destructive">{fieldError("driverId")}</p>}
          </div>
          <Input
            label="Cargo Weight (kg)"
            type="number"
            min={1}
            placeholder="e.g. 500"
            value={form.cargoWeightKg || ""}
            onChange={(e) => setForm({ ...form, cargoWeightKg: Number(e.target.value) })}
            error={fieldError("cargoWeightKg")}
            required
          />
          <Input
            label="Planned Distance (km)"
            type="number"
            min={1}
            placeholder="e.g. 150"
            value={form.plannedDistanceKm || ""}
            onChange={(e) => setForm({ ...form, plannedDistanceKm: Number(e.target.value) })}
            error={fieldError("plannedDistanceKm")}
            required
          />

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Trip"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
}
