"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { CategoryDatum } from "@/types";

// Monochrome-first: brand blue, graphite, then lighter tints of both.
const PALETTE = ["#2563EB", "#17191F", "#93B8FD", "#989DA7", "#DBE8FE", "#585D68"];

interface DonutChartCardProps {
  title: string;
  data: CategoryDatum[];
}

export function DonutChartCard({ title, data }: DonutChartCardProps) {
  return (
    <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
      <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
        {title}
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E6E8EC",
                fontSize: 12,
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value) => (
                <span className="text-ink-700 dark:text-white/70">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
