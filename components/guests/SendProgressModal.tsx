"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, SkipForward, Send, PartyPopper } from "lucide-react";
import { Guest, WATemplate } from "@/types/guest.types";
import { markBulkInvitationSent } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  guests: Guest[];
  metadata: any;
  template: WATemplate;
  onComplete: (sentIds: string[], skippedIds: string[]) => void;
  onClose: () => void;
}

interface HistoryItem {
  guestId: string;
  name: string;
  action: 'sent' | 'skipped';
  time: string;
}

export default function SendProgressModal({ isOpen, guests, metadata, template, onComplete, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentIds, setSentIds] = useState<string[]>([]);
  const [skippedIds, setSkippedIds] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      setSentIds([]);
      setSkippedIds([]);
      setHistory([]);
    }
  }, [isOpen]);

  const total = guests.length;
  const processed = sentIds.length + skippedIds.length;
  const progress = total > 0 ? Math.round((processed / total) * 100) : 0;
  const isFinished = currentIndex >= total;
  const currentGuest = guests[currentIndex];

  const getInvitationLink = (guest: Guest) => {
    return `${typeof window !== 'undefined' ? window.location.origin : ''}/invitation/${guest.rsvp_token || guest.guest_id}`;
  };

  const handleSend = async () => {
    if (!currentGuest) return;
    const link = getInvitationLink(currentGuest);
    const message = template.preview(currentGuest.name, link, metadata);
    const phone = currentGuest.phone_wa || '';
    
    // Open WA Web
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');

    // Mark as sent
    const newSentIds = [...sentIds, currentGuest.guest_id];
    setSentIds(newSentIds);

    // Update in background
    markBulkInvitationSent([currentGuest.guest_id]).catch(console.error);

    setHistory(prev => [...prev, {
      guestId: currentGuest.guest_id,
      name: currentGuest.name,
      action: 'sent',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }]);

    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = () => {
    if (!currentGuest) return;
    const newSkippedIds = [...skippedIds, currentGuest.guest_id];
    setSkippedIds(newSkippedIds);

    setHistory(prev => [...prev, {
      guestId: currentGuest.guest_id,
      name: currentGuest.name,
      action: 'skipped',
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    }]);

    setCurrentIndex(prev => prev + 1);
  };

  const handleFinish = () => {
    onComplete(sentIds, skippedIds);
    onClose();
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
            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-serif text-xl text-[#1A1A1A]">
                  {isFinished ? '🎉 Selesai!' : 'Kirim Undangan'}
                </h3>
                <button onClick={handleFinish} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{processed} dari {total} diproses</span>
                  <span className="font-semibold text-[#C8975A]">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-[#C8975A] to-[#DEB078] rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              {/* Finished Screen */}
              {isFinished ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <PartyPopper className="w-16 h-16 text-[#C8975A] mx-auto mb-4" />
                  <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-2">Pengiriman Selesai!</h2>
                  <div className="flex justify-center gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-600">{sentIds.length}</p>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Terkirim</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-gray-400">{skippedIds.length}</p>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Dilewati</p>
                    </div>
                  </div>
                  <Button onClick={handleFinish} className="mt-8 rounded-xl h-12 bg-[#1A1A1A] hover:bg-[#333] text-white px-8">
                    Tutup
                  </Button>
                </motion.div>
              ) : (
                <>
                  {/* Current Guest Card */}
                  {currentGuest && (
                    <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-[#1A1A1A] text-lg">{currentGuest.name}</p>
                          <p className="text-sm text-gray-500">{currentGuest.phone_wa || 'No WA tidak tersedia'}</p>
                        </div>
                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C8975A]/10 text-[#C8975A]">
                          {currentGuest.category.replace(/_/g, ' ')}
                        </span>
                      </div>

                      {/* Preview Message */}
                      <div className="max-h-[200px] overflow-y-auto">
                        <div className="bg-white rounded-xl p-4 border border-gray-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {template.preview(currentGuest.name, getInvitationLink(currentGuest), metadata)}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3">
                        <Button
                          onClick={handleSkip}
                          variant="outline"
                          className="flex-1 rounded-xl h-12 border-gray-200"
                        >
                          <SkipForward className="w-4 h-4 mr-2" />
                          Lewati
                        </Button>
                        <Button
                          onClick={handleSend}
                          className="flex-[2] rounded-xl h-12 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold"
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Buka WA & Kirim
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* History */}
              {history.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Riwayat</p>
                  <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
                    {[...history].reverse().map((h, i) => (
                      <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50">
                        <div className="flex items-center gap-2">
                          {h.action === 'sent' ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                          ) : (
                            <SkipForward className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium text-[#1A1A1A]">{h.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${
                            h.action === 'sent' ? 'text-green-600' : 'text-gray-400'
                          }`}>
                            {h.action === 'sent' ? '✅ Terkirim' : '⏭️ Dilewati'}
                          </span>
                          <span className="text-[10px] text-gray-400">{h.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
