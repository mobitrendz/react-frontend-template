import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Clock, RefreshCw, AlertCircle } from "lucide-react";
import { DashboardReport } from "../../../types/dashboard";
import { useAuth, Role } from "../../../contexts/AuthContext";
import { readDashboardStatsApiV1DashboardStatsGet } from "../../../client/sdk.gen";
import MetricCard from "./MetricCard";
import ServerGauge from "./ServerGauge";
import ActivityTable from "./ActivityTable";

const SuperAdminDashboard: React.FC = () => {
  const { role, token } = useAuth();
  const [data, setData] = useState<DashboardReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());

  const isSuper = role === Role.SUPER;

  const fetchStats = useCallback(async () => {
    if (!isSuper || !token) return;

    try {
      setError(null);
      const response = await readDashboardStatsApiV1DashboardStatsGet();

      if (response.error) {
        if ((response.error as any).status === 403) {
          throw new Error("Access Denied: Super User permission required.");
        }
        throw new Error("Failed to fetch dashboard metrics.");
      }

      const result = response.data;
      if (!result) throw new Error("No data received from server.");

      setData(result as any);
      setLastRefreshed(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isSuper, token]);

  useEffect(() => {
    fetchStats();
    // 30 seconds polling
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);

    return parts.length > 0 ? parts.join(" ") : `${seconds}s`;
  };

  if (!isSuper) {
    return (
      <div className="flex flex-col items-center justify-center h-96 p-8 text-center bg-red-500/5 border border-red-500/10 rounded-3xl">
        <AlertCircle className="w-16 h-16 text-red-500 mb-6" />
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="text-[var(--text-dim)] mt-2 max-w-md">
          This secure console is reserved for Super User administrative actions.
          Your account does not have sufficient permissions to view this data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header with status */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-h)] tracking-tight">
            System Intelligence
          </h1>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-500 mt-1 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Live Console Monitoring Active
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-black text-[var(--text-dim)] uppercase tracking-widest">
              Last Sync
            </div>
            <div className="text-sm font-bold text-[var(--text)] flex items-center gap-1.5 justify-end">
              <Clock className="w-3.5 h-3.5" />
              {lastRefreshed.toLocaleTimeString()}
            </div>
          </div>
          <button
            onClick={fetchStats}
            className="p-3 bg-gray-800 border border-gray-700 rounded-xl hover:bg-gray-700 transition-colors"
            title="Force Refresh"
          >
            <RefreshCw
              className={`w-5 h-5 text-indigo-400 ${isLoading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={data?.user_stats.total_users || 0}
          icon="users"
          loading={isLoading && !data}
        />
        <MetricCard
          title="Active (24h)"
          value={data?.user_stats.active_24h || 0}
          icon="active"
          trend={data?.user_stats.growth_pct || 12.5}
          loading={isLoading && !data}
        />
        <MetricCard
          title="New Registrations"
          value={data?.user_stats.new_registrations_24h || 0}
          icon="new"
          loading={isLoading && !data}
        />
      </div>

      {/* System Health */}
      <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] p-8 rounded-3xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
          <div>
            <h2 className="text-xl font-bold text-[var(--text-h)]">
              Server Fleet Health
            </h2>
            <p className="text-sm text-[var(--text-dim)]">
              Real-time resource utilization metrics
            </p>
          </div>
          {data && (
            <div className="px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-full text-xs font-bold text-indigo-400">
              UPTIME: {formatUptime(data.server_metrics.uptime_seconds)}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
          <ServerGauge
            label="CPU Load"
            value={data?.server_metrics.cpu_usage || 0}
            color="#6366f1"
            loading={isLoading && !data}
          />
          <ServerGauge
            label="Memory Usage"
            value={data?.server_metrics.memory_usage || 0}
            color="#a855f7"
            loading={isLoading && !data}
          />
          <ServerGauge
            label="Disk Storage"
            value={data?.server_metrics.disk_usage || 0}
            color="#ec4899"
            loading={isLoading && !data}
          />
        </div>
      </div>

      {/* Analytics Section */}
      <ActivityTable
        endpoints={data?.activity_analytics.top_endpoints || []}
        successRate={data?.activity_analytics.success_rate || 0}
        failureRate={data?.activity_analytics.failure_rate || 0}
        loading={isLoading && !data}
      />
    </div>
  );
};

export default SuperAdminDashboard;
