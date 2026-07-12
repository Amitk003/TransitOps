"use client";

import { useState, useEffect, useCallback } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle, CardValue, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getReportKpis, getTripTrends, getDriverStats, getVehicleCosts } from "@/lib/services/reports.service";
import { formatCurrency } from "@/lib/utils";
import type { ReportKpis, TripTrend, DriverStat, VehicleCost } from "@/lib/services/reports.service";

export default function ReportsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [kpis, setKpis] = useState<ReportKpis | null>(null);
  const [trends, setTrends] = useState<TripTrend[]>([]);
  const [driverStats, setDriverStats] = useState<DriverStat[]>([]);
  const [vehicleCosts, setVehicleCosts] = useState<VehicleCost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = useCallback(async (start: string, end: string) => {
    setLoading(true);
    try {
      const range = { start, end };
      const [k, t, d, v] = await Promise.all([
        getReportKpis(range),
        getTripTrends(range),
        getDriverStats(range),
        getVehicleCosts(range),
      ]);
      setKpis(k);
      setTrends(t);
      setDriverStats(d);
      setVehicleCosts(v);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleApply() {
    fetchReports(startDate, endDate);
  }

  const kpiItems = kpis ? [
    { label: "Total Trips", value: kpis.totalTrips },
    { label: "Completed", value: kpis.completedTrips },
    { label: "Cancelled", value: kpis.cancelledTrips },
    { label: "Total Distance", value: `${kpis.totalDistance.toLocaleString()} km` },
    { label: "Fuel Cost", value: formatCurrency(kpis.totalFuelCost) },
    { label: "Maintenance Cost", value: formatCurrency(kpis.totalMaintenanceCost) },
    { label: "Other Cost", value: formatCurrency(kpis.totalOtherCost) },
    { label: "Total Cost", value: formatCurrency(kpis.totalCost) },
  ] : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Reports & Analytics</h1>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <Input
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <Input
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <Button onClick={handleApply} disabled={loading}>
          {loading ? "Loading..." : "Apply"}
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-muted-foreground">Loading reports...</p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {kpiItems.map(({ label, value }) => (
              <Card key={label}>
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                  <CardValue>{value}</CardValue>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Trip Trends</CardTitle>
              </CardHeader>
              <div className="h-72 px-2 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        color: "hsl(var(--card-foreground))",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
                    <Line type="monotone" dataKey="completed" stroke="hsl(var(--success))" strokeWidth={2} name="Completed" />
                    <Line type="monotone" dataKey="dispatched" stroke="hsl(var(--secondary))" strokeWidth={2} name="In Progress" />
                    <Line type="monotone" dataKey="cancelled" stroke="hsl(var(--destructive))" strokeWidth={2} name="Cancelled" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
              </CardHeader>
              <div className="h-72 px-2 pb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { category: "Fuel", cost: kpis?.totalFuelCost ?? 0 },
                      { category: "Maintenance", cost: kpis?.totalMaintenanceCost ?? 0 },
                      { category: "Other", cost: kpis?.totalOtherCost ?? 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="category" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 8,
                        color: "hsl(var(--card-foreground))",
                      }}
                      formatter={(value) => formatCurrency(Number(value ?? 0))}
                    />
                    <Bar dataKey="cost" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Cost Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Fuel Cost</TableHead>
                    <TableHead>Maintenance Cost</TableHead>
                    <TableHead>Total Cost</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicleCosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No cost data for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vehicleCosts.map((v) => (
                      <TableRow key={v.vehicle_id}>
                        <TableCell>{v.vehicle_name}</TableCell>
                        <TableCell className="font-mono text-xs">{v.registration_number}</TableCell>
                        <TableCell className="tabular-nums">{formatCurrency(v.fuel_cost)}</TableCell>
                        <TableCell className="tabular-nums">{formatCurrency(v.maintenance_cost)}</TableCell>
                        <TableCell className="tabular-nums font-semibold">{formatCurrency(v.total_cost)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Driver Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Driver</TableHead>
                    <TableHead>Trips Completed</TableHead>
                    <TableHead>Total Distance (km)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {driverStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        No trip data for this period.
                      </TableCell>
                    </TableRow>
                  ) : (
                    driverStats.map((d) => (
                      <TableRow key={d.driver_id}>
                        <TableCell>{d.driver_name}</TableCell>
                        <TableCell className="tabular-nums">{d.trip_count}</TableCell>
                        <TableCell className="tabular-nums">{d.total_distance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
