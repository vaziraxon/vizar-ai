"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { CategoryDatum } from "@/types";

interface BarChartCardProps {
  title: string;
  data: CategoryDatum[];
  color?: string;
  horizontal?: boolean;
}

export function BarChartCard({
  title,
  data,
  color = "#2E1FD0",
  horizontal = false,
}: BarChartCardProps) {
  return (
    <div className="card p-6 dark:border-white/10 dark:bg-navy-800">
      <p className="mb-4 text-body-sm font-semibold text-ink-900 dark:text-white">
        {title}
      </p>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout={horizontal ? "vertical" : "horizontal"}
            margin={{ top: 5, right: 10, left: horizontal ? 10 : -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-surface-border dark:text-white/10" />
            {horizontal ? (
              <>
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis
                  dataKey="label"
                  type="category"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
              </>
            ) : (
              <>
                <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
              </>
            )}
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: "1px solid #E4E8F5",
                fontSize: 12,
              }}
            />
            <Bar dataKey="value" fill={color} radius={[6, 6, 6, 6]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
