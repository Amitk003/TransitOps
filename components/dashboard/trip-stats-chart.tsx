"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  data: { date: string; completed: number; cancelled: number; dispatched: number }[];
}

// "Build trip statistics" — daily trip volume by outcome, last 14 days.
export function TripStatsChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trip Statistics (last 14 days)</CardTitle>
      </CardHeader>
      <div className="h-64 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
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
            <Bar dataKey="completed" stackId="a" fill="hsl(var(--success))" />
            <Bar dataKey="dispatched" stackId="a" fill="hsl(var(--secondary))" />
            <Bar dataKey="cancelled" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
