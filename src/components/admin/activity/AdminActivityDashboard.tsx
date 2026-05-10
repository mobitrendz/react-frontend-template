import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Zap, ShieldAlert, AlertCircle, Loader2 } from "lucide-react";
import { AdminDashboardReport } from "../../../types/dashboard";
import { useAuth, Role } from "../../../contexts/AuthContext";
import { readAdminDashboardStatsApiV1AdminDashboardStatsGet } from "../../../client/sdk.gen";
import { extractApiError } from "../../../lib/error-handler";
import KPICard from "./KPICard";
import EngagementChart from "./EngagementChart";
import UserLeaderboard from "./UserLeaderboard";

const AdminActivityDashboard: React.FC = () => {
  const { token, hasPermission } = useAuth();
  const isAdmin = hasPermission(Role.ADMIN);

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const response =
        await readAdminDashboardStatsApiV1AdminDashboardStatsGet();
      if (response.error) throw response.error;
      return response.data as AdminDashboardReport;
    },
    enabled: isAdmin && !!token,
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-12 bg-rose-500/5 border border-rose-500/10 rounded-[32px] animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6">
          <ShieldAlert className="w-10 h-10 text-rose-500" />
        </div>
        <h1 className="text-3xl font-black text-rose-500 tracking-tight">
          Access Restricted
        </h1>
        <p className="text-muted-foreground mt-4 max-w-sm text-lg font-medium">
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
          <h1 className="text-3xl font-black text-foreground tracking-tight">
            Platform Pulse
          </h1>
          <p className="text-lg text-muted-foreground font-medium mt-1">
            Growth & engagement analytics across the user base
          </p>
        </div>
        {isLoading && (
          <div className="flex items-center gap-2 text-primary font-bold text-sm">
            <Loader2 className="w-4 h-4 animate-spin" />
            Live Syncing...
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500 text-sm font-bold">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {extractApiError(error)}
        </div>
      )}

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard
          title="User Base"
          value={stats?.total_regular_users || 0}
          icon={Users}
          colorClass="bg-indigo-600"
          loading={isLoading && !stats}
        />
        <KPICard
          title="Daily Velocity"
          value={stats?.total_activities_24h || 0}
          icon={Zap}
          colorClass="bg-emerald-600"
          loading={isLoading && !stats}
        />
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EngagementChart
          data={stats?.daily_trends || []}
          loading={isLoading && !stats}
        />
        <UserLeaderboard
          users={stats?.top_active_users || []}
          loading={isLoading && !stats}
        />
      </div>
    </div>
  );
};

export default AdminActivityDashboard;
