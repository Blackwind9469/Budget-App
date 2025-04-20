"use client";

import { formatCurrency } from "@/lib/format";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// Mock data - would be fetched from API in real implementation
const data = [
  { week: "Week 1", food: 180, transportation: 120, entertainment: 80, housing: 400, other: 150 },
  { week: "Week 2", food: 200, transportation: 100, entertainment: 120, housing: 400, other: 180 },
  { week: "Week 3", food: 150, transportation: 110, entertainment: 170, housing: 400, other: 120 },
  { week: "Week 4", food: 220, transportation: 130, entertainment: 60, housing: 400, other: 190 },
];

export function SpendingTrendsChart() {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="week" 
            className="text-xs" 
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <YAxis 
            className="text-xs"
            tickFormatter={(value) => `$${value}`}
            tickLine={false}
            axisLine={{ stroke: 'hsl(var(--border))' }}
          />
          <Tooltip 
            formatter={(value) => formatCurrency(Number(value))}
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              borderRadius: '0.5rem'
            }}
            itemStyle={{
              color: 'hsl(var(--foreground))'
            }}
          />
          <Legend 
            iconType="circle" 
            formatter={(value) => <span className="text-xs capitalize">{value}</span>}
          />
          <Bar dataKey="food" name="Food" fill="hsl(var(--chart-1))" />
          <Bar dataKey="transportation" name="Transportation" fill="hsl(var(--chart-2))" />
          <Bar dataKey="entertainment" name="Entertainment" fill="hsl(var(--chart-3))" />
          <Bar dataKey="housing" name="Housing" fill="hsl(var(--chart-4))" />
          <Bar dataKey="other" name="Other" fill="hsl(var(--chart-5))" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}