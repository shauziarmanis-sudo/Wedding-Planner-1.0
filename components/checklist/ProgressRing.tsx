"use client";

import { motion } from "framer-motion";

interface ProgressRingProps {
  percentage: number;
  completed: number;
  total: number;
  size?: number;
  strokeWidth?: number;
}

export default function ProgressRing({ percentage, completed, total, size = 140, strokeWidth = 10 }: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  const color = percentage >= 70 ? "#16A34A" : percentage >= 30 ? "#D97706" : "#DC2626";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#E5E7EB" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1A1A1A]">{percentage}%</span>
        <span className="text-xs text-[#1A1A1A]/50">{completed}/{total} tugas</span>
      </div>
    </div>
  );
}
