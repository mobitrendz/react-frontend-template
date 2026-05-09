import React from "react";
import { motion } from "framer-motion";

interface ServerGaugeProps {
  label: string;
  value: number; // 0 to 100
  color: string;
  loading?: boolean;
}

const ServerGauge: React.FC<ServerGaugeProps> = ({
  label,
  value,
  color,
  loading,
}) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  if (loading) {
    return (
      <div className="flex flex-col items-center p-4">
        <div className="w-24 h-24 rounded-full bg-gray-800 animate-pulse" />
        <div className="h-4 w-16 bg-gray-800 rounded mt-4" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center group">
      <div className="relative w-24 h-24">
        {/* Background track */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-gray-800"
          />
          {/* Progress circle */}
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
            cx="48"
            cy="48"
            r={radius}
            stroke={color}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-[var(--text-h)]">
            {Math.round(value)}%
          </span>
        </div>
      </div>
      <span className="mt-4 text-xs font-black uppercase tracking-widest text-[var(--text-dim)] group-hover:text-[var(--accent)] transition-colors">
        {label}
      </span>
    </div>
  );
};

export default React.memo(ServerGauge);
