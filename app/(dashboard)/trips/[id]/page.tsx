"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Truck, User, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardValue, CardContent } from "@/components/ui/card";
import {
  getTripById,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  type TripWithDetails,
} from "@/lib/services/trip.service";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, "default" | "secondary" | "success" | "warning" | "destructive" | "outline"> = {
  draft: "default",
  dispatched: "secondary",
  completed: "success",
  cancelled: "outline",
};

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const loadTrip = useCallback(async () => {
    setLoading(true);
    const data = await getTripById(id);
    setTrip(data);
    setLoading(false);
    if (!data) setError("Trip not found");
  }, [id]);

  useEffect(() => {
    loadTrip();
  }, [loadTrip]);

  async function handleDispatch() {
    if (!trip) return;
    setActionLoading("dispatch");
    await dispatchTrip(trip.id);
    await loadTrip();
    setActionLoading(null);
  }

  async function handleComplete() {
    if (!trip) return;
    setActionLoading("complete");
    await completeTrip(trip.id);
    await loadTrip();
    setActionLoading(null);
  }

  async function handleCancel() {
    if (!trip) return;
    setActionLoading("cancel");
    await cancelTrip(trip.id);
    await loadTrip();
    setActionLoading(null);
  }

  if (loading) {
    return <div className="flex items-center justify-center p-12 text-muted-foreground">Loading...</div>;
  }

  if (error || !trip) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-destructive">{error || "Trip not found"}</p>
        <Button variant="outline" onClick={() => router.push("/trips")}>Back to Trips</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/trips")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Trip {trip.id}</h1>
            <Badge variant={statusVariant[trip.status]}>{trip.status.replace("_", " ")}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{trip.source} → {trip.destination}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Route</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Source</p>
              <p className="font-medium">{trip.source}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Destination</p>
              <p className="font-medium">{trip.destination}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="tabular-nums font-medium">{trip.plannedDistanceKm} km</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Vehicle</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Registration</p>
              <p className="font-mono font-medium">{trip.vehicleReg}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{trip.vehicleName}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cargo Weight</p>
              <p className="tabular-nums font-medium">{trip.cargoWeightKg} kg</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle>Driver</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{trip.driverName}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">1</div>
            <div>
              <p className="text-sm font-medium">Created</p>
              <p className="text-xs text-muted-foreground">{formatDate(trip.createdAt)}</p>
            </div>
          </div>
          {trip.startTime && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-medium">2</div>
              <div>
                <p className="text-sm font-medium">Dispatched</p>
                <p className="text-xs text-muted-foreground">{formatDate(trip.startTime)}</p>
              </div>
            </div>
          )}
          {trip.endTime && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-medium">3</div>
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-xs text-muted-foreground">{formatDate(trip.endTime)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {trip.status === "draft" && (
          <>
            <Button onClick={handleDispatch} disabled={actionLoading !== null}>
              {actionLoading === "dispatch" ? "Dispatching..." : "Dispatch Trip"}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading !== null}>
              {actionLoading === "cancel" ? "Cancelling..." : "Cancel Trip"}
            </Button>
          </>
        )}
        {trip.status === "dispatched" && (
          <>
            <Button variant="success" onClick={handleComplete} disabled={actionLoading !== null}>
              {actionLoading === "complete" ? "Completing..." : "Complete Trip"}
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={actionLoading !== null}>
              {actionLoading === "cancel" ? "Cancelling..." : "Cancel Trip"}
            </Button>
          </>
        )}
        {(trip.status === "completed" || trip.status === "cancelled") && (
          <p className="text-sm text-muted-foreground">This trip is {trip.status}.</p>
        )}
      </div>
    </div>
  );
}
