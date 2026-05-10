import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { EndpointStats } from "../../../types/dashboard";

interface ActivityTableProps {
  endpoints: EndpointStats[];
  successRate: number;
  failureRate: number;
  loading?: boolean;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
  endpoints,
  successRate,
  failureRate,
  loading,
}) => {
  const chartData = [
    { name: "Success", value: successRate, color: "#10b981" },
    { name: "Failure", value: failureRate, color: "#ef4444" },
  ];

  if (loading) {
    return <div className="h-64 bg-muted animate-pulse rounded-2xl" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Chart Section */}
      <div className="bg-card border border-border p-6 rounded-2xl flex flex-col items-center">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6 self-start">
          Request Success Ratio
        </h3>
        <div className="w-full h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  color: "var(--popover-foreground)",
                  fontSize: "12px",
                  fontWeight: "bold",
                }}
                itemStyle={{ color: "var(--popover-foreground)" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-8 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-muted-foreground">
              Success {successRate}%
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-xs text-muted-foreground">
              Failure {failureRate}%
            </span>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="lg:col-span-2 bg-card border border-border p-6 rounded-2xl overflow-hidden">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-6">
          Hot Endpoints
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 text-xs font-black uppercase tracking-widest text-primary">
                  Method
                </th>
                <th className="pb-3 text-xs font-black uppercase tracking-widest text-primary">
                  Path
                </th>
                <th className="pb-3 text-xs font-black uppercase tracking-widest text-primary text-right">
                  Hit Count
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {endpoints.map((ep, idx) => (
                <tr
                  key={idx}
                  className="group hover:bg-accent/50 transition-colors"
                >
                  <td className="py-4">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                        ep.method === "GET"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : ep.method === "POST"
                            ? "bg-indigo-500/10 text-indigo-500"
                            : "bg-amber-500/10 text-amber-500"
                      }`}
                    >
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-4 text-sm font-medium text-foreground font-mono">
                    {ep.path}
                  </td>
                  <td className="py-4 text-sm font-bold text-foreground text-right">
                    {ep.count?.toLocaleString() ?? 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ActivityTable);
