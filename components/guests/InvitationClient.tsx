"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, MapPin, Clock, Users, Check, X, Loader2 } from "lucide-react";
import { Guest, RSVPStatus } from "@/types/guest.types";
import { updateRSVP } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Props {
  guest: Guest;
  token: string;
  metadata: any;
}

export default function InvitationClient({ guest, token, metadata }: Props) {
  const bride = metadata.bride_name || "Nanda";
  const groom = metadata.groom_name || "Arfan";
  const dateFormatted = metadata.wedding_date ? format(new Date(metadata.wedding_date), "d MMMM yyyy", { locale: id }) : "12 JANUARI 2026";
  const venue = metadata.venue_name || "Hotel Mulia Senayan";
  const address = metadata.venue_address || "Jl. Asia Afrika, Senayan, Jakarta Pusat";
  const akadTime = metadata.akad_time || "08:00 - 10:00 WIB";
  const resepsiTime = metadata.resepsi_time || "11:00 - 13:00 WIB";

  const [status, setStatus] = useState<RSVPStatus>(guest.rsvp_status);
  const [pax, setPax] = useState<number>(guest.actual_pax || guest.pax_estimate || 1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await updateRSVP(guest.guest_id, status, pax, token);
    if (res.success) {
      setSubmitted(true);
    } else {
      alert("Gagal mengirim konfirmasi: " + res.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2C1810] font-sans overflow-x-hidden">
      {/* ── Hero Section ── */}
      <section className="relative h-screen flex flex-col items-center justify-center p-6 text-center border-[16px] border-double border-[#C8975A]/20 m-4 rounded-3xl overflow-hidden">
        {/* Simple CSS Floral Pattern placeholder */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#C8975A 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="z-10"
        >
          <span className="text-[#C8975A] font-serif italic text-lg tracking-widest uppercase mb-4 block">The Wedding of</span>
          <h1 className="text-5xl md:text-7xl font-serif mb-6 leading-tight">
            {bride} <br /> & <br /> {groom}
          </h1>
          <div className="w-16 h-px bg-[#C8975A] mx-auto mb-6"></div>
          <p className="text-xl tracking-[0.2em] font-light">{dateFormatted.toUpperCase()}</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-10 animate-bounce"
        >
          <div className="w-px h-12 bg-[#C8975A]/40"></div>
        </motion.div>
      </section>

      {/* ── Details Section ── */}
      <section className="max-w-2xl mx-auto py-20 px-6 space-y-12">
        <motion.div 
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          className="text-center"
        >
          <h2 className="text-3xl font-serif mb-8 text-[#C8975A]">Waktu & Lokasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C8975A]/10">
              <Calendar className="w-8 h-8 text-[#C8975A] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Akad Nikah</h3>
              <p className="text-sm text-gray-600">{akadTime}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#C8975A]/10">
              <Clock className="w-8 h-8 text-[#C8975A] mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Resepsi</h3>
              <p className="text-sm text-gray-600">{resepsiTime}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          whileInView={{ opacity: 1, y: 0 }}
          initial={{ opacity: 0, y: 20 }}
          className="bg-white p-8 rounded-3xl shadow-sm border border-[#C8975A]/10 text-center"
        >
          <MapPin className="w-8 h-8 text-[#C8975A] mx-auto mb-4" />
          <h3 className="text-xl font-serif mb-2">{venue}</h3>
          <p className="text-sm text-gray-500 mb-6">{address}</p>
          <Button variant="outline" className="rounded-full border-[#C8975A] text-[#C8975A] hover:bg-[#C8975A] hover:text-white" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue + " " + address)}`, '_blank')}>
            Buka Google Maps
          </Button>
        </motion.div>
      </section>

      {/* ── RSVP Section ── */}
      <section className="bg-white py-20 px-6 border-t border-[#C8975A]/10">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-3xl font-serif mb-4 text-[#C8975A]">RSVP</h2>
          <p className="text-gray-600 mb-8">Halo, <strong className="text-[#2C1810]">{guest.name}</strong>! <br /> Mohon konfirmasi kehadiran Anda.</p>

          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-6"
              >
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStatus("HADIR")}
                    className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      status === "HADIR" ? "border-[#C8975A] bg-[#C8975A]/5 text-[#C8975A]" : "border-gray-100 text-gray-400"
                    }`}
                  >
                    <Check className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Hadir</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("TIDAK_HADIR")}
                    className={`flex-1 py-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                      status === "TIDAK_HADIR" ? "border-red-200 bg-red-50 text-red-500" : "border-gray-100 text-gray-400"
                    }`}
                  >
                    <X className="w-6 h-6" />
                    <span className="text-sm font-semibold uppercase tracking-wider">Absen</span>
                  </button>
                </div>

                {status === "HADIR" && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    className="text-left"
                  >
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Jumlah Kehadiran (Orang)</label>
                    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl">
                      <Users className="w-5 h-5 text-gray-400 ml-2" />
                      <Input 
                        type="number" 
                        min={1} 
                        max={guest.pax_estimate + 2}
                        value={pax}
                        onChange={e => setPax(parseInt(e.target.value))}
                        className="bg-transparent border-none focus-visible:ring-0 text-lg font-semibold"
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 italic">*Estimasi awal: {guest.pax_estimate} orang</p>
                  </motion.div>
                )}

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#C8975A] hover:bg-[#B68649] text-white py-8 rounded-2xl text-lg font-serif"
                >
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Kirim Konfirmasi"}
                </Button>
              </motion.form>
            ) : (
              <motion.div 
                key="success"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-green-50 p-10 rounded-3xl border border-green-100"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-lg shadow-green-200">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-serif text-green-800 mb-2">Terima Kasih!</h3>
                <p className="text-green-700/70 text-sm">
                  {status === "HADIR" 
                    ? `Kami sangat menantikan kehadiran Anda (${pax} orang). Sampai jumpa di hari bahagia kami!` 
                    : "Terima kasih atas konfirmasinya. Walaupun Anda tidak dapat hadir, doa restu Anda sangat berarti bagi kami."}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <footer className="py-12 text-center text-gray-400 text-xs">
        <p className="mb-2 italic font-serif text-[#C8975A]">{bride} & {groom}</p>
        <p>Dibuat dengan ❤️ menggunakan <strong className="text-gray-600">Life-Start</strong></p>
      </footer>
    </div>
  );
}
