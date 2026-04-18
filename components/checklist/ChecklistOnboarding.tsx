"use client";

import { motion } from "framer-motion";
import { useState, useTransition } from "react";
import { Heart, Sparkles } from "lucide-react";
import { initChecklist } from "@/actions/checklist.actions";
import { AdatType } from "@/types/checklist.types";
import { MASTER_CHECKLIST } from "@/lib/checklistSeed";

const adatOptions: { value: AdatType; label: string; icon: string; desc: string }[] = [
  { value: "JAWA", label: "Adat Jawa", icon: "🏛️", desc: "Siraman, midodareni, panggih" },
  { value: "SUNDA", label: "Adat Sunda", icon: "🌿", desc: "Ngeuyeuk seureuh, saweran" },
  { value: "ISLAMI", label: "Islami", icon: "🕌", desc: "Pengajian, akad syar'i, hadrah" },
  { value: "MODERN", label: "Modern", icon: "✨", desc: "Intimate, international style" },
  { value: "CAMPURAN", label: "Campuran", icon: "🎎", desc: "Gabungan beberapa adat" },
];

interface Props {
  onComplete: () => void;
}

export default function ChecklistOnboarding({ onComplete }: Props) {
  const [adatType, setAdatType] = useState<AdatType>("MODERN");
  const [weddingDate, setWeddingDate] = useState("");
  const [guestCount, setGuestCount] = useState("200");
  const [isPending, startTransition] = useTransition();

  const filteredCount = MASTER_CHECKLIST.filter((task) => {
    if (task.adat_filter === "ALL") return true;
    if (adatType === "CAMPURAN") return true;
    return task.adat_filter.split(",").map((s) => s.trim()).includes(adatType);
  }).length;

  function handleSubmit() {
    if (!weddingDate) return;
    startTransition(async () => {
      await initChecklist({
        adat_type: adatType,
        wedding_date: weddingDate,
        guest_count_estimate: parseInt(guestCount) || 200,
      });
      onComplete();
    });
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto py-8">
      <div className="text-center mb-8">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
          <Heart className="w-10 h-10 text-[#C2185B] mx-auto mb-3 fill-[#C2185B]" />
        </motion.div>
        <h1 className="font-serif text-3xl font-bold text-[#C2185B]">Buat Checklist Pernikahanmu</h1>
        <p className="text-[#212121]/60 mt-2">Kami akan menyesuaikan tugas berdasarkan profil pernikahanmu</p>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg shadow-black/5 border border-black/[0.03] space-y-6">
        {/* Adat Type Selection */}
        <div>
          <label className="text-sm font-semibold text-[#212121] mb-3 block">Jenis Adat Pernikahan</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {adatOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setAdatType(opt.value)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  adatType === opt.value
                    ? "border-[#C2185B] bg-[#C2185B]/5 shadow-sm"
                    : "border-transparent bg-[#FFF8E1]/50 hover:border-[#C2185B]/20"
                }`}
              >
                <span className="text-xl">{opt.icon}</span>
                <p className="text-sm font-semibold text-[#212121] mt-1">{opt.label}</p>
                <p className="text-[10px] text-[#212121]/50">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Wedding Date */}
        <div>
          <label className="text-sm font-semibold text-[#212121] mb-1 block">Tanggal Pernikahan</label>
          <input
            type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30"
          />
        </div>

        {/* Guest Count */}
        <div>
          <label className="text-sm font-semibold text-[#212121] mb-1 block">Estimasi Jumlah Tamu</label>
          <input
            type="number" value={guestCount} onChange={(e) => setGuestCount(e.target.value)} min="10" max="5000"
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-[#FFF8E1]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#E91E63]/30"
          />
        </div>

        {/* Preview */}
        <div className="bg-[#FFF8E1] rounded-xl p-4 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-[#C2185B] flex-shrink-0" />
          <p className="text-sm text-[#212121]">
            Dengan profil ini, kamu akan mendapat <strong className="text-[#C2185B]">{filteredCount} tugas</strong> yang relevan untuk persiapan pernikahanmu.
          </p>
        </div>

        {/* Submit */}
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={isPending || !weddingDate}
          className="w-full py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-xl font-semibold shadow-lg shadow-[#E91E63]/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? "Membuat checklist..." : "Buat Checklist Saya"}
        </motion.button>
      </div>
    </motion.div>
  );
}
