"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { X, Store } from "lucide-react";
import { addVendor } from "@/actions/vendor.actions";
import { VendorCategory } from "@/types/vendor.types";

const CATEGORIES: VendorCategory[] = [
  'VENUE', 'KATERING', 'FOTOGRAFER', 'VIDEOGRAFER', 'MUA_PENGANTIN', 'MUA_KELUARGA',
  'BUSANA_PENGANTIN', 'BUSANA_KELUARGA', 'DEKORASI', 'FLORIST', 'MC', 'BAND_MUSIK',
  'DJ', 'WEDDING_ORGANIZER', 'TRANSPORTASI', 'WEDDING_CAKE', 'SOUVENIR',
  'DOKUMENTASI_PREWEDDING', 'PERCETAKAN_UNDANGAN', 'PENGHULU', 'CATERING_PRASMANAN',
  'SOUNDSYSTEM', 'LIGHTING', 'PHOTO_BOOTH', 'LAINNYA'
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVendorForm({ onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState({
    category: "VENUE" as VendorCategory,
    vendor_name: "",
    contact_name: "",
    phone_wa: "",
    instagram: "",
    estimated_cost: "",
    actual_cost: "",
    dp_amount: "",
    dp_date: "",
    contract_signed: "PROSES" as "YA" | "TIDAK" | "PROSES",
    notes: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const val = value.replace(/\D/g, "");
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...formData,
        estimated_cost: parseInt(formData.estimated_cost) || 0,
        actual_cost: parseInt(formData.actual_cost) || 0,
        dp_amount: parseInt(formData.dp_amount) || 0,
      };
      await addVendor(payload);
      onSuccess();
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 my-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Store className="w-5 h-5 text-[#C8975A]" /> Tambah Vendor Baru
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Kategori *</label>
              <select name="category" value={formData.category} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nama Vendor *</label>
              <input required name="vendor_name" value={formData.vendor_name} onChange={handleChange} placeholder="Mis: Gedung Sate" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Nama Kontak Person</label>
              <input name="contact_name" value={formData.contact_name} onChange={handleChange} placeholder="Mis: Bpk. Budi" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">No WhatsApp</label>
              <input name="phone_wa" value={formData.phone_wa} onChange={handleChange} placeholder="628123456789" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Instagram</label>
              <input name="instagram" value={formData.instagram} onChange={handleChange} placeholder="@vendorwedding" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Status Kontrak</label>
              <select name="contract_signed" value={formData.contract_signed} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm">
                <option value="PROSES">Sedang Diproses</option>
                <option value="YA">Sudah Tanda Tangan</option>
                <option value="TIDAK">Tanpa Kontrak Resmi</option>
              </select>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 mt-4">
            <h3 className="text-sm font-bold text-[#1A1A1A] mb-3">Informasi Biaya</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Estimasi Biaya (Rp)</label>
                <input required name="estimated_cost" value={formData.estimated_cost ? parseInt(formData.estimated_cost).toLocaleString("id-ID") : ""} onChange={handleNumberChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Biaya Aktual (Rp) (Opsional)</label>
                <input name="actual_cost" value={formData.actual_cost ? parseInt(formData.actual_cost).toLocaleString("id-ID") : ""} onChange={handleNumberChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Sudah DP? (Nominal Rp)</label>
                <input name="dp_amount" value={formData.dp_amount ? parseInt(formData.dp_amount).toLocaleString("id-ID") : ""} onChange={handleNumberChange} placeholder="0" className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Tanggal Bayar DP</label>
                <input type="date" name="dp_date" value={formData.dp_date} onChange={handleChange} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm" />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Catatan</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Catatan tambahan tentang vendor ini..." rows={2} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8975A]/30 text-sm resize-none" />
          </div>

          <div className="pt-4">
            <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} disabled={isPending || !formData.vendor_name || !formData.estimated_cost} type="submit" className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-bold shadow-lg disabled:opacity-50">
              {isPending ? "Menyimpan..." : "Simpan Vendor"}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
