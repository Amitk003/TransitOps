"use client";

import type { Driver } from "@/types";

const mockDrivers: Driver[] = [
  { id: "d1", name: "Alex", licenseNumber: "DL123456", licenseCategory: "LMV", licenseExpiryDate: "2028-12-31", contactNumber: "9876500001", safetyScore: 98, status: "available", createdAt: "2025-01-10T00:00:00Z", updatedAt: "2025-06-15T00:00:00Z" },
  { id: "d2", name: "Rahul Kumar", licenseNumber: "DL654321", licenseCategory: "HMV", licenseExpiryDate: "2027-08-15", contactNumber: "9876500002", safetyScore: 95, status: "available", createdAt: "2025-01-10T00:00:00Z", updatedAt: "2025-06-15T00:00:00Z" },
  { id: "d3", name: "Priya Sharma", licenseNumber: "DL789456", licenseCategory: "HMV", licenseExpiryDate: "2029-04-20", contactNumber: "9876500003", safetyScore: 99, status: "off_duty", createdAt: "2025-02-01T00:00:00Z", updatedAt: "2025-07-01T00:00:00Z" },
  { id: "d4", name: "Suresh Patel", licenseNumber: "DL456789", licenseCategory: "LMV", licenseExpiryDate: "2026-11-30", contactNumber: "9876500004", safetyScore: 88, status: "available", createdAt: "2025-03-05T00:00:00Z", updatedAt: "2025-06-20T00:00:00Z" },
];

function delay<T>(data: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(data), 150));
}

export async function getDrivers(): Promise<Driver[]> {
  return delay(mockDrivers);
}

export async function getDriverById(id: string): Promise<Driver | null> {
  return delay(mockDrivers.find((d) => d.id === id) ?? null);
}

export async function getAvailableDrivers(): Promise<Driver[]> {
  return delay(mockDrivers.filter((d) => d.status === "available"));
}
