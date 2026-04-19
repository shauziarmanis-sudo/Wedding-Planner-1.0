"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Scale, Check, AlertCircle, Package, Bot, Loader2, Sparkles } from "lucide-react";
import { Vendor, VendorCategory } from "@/types/vendor.types";
import { analyzeVendors } from "@/actions/ai.actions";
import { formatRupiah } from "./VendorCard";
import WeddingPackageComparison from "./WeddingPackageComparison";

type TabMode = "category" | "paket";

interface Props {
  vendors: Vendor[];
  onClose: () => void;
}

export default function VendorComparisonModal({ vendors, onClose }: Props) {
  const hasPaketWedding = vendors.filter(v => v.category === "PAKET_WEDDING").length >= 2;
  const [activeTab, setActiveTab] = useState<TabMode>(hasPaketWedding ? "paket" : "category");
  const [selectedCategory, setSelectedCategory] = useState<VendorCategory | "">("");

  // AI State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Categories that have at least 2 vendors to compare
  const comparableCategories = Array.from(new Set(vendors.map(v => v.category)))
    .filter(cat => cat !== "PAKET_WEDDING" && vendors.filter(v => v.category === cat).length >= 2);

  const comparedVendors = selectedCategory
    ? vendors.filter(v => v.category === selectedCategory).slice(0, 4)
    : [];

  const cheapestCost = comparedVendors.length > 0 
    ? Math.min(...comparedVendors.map(v => v.actual_cost > 0 ? v.actual_cost : v.estimated_cost))
    : 0;

  const handleAIAnalysis = async () => {
    if (comparedVendors.length < 2) return;
    setIsAnalyzing(true); setAiError(null); setAiResult(null);
    try {
      const res = await analyzeVendors(comparedVendors);
      if (res.success && res.data) setAiResult(res.data);
      else setAiError(res.error || "Gagal menganalisis.");
    } catch { setAiError("Koneksi ke AI gagal."); }
    setIsAnalyzing(false);
  };

  // If paket tab is active, delegate to the dedicated component
  if (activeTab === "paket") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[92vh] overflow-y-auto">
          
          {/* Tab Switcher */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-gray-100 px-6 pt-6 pb-4 rounded-t-3xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
                <Scale className="w-6 h-6 text-indigo-600" /> Perbandingan Vendor
              </h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setActiveTab("paket")}
                className="px-4 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white shadow-md shadow-[#C2185B]/20 flex items-center gap-2">
                <Package className="w-4 h-4" /> Paket Wedding
              </button>
              {comparableCategories.length > 0 && (
                <button onClick={() => setActiveTab("category")}
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2">
                  <Scale className="w-4 h-4" /> Per Kategori
                </button>
              )}
            </div>
          </div>

          {/* Paket Content Inline */}
          <div className="p-6">
            <WeddingPackageComparison vendors={vendors} onClose={onClose} />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full p-6 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-bold text-[#1A1A1A] flex items-center gap-2">
            <Scale className="w-6 h-6 text-indigo-600" /> Perbandingan Vendor
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          {hasPaketWedding && (
            <button onClick={() => setActiveTab("paket")}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Package className="w-4 h-4" /> Paket Wedding
            </button>
          )}
          <button onClick={() => setActiveTab("category")}
            className="px-4 py-2 rounded-xl text-sm font-bold bg-indigo-600 text-white shadow-md shadow-indigo-600/20 flex items-center gap-2">
            <Scale className="w-4 h-4" /> Per Kategori
          </button>
        </div>

        {comparableCategories.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
            <AlertCircle className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700">Belum ada vendor untuk dibandingkan</h3>
            <p className="text-sm text-gray-500 mt-1">Tambahkan minimal 2 vendor dengan kategori yang sama untuk membandingkan.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-2">Pilih Kategori:</label>
              <div className="flex gap-2 flex-wrap">
                {comparableCategories.map(cat => (
                  <button key={cat} onClick={() => { setSelectedCategory(cat as VendorCategory); setAiResult(null); }}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                      selectedCategory === cat ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}>
                    {cat.replace(/_/g, " ")} ({vendors.filter(v => v.category === cat).length})
                  </button>
                ))}
              </div>
            </div>

            {selectedCategory && comparedVendors.length > 0 && (
              <>
                <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
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
                        <tr className="border-b">
                          <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Kontak Person</td>
                          {comparedVendors.map(v => (
                            <td key={v.vendor_id} className="py-4 px-4 text-center border-l text-gray-600">
                              {v.contact_name || "-"}<br/><span className="text-xs text-gray-400">{v.phone_wa || "-"}</span>
                            </td>
                          ))}
                        </tr>
                        <tr className="border-b">
                          <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Portfolio (IG)</td>
                          {comparedVendors.map(v => (
                            <td key={v.vendor_id} className="py-4 px-4 text-center border-l text-blue-600">
                              {v.instagram ? <a href={`https://instagram.com/${v.instagram.replace('@', '')}`} target="_blank" rel="noreferrer" className="hover:underline">{v.instagram}</a> : "-"}
                            </td>
                          ))}
                        </tr>
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
                        <tr>
                          <td className="py-4 px-4 font-semibold text-gray-700 bg-gray-50">Catatan</td>
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

                {/* AI Analysis */}
                <div className="flex justify-center">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAIAnalysis} disabled={isAnalyzing}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-60 flex items-center gap-2">
                    {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang Menganalisis...</> : <><Bot className="w-4 h-4" /> 🤖 AI Analisis</>}
                  </motion.button>
                </div>

                <AnimatePresence>
                  {aiResult && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-indigo-900">Hasil Analisis AI</h3>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm">{aiResult}</div>
                    </motion.div>
                  )}
                  {aiError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{aiError}</motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
