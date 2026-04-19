"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Scale, Check, AlertCircle } from "lucide-react";
import { Vendor, VendorCategory } from "@/types/vendor.types";
import { formatRupiah } from "./VendorCard";

interface Props {
  vendors: Vendor[];
  onClose: () => void;
}

export default function VendorComparisonModal({ vendors, onClose }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | "">("");

  // Categories that have at least 2 vendors to compare
  const comparableCategories = Array.from(new Set(vendors.map(v => v.category)))
    .filter(cat => vendors.filter(v => v.category === cat).length >= 2);

  const comparedVendors = selectedCategory
    ? vendors.filter(v => v.category === selectedCategory).slice(0, 4) // max 4 for UI fit
    : [];

  const cheapestCost = comparedVendors.length > 0 
    ? Math.min(...comparedVendors.map(v => v.actual_cost > 0 ? v.actual_cost : v.estimated_cost))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" /> Perbandingan Vendor
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {comparableCategories.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700">Belum ada vendor untuk dibandingkan</h3>
            <p className="text-sm text-gray-500 mt-1">Tambahkan minimal 2 vendor dengan kategori yang sama (misal: 2 Venue) untuk membandingkan.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Pilih Kategori untuk Dibandingkan:</label>
              <div className="flex gap-2 flex-wrap">
                {comparableCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat as VendorCategory)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      selectedCategory === cat 
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" 
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {cat.replace(/_/g, " ")} ({vendors.filter(v => v.category === cat).length})
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && comparedVendors.length > 0 && (
              <div className="mt-8 border rounded-2xl overflow-hidden bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b">
                      <tr>
                        <th className="py-4 px-4 font-semibold w-32">Kriteria</th>
                        {comparedVendors.map(v => (
                          <th key={v.vendor_id} className="py-4 px-4 font-bold text-center border-l bg-white">
                            <span className="block text-base text-[#1A1A1A]">{v.vendor_name}</span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Biaya */}
                      <tr className="border-b">
                        <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Estimasi / Aktual Biaya</td>
                        {comparedVendors.map(v => {
                          const cost = v.actual_cost > 0 ? v.actual_cost : v.estimated_cost;
                          const isCheapest = cost === cheapestCost;
                          return (
                            <td key={v.vendor_id} className={`py-4 px-4 text-center border-l font-bold ${isCheapest ? "bg-green-50 text-green-700" : "text-gray-900"}`}>
                              {formatRupiah(cost)}
                              {isCheapest && <span className="block text-[10px] text-green-600 mt-1 flex items-center justify-center gap-1"><Check className="w-3 h-3" /> Termurah</span>}
                            </td>
                          );
                        })}
                      </tr>
                      {/* Kontak */}
                      <tr className="border-b">
                        <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Kontak Person</td>
                        {comparedVendors.map(v => (
                          <td key={v.vendor_id} className="py-4 px-4 text-center border-l text-gray-600">
                            {v.contact_name || "-"}<br/>
                            <span className="text-xs text-gray-400">{v.phone_wa || "-"}</span>
                          </td>
                        ))}
                      </tr>
                      {/* Instagram */}
                      <tr className="border-b">
                        <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Portfolio (IG)</td>
                        {comparedVendors.map(v => (
                          <td key={v.vendor_id} className="py-4 px-4 text-center border-l text-blue-600">
                            {v.instagram ? <a href={`https://instagram.com/${v.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:underline">{v.instagram}</a> : "-"}
                          </td>
                        ))}
                      </tr>
                      {/* Status */}
                      <tr className="border-b">
                        <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Status Kontrak</td>
                        {comparedVendors.map(v => (
                          <td key={v.vendor_id} className="py-4 px-4 text-center border-l">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold ${v.contract_signed === "YA" ? "bg-green-100 text-green-700" : v.contract_signed === "PROSES" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                              {v.contract_signed}
                            </span>
                          </td>
                        ))}
                      </tr>
                      {/* Notes */}
                      <tr>
                        <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Kelebihan / Catatan</td>
                        {comparedVendors.map(v => (
                          <td key={v.vendor_id} className="py-4 px-4 border-l text-gray-600 text-xs italic">
                            {v.notes || "-"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
