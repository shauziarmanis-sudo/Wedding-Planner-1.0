"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Lock, X, Gift, AlertTriangle, ChevronDown } from "lucide-react";
import { useState } from "react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const guests = [
  { name: "Ahmad Rizki", pax: 2, rsvp: "CONFIRMED", kado: 500000 },
  { name: "Siti Nurhaliza", pax: 3, rsvp: "CONFIRMED", kado: 1000000 },
  { name: "Budi Santoso", pax: 2, rsvp: "PENDING", kado: 0 },
  { name: "Dewi Lestari", pax: 1, rsvp: "CONFIRMED", kado: 750000 },
  { name: "Eko Prasetyo", pax: 4, rsvp: "DECLINED", kado: 0 },
  { name: "Fitri Handayani", pax: 2, rsvp: "CONFIRMED", kado: 300000 },
  { name: "Gilang Ramadhan", pax: 2, rsvp: "CONFIRMED", kado: 2000000 },
  { name: "Hana Wijaya", pax: 1, rsvp: "PENDING", kado: 0 },
];

const rsvpColors: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  DECLINED: "bg-red-100 text-red-700",
};

export default function GuestListView() {
  const [showAudit, setShowAudit] = useState(false);

  const totalGifts = 45_000_000;
  const vendorDebt = 15_000_000;
  const surplus = totalGifts - vendorDebt;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#C2185B]">
            👥 Guest List
          </h1>
          <p className="text-[#212121]/60 mt-1">Kelola daftar tamu & RSVP</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAudit(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-full text-sm font-semibold shadow-lg shadow-[#E91E63]/20 hover:shadow-[#E91E63]/40 transition-shadow"
        >
          <Gift className="w-4 h-4" />
          Pre-Transition Audit
        </motion.button>
      </motion.div>

      {/* Guest Table */}
      <motion.div
        variants={item}
        className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-black/[0.03] overflow-hidden"
      >
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#FFF8E1]/60 border-b border-black/5 text-xs font-semibold text-[#212121]/50 uppercase tracking-wider">
          <div className="col-span-4">Nama</div>
          <div className="col-span-2 text-center">Pax</div>
          <div className="col-span-3 text-center">RSVP</div>
          <div className="col-span-3 text-right">Kado (Rp)</div>
        </div>

        {/* Table Rows */}
        {guests.map((guest, i) => (
          <motion.div
            key={guest.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-black/[0.03] hover:bg-[#FFF8E1]/30 transition-colors items-center"
          >
            <div className="col-span-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C2185B]/20 to-[#E91E63]/20 flex items-center justify-center text-[#C2185B] font-bold text-xs">
                  {guest.name.charAt(0)}
                </div>
                <span className="text-sm font-medium text-[#212121]">{guest.name}</span>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-sm text-[#212121]/70">{guest.pax}</span>
            </div>
            <div className="col-span-3 text-center">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${rsvpColors[guest.rsvp]}`}>
                {guest.rsvp === "CONFIRMED" && "✓ "}
                {guest.rsvp}
              </span>
            </div>
            <div className="col-span-3 text-right">
              {guest.kado > 0 ? (
                <span className="text-sm font-medium text-[#212121]">
                  {guest.kado.toLocaleString("id-ID")}
                </span>
              ) : (
                <span className="text-sm text-[#212121]/30">—</span>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Pre-Transition Audit Modal ── */}
      <AnimatePresence>
        {showAudit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowAudit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative"
            >
              <button
                onClick={() => setShowAudit(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#212121]/40 hover:text-[#212121] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C2185B]/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-7 h-7 text-[#C2185B]" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-[#C2185B]">Pre-Transition Audit</h2>
                <p className="text-sm text-[#212121]/50 mt-1">Ringkasan keuangan sebelum transisi</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-[#212121]">Total Gifts</span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    Rp {totalGifts.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-medium text-[#212121]">Vendor Debt</span>
                  </div>
                  <span className="text-lg font-bold text-red-600">
                    - Rp {vendorDebt.toLocaleString("id-ID")}
                  </span>
                </div>
                <div className="border-t border-dashed border-black/10 pt-4">
                  <div className="flex justify-between items-center p-4 bg-[#C2185B]/5 rounded-xl">
                    <span className="text-sm font-bold text-[#C2185B]">Surplus Transisi</span>
                    <span className="text-2xl font-bold text-[#C2185B]">
                      Rp {surplus.toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#C2185B] to-[#880E4F] text-white rounded-xl font-semibold shadow-lg shadow-[#C2185B]/30 hover:shadow-[#C2185B]/50 transition-shadow"
              >
                <Lock className="w-4 h-4" />
                Kunci Data & Transisi ke Keluarga
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
