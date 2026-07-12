import { Card, CardHeader, CardTitle, CardValue } from "@/components/ui/card";
import type { DashboardKpis } from "@/types";

export function KpiCards({ kpis, loading }: { kpis: DashboardKpis | null; loading: boolean }) {
  const items = [
    { label: "Active Trips", value: kpis?.activeTrips },
    { label: "Pending Trips", value: kpis?.pendingTrips },
    { label: "Active Vehicles", value: kpis?.activeVehicles },
    { label: "Available Vehicles", value: kpis?.availableVehicles },
    { label: "Vehicles in Maintenance", value: kpis?.vehiclesInMaintenance },
    { label: "Active Drivers", value: kpis?.activeDrivers },
    { label: "Fleet Utilization", value: kpis ? `${kpis.fleetUtilizationPct}%` : undefined },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-7">
      {items.map(({ label, value }) => (
        <Card key={label}>
          <CardHeader>
            <CardTitle>{label}</CardTitle>
            <CardValue>{loading || value === undefined ? "-" : value}</CardValue>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}
