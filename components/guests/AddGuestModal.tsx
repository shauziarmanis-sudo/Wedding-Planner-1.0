"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, User, Users, Minus, Plus } from "lucide-react";
import { GuestCategory, GuestType, Guest } from "@/types/guest.types";
import { addGuest } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (guest: Guest) => void;
}

const CATEGORIES: { id: GuestCategory; label: string; emoji: string }[] = [
  { id: 'KELUARGA_PRIA', label: 'Keluarga Pria', emoji: '👨' },
  { id: 'KELUARGA_WANITA', label: 'Keluarga Wanita', emoji: '👩' },
  { id: 'SAHABAT', label: 'Sahabat', emoji: '🤝' },
  { id: 'REKAN_KERJA', label: 'Rekan Kerja', emoji: '💼' },
  { id: 'KENALAN', label: 'Kenalan', emoji: '👋' },
  { id: 'VIP', label: 'VIP', emoji: '⭐' },
];

function formatPhone(raw: string): string {
  let cleaned = raw.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export default function AddGuestModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [guestType, setGuestType] = useState<GuestType>('PERSONAL');
  const [name, setName] = useState('');
  const [phoneRaw, setPhoneRaw] = useState('');
  const [category, setCategory] = useState<GuestCategory>('KENALAN');
  const [pax, setPax] = useState(2);
  const [notes, setNotes] = useState('');

  const phoneFormatted = formatPhone(phoneRaw);
  const isPhoneValid = phoneFormatted.length >= 10 && phoneFormatted.length <= 17;
  const canSubmit = name.trim() !== '' && isPhoneValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    try {
      const guest_id = await addGuest({
        name: name.trim(),
        phone_wa: phoneFormatted,
        category,
        pax_estimate: guestType === 'GRUP' ? pax : 1,
        notes,
      });
      const newGuest: Guest = {
        guest_id,
        name: name.trim(),
        category,
        phone_wa: phoneFormatted,
        address: '',
        pax_estimate: guestType === 'GRUP' ? pax : 1,
        rsvp_status: 'BELUM_KONFIRMASI',
        actual_pax: 0,
        gift_amount: 0,
        gift_type: 'TIDAK_ADA',
        rsvp_at: null,
        table_number: '',
        seat_notes: '',
        invitation_sent: false,
        invitation_sent_at: null,
        notes,
        created_at: new Date().toISOString(),
      };
      toast.success(`${name.trim()} berhasil ditambahkan!`);
      onSuccess(newGuest);
      // Reset form
      setName(''); setPhoneRaw(''); setCategory('KENALAN'); setPax(2); setNotes(''); setGuestType('PERSONAL');
    } catch (err: any) {
      toast.error(err.message || 'Gagal menambahkan tamu.');
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
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl text-[#1A1A1A]">Tambah Tamu Baru</h3>
                <p className="text-sm text-gray-500 mt-1">Isi data tamu undangan</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Guest Type Toggle */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Tipe Tamu</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGuestType('PERSONAL')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      guestType === 'PERSONAL'
                        ? 'border-[#C8975A] bg-[#C8975A]/5 text-[#1A1A1A]'
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span className="font-semibold text-sm">Personal</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setGuestType('GRUP')}
                    className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                      guestType === 'GRUP'
                        ? 'border-[#C8975A] bg-[#C8975A]/5 text-[#1A1A1A]'
                        : 'border-gray-100 bg-gray-50 text-gray-400'
                    }`}
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-semibold text-sm">Keluarga/Grup</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nama Tamu <span className="text-red-400">*</span></label>
                <Input
                  placeholder="Masukkan nama lengkap"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="rounded-xl h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#C8975A]"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">No. WhatsApp <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">+62</span>
                  <Input
                    type="tel"
                    placeholder="8123456789"
                    value={phoneRaw}
                    onChange={e => setPhoneRaw(e.target.value.replace(/\D/g, ''))}
                    className="pl-14 rounded-xl h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#C8975A]"
                    required
                  />
                </div>
                {phoneRaw && !isPhoneValid && (
                  <p className="text-xs text-red-400 mt-1">Nomor harus 10-17 digit</p>
                )}
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

              {/* Pax (only for GRUP) */}
              <AnimatePresence>
                {guestType === 'GRUP' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="text-sm font-medium text-gray-700 mb-3 block">Estimasi Jumlah Orang</label>
                    <div className="flex items-center justify-center gap-6 bg-gray-50 rounded-xl p-4">
                      <button
                        type="button"
                        onClick={() => setPax(Math.max(1, pax - 1))}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#C8975A] transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-3xl font-bold text-[#1A1A1A] w-12 text-center">{pax}</span>
                      <button
                        type="button"
                        onClick={() => setPax(pax + 1)}
                        className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-[#C8975A] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Catatan <span className="text-gray-400">(opsional)</span></label>
                <textarea
                  placeholder="Mis: Vegetarian, Alergi, dll."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-[#C8975A] focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12">
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="flex-[2] rounded-xl h-12 bg-[#1A1A1A] hover:bg-[#333] text-white"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Tambah Tamu
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
