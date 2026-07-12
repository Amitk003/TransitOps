"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { month: string; cost: number }[];
}

// "Build maintenance charts" — total maintenance cost per month, last 6 months.
export function MaintenanceChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Maintenance Cost (last 6 months)</CardTitle>
      </CardHeader>
      <div className="h-64 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
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
            <Line
              type="monotone"
              dataKey="cost"
              stroke="hsl(var(--warning))"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
