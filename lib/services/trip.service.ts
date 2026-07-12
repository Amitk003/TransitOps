"use client";

import type { Trip, TripStatus, Vehicle, Driver } from "@/types";
import { getVehicleById, getAvailableVehicles } from "./vehicle.service";
import { getDriverById, getAvailableDrivers } from "./driver.service";

export interface CreateTripInput {
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeightKg: number;
  plannedDistanceKm: number;
}

export interface TripWithDetails extends Trip {
  vehicleReg: string;
  vehicleName: string;
  driverName: string;
}

let mockTrips: Trip[] = [
  {
    id: "t1",
    source: "Bangalore",
    destination: "Mysore",
    vehicleId: "v1",
    driverId: "d1",
    cargoWeightKg: 450,
    plannedDistanceKm: 145,
    status: "dispatched",
    startTime: "2025-07-10T08:00:00Z",
    createdAt: "2025-07-09T10:00:00Z",
    updatedAt: "2025-07-10T08:00:00Z",
  },
  {
    id: "t2",
    source: "Mumbai",
    destination: "Pune",
    vehicleId: "v2",
    driverId: "d2",
    cargoWeightKg: 2000,
    plannedDistanceKm: 150,
    status: "draft",
    createdAt: "2025-07-11T09:00:00Z",
    updatedAt: "2025-07-11T09:00:00Z",
  },
];

let nextId = 3;

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 200));
}

function enrichTrip(trip: Trip): TripWithDetails | null {
  return {
    ...trip,
    vehicleReg: "",
    vehicleName: "",
    driverName: "",
  };
}

async function toDetails(trip: Trip): Promise<TripWithDetails> {
  const vehicle = await getVehicleById(trip.vehicleId);
  const driver = await getDriverById(trip.driverId);
  return {
    ...trip,
    vehicleReg: vehicle?.registrationNumber ?? "Unknown",
    vehicleName: vehicle?.name ?? "Unknown",
    driverName: driver?.name ?? "Unknown",
  };
}

export async function getTrips(): Promise<TripWithDetails[]> {
  const enriched = await Promise.all(mockTrips.map(toDetails));
  return enriched;
}

export async function getTripById(id: string): Promise<TripWithDetails | null> {
  const trip = mockTrips.find((t) => t.id === id);
  if (!trip) return null;
  return toDetails(trip);
}

export interface ValidationError {
  field: string;
  message: string;
}

export async function validateTripInput(input: CreateTripInput): Promise<ValidationError[]> {
  const errors: ValidationError[] = [];

  if (!input.source.trim()) errors.push({ field: "source", message: "Source is required" });
  if (!input.destination.trim()) errors.push({ field: "destination", message: "Destination is required" });
  if (input.cargoWeightKg <= 0) errors.push({ field: "cargoWeightKg", message: "Cargo weight must be greater than 0" });
  if (input.plannedDistanceKm <= 0) errors.push({ field: "plannedDistanceKm", message: "Distance must be greater than 0" });

  const vehicle = await getVehicleById(input.vehicleId);
  if (!vehicle) {
    errors.push({ field: "vehicleId", message: "Selected vehicle not found" });
  } else {
    if (vehicle.status !== "available") {
      errors.push({ field: "vehicleId", message: `Vehicle "${vehicle.name}" is ${vehicle.status.replace("_", " ")} and cannot be assigned` });
    }
    if (input.cargoWeightKg > vehicle.maxLoadCapacityKg) {
      errors.push({ field: "cargoWeightKg", message: `Cargo weight exceeds vehicle capacity of ${vehicle.maxLoadCapacityKg} kg` });
    }
  }

  const driver = await getDriverById(input.driverId);
  if (!driver) {
    errors.push({ field: "driverId", message: "Selected driver not found" });
  } else {
    if (driver.status !== "available") {
      errors.push({ field: "driverId", message: `Driver "${driver.name}" is currently ${driver.status.replace("_", " ")}` });
    }
  }

  return errors;
}

export async function createTrip(input: CreateTripInput): Promise<{ trip?: TripWithDetails; errors?: ValidationError[] }> {
  const validationErrors = await validateTripInput(input);
  if (validationErrors.length > 0) {
    return { errors: validationErrors };
  }

  const now = new Date().toISOString();
  const trip: Trip = {
    id: `t${nextId++}`,
    source: input.source,
    destination: input.destination,
    vehicleId: input.vehicleId,
    driverId: input.driverId,
    cargoWeightKg: input.cargoWeightKg,
    plannedDistanceKm: input.plannedDistanceKm,
    status: "draft",
    createdAt: now,
    updatedAt: now,
  };

  mockTrips.push(trip);
  return { trip: await toDetails(trip) };
}

export async function dispatchTrip(id: string): Promise<TripWithDetails | null> {
  const trip = mockTrips.find((t) => t.id === id);
  if (!trip) return null;
  if (trip.status !== "draft") return null;

  const now = new Date().toISOString();
  trip.status = "dispatched";
  trip.startTime = now;
  trip.updatedAt = now;

  return toDetails(trip);
}

export async function completeTrip(id: string): Promise<TripWithDetails | null> {
  const trip = mockTrips.find((t) => t.id === id);
  if (!trip) return null;
  if (trip.status !== "dispatched") return null;

  const now = new Date().toISOString();
  trip.status = "completed";
  trip.endTime = now;
  trip.updatedAt = now;

  return toDetails(trip);
}

export async function cancelTrip(id: string): Promise<TripWithDetails | null> {
  const trip = mockTrips.find((t) => t.id === id);
  if (!trip) return null;
  if (trip.status === "completed" || trip.status === "cancelled") return null;

  const now = new Date().toISOString();
  trip.status = "cancelled";
  trip.updatedAt = now;

  return toDetails(trip);
}

export async function getAvailableVehiclesForTrip(): Promise<Vehicle[]> {
  return getAvailableVehicles();
}

export async function getAvailableDriversForTrip(): Promise<Driver[]> {
  return getAvailableDrivers();
}
