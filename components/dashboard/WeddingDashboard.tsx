"use client";

import { motion } from "framer-motion";
import { Users, UserCheck, TrendingUp, Store } from "lucide-react";
import { useEffect, useState } from "react";
import { getGuests } from "@/actions/guest.actions";
import { getVendors } from "@/actions/vendor.actions";
import { Guest } from "@/types/guest.types";
import { Vendor } from "@/types/vendor.types";

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
    const dur = 1500, start = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - start) / dur, 1);
      setDisplay(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value]);
  return <>{display.toLocaleString("id-ID")}</>;
}

export default function WeddingDashboard() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [g, v] = await Promise.all([getGuests(), getVendors()]);
    setGuests(g);
    setVendors(v);
  }

  const totalBudget = vendors.reduce((s, v) => s + (v.actual_cost > 0 ? v.actual_cost : v.estimated_cost), 0);
  const totalPaid = vendors.reduce((s, v) => s + v.paid_amount, 0);
  const budgetPercent = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;
  const confirmedGuests = guests.filter((g) => g.rsvp_status === "HADIR").length;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#C2185B]">💍 Wedding Overview</h1>
        <p className="text-[#212121]/60 mt-1">Ringkasan persiapan pernikahanmu</p>
      </motion.div>

      {/* Budget Card */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-[#212121]/60">Total Biaya Vendor</p>
            <p className="text-2xl md:text-3xl font-bold text-[#212121] mt-1">
              Rp <AnimatedNumber value={totalPaid} />
              <span className="text-base font-normal text-[#212121]/40"> / Rp {totalBudget.toLocaleString("id-ID")}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[#C2185B]/10 px-3 py-1.5 rounded-full">
            <TrendingUp className="w-4 h-4 text-[#C2185B]" />
            <span className="text-sm font-semibold text-[#C2185B]">{budgetPercent}%</span>
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
          <span>Terbayar</span>
          <span>Sisa Rp {(Math.max(0, totalBudget - totalPaid)).toLocaleString("id-ID")}</span>
        </div>
      </motion.div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div variants={item} whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-[#E91E63]/10 flex items-center justify-center"><Users className="w-5 h-5 text-[#E91E63]" /></div>
            <p className="text-sm font-medium text-[#212121]/60">Total Tamu</p>
          </div>
          <p className="text-3xl font-bold text-[#212121]"><AnimatedNumber value={guests.length} /></p>
        </motion.div>
        <motion.div variants={item} whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-green-500/10 flex items-center justify-center"><UserCheck className="w-5 h-5 text-green-600" /></div>
            <p className="text-sm font-medium text-[#212121]/60">RSVP Hadir</p>
          </div>
          <p className="text-3xl font-bold text-[#212121]"><AnimatedNumber value={confirmedGuests} /></p>
        </motion.div>
        <motion.div variants={item} whileHover={{ y: -4 }} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl bg-purple-500/10 flex items-center justify-center"><Store className="w-5 h-5 text-purple-600" /></div>
            <p className="text-sm font-medium text-[#212121]/60">Total Vendor</p>
          </div>
          <p className="text-3xl font-bold text-[#212121]"><AnimatedNumber value={vendors.length} /></p>
        </motion.div>
      </div>

      {/* Vendor List Preview */}
      {vendors.length > 0 && (
        <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-serif text-lg font-bold text-[#212121]">📋 Vendor Terkini</h3>
          </div>
          <div className="space-y-3">
            {vendors.slice(0, 5).map((v) => (
              <div key={v.vendor_id} className="flex items-center justify-between p-3 rounded-xl bg-[#FFF8E1]/50">
                <div>
                  <p className="text-sm font-semibold text-[#212121]">{v.vendor_name}</p>
                  <p className="text-[10px] font-bold text-[#C8975A]">{v.category.replace(/_/g, " ")}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#212121]">
                    Rp {v.paid_amount.toLocaleString("id-ID")} <span className="font-normal text-[#212121]/40">/ {(v.actual_cost > 0 ? v.actual_cost : v.estimated_cost).toLocaleString("id-ID")}</span>
                  </p>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    v.status === "LUNAS" ? "bg-green-100 text-green-700" : 
                    v.status === "DP_LUNAS" ? "bg-blue-100 text-blue-700" : 
                    v.status === "PARTIAL" ? "bg-amber-100 text-amber-700" : 
                    "bg-red-100 text-red-700"
                  }`}>
                    {v.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
