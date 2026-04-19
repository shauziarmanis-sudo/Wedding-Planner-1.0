"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Heart, MapPin, Calendar, Clock } from "lucide-react";

export interface WeddingInfo {
  groomName: string;
  brideName: string;
  akadDate: string;
  akadTime: string;
  akadVenue: string;
  resepsiDate: string;
  resepsiTime: string;
  resepsiVenue: string;
  quote?: string;
}

interface GuestInfo {
  name: string;
  pax: number;
}

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

export default function InvitationTemplate({ 
  guest, 
  wedding 
}: { 
  guest: GuestInfo; 
  wedding: WeddingInfo;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div className="min-h-screen bg-[#FFF8E1] text-[#212121] overflow-hidden selection:bg-[#E91E63] selection:text-white">
      {/* ── Hero Section ── */}
      <section ref={heroRef} className="relative h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden">
        <motion.div style={{ y: heroY }} className="absolute inset-0 z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#C2185B]/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E91E63]/5 blur-[100px]" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="z-10">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: "spring" }}>
            <Heart className="w-8 h-8 text-[#E91E63] mx-auto mb-4 fill-[#E91E63]" />
          </motion.div>
          <h3 className="text-sm tracking-[0.3em] uppercase mb-4 text-[#C2185B] font-medium">The Wedding Of</h3>
          <h1 className="text-5xl md:text-7xl font-serif text-[#C2185B] mb-4 leading-tight">
            {wedding.groomName} <br className="md:hidden" /> &amp; <br className="md:hidden" /> {wedding.brideName}
          </h1>
          <div className="w-24 h-[1px] bg-[#C2185B]/30 mx-auto my-6" />
          <p className="text-lg md:text-xl font-light italic text-[#212121]/60">
            &ldquo;{wedding.quote || "We decided on forever"}&rdquo;
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6, duration: 0.8 }}
          className="z-10 mt-12 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/40 max-w-md w-full">
          <p className="text-sm mb-1 text-[#212121]/40">Kepada Yth.</p>
          <h2 className="text-2xl font-serif font-bold text-[#212121] mb-1">{guest.name}</h2>
          <p className="text-sm text-[#212121]/50 mb-6">beserta {guest.pax} orang pendamping</p>
          <button className="w-full bg-[#E91E63] text-white py-3 rounded-full font-medium hover:bg-[#C2185B] transition-colors shadow-lg shadow-[#E91E63]/30">
            Buka Undangan
          </button>
        </motion.div>
      </section>

      {/* ── Details Section ── */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto space-y-16">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-[#C2185B] mb-4">Akad Nikah</h2>
            <div className="flex flex-col items-center gap-3 text-[#212121]/70">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#E91E63]" /><span>{wedding.akadDate || "Belum ditentukan"}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#E91E63]" /><span>{wedding.akadTime || "Belum ditentukan"}</span></div>
              <div className="flex items-center gap-2 text-center max-w-sm"><MapPin className="w-4 h-4 text-[#E91E63] shrink-0" /><span>{wedding.akadVenue || "Belum ditentukan"}</span></div>
            </div>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="text-center">
            <h2 className="font-serif text-3xl md:text-4xl text-[#C2185B] mb-4">Resepsi</h2>
            <div className="flex flex-col items-center gap-3 text-[#212121]/70">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-[#E91E63]" /><span>{wedding.resepsiDate || "Belum ditentukan"}</span></div>
              <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#E91E63]" /><span>{wedding.resepsiTime || "Belum ditentukan"}</span></div>
              <div className="flex items-center gap-2 text-center max-w-sm"><MapPin className="w-4 h-4 text-[#E91E63] shrink-0" /><span>{wedding.resepsiVenue || "Belum ditentukan"}</span></div>
            </div>
          </motion.div>

          {/* RSVP */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-white/40 text-center">
            <h2 className="font-serif text-2xl text-[#C2185B] mb-2">Konfirmasi Kehadiran</h2>
            <p className="text-sm text-[#212121]/50 mb-6">Mohon konfirmasi kehadiran Anda</p>
            <div className="flex gap-3 justify-center">
              <button className="flex-1 max-w-[200px] py-3 bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white rounded-full font-medium shadow-lg shadow-[#E91E63]/20 hover:shadow-[#E91E63]/40 transition-shadow">
                Hadir
              </button>
              <button className="flex-1 max-w-[200px] py-3 bg-white text-[#C2185B] border border-[#C2185B]/20 rounded-full font-medium hover:bg-[#C2185B]/5 transition-colors">
                Tidak Hadir
              </button>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center py-8">
            <Heart className="w-6 h-6 text-[#E91E63] mx-auto mb-3 fill-[#E91E63]" />
            <p className="text-sm text-[#212121]/40">Merupakan suatu kehormatan bagi kami</p>
            <p className="text-sm text-[#212121]/40">apabila Anda berkenan hadir</p>
            <p className="text-xs text-[#212121]/30 mt-4">Powered by Life-Start</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
