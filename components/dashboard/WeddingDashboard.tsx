"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, Plus, CheckCircle2, Circle, TrendingUp, Calendar } from "lucide-react";
import { useEffect, useState } from "react";

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
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.floor(eased * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display.toLocaleString("id-ID")}</>;
}

const tasks = [
  { id: 1, text: "Booking venue resepsi", done: true },
  { id: 2, text: "Confirm catering & menu tasting", done: true },
  { id: 3, text: "Fitting baju pengantin", done: true },
  { id: 4, text: "Kirim undangan digital ke semua tamu", done: false },
  { id: 5, text: "Meeting dengan photographer & videographer", done: false },
];

export default function WeddingDashboard() {
  const budgetUsed = 150_000_000;
  const budgetTotal = 200_000_000;
  const budgetPercent = (budgetUsed / budgetTotal) * 100;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title */}
      <motion.div variants={item}>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#C2185B]">
          💍 Wedding Planner
        </h1>
        <p className="text-[#212121]/60 mt-1">Kelola persiapan pernikahanmu dengan mudah</p>
      </motion.div>

      {/* Budget Card */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-[#212121]/60">Budget Pernikahan</p>
            <p className="text-2xl md:text-3xl font-bold text-[#212121] mt-1">
              Rp <AnimatedNumber value={150} />
              <span className="text-lg font-normal">JT</span>
              <span className="text-base font-normal text-[#212121]/40"> / Rp 200JT</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#C2185B]/10 px-3 py-1.5 rounded-full">
            <TrendingUp className="w-4 h-4 text-[#C2185B]" />
            <span className="text-sm font-semibold text-[#C2185B]">75%</span>
          </div>
        </div>
        <div className="w-full h-3 bg-[#FFF8E1] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${budgetPercent}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-[#C2185B] to-[#E91E63]"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-[#212121]/40">
          <span>Terpakai</span>
          <span>Sisa Rp 50.000.000</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03] cursor-default"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#E91E63]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E91E63]" />
            </div>
            <p className="text-sm font-medium text-[#212121]/60">Total Guests</p>
          </div>
          <p className="text-3xl font-bold text-[#212121]">
            <AnimatedNumber value={250} />
          </p>
          <p className="text-xs text-[#212121]/40 mt-1">undangan terkirim</p>
        </motion.div>

        <motion.div
          variants={item}
          whileHover={{ y: -4 }}
          className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03] cursor-default"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-medium text-[#212121]/60">RSVP Attending</p>
          </div>
          <p className="text-3xl font-bold text-[#212121]">
            <AnimatedNumber value={187} />
          </p>
          <p className="text-xs text-green-600 mt-1">✓ 74.8% konfirmasi hadir</p>
        </motion.div>
      </div>

      {/* Task List */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]"
      >
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-[#C2185B]" />
          <h3 className="font-serif text-lg font-bold text-[#212121]">Tugas Minggu Ini</h3>
        </div>
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                task.done ? "bg-green-50/80" : "bg-[#FFF8E1]/50 hover:bg-[#FFF8E1]"
              }`}
            >
              {task.done ? (
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-[#212121]/20 flex-shrink-0" />
              )}
              <span className={`text-sm ${task.done ? "line-through text-[#212121]/40" : "text-[#212121]"}`}>
                {task.text}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Floating Action Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-full shadow-xl shadow-[#E91E63]/30 flex items-center justify-center z-40"
        title="Add Vendor"
      >
        <Plus className="w-6 h-6" />
      </motion.button>
    </motion.div>
  );
}
