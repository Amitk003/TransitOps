"use client";

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface Props {
  data: { category: string; amount: number }[];
}

const COLORS = [
  "hsl(var(--secondary))",
  "hsl(var(--accent))",
  "hsl(var(--destructive))",
  "hsl(var(--muted-foreground))",
];

// "Build expense charts" — fuel vs tolls vs maintenance vs other, as a share of total spend.
export function ExpenseChart({ data }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Expense Breakdown</CardTitle>
      </CardHeader>
      <div className="h-64 px-2 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="amount" nameKey="category" innerRadius={50} outerRadius={80}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: 8,
                color: "hsl(var(--card-foreground))",
              }}
              formatter={(value) => formatCurrency(Number(value ?? 0))}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
