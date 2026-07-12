"use client";

import { Badge } from "@/components/ui/badge";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { FleetUtilizationChart } from "@/components/dashboard/fleet-utilization-chart";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { MaintenanceChart } from "@/components/dashboard/maintenance-chart";
import { TripStatsChart } from "@/components/dashboard/trip-stats-chart";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function DashboardPage() {
  const { kpis, utilizationByType, expenseBreakdown, maintenanceCostByMonth, tripStatsByDay, loading, error } =
    useDashboardData();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Fleet Dashboard</h1>
          <p className="mt-1 text-sm text-[#94A3B8]">Live operational overview</p>
        </div>
        <Badge variant={error ? "destructive" : "success"}>{error ? "Connection issue" : "Live"}</Badge>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <KpiCards kpis={kpis} loading={loading} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FleetUtilizationChart data={utilizationByType} />
        <ExpenseChart data={expenseBreakdown} />
        <MaintenanceChart data={maintenanceCostByMonth} />
        <TripStatsChart data={tripStatsByDay} />
      </div>
    </div>
  );
}
