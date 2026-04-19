"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { GuestCategory, Guest } from "@/types/guest.types";
import { updateGuest } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  guest: Guest;
  onClose: () => void;
  onSuccess: (updated: Guest) => void;
}

const CATEGORIES: { id: GuestCategory; label: string; emoji: string }[] = [
  { id: 'KELUARGA_PRIA', label: 'Keluarga Pria', emoji: '👨' },
  { id: 'KELUARGA_WANITA', label: 'Keluarga Wanita', emoji: '👩' },
  { id: 'SAHABAT', label: 'Sahabat', emoji: '🤝' },
  { id: 'REKAN_KERJA', label: 'Rekan Kerja', emoji: '💼' },
  { id: 'KENALAN', label: 'Kenalan', emoji: '👋' },
  { id: 'VIP', label: 'VIP', emoji: '⭐' },
];

export default function EditGuestModal({ isOpen, guest, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(guest.name);
  const [phoneWa, setPhoneWa] = useState(guest.phone_wa);
  const [category, setCategory] = useState<GuestCategory>(guest.category);
  const [paxEstimate, setPaxEstimate] = useState(guest.pax_estimate);
  const [tableNumber, setTableNumber] = useState(guest.table_number);
  const [notes, setNotes] = useState(guest.notes);

  const canSubmit = name.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      await updateGuest(guest.guest_id, {
        name: name.trim(),
        phone_wa: phoneWa,
        category,
        pax_estimate: paxEstimate,
        table_number: tableNumber,
        notes,
      });
      toast.success('Data tamu berhasil diperbarui!');
      onSuccess({
        ...guest,
        name: name.trim(),
        phone_wa: phoneWa,
        category,
        pax_estimate: paxEstimate,
        table_number: tableNumber,
        notes,
      });
    } catch (err: any) {
      toast.error(err.message || 'Gagal memperbarui data tamu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl text-[#1A1A1A]">Edit Data Tamu</h3>
                <p className="text-sm text-gray-500 mt-1">Perbarui informasi <strong>{guest.name}</strong></p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nama Tamu</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="rounded-xl h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#C8975A]" required />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">No. WhatsApp</label>
                <Input value={phoneWa} onChange={e => setPhoneWa(e.target.value.replace(/\D/g, ''))} className="rounded-xl h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#C8975A]" />
              </div>

              {/* Category */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Kategori</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
                        category === c.id
                          ? 'border-[#C8975A] bg-[#C8975A]/10 text-[#1A1A1A]'
                          : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                      }`}
                    >
                      <span>{c.emoji}</span>
                      <span className="truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Pax */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Estimasi Pax</label>
                  <Input type="number" min={1} value={paxEstimate} onChange={e => setPaxEstimate(parseInt(e.target.value) || 1)} className="rounded-xl h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#C8975A]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">No. Meja</label>
                  <Input placeholder="Mis: A1" value={tableNumber} onChange={e => setTableNumber(e.target.value)} className="rounded-xl h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#C8975A]" />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Catatan</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#C8975A] focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12">Batal</Button>
                <Button type="submit" disabled={loading || !canSubmit} className="flex-[2] rounded-xl h-12 bg-[#1A1A1A] hover:bg-[#333] text-white">
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
