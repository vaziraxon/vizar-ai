"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { TrendPoint } from "@/types";

interface TrendChartCardProps {
  title: string;
  data: TrendPoint[];
  color?: string;
  suffix?: string;
}

export function TrendChartCard({
  title,
  data,
  color = "#2E1FD0",
  suffix = "",
}: TrendChartCardProps) {
  return (
    <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
      <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
        {title}
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-border dark:text-white/10" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-ink-400 dark:text-white/40"
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "currentColor" }}
              className="text-ink-400 dark:text-white/40"
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              formatter={(value: number) => [`${value}${suffix}`, ""]}
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E4E8F5",
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
