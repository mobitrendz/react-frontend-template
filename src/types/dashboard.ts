export interface UserStats {
  total_users: number;
  active_users_24h: number;
  new_registrations_24h: number;
  growth_pct?: number;
}

export interface ServerMetrics {
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  uptime_seconds: number;
}

export interface EndpointStats {
  method: string;
  path: string;
  count: number;
}

export interface ActivityAnalytics {
  success_rate: number;
  failure_rate: number;
  top_endpoints: EndpointStats[];
}

export interface DashboardReport {
  users: UserStats;
  server: ServerMetrics;
  activity: ActivityAnalytics;
}

export interface DailyTrend {
  date: string;
  count: number;
}

export interface TopUser {
  email: string;
  full_name: string | null;
  count: number;
}

export interface AdminDashboardReport {
  total_regular_users: number;
  total_activities_24h: number;
  daily_trends: DailyTrend[];
  top_active_users: TopUser[];
}
