"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, UserCheck, Plus, CheckCircle2, Circle, TrendingUp, Calendar, X, Store } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { getGuests } from "@/actions/guest";
import { getVendors, addVendor } from "@/actions/vendor";
import { GuestRecord, VendorRecord } from "@/types/wedding";

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
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [vendors, setVendors] = useState<VendorRecord[]>([]);
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Vendor form state
  const [vName, setVName] = useState("");
  const [vCategory, setVCategory] = useState("Catering");
  const [vCost, setVCost] = useState("");
  const [vPaid, setVPaid] = useState("");
  const [vDate, setVDate] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [g, v] = await Promise.all([getGuests(), getVendors()]);
    setGuests(g);
    setVendors(v);
  }

  const totalBudget = vendors.reduce((s, v) => s + v.totalCost, 0);
  const totalPaid = vendors.reduce((s, v) => s + v.paidAmount, 0);
  const budgetPercent = totalBudget > 0 ? Math.round((totalPaid / totalBudget) * 100) : 0;
  const confirmedGuests = guests.filter((g) => g.status === "CONFIRMED").length;

  async function handleAddVendor() {
    startTransition(async () => {
      await addVendor({
        category: vCategory,
        name: vName,
        totalCost: parseFloat(vCost) || 0,
        paidAmount: parseFloat(vPaid) || 0,
        dueDate: vDate,
      });
      setShowVendorModal(false);
      setVName(""); setVCost(""); setVPaid(""); setVDate("");
      loadData();
    });
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#C2185B]">💍 Wedding Planner</h1>
        <p className="text-[#212121]/60 mt-1">Kelola persiapan pernikahanmu dengan mudah</p>
      </motion.div>

      {/* Budget Card */}
      <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-medium text-[#212121]/60">Budget Pernikahan</p>
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
          <span>Sisa Rp {(totalBudget - totalPaid).toLocaleString("id-ID")}</span>
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

      {/* Vendor List */}
      {vendors.length > 0 && (
        <motion.div variants={item} className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03]">
          <h3 className="font-serif text-lg font-bold text-[#212121] mb-4">📋 Daftar Vendor</h3>
          <div className="space-y-3">
            {vendors.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-xl bg-[#FFF8E1]/50">
                <div>
                  <p className="text-sm font-semibold text-[#212121]">{v.name}</p>
                  <p className="text-xs text-[#212121]/50">{v.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-[#212121]">Rp {v.paidAmount.toLocaleString("id-ID")} <span className="font-normal text-[#212121]/40">/ {v.totalCost.toLocaleString("id-ID")}</span></p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${v.status === "PAID" ? "bg-green-100 text-green-700" : v.status === "PARTIAL" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{v.status}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* FAB */}
      <motion.button
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: "spring", stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        onClick={() => setShowVendorModal(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-full shadow-xl shadow-[#E91E63]/30 flex items-center justify-center z-40"
        title="Add Vendor"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Add Vendor Modal */}
      <AnimatePresence>
        {showVendorModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowVendorModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold text-[#C2185B]">Tambah Vendor</h2>
                <button onClick={() => setShowVendorModal(false)} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5 text-[#212121]/40" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Nama Vendor</label>
                  <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Contoh: Grand Ballroom" className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30" />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Kategori</label>
                  <select value={vCategory} onChange={(e) => setVCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30">
                    <option>Venue</option><option>Catering</option><option>Photographer</option><option>Decoration</option><option>Entertainment</option><option>MUA</option><option>Invitation</option><option>Other</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Total Biaya</label>
                    <input type="number" value={vCost} onChange={(e) => setVCost(e.target.value)} placeholder="50000000" className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Sudah Bayar</label>
                    <input type="number" value={vPaid} onChange={(e) => setVPaid(e.target.value)} placeholder="25000000" className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Tanggal Jatuh Tempo</label>
                  <input type="date" value={vDate} onChange={(e) => setVDate(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30" />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddVendor} disabled={isPending || !vName || !vCost}
                  className="w-full py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl font-semibold shadow-lg shadow-[#E91E63]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? "Menyimpan..." : "Simpan Vendor"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
