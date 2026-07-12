"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { FleetVehicle, FleetTrip } from "@/lib/services/fleet.service";

const vehicleIcon = L.divIcon({
  className: "",
  html: `<div style="background:#3b82f6;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

const activeTripIcon = L.divIcon({
  className: "",
  html: `<div style="background:#f59e0b;width:14px;height:14px;border-radius:50%;border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
  iconSize: [14, 14],
  iconAnchor: [7, 7],
  popupAnchor: [0, -8],
});

interface Props {
  vehicles: FleetVehicle[];
  trips: FleetTrip[];
}

function MapBoundsUpdater({ vehicles, trips }: Props) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [];
    vehicles.forEach((v) => { if (v.current_latitude && v.current_longitude) points.push([v.current_latitude, v.current_longitude]); });
    trips.forEach((t) => {
      if (t.start_latitude && t.start_longitude) points.push([t.start_latitude, t.start_longitude]);
      if (t.end_latitude && t.end_longitude) points.push([t.end_latitude, t.end_longitude]);
    });
    if (points.length > 0) map.fitBounds(L.latLngBounds(points));
  }, [vehicles, trips, map]);
  return null;
}

const routeColors: Record<string, string> = {
  draft: "#3b82f6",
  dispatched: "#f59e0b",
};

export function FleetMap({ vehicles, trips }: Props) {
  return (
    <div className="h-[600px] w-full overflow-hidden rounded-lg border border-border">
      <MapContainer center={[12.9716, 77.5946]} zoom={7} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBoundsUpdater vehicles={vehicles} trips={trips} />

        {vehicles.map((v) =>
          v.current_latitude && v.current_longitude ? (
            <Marker key={v.id} position={[v.current_latitude, v.current_longitude]} icon={vehicleIcon}>
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold">{v.vehicle_name}</p>
                  <p className="text-xs text-muted-foreground">{v.registration_number}</p>
                  <p className="mt-1 text-xs capitalize">Status: {v.status.replace("_", " ")}</p>
                </div>
              </Popup>
            </Marker>
          ) : null
        )}

        {trips.map((t) => {
          if (!t.start_latitude || !t.start_longitude || !t.end_latitude || !t.end_longitude) return null;
          return (
            <Polyline
              key={t.id}
              positions={[
                [t.start_latitude, t.start_longitude],
                [t.end_latitude, t.end_longitude],
              ]}
              pathOptions={{
                color: routeColors[t.status] || "#3b82f6",
                weight: 3,
                opacity: 0.7,
                dashArray: t.status === "draft" ? "10 5" : undefined,
              }}
            >
              <Popup>
                <div className="min-w-[180px]">
                  <p className="font-semibold">{t.source} &rarr; {t.destination}</p>
                  <p className="text-xs text-muted-foreground">{t.vehicle_name} &middot; {t.driver_name}</p>
                  <p className="mt-1 text-xs capitalize">Status: {t.status.replace("_", " ")}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}
      </MapContainer>
    </div>
  );
}
