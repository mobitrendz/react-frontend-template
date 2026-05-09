import React from "react";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  UserPlus,
} from "lucide-react";
import { motion } from "framer-motion";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: "users" | "active" | "new";
  trend?: number;
  loading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon,
  trend,
  loading,
}) => {
  const icons = {
    users: <Users className="w-6 h-6 text-indigo-400" />,
    active: <Activity className="w-6 h-6 text-emerald-400" />,
    new: <UserPlus className="w-6 h-6 text-amber-400" />,
  };

  if (loading) {
    return (
      <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] p-6 rounded-2xl animate-pulse">
        <div className="h-4 w-24 bg-gray-700 rounded mb-4" />
        <div className="h-8 w-32 bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] p-6 rounded-2xl relative overflow-hidden group hover:border-[var(--accent)] transition-colors"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icons[icon]}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-gray-800/50 rounded-xl border border-gray-700">
          {icons[icon]}
        </div>
        <h3 className="text-sm font-medium text-[var(--text-dim)] uppercase tracking-wider">
          {title}
        </h3>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-3xl font-bold text-[var(--text-h)]">
          {typeof value === "number" ? value.toLocaleString() : (value ?? 0)}
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-bold ${trend >= 0 ? "text-emerald-500" : "text-crimson-500"}`}
          >
            {trend >= 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      {/* Decorative sparkline-like background */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />
    </motion.div>
  );
};

export default React.memo(MetricCard);
