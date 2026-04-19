"use client";

import { motion } from "framer-motion";
import { Phone, Instagram, FileText, CheckCircle2, Clock, Edit3, Banknote } from "lucide-react";
import { Vendor } from "@/types/vendor.types";

interface Props {
  vendor: Vendor;
  onPaymentClick: (v: Vendor) => void;
  onEditClick: (v: Vendor) => void;
}

export function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function VendorCard({ vendor, onPaymentClick, onEditClick }: Props) {
  const isLunas = vendor.status === "LUNAS";
  const cost = vendor.actual_cost > 0 ? vendor.actual_cost : vendor.estimated_cost;
  const progress = cost > 0 ? Math.min(100, Math.round((vendor.paid_amount / cost) * 100)) : 0;

  const handleWA = () => {
    const text = encodeURIComponent(`Halo ${vendor.contact_name || vendor.vendor_name}, kami calon pengantin Life-Start. Mengenai konfirmasi vendor untuk pernikahan kami...`);
    window.open(`https://wa.me/${vendor.phone_wa.replace(/\D/g, '')}?text=${text}`, "_blank");
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-white rounded-2xl p-5 shadow-sm border ${
        isLunas ? "border-green-200" : "border-black/[0.06]"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-[10px] font-bold text-[#C8975A] bg-[#C8975A]/10 px-2 py-1 rounded-md mb-2 inline-block">
            {vendor.category}
          </span>
          <h3 className="font-bold text-[#1A1A1A] text-lg">{vendor.vendor_name}</h3>
          
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
            {vendor.phone_wa && (
              <button onClick={handleWA} className="flex items-center gap-1 hover:text-green-600 transition-colors">
                <Phone className="w-3.5 h-3.5" /> {vendor.contact_name || "Hubungi"}
              </button>
            )}
            {vendor.instagram && (
              <a href={`https://instagram.com/${vendor.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-pink-600 transition-colors">
                <Instagram className="w-3.5 h-3.5" /> {vendor.instagram}
              </a>
            )}
          </div>
        </div>

        <div className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
          vendor.status === "LUNAS" ? "bg-green-50 text-green-700 border-green-200" :
          vendor.status === "DP_LUNAS" ? "bg-blue-50 text-blue-700 border-blue-200" :
          vendor.status === "PARTIAL" ? "bg-amber-50 text-amber-700 border-amber-200" :
          "bg-red-50 text-red-700 border-red-200"
        }`}>
          {vendor.status.replace("_", " ")}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500">Biaya Aktual</span>
          <span className="font-bold text-[#1A1A1A]">{formatRupiah(cost)}</span>
        </div>
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-500">Telah Dibayar</span>
          <span className="font-bold text-green-600">{formatRupiah(vendor.paid_amount)}</span>
        </div>
        
        <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
        
        {vendor.remaining_cost > 0 && (
          <p className="text-[10px] text-red-500 mt-2 font-medium">
            Sisa Tagihan: {formatRupiah(vendor.remaining_cost)}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs">
          {vendor.contract_signed === "YA" ? (
            <span className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-md"><CheckCircle2 className="w-3.5 h-3.5" /> Kontrak</span>
          ) : vendor.contract_signed === "PROSES" ? (
            <span className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-1 rounded-md"><Clock className="w-3.5 h-3.5" /> Proses Kontrak</span>
          ) : (
            <span className="flex items-center gap-1 text-gray-500 bg-gray-100 px-2 py-1 rounded-md"><FileText className="w-3.5 h-3.5" /> Tanpa Kontrak</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => onEditClick(vendor)} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </button>
          {!isLunas && (
            <button onClick={() => onPaymentClick(vendor)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] text-white text-xs font-bold rounded-lg hover:bg-black/80 transition-colors">
              <Banknote className="w-3.5 h-3.5" /> Bayar
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
