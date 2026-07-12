"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: { type: string; utilizationPct: number }[];
}

// "Build fleet utilization charts" — utilization % per vehicle type, current snapshot.
export function FleetUtilizationChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fleet Utilization by Type</CardTitle>
      </CardHeader>
      <div className="h-64 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="type" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
            <YAxis
              unit="%"
              tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value) => [`${Number(value ?? 0)}%`, "Utilization"]}
            />
            <Bar dataKey="utilizationPct" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
