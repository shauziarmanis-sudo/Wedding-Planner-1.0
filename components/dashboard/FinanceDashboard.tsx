"use client";

import { motion } from "framer-motion";
import { Wallet, TrendingUp, Target, MessageCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } },
};

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / duration, 1);
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display.toLocaleString("id-ID")}</>;
}

const chartData = [
  { bulan: "Jan", Pemasukan: 8500000, Pengeluaran: 6200000 },
  { bulan: "Feb", Pemasukan: 9000000, Pengeluaran: 7100000 },
  { bulan: "Mar", Pemasukan: 8800000, Pengeluaran: 5800000 },
  { bulan: "Apr", Pemasukan: 9500000, Pengeluaran: 6900000 },
  { bulan: "May", Pemasukan: 10000000, Pengeluaran: 7500000 },
  { bulan: "Jun", Pemasukan: 9200000, Pengeluaran: 6400000 },
];

const goals = [
  { name: "Dana Darurat", current: 18_000_000, target: 30_000_000, color: "#E91E63" },
  { name: "DP Rumah", current: 25_000_000, target: 100_000_000, color: "#C2185B" },
];

export default function FinanceDashboard() {
  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title */}
      <motion.div variants={item}>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#C2185B]">
          💰 Keuangan Keluarga
        </h1>
        <p className="text-[#212121]/60 mt-1">Dashboard keuangan rumah tangga</p>
      </motion.div>

      {/* Hero Card */}
      <motion.div
        variants={item}
        className="relative overflow-hidden bg-gradient-to-br from-[#C2185B] to-[#880E4F] rounded-2xl p-8 text-white shadow-xl shadow-[#C2185B]/20"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-5 h-5 text-white/70" />
            <span className="text-sm font-medium text-white/70">Total Aset Keluarga</span>
          </div>
          <p className="text-4xl md:text-5xl font-bold mb-2">
            Rp <AnimatedNumber value={30_000_000} />
          </p>
          <div className="flex items-center gap-2 mt-3 bg-white/10 rounded-full px-3 py-1 w-fit">
            <TrendingUp className="w-4 h-4 text-green-300" />
            <span className="text-sm text-white/80">Surplus dari Pernikahan</span>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-[-40px] right-[-40px] w-[180px] h-[180px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[60px] w-[120px] h-[120px] rounded-full bg-white/5" />
      </motion.div>

      {/* Chart */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]"
      >
        <h3 className="font-serif text-lg font-bold text-[#212121] mb-6">Income vs Expenses</h3>
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bulan" tick={{ fontSize: 12, fill: "#999" }} />
              <YAxis tick={{ fontSize: 12, fill: "#999" }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(0)}JT`} />
              <Tooltip
                formatter={(value: number) => [`Rp ${value.toLocaleString("id-ID")}`, undefined]}
                contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              />
              <Legend />
              <Bar dataKey="Pemasukan" fill="#4CAF50" radius={[6, 6, 0, 0]} />
              <Bar dataKey="Pengeluaran" fill="#E91E63" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Savings Goals */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]"
      >
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-5 h-5 text-[#C2185B]" />
          <h3 className="font-serif text-lg font-bold text-[#212121]">Savings Goals</h3>
        </div>
        <div className="space-y-5">
          {goals.map((goal) => {
            const pct = Math.round((goal.current / goal.target) * 100);
            return (
              <div key={goal.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-[#212121]">{goal.name}</span>
                  <span className="text-xs text-[#212121]/50">
                    Rp {goal.current.toLocaleString("id-ID")} / Rp {goal.target.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="w-full h-3 bg-[#FFF8E1] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: goal.color }}
                  />
                </div>
                <p className="text-right text-xs font-semibold mt-1" style={{ color: goal.color }}>
                  {pct}%
                </p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* WhatsApp Floating Button */}
      <motion.a
        href="https://wa.me/"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[#25D366] text-white rounded-full shadow-xl shadow-[#25D366]/30 flex items-center justify-center z-40"
        title="WhatsApp Support"
      >
        <MessageCircle className="w-6 h-6" />
      </motion.a>
    </motion.div>
  );
}
