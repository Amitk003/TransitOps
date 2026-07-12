"use client";

import type { Vehicle } from "@/types";

const mockVehicles: Vehicle[] = [
  { id: "v1", registrationNumber: "KA01AB1234", name: "Tata Ace", type: "mini_truck", maxLoadCapacityKg: 750, odometerKm: 25000, acquisitionCost: 650000, status: "available", createdAt: "2025-01-15T00:00:00Z", updatedAt: "2025-06-10T00:00:00Z" },
  { id: "v2", registrationNumber: "KA02CD5678", name: "Ashok Leyland Truck", type: "truck", maxLoadCapacityKg: 5000, odometerKm: 80000, acquisitionCost: 3200000, status: "available", createdAt: "2025-01-15T00:00:00Z", updatedAt: "2025-06-10T00:00:00Z" },
  { id: "v3", registrationNumber: "KA03EF9012", name: "Eicher Pro", type: "truck", maxLoadCapacityKg: 7000, odometerKm: 45000, acquisitionCost: 4100000, status: "in_shop", createdAt: "2025-02-20T00:00:00Z", updatedAt: "2025-07-01T00:00:00Z" },
  { id: "v4", registrationNumber: "MH01XY5678", name: "Mahindra Bolero", type: "pickup", maxLoadCapacityKg: 1200, odometerKm: 18000, acquisitionCost: 950000, status: "available", createdAt: "2025-03-10T00:00:00Z", updatedAt: "2025-06-20T00:00:00Z" },
  { id: "v5", registrationNumber: "DL05PQ9012", name: "Tata 407", type: "truck", maxLoadCapacityKg: 4000, odometerKm: 62000, acquisitionCost: 2800000, status: "on_trip", createdAt: "2025-01-05T00:00:00Z", updatedAt: "2025-07-05T00:00:00Z" },
];

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 150));
}

export async function getVehicles(): Promise<Vehicle[]> {
  return delay(mockVehicles);
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  return delay(mockVehicles.find((v) => v.id === id) ?? null);
}

export async function getAvailableVehicles(): Promise<Vehicle[]> {
  return delay(mockVehicles.filter((v) => v.status === "available"));
}
