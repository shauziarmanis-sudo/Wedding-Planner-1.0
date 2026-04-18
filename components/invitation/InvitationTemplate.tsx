"use client";

import { motion } from "framer-motion";

interface GuestInfo {
  name: string;
  pax: number;
}

export default function InvitationTemplate({ guest }: { guest: GuestInfo }) {
  return (
    <div className="min-h-screen bg-[#FFF8E1] text-[#212121] overflow-hidden selection:bg-[#E91E63] selection:text-white">
      {/* Hero Section */}
      <section className="relative h-screen flex flex-col items-center justify-center text-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="z-10"
        >
          <h3 className="text-sm tracking-widest uppercase mb-4 text-[#C2185B]">
            The Wedding Of
          </h3>
          <h1 className="text-5xl md:text-7xl font-serif text-[#C2185B] mb-8">
            Romeo & Juliet
          </h1>
          <p className="text-lg md:text-xl font-light italic mb-12">
            "We decided on forever"
          </p>
        </motion.div>

        {/* Guest Info Card - Floating */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="z-10 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-white/40 max-w-md w-full"
        >
          <p className="text-sm mb-2 text-gray-500">Dear,</p>
          <h2 className="text-2xl font-semibold text-[#212121] mb-2">{guest.name}</h2>
          <p className="text-sm text-gray-600 mb-6">
            You are invited to share in our joy.
          </p>
          <button className="w-full bg-[#E91E63] text-white py-3 rounded-full font-medium hover:bg-[#C2185B] transition-colors shadow-lg shadow-[#E91E63]/30">
            Open Invitation
          </button>
        </motion.div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#C2185B]/5 blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#E91E63]/5 blur-[100px]" />
        </div>
      </section>
    </div>
  );
}
