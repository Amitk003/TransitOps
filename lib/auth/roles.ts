import type { UserRole } from "@/types";

export const roleLabels: Record<UserRole, string> = {
  fleet_manager: "Fleet Manager",
  driver: "Driver",
  safety_officer: "Safety Officer",
  financial_analyst: "Financial Analyst",
};

export type Permission =
  | "view_vehicles"
  | "manage_vehicles"
  | "view_drivers"
  | "manage_drivers"
  | "view_trips"
  | "manage_trips"
  | "view_maintenance"
  | "manage_maintenance"
  | "view_fuel"
  | "manage_fuel"
  | "view_reports";

const rolePermissions: Record<UserRole, Permission[]> = {
  fleet_manager: [
    "view_vehicles",
    "manage_vehicles",
    "view_drivers",
    "manage_drivers",
    "view_trips",
    "manage_trips",
    "view_maintenance",
    "manage_maintenance",
    "view_fuel",
    "manage_fuel",
    "view_reports",
  ],
  driver: ["view_trips", "manage_trips", "view_fuel", "manage_fuel"],
  safety_officer: [
    "view_vehicles",
    "view_drivers",
    "manage_drivers",
    "view_maintenance",
    "manage_maintenance",
  ],
  financial_analyst: [
    "view_vehicles",
    "view_drivers",
    "view_maintenance",
    "view_fuel",
    "view_reports",
  ],
};

export function hasPermission(
  role: UserRole | null,
  permission: Permission
): boolean {
  if (!role) return false;
  const permissions = rolePermissions[role];
  return permissions?.includes(permission) ?? false;
}

export function canAccessRoute(
  role: UserRole | null,
  pathname: string
): boolean {
  if (!role) return false;

  const routePermissions: Record<string, Permission> = {
    "/vehicles": "view_vehicles",
    "/drivers": "view_drivers",
    "/trips": "view_trips",
    "/maintenance": "view_maintenance",
    "/fuel-expenses": "view_fuel",
    "/reports": "view_reports",
  };

  const requiredPermission = routePermissions[pathname];
  if (!requiredPermission) return true; // no restriction
  return hasPermission(role, requiredPermission);
}
