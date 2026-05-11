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
    users: <Users className="w-6 h-6 text-primary" />,
    active: <Activity className="w-6 h-6 text-emerald-500" />,
    new: <UserPlus className="w-6 h-6 text-amber-500" />,
  };

  if (loading) {
    return (
      <div className="bg-card border border-border p-6 rounded-2xl animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="h-8 w-32 bg-muted rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border p-6 rounded-2xl relative overflow-hidden group hover:border-primary/50 transition-colors"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icons[icon]}
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 bg-muted rounded-xl border border-border">
          {icons[icon]}
        </div>
        <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest">
          {title}
        </h3>
      </div>

      <div className="flex items-end justify-between">
        <div className="text-3xl font-black text-foreground tracking-tight">
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
