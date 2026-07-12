"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FleetMap } from "@/components/fleet/fleet-map";
import { getFleetVehicles, getActiveTripRoutes, type FleetVehicle, type FleetTrip } from "@/lib/services/fleet.service";

export default function FleetPage() {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [trips, setTrips] = useState<FleetTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchData() {
    try {
      const [v, t] = await Promise.all([getFleetVehicles(), getActiveTripRoutes()]);
      setVehicles(v);
      setTrips(t);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load fleet data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
    const supabase = createClient();
    const channel = supabase.channel("fleet-realtime");
    ["vehicles", "trips"].forEach((table) => {
      channel.on("postgres_changes" as any, { event: "*", schema: "public", table }, () => fetchData());
    });
    channel.subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const activeCount = vehicles.filter((v) => v.status === "on_trip").length;
  const availableCount = vehicles.filter((v) => v.status === "available").length;
  const activeTripCount = trips.filter((t) => t.status === "dispatched").length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight text-white">Live Fleet Tracking</h1>
        <p className="mt-1 text-sm text-[#94A3B8]">Real-time vehicle positions and active trip routes</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-[#111827] p-4">
          <p className="text-sm text-[#94A3B8]">Active Vehicles</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? "-" : activeCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-[#111827] p-4">
          <p className="text-sm text-[#94A3B8]">Available</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? "-" : availableCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-[#111827] p-4">
          <p className="text-sm text-[#94A3B8]">Active Trips</p>
          <p className="mt-1 text-2xl font-bold text-white">{loading ? "-" : activeTripCount}</p>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      {loading ? (
        <div className="flex h-[600px] items-center justify-center rounded-lg border border-border bg-[#111827]">
          <p className="text-[#94A3B8]">Loading map...</p>
        </div>
      ) : (
        <FleetMap vehicles={vehicles} trips={trips} />
      )}
    </div>
  );
}
