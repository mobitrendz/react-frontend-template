import React from "react";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  colorClass: string;
  loading?: boolean;
}

const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  icon: Icon,
  colorClass,
  loading,
}) => {
  if (loading) {
    return (
      <div className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] p-6 rounded-2xl animate-pulse">
        <div className="h-4 w-24 bg-gray-700/50 rounded mb-4" />
        <div className="h-10 w-32 bg-gray-700/50 rounded" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[var(--sidebar-bg)] border border-[var(--sidebar-border)] p-6 rounded-2xl flex items-center gap-6 group hover:shadow-lg transition-all"
    >
      <div
        className={`p-4 rounded-xl ${colorClass} bg-opacity-10 transition-colors group-hover:bg-opacity-20`}
      >
        <Icon className={`w-8 h-8 ${colorClass.replace("bg-", "text-")}`} />
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-widest text-[var(--text-dim)] mb-1">
          {title}
        </p>
        <p className="text-3xl font-black text-[var(--text-h)] tracking-tight">
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </motion.div>
  );
};

export default React.memo(KPICard);
