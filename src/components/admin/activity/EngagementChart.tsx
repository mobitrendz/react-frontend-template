import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DailyTrend } from "../../../types/dashboard";
import { TrendingUp } from "lucide-react";

interface EngagementChartProps {
  data: DailyTrend[];
  loading?: boolean;
}

const EngagementChart: React.FC<EngagementChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="h-80 bg-gray-800/20 animate-pulse rounded-3xl" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-80 bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] rounded-3xl flex flex-col items-center justify-center text-center p-8">
        <TrendingUp className="w-12 h-12 text-[var(--text-dim)] mb-4 opacity-20" />
        <h3 className="text-lg font-bold text-[var(--text-h)]">
          No Recent Activity
        </h3>
        <p className="text-sm text-[var(--text-dim)] max-w-xs">
          There hasn't been enough activity in the last 7 days to generate a
          trend report.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] p-8 rounded-3xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-xl font-bold text-[var(--text-h)]">
            Engagement Velocity
          </h2>
          <p className="text-sm text-[var(--text-dim)]">
            Daily user interactions over the last 7 days
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#1e293b"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0f172a",
                border: "1px solid #1e293b",
                borderRadius: "12px",
                boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.5)",
              }}
              itemStyle={{ color: "#818cf8", fontWeight: "bold" }}
              labelStyle={{
                color: "#f8fafc",
                marginBottom: "4px",
                fontWeight: "bold",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorCount)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default React.memo(EngagementChart);
