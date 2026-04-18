"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Users, Lock, X, Gift, AlertTriangle, Plus, Trash2, UserPlus } from "lucide-react";
import { useState, useEffect, useTransition } from "react";
import { getGuests, addGuest, deleteGuest, updateGuestRSVP } from "@/actions/guest";
import { GuestRecord } from "@/types/wedding";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const rsvpColors: Record<string, string> = {
  CONFIRMED: "bg-green-100 text-green-700",
  PENDING: "bg-amber-100 text-amber-700",
  DECLINED: "bg-red-100 text-red-700",
};

export default function GuestListView() {
  const [guests, setGuests] = useState<GuestRecord[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [gName, setGName] = useState("");
  const [gCategory, setGCategory] = useState("REGULAR");
  const [gPax, setGPax] = useState("1");

  useEffect(() => {
    loadGuests();
  }, []);

  async function loadGuests() {
    const data = await getGuests();
    setGuests(data.filter((g) => g.id));
  }

  async function handleAddGuest() {
    startTransition(async () => {
      await addGuest({ name: gName, category: gCategory, pax: parseInt(gPax) || 1 });
      setShowAddGuest(false);
      setGName(""); setGPax("1");
      loadGuests();
    });
  }

  async function handleDelete(guestId: string) {
    startTransition(async () => {
      await deleteGuest(guestId);
      loadGuests();
    });
  }

  async function handleRSVP(guestId: string, status: "CONFIRMED" | "DECLINED") {
    startTransition(async () => {
      await updateGuestRSVP(guestId, status);
      loadGuests();
    });
  }

  const totalGifts = 45_000_000;
  const vendorDebt = 15_000_000;
  const surplus = totalGifts - vendorDebt;

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      {/* Title */}
      <motion.div variants={item} className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-[#C2185B]">👥 Guest List</h1>
          <p className="text-[#212121]/60 mt-1">{guests.length} tamu terdaftar</p>
        </div>
        <div className="flex gap-2">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAddGuest(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-full text-sm font-semibold shadow-lg shadow-[#E91E63]/20">
            <UserPlus className="w-4 h-4" /> Tambah Tamu
          </motion.button>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowAudit(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-[#C2185B] border border-[#C2185B]/20 rounded-full text-sm font-semibold hover:bg-[#C2185B]/5">
            <Gift className="w-4 h-4" /> Audit
          </motion.button>
        </div>
      </motion.div>

      {/* Guest Table */}
      <motion.div variants={item} className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-black/[0.03] overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-6 py-3 bg-[#FFF8E1]/60 border-b border-black/5 text-xs font-semibold text-[#212121]/50 uppercase tracking-wider">
          <div className="col-span-3">Nama</div>
          <div className="col-span-2 text-center">Kategori</div>
          <div className="col-span-1 text-center">Pax</div>
          <div className="col-span-3 text-center">RSVP</div>
          <div className="col-span-3 text-right">Aksi</div>
        </div>

        {guests.length === 0 && (
          <div className="p-12 text-center text-[#212121]/40">
            <Users className="w-10 h-10 mx-auto mb-3 text-[#212121]/20" />
            <p>Belum ada tamu. Klik &quot;Tambah Tamu&quot; untuk mulai.</p>
          </div>
        )}

        {guests.map((guest, i) => (
          <motion.div key={guest.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.03 }}
            className="grid grid-cols-12 gap-2 px-6 py-4 border-b border-black/[0.03] hover:bg-[#FFF8E1]/30 transition-colors items-center">
            <div className="col-span-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C2185B]/20 to-[#E91E63]/20 flex items-center justify-center text-[#C2185B] font-bold text-xs">{guest.name.charAt(0)}</div>
                <span className="text-sm font-medium text-[#212121]">{guest.name}</span>
              </div>
            </div>
            <div className="col-span-2 text-center">
              <span className="text-xs px-2 py-1 rounded-full bg-[#FFF8E1] text-[#212121]/60">{guest.category}</span>
            </div>
            <div className="col-span-1 text-center text-sm text-[#212121]/70">{guest.pax}</div>
            <div className="col-span-3 text-center">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${rsvpColors[guest.status]}`}>
                {guest.status}
              </span>
            </div>
            <div className="col-span-3 flex justify-end gap-1">
              {guest.status !== "CONFIRMED" && (
                <button onClick={() => handleRSVP(guest.id, "CONFIRMED")} className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors" disabled={isPending}>✓</button>
              )}
              {guest.status !== "DECLINED" && (
                <button onClick={() => handleRSVP(guest.id, "DECLINED")} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" disabled={isPending}>✗</button>
              )}
              <button onClick={() => handleDelete(guest.id)} className="px-2 py-1 text-xs bg-gray-50 text-gray-500 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors" disabled={isPending}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Add Guest Modal */}
      <AnimatePresence>
        {showAddGuest && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAddGuest(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-bold text-[#C2185B]">Tambah Tamu</h2>
                <button onClick={() => setShowAddGuest(false)} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5 text-[#212121]/40" /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Nama Tamu</label>
                  <input value={gName} onChange={(e) => setGName(e.target.value)} placeholder="Contoh: Ahmad Rizki" className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Kategori</label>
                    <select value={gCategory} onChange={(e) => setGCategory(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30">
                      <option value="FAMILY">Family</option><option value="FRIEND">Friend</option><option value="VIP">VIP</option><option value="REGULAR">Regular</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-[#212121]/60 mb-1 block">Jumlah (Pax)</label>
                    <input type="number" value={gPax} onChange={(e) => setGPax(e.target.value)} min="1" max="10" className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddGuest} disabled={isPending || !gName}
                  className="w-full py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl font-semibold shadow-lg shadow-[#E91E63]/20 disabled:opacity-50 disabled:cursor-not-allowed">
                  {isPending ? "Menyimpan..." : "Simpan Tamu"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pre-Transition Audit Modal */}
      <AnimatePresence>
        {showAudit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowAudit(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 relative">
              <button onClick={() => setShowAudit(false)} className="absolute top-4 right-4 p-2 rounded-full hover:bg-black/5 text-[#212121]/40"><X className="w-5 h-5" /></button>
              <div className="text-center mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#C2185B]/10 flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-7 h-7 text-[#C2185B]" /></div>
                <h2 className="font-serif text-2xl font-bold text-[#C2185B]">Pre-Transition Audit</h2>
                <p className="text-sm text-[#212121]/50 mt-1">Ringkasan keuangan sebelum transisi</p>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2"><Gift className="w-5 h-5 text-green-600" /><span className="text-sm font-medium">Total Gifts</span></div>
                  <span className="text-lg font-bold text-green-700">Rp {totalGifts.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl">
                  <div className="flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-500" /><span className="text-sm font-medium">Vendor Debt</span></div>
                  <span className="text-lg font-bold text-red-600">- Rp {vendorDebt.toLocaleString("id-ID")}</span>
                </div>
                <div className="border-t border-dashed border-black/10 pt-4">
                  <div className="flex justify-between items-center p-4 bg-[#C2185B]/5 rounded-xl">
                    <span className="text-sm font-bold text-[#C2185B]">Surplus Transisi</span>
                    <span className="text-2xl font-bold text-[#C2185B]">Rp {surplus.toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#C2185B] to-[#880E4F] text-white rounded-xl font-semibold shadow-lg shadow-[#C2185B]/30">
                <Lock className="w-4 h-4" /> Kunci Data & Transisi ke Keluarga
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
