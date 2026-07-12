"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  getTrip,
  dispatchTrip,
  completeTrip,
  cancelTrip,
  deleteTrip,
} from "@/lib/services/trip.service";
import { formatDate } from "@/lib/utils";

const statusVariant: Record<string, "default" | "secondary" | "success" | "outline" | "destructive"> = {
  draft: "default",
  dispatched: "secondary",
  completed: "success",
  cancelled: "outline",
};

interface TripDetail {
  id: string;
  source: string;
  destination: string;
  vehicle_id: string;
  driver_id: string;
  cargo_weight: number;
  planned_distance: number;
  status: string;
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
  registration_number: string;
  vehicle_name: string;
  driver_name: string;
}

export default function TripDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getTrip(id);
        if (!data) {
          setError("Trip not found.");
        } else {
          setTrip(data as unknown as TripDetail);
        }
      } catch {
        setError("Failed to load trip.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function reload() {
    try {
      const data = await getTrip(id);
      if (data) setTrip(data as unknown as TripDetail);
    } catch {
      // ignore
    }
  }

  async function handleAction(action: string) {
    if (!trip) return;
    setActionLoading(action);
    try {
      if (action === "dispatch") await dispatchTrip(trip.id);
      else if (action === "complete") await completeTrip(trip.id);
      else if (action === "cancel") await cancelTrip(trip.id);
      await reload();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Action failed.";
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!trip) return;
    setActionLoading("delete");
    try {
      await deleteTrip(trip.id);
      router.push("/trips");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete trip.";
      setError(msg);
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading...</p>;
  }

  if (error && !trip) {
    return (
      <div className="flex flex-col items-center gap-4 p-12">
        <p className="text-destructive">{error}</p>
        <Button variant="outline" onClick={() => router.push("/trips")}>Back to Trips</Button>
      </div>
    );
  }

  if (!trip) return null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/trips")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Trip {trip.id.slice(0, 8)}</h1>
            <Badge variant={statusVariant[trip.status]}>
              {trip.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{trip.source} &rarr; {trip.destination}</p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Route</CardTitle>
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
              <p className="tabular-nums font-medium">{trip.planned_distance} km</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vehicle</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Registration</p>
              <p className="font-mono font-medium">{trip.registration_number}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{trip.vehicle_name}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cargo Weight</p>
              <p className="tabular-nums font-medium">{trip.cargo_weight} kg</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Driver</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{trip.driver_name}</p>
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
              <p className="text-xs text-muted-foreground">{formatDate(trip.created_at)}</p>
            </div>
          </div>
          {trip.start_time && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground text-xs font-medium">2</div>
              <div>
                <p className="text-sm font-medium">Dispatched</p>
                <p className="text-xs text-muted-foreground">{formatDate(trip.start_time)}</p>
              </div>
            </div>
          )}
          {trip.end_time && (
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success text-success-foreground text-xs font-medium">3</div>
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-xs text-muted-foreground">{formatDate(trip.end_time)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-2">
        {trip.status === "draft" && (
          <>
            <Button
              variant="secondary"
              disabled={actionLoading !== null}
              onClick={() => handleAction("dispatch")}
            >
              {actionLoading === "dispatch" ? "Dispatching..." : "Dispatch Trip"}
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading !== null}
              onClick={() => handleAction("cancel")}
            >
              {actionLoading === "cancel" ? "Cancelling..." : "Cancel Trip"}
            </Button>
          </>
        )}
        {trip.status === "dispatched" && (
          <>
            <Button
              variant="success"
              disabled={actionLoading !== null}
              onClick={() => handleAction("complete")}
            >
              {actionLoading === "complete" ? "Completing..." : "Complete Trip"}
            </Button>
            <Button
              variant="destructive"
              disabled={actionLoading !== null}
              onClick={() => handleAction("cancel")}
            >
              {actionLoading === "cancel" ? "Cancelling..." : "Cancel Trip"}
            </Button>
          </>
        )}
        {(trip.status === "completed" || trip.status === "cancelled") && (
          <p className="text-sm text-muted-foreground">This trip is {trip.status}.</p>
        )}
        <Button
          variant="outline"
          disabled={actionLoading !== null}
          onClick={handleDelete}
          className="ml-auto"
        >
          {actionLoading === "delete" ? "Deleting..." : "Delete Trip"}
        </Button>
      </div>
    </div>
  );
}
