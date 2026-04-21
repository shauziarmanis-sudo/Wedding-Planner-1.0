"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, ChevronRight } from "lucide-react";
import { Guest, GuestCategory, WATemplate } from "@/types/guest.types";
import { generateWABlastText } from "@/lib/wa-template";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SendProgressModal from "./SendProgressModal";

interface Props {
  isOpen: boolean;
  guests: Guest[];
  metadata: any;
  onClose: () => void;
  onComplete: (sentIds: string[], skippedIds: string[]) => void;
}

const FILTER_CHIPS: { id: GuestCategory | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'Semua' },
  { id: 'VIP', label: 'VIP' },
  { id: 'KELUARGA_PRIA', label: 'Keluarga Pria' },
  { id: 'KELUARGA_WANITA', label: 'Keluarga Wanita' },
  { id: 'SAHABAT', label: 'Sahabat' },
  { id: 'REKAN_KERJA', label: 'Rekan Kerja' },
  { id: 'KENALAN', label: 'Kenalan' },
];

const WA_TEMPLATES: WATemplate[] = [
  {
    id: 'formal',
    name: '📝 Formal',
    description: 'Bahasa formal dan sopan',
    preview: (name: string, link: string, meta: any) =>
      generateWABlastText(meta, { name } as any, link),
  },
  {
    id: 'casual',
    name: '😊 Santai',
    description: 'Bahasa kasual dan friendly',
    preview: (name: string, link: string, meta: any) =>
      `Halo ${name}! 👋\n\nKabar gembira! ${meta.groom_name || 'Mempelai Pria'} & ${meta.bride_name || 'Mempelai Wanita'} akan menikah! 🎉\n\nKami sangat berharap kamu bisa hadir di hari bahagia kami.\n\nKonfirmasi kehadiran kamu di sini ya:\n🔗 ${link}\n\nDitunggu kehadirannya! 💕`,
  },
  {
    id: 'islami',
    name: '🌙 Islami',
    description: 'Bernuansa Islami',
    preview: (name: string, link: string, meta: any) =>
      `Assalamu'alaikum Warahmatullahi Wabarakatuh\n\nKepada Yth.\nBapak/Ibu/Saudara/i ${name}\n\nDengan memohon Rahmat dan Ridho Allah SWT, kami bermaksud mengundang kehadiran Bapak/Ibu/Saudara/i pada acara pernikahan:\n\n💍 ${meta.groom_name || 'Mempelai Pria'} & ${meta.bride_name || 'Mempelai Wanita'}\n\nUntuk informasi lengkap dan konfirmasi kehadiran:\n🔗 ${link}\n\nJazakallahu Khairan atas kehadirannya.\nWassalamu'alaikum Warahmatullahi Wabarakatuh`,
  },
];

