"use client";

import { useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Store, Plus, Trash2, Package, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { addVendor } from "@/actions/vendor.actions";
import { VendorCategory } from "@/types/vendor.types";

const CATEGORIES: VendorCategory[] = [
  'PAKET_WEDDING', 'VENUE', 'KATERING', 'FOTOGRAFER', 'VIDEOGRAFER', 'MUA_PENGANTIN', 'MUA_KELUARGA',
  'BUSANA_PENGANTIN', 'BUSANA_KELUARGA', 'DEKORASI', 'FLORIST', 'MC', 'BAND_MUSIK',
  'DJ', 'WEDDING_ORGANIZER', 'TRANSPORTASI', 'WEDDING_CAKE', 'SOUVENIR',
  'DOKUMENTASI_PREWEDDING', 'PERCETAKAN_UNDANGAN', 'PENGHULU', 'CATERING_PRASMANAN',
  'SOUNDSYSTEM', 'LIGHTING', 'PHOTO_BOOTH', 'LAINNYA'
];

interface BenefitItem {
  id: string; label: string; emoji: string; enabled: boolean; detail: string; placeholder: string;
}
interface CustomItem {
  id: string; name: string; detail: string;
}

const DEFAULTS: BenefitItem[] = [
  { id: "venue", label: "Venue", emoji: "🏛️", enabled: false, detail: "", placeholder: "Nama tempat, kapasitas (mis: Gedung Sate, 500 pax)" },
  { id: "katering", label: "Katering", emoji: "🍽️", enabled: false, detail: "", placeholder: "Jumlah pax, menu, gubuk (mis: 500 pax, 5 gubuk)" },
  { id: "fotoVideo", label: "Fotografer & Videografer", emoji: "📸", enabled: false, detail: "", placeholder: "Durasi, crew, output (mis: 8 jam, 2 fotografer, album)" },
  { id: "mua", label: "MUA", emoji: "💄", enabled: false, detail: "", placeholder: "Berapa sesi, include keluarga? (mis: 2 sesi)" },
  { id: "busana", label: "Busana Pengantin", emoji: "👰", enabled: false, detail: "", placeholder: "Berapa pasang, sewa/custom (mis: 3 pasang sewa)" },
  { id: "dekorasi", label: "Dekorasi", emoji: "🎨", enabled: false, detail: "", placeholder: "Tema, area (mis: Rustic, Pelaminan+Gate)" },
  { id: "wo", label: "Wedding Organizer", emoji: "📋", enabled: false, detail: "", placeholder: "Meeting, timeline (mis: 3x meeting, full day)" },
  { id: "souvenir", label: "Souvenir", emoji: "🎁", enabled: false, detail: "", placeholder: "Jumlah, jenis (mis: 500 pcs kotak mika)" },
  { id: "photobooth", label: "Photo Booth", emoji: "📷", enabled: false, detail: "", placeholder: "Durasi, print (mis: 4 jam unlimited print)" },
];

interface Props { onClose: () => void; onSuccess: () => void; }

export default function AddVendorForm({ onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    category: "VENUE" as VendorCategory, vendor_name: "", contact_name: "",
    phone_wa: "", instagram: "", estimated_cost: "", actual_cost: "",
    dp_amount: "", dp_date: "", contract_signed: "PROSES" as "YA"|"TIDAK"|"PROSES", notes: ""
  });
  const [benefits, setBenefits] = useState<BenefitItem[]>(DEFAULTS.map(b => ({ ...b })));
  const [customBenefits, setCustomBenefits] = useState<CustomItem[]>([]);
  const [showBenefits, setShowBenefits] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value.replace(/\D/g, "") }));
  };
  const toggleBenefit = (id: string) => setBenefits(p => p.map(b => b.id === id ? { ...b, enabled: !b.enabled } : b));
  const updateDetail = (id: string, detail: string) => setBenefits(p => p.map(b => b.id === id ? { ...b, detail } : b));
  const addCustom = () => setCustomBenefits(p => [...p, { id: `c_${Date.now()}`, name: "", detail: "" }]);
  const updateCustom = (id: string, f: "name"|"detail", v: string) => setCustomBenefits(p => p.map(c => c.id === id ? { ...c, [f]: v } : c));
  const removeCustom = (id: string) => setCustomBenefits(p => p.filter(c => c.id !== id));

  const buildPaketNotes = (): string => {
    const lines: string[] = [];
    benefits.filter(b => b.enabled).forEach(b => lines.push(`${b.emoji} ${b.label}: ${b.detail || "Termasuk"}`));
    customBenefits.filter(c => c.name.trim()).forEach(c => lines.push(`➕ ${c.name}: ${c.detail || "Termasuk"}`));
    let n = "🌟 DETAIL PAKET WEDDING:\n" + lines.map(l => `• ${l}`).join("\n");
    if (formData.notes.trim()) n += `\n\n📝 Catatan: ${formData.notes}`;
    return n;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); setErrorMsg("");
    startTransition(async () => {
      const finalNotes = isPaket ? buildPaketNotes() : formData.notes;
      const payload = { ...formData, notes: finalNotes,
        estimated_cost: parseInt(formData.estimated_cost) || 0,
        actual_cost: parseInt(formData.actual_cost) || 0,
        dp_amount: parseInt(formData.dp_amount) || 0 };
      const res = await addVendor(payload);
      if (res && !res.success) setErrorMsg(res.error || "Gagal menyimpan.");
      else { onSuccess(); onClose(); }
    });
  };

  const isPaket = formData.category === "PAKET_WEDDING";
  const enabledCount = benefits.filter(b => b.enabled).length + customBenefits.filter(c => c.name.trim()).length;
  const inputCls = "w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()} className={`bg-white rounded-3xl shadow-2xl w-full p-6 max-h-[90vh] overflow-y-auto ${isPaket ? "max-w-3xl" : "max-w-2xl"}`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            {isPaket ? <><Package className="w-5 h-5 text-[#C2185B]" /> Tambah Paket Wedding</> : <><Store className="w-5 h-5 text-[#C8975A]" /> Tambah Vendor Baru</>}
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {isPaket && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="mb-5 p-3 bg-gradient-to-r from-[#C2185B]/5 via-[#E91E63]/5 to-[#FF5722]/5 rounded-2xl border border-[#C2185B]/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C2185B]" />
              <span className="text-xs font-bold text-[#C2185B]">MODE PAKET ALL-IN-ONE</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Centang benefit yang termasuk dan isi detail spesifikasinya.</p>
          </motion.div>
        )}

        {errorMsg && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Kategori *</label>
              <select name="category" value={formData.category} onChange={handleChange} className={`${inputCls} bg-gray-50`}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">{isPaket ? "Nama Paket *" : "Nama Vendor *"}</label>
              <input required name="vendor_name" value={formData.vendor_name} onChange={handleChange} placeholder={isPaket ? "Mis: Paket Platinum - Hotel Mulia" : "Mis: Gedung Sate"} className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Kontak Person</label>
              <input name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Mis: Bpk. Budi" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">No WhatsApp</label>
              <input name="phone_wa" value={formData.phone_wa} onChange={handleChange} placeholder="628123456789" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Instagram</label>
              <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@vendorwedding" className={inputCls} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status Kontrak</label>
              <select name="contract_signed" value={formData.contract_signed} onChange={handleChange} className={`${inputCls} bg-gray-50`}>
                <option value="PROSES">Sedang Diproses</option>
                <option value="YA">Sudah Tanda Tangan</option>
                <option value="TIDAK">Tanpa Kontrak Resmi</option>
              </select>
            </div>
          </div>

          {/* PAKET WEDDING BENEFITS */}
          <AnimatePresence>
            {isPaket && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="border-t border-gray-100 pt-4 mt-2">
                  <button type="button" onClick={() => setShowBenefits(!showBenefits)} className="w-full flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                      <Package className="w-4 h-4 text-[#C2185B]" /> Detail Benefit Paket
                      {enabledCount > 0 && <span className="px-2 py-0.5 bg-[#C2185B]/10 text-[#C2185B] text-[10px] font-bold rounded-full">{enabledCount} item</span>}
                    </h3>
                    {showBenefits ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  <AnimatePresence>
                    {showBenefits && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-2">
                        {benefits.map(b => (
                          <div key={b.id} className={`rounded-xl border transition-all ${b.enabled ? "border-[#C2185B]/20 bg-gradient-to-r from-[#C2185B]/[0.03] to-transparent shadow-sm" : "border-gray-100 bg-gray-50/50 hover:bg-gray-50"}`}>
                            <label className="flex items-center gap-3 p-3 cursor-pointer">
                              <input type="checkbox" checked={b.enabled} onChange={() => toggleBenefit(b.id)} className="w-4 h-4 rounded border-gray-300 text-[#C2185B] focus:ring-[#C2185B]/30" />
                              <span className="text-base">{b.emoji}</span>
                              <span className={`text-sm font-medium ${b.enabled ? "text-[#1A1A1A]" : "text-gray-500"}`}>{b.label}</span>
                              {b.enabled && b.detail && <span className="ml-auto text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">✓ Detail terisi</span>}
                            </label>
                            <AnimatePresence>
                              {b.enabled && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                  <div className="px-3 pb-3"><input type="text" value={b.detail} onChange={e => updateDetail(b.id, e.target.value)} placeholder={b.placeholder} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#C2185B]/20 bg-white" /></div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                        {customBenefits.map(c => (
                          <motion.div key={c.id} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-amber-200/50 bg-amber-50/30 p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <span>➕</span>
                              <input type="text" value={c.name} onChange={e => updateCustom(c.id, "name", e.target.value)} placeholder="Nama item custom..." className="flex-1 px-3 py-1.5 rounded-lg border border-amber-200 text-xs font-medium focus:outline-none bg-white" />
                              <button type="button" onClick={() => removeCustom(c.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                            <input type="text" value={c.detail} onChange={e => updateCustom(c.id, "detail", e.target.value)} placeholder="Detail spesifikasi..." className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none bg-white" />
                          </motion.div>
                        ))}
                        <button type="button" onClick={addCustom} className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-xs font-semibold text-gray-500 hover:text-[#C2185B] hover:border-[#C2185B]/30 transition-colors flex items-center justify-center gap-2">
                          <Plus className="w-3.5 h-3.5" /> Tambah Item Benefit Custom
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cost */}
          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Informasi Biaya</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Estimasi Biaya (Rp)</label><input required name="estimated_cost" value={formData.estimated_cost ? parseInt(formData.estimated_cost).toLocaleString("id-ID") : ""} onChange={handleNumberChange} placeholder="0" className={inputCls} /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Biaya Aktual (Rp)</label><input name="actual_cost" value={formData.actual_cost ? parseInt(formData.actual_cost).toLocaleString("id-ID") : ""} onChange={handleNumberChange} placeholder="0" className={inputCls} /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Sudah DP? (Rp)</label><input name="dp_amount" value={formData.dp_amount ? parseInt(formData.dp_amount).toLocaleString("id-ID") : ""} onChange={handleNumberChange} placeholder="0" className={inputCls} /></div>
              <div><label className="text-xs font-medium text-gray-600 mb-1 block">Tanggal DP</label><input type="date" name="dp_date" value={formData.dp_date} onChange={handleChange} className={inputCls} /></div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">{isPaket ? "Catatan Tambahan" : "Catatan"}</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder={isPaket ? "Promo, deadline booking, dll..." : "Catatan tentang vendor..."} rows={2} className={`${inputCls} resize-none`} />
          </div>

          <div className="pt-4">
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={isPending || !formData.vendor_name || !formData.estimated_cost} type="submit"
              className={`w-full py-3 text-white rounded-xl font-bold shadow-lg disabled:opacity-50 ${isPaket ? "bg-gradient-to-r from-[#C2185B] to-[#E91E63]" : "bg-[#1A1A1A]"}`}>
              {isPending ? "Menyimpan..." : isPaket ? `💍 Simpan Paket Wedding (${enabledCount} benefit)` : "Simpan Vendor"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
