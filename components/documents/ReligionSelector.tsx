"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, ChevronRight, Loader2 } from "lucide-react";
import { Religion } from "@/types/document.types";
import { Button } from "@/components/ui/button";

interface ReligionSelectorProps {
  onSelect: (religion: Religion) => Promise<void>;
}

const RELIGIONS: { id: Religion; label: string; icon: string; desc: string }[] = [
  { id: 'ISLAM', label: 'Islam', icon: '🕌', desc: 'KUA & Administrasi Kelurahan' },
  { id: 'KRISTEN_PROTESTAN', label: 'Kristen Protestan', icon: '⛪', desc: 'Gereja & Disdukcapil' },
  { id: 'KATOLIK', label: 'Katolik', icon: '⛪', desc: 'Paroki & Disdukcapil' },
  { id: 'HINDU', label: 'Hindu', icon: '🕉️', desc: 'PHDI & Disdukcapil' },
  { id: 'BUDDHA', label: 'Buddha', icon: '☸️', desc: 'Walubi & Disdukcapil' },
  { id: 'KONGHUCU', label: 'Konghucu', icon: '☯️', desc: 'MAKIN & Disdukcapil' },
];

export default function ReligionSelector({ onSelect }: ReligionSelectorProps) {
  const [selected, setSelected] = useState<Religion | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    await onSelect(selected);
    // UI state should be handled by parent after promise resolves
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-[#1A1A1A] mb-3">Persiapan Dokumen Resmi</h2>
        <p className="text-gray-500">
          Untuk membuat daftar dokumen yang tepat, silakan pilih agama yang akan menjadi dasar pencatatan pernikahan Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {RELIGIONS.map((rel) => (
          <motion.div
            key={rel.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelected(rel.id)}
            className={`cursor-pointer p-5 rounded-2xl border-2 transition-all flex items-start gap-4 ${
              selected === rel.id
                ? "border-[#C8975A] bg-[#C8975A]/5"
                : "border-gray-100 bg-white hover:border-gray-200"
            }`}
          >
            <div className="text-3xl">{rel.icon}</div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{rel.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{rel.desc}</p>
            </div>
            {selected === rel.id && (
              <CheckCircle2 className="w-5 h-5 text-[#C8975A] mt-1" />
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button
          onClick={handleSubmit}
          disabled={!selected || loading}
          className="bg-[#1A1A1A] hover:bg-[#333333] text-white px-8 py-6 rounded-full text-lg w-full md:w-auto"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Membuat Daftar Dokumen...
            </>
          ) : (
            <>
              Lanjutkan
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
