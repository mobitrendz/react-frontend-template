import React, { useState, useEffect, useCallback } from "react";
import { Users, Zap, ShieldAlert, AlertCircle } from "lucide-react";
import { AdminDashboardReport } from "../../../types/dashboard";
import { useAuth, Role } from "../../../contexts/AuthContext";
import { readAdminDashboardStatsApiV1AdminDashboardStatsGet } from "../../../client/sdk.gen";
import KPICard from "./KPICard";
import EngagementChart from "./EngagementChart";
import UserLeaderboard from "./UserLeaderboard";

const AdminActivityDashboard: React.FC = () => {
  const { role, token, hasPermission } = useAuth();
  const [data, setData] = useState<AdminDashboardReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = hasPermission(Role.ADMIN);

  const fetchStats = useCallback(async () => {
    if (!isAdmin || !token) return;

    try {
      setIsLoading(true);
      setError(null);
      const response =
        await readAdminDashboardStatsApiV1AdminDashboardStatsGet();

      if (response.error) {
        if ((response.error as any).status === 403) {
          throw new Error("403: Forbidden - Admin access required.");
        }
        throw new Error("Failed to load activity metrics.");
      }

      const result = response.data;
      if (!result) throw new Error("No data received from server.");

      setData(result as any);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin, token]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-12 bg-red-500/5 border border-red-500/10 rounded-[32px] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-red-500" />
        </div>
        <h1 className="text-3xl font-black text-red-500 tracking-tight">
          Access Restricted
        </h1>
        <p className="text-[var(--text-dim)] mt-4 max-w-sm text-lg font-medium">
          The User Engagement Console is restricted to administrative personnel
          only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-h)] tracking-tight">
            Platform Pulse
          </h1>
          <p className="text-lg text-[var(--text-dim)] font-medium mt-1">
            Growth & engagement analytics across the user base
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="User Base"
          value={data?.total_regular_users || 0}
          icon={Users}
          colorClass="bg-indigo-500"
          loading={isLoading && !data}
        />
        <KPICard
          title="Daily Velocity"
          value={data?.total_activities_24h || 0}
          icon={Zap}
          colorClass="bg-emerald-500"
          loading={isLoading && !data}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementChart
          data={data?.daily_trends || []}
          loading={isLoading && !data}
        />
        <UserLeaderboard
          users={data?.top_active_users || []}
          loading={isLoading && !data}
        />
      </div>
    </div>
  );
};

export default AdminActivityDashboard;
