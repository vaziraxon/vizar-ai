"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import type { CategoryDatum } from "@/types";

const PALETTE = ["#2E1FD0", "#22D3EE", "#16C79A", "#FAA93A", "#E24B4A", "#8F97F5"];

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
                border: "1px solid #E4E8F5",
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