export default function BulkSendModal({ isOpen, guests, metadata, onClose, onComplete }: Props) {
  const [step, setStep] = useState<1 | 2>(1);
  const [campaignName, setCampaignName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GuestCategory | 'ALL'>('ALL');
  const [onlyUnsent, setOnlyUnsent] = useState(true);
  const [onlyNoRSVP, setOnlyNoRSVP] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<WATemplate>(WA_TEMPLATES[0]);

  const targetGuests = useMemo(() => {
    return guests.filter(g => {
      if (selectedCategory !== 'ALL' && g.category !== selectedCategory) return false;
      if (onlyUnsent && g.invitation_sent) return false;
      if (onlyNoRSVP && g.rsvp_status !== 'BELUM_KONFIRMASI') return false;
      if (!g.phone_wa) return false; // skip guests without phone
      return true;
    });
  }, [guests, selectedCategory, onlyUnsent, onlyNoRSVP]);

  const getCategoryCount = (catId: GuestCategory | 'ALL') => {
    return guests.filter(g => {
      if (catId !== 'ALL' && g.category !== catId) return false;
      if (onlyUnsent && g.invitation_sent) return false;
      if (onlyNoRSVP && g.rsvp_status !== 'BELUM_KONFIRMASI') return false;
      if (!g.phone_wa) return false;
      return true;
    }).length;
  };

  const previewMessage = targetGuests.length > 0
    ? selectedTemplate.preview(
        targetGuests[0].name,
        `${typeof window !== 'undefined' ? window.location.origin : ''}/invitation/${targetGuests[0].rsvp_token || targetGuests[0].guest_id}`,
        metadata
      )
    : selectedTemplate.preview('Nama Tamu', 'https://link-undangan.com', metadata);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleSendComplete = (sentIds: string[], skippedIds: string[]) => {
    setStep(1);
    onComplete(sentIds, skippedIds);
  };

  return (
    <AnimatePresence>
      {isOpen && step === 1 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl text-[#1A1A1A]">📤 Kirim Undangan via WA</h3>
                <p className="text-sm text-gray-500 mt-1">Konfigurasi pengiriman undangan</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Info Banner */}
              <div className="flex items-start gap-3 bg-blue-50 rounded-2xl p-4">
                <Info className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                <p className="text-sm text-blue-700">
                  Undangan akan dikirim satu per satu melalui WhatsApp Web secara manual. Anda bisa melewati tamu tertentu.
                </p>
              </div>

              {/* Campaign Name */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Nama Campaign</label>
                <Input
                  placeholder="Mis: Blast Undangan Minggu 1"
                  value={campaignName}
                  onChange={e => setCampaignName(e.target.value)}
                  className="rounded-xl h-12 bg-gray-50 border-gray-200 focus-visible:ring-[#C8975A]"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Kirim Ke</label>
                <div className="flex flex-wrap gap-2">
                  {FILTER_CHIPS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.id)}
                      className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                        selectedCategory === c.id
                          ? 'bg-[#C8975A] text-white border-[#C8975A]'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-[#C8975A]'
                      }`}
                    >
                      {c.label}
                      <span className="ml-1.5 opacity-60">({getCategoryCount(c.id)})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyUnsent}
                    onChange={e => setOnlyUnsent(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#C8975A] focus:ring-[#C8975A]"
                  />
                  <span className="text-sm text-gray-700">Hanya yang belum dikirim</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyNoRSVP}
                    onChange={e => setOnlyNoRSVP(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-[#C8975A] focus:ring-[#C8975A]"
                  />
                  <span className="text-sm text-gray-700">Hanya yang belum RSVP</span>
                </label>
              </div>

              {/* Template Selector */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">Pilih Template Pesan</label>
                <div className="grid grid-cols-3 gap-3">
                  {WA_TEMPLATES.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                        selectedTemplate.id === t.id
                          ? 'border-[#C8975A] bg-[#C8975A]/5'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-lg">{t.name.split(' ')[0]}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{t.name.split(' ').slice(1).join(' ')}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Preview */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Preview Pesan</label>
                <div className="bg-[#E5DDD5] rounded-2xl p-4 max-h-[180px] overflow-y-auto">
                  <div className="bg-white rounded-xl p-3 shadow-sm text-sm whitespace-pre-wrap leading-relaxed text-gray-700 max-w-[85%]">
                    {previewMessage}
                  </div>
                </div>
              </div>

              {/* Counter & Submit */}
              <div className="pt-2 space-y-4">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Akan dikirim ke <strong className="text-[#1A1A1A] text-lg">{targetGuests.length}</strong> tamu
                  </p>
                </div>
                <Button
                  onClick={() => setStep(2)}
                  disabled={targetGuests.length === 0}
                  className="w-full rounded-xl h-12 bg-[#C8975A] hover:bg-[#B68649] text-white font-semibold"
                >
                  Mulai Kirim
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Step 2: Send Progress */}
      <SendProgressModal
        isOpen={isOpen && step === 2}
        guests={targetGuests}
        metadata={metadata}
        template={selectedTemplate}
        onComplete={handleSendComplete}
        onClose={handleClose}
      />
    </AnimatePresence>
  );
}
