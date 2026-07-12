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
    registration_number: "GJ-01-AB-1234",
    vehicle_name: "Van-05",
    vehicle_type: "van",
    max_load_capacity: 500,
    odometer: 18234,
    acquisition_cost: 1200000,
    status: "available",
    created_at: "",
    updated_at: "",
  },
  {
    id: "2",
    registration_number: "GJ-01-CD-5678",
    vehicle_name: "Truck-11",
    vehicle_type: "truck",
    max_load_capacity: 2000,
    odometer: 54210,
    acquisition_cost: 3400000,
    status: "on_trip",
    created_at: "",
    updated_at: "",
  },
  {
    id: "3",
    registration_number: "GJ-01-EF-9012",
    vehicle_name: "Truck-04",
    vehicle_type: "truck",
    max_load_capacity: 1500,
    odometer: 88120,
    acquisition_cost: 2900000,
    status: "in_shop",
    created_at: "",
    updated_at: "",
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
                <TableCell className="font-mono text-xs">{v.registration_number}</TableCell>
                <TableCell>{v.vehicle_name}</TableCell>
                <TableCell>{v.vehicle_type}</TableCell>
                <TableCell className="tabular-nums">{v.odometer.toLocaleString()} km</TableCell>
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
