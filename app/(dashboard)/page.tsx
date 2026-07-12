import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { DashboardKpis, Vehicle } from "@/types";

const kpis: DashboardKpis = {
  activeVehicles: 42,
  availableVehicles: 18,
  vehiclesInMaintenance: 5,
  activeTrips: 12,
  pendingTrips: 3,
  driversOnDuty: 27,
  fleetUtilizationPct: 71,
};

const recentVehicles: Vehicle[] = [
  {
    id: "1",
    registrationNumber: "GJ-01-AB-1234",
    name: "Van-05",
    type: "van",
    maxLoadCapacityKg: 500,
    odometerKm: 18234,
    acquisitionCost: 1200000,
    status: "available",
  },
  {
    id: "2",
    registrationNumber: "GJ-01-CD-5678",
    name: "Truck-11",
    type: "truck",
    maxLoadCapacityKg: 2000,
    odometerKm: 54210,
    acquisitionCost: 3400000,
    status: "on_trip",
  },
  {
    id: "3",
    registrationNumber: "GJ-01-EF-9012",
    name: "Truck-04",
    type: "truck",
    maxLoadCapacityKg: 1500,
    odometerKm: 88120,
    acquisitionCost: 2900000,
    status: "in_shop",
  },
];

const statusVariant: Record<Vehicle["status"], "success" | "secondary" | "warning" | "outline"> = {
  available: "success",
  on_trip: "secondary",
  in_shop: "warning",
  retired: "outline",
};

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fleet Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of fleet operations and key metrics.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Vehicles</CardTitle>
            <CardValue>{kpis.activeVehicles}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Available Vehicles</CardTitle>
            <CardValue>{kpis.availableVehicles}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>In Maintenance</CardTitle>
            <CardValue>{kpis.vehiclesInMaintenance}</CardValue>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fleet Utilization</CardTitle>
            <CardValue>{kpis.fleetUtilizationPct}%</CardValue>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Vehicles</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Registration</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Odometer</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentVehicles.map((v) => (
              <TableRow key={v.id}>
                <TableCell className="font-mono text-xs">{v.registrationNumber}</TableCell>
                <TableCell>{v.name}</TableCell>
                <TableCell>{v.type}</TableCell>
                <TableCell className="tabular-nums">{v.odometerKm.toLocaleString()} km</TableCell>
                <TableCell>
                  <Badge variant={statusVariant[v.status]}>{v.status.replace("_", " ")}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
