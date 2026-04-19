"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { X, Banknote } from "lucide-react";
import { Vendor } from "@/types/vendor.types";
import { recordPayment } from "@/actions/vendor.actions";
import { formatRupiah } from "./VendorCard";

interface Props {
  vendor: Vendor;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaymentModal({ vendor, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "");
    setAmount(val);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount) || 0;
    if (numAmount <= 0) return;

    startTransition(async () => {
      await recordPayment(vendor.vendor_id, numAmount, notes);
      onSuccess();
      onClose();
    });
  };

  const numAmount = parseInt(amount) || 0;
  const newTotalPaid = vendor.paid_amount + numAmount;
  const actual = vendor.actual_cost > 0 ? vendor.actual_cost : vendor.estimated_cost;
  const newRemaining = Math.max(0, actual - newTotalPaid);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Banknote className="w-5 h-5 text-green-600" /> Catat Pembayaran
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 mb-6">
          <p className="text-sm font-bold text-[#1A1A1A]">{vendor.vendor_name}</p>
          <p className="text-xs text-gray-500 mb-3">{vendor.category}</p>
          
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Total Biaya</span>
            <span className="font-bold">{formatRupiah(actual)}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Sudah Dibayar</span>
            <span className="font-bold text-green-600">{formatRupiah(vendor.paid_amount)}</span>
          </div>
          <div className="flex justify-between text-xs pt-2 mt-2 border-t border-gray-200">
            <span className="text-gray-500 font-medium">Sisa Tagihan Saat Ini</span>
            <span className="font-bold text-red-500">{formatRupiah(vendor.remaining_cost)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Nominal Pembayaran (Rp)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">Rp</span>
              <input
                type="text"
                value={amount ? parseInt(amount).toLocaleString("id-ID") : ""}
                onChange={handleAmountChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-lg font-bold"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Catatan Tambahan</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Misal: Pelunasan sisa tagihan via BCA"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500/30 text-sm"
            />
          </div>

          {numAmount > 0 && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-green-50 text-green-800 rounded-xl p-3 text-sm">
              Setelah pembayaran ini, sisa tagihan menjadi: <strong>{formatRupiah(newRemaining)}</strong>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending || numAmount <= 0}
            type="submit"
            className="w-full py-3 bg-[#1A1A1A] text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
          >
            {isPending ? "Menyimpan..." : "Simpan Pembayaran"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
