"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Bot, Loader2, Crown, TrendingDown, AlertCircle } from "lucide-react";
import { Vendor } from "@/types/vendor.types";
import { analyzeWeddingPackages } from "@/actions/ai.actions";
import { formatRupiah } from "./VendorCard";

// Parse benefit notes into structured data
interface ParsedBenefit { label: string; detail: string; emoji: string; }

function parsePaketNotes(notes: string): ParsedBenefit[] {
  if (!notes) return [];
  const results: ParsedBenefit[] = [];
  const lines = notes.split("\n").filter(l => l.trim().startsWith("•") || l.trim().startsWith("-"));
  for (const line of lines) {
    const clean = line.replace(/^[\s•\-]+/, "").trim();
    // Try to match emoji + label: detail pattern
    const match = clean.match(/^(.{1,4})\s*(.+?):\s*(.+)$/);
    if (match) {
      results.push({ emoji: match[1].trim(), label: match[2].trim(), detail: match[3].trim() });
    } else if (clean) {
      results.push({ emoji: "📌", label: clean, detail: "Termasuk" });
    }
  }
  return results;
}

// Standard benefit labels for comparison rows
const STANDARD_BENEFITS = [
  { key: "venue", label: "Venue", emoji: "🏛️" },
  { key: "katering", label: "Katering", emoji: "🍽️" },
  { key: "foto", label: "Fotografer & Videografer", emoji: "📸" },
  { key: "mua", label: "MUA", emoji: "💄" },
  { key: "busana", label: "Busana Pengantin", emoji: "👰" },
  { key: "dekorasi", label: "Dekorasi", emoji: "🎨" },
  { key: "wo", label: "Wedding Organizer", emoji: "📋" },
  { key: "souvenir", label: "Souvenir", emoji: "🎁" },
  { key: "photobooth", label: "Photo Booth", emoji: "📷" },
];

function findBenefitMatch(parsed: ParsedBenefit[], keywords: string[]): ParsedBenefit | null {
  for (const b of parsed) {
    const text = (b.label + " " + b.detail).toLowerCase();
    if (keywords.some(k => text.includes(k))) return b;
  }
  return null;
}

interface Props {
  vendors: Vendor[];
  onClose: () => void;
}

export default function WeddingPackageComparison({ vendors, onClose }: Props) {
  const paketVendors = vendors.filter(v => v.category === "PAKET_WEDDING");
  const [selected, setSelected] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const selectedVendors = paketVendors.filter(v => selected.includes(v.vendor_id));
  const parsedMap = new Map(selectedVendors.map(v => [v.vendor_id, parsePaketNotes(v.notes)]));
  
  const costs = selectedVendors.map(v => v.actual_cost > 0 ? v.actual_cost : v.estimated_cost);
  const cheapestCost = costs.length > 0 ? Math.min(...costs) : 0;
  
  // Count benefits per vendor
  const benefitCounts = selectedVendors.map(v => {
    const parsed = parsedMap.get(v.vendor_id) || [];
    return { id: v.vendor_id, count: parsed.length };
  });
  const maxBenefitCount = Math.max(0, ...benefitCounts.map(b => b.count));

  const handleAIAnalysis = async () => {
    if (selectedVendors.length < 2) return;
    setIsAnalyzing(true); setAiError(null); setAiResult(null);
    try {
      const res = await analyzeWeddingPackages(selectedVendors);
      if (res.success && res.data) setAiResult(res.data);
      else setAiError(res.error || "Gagal menganalisis.");
    } catch { setAiError("Koneksi ke AI gagal."); }
    setIsAnalyzing(false);
  };

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Pilih hingga 3 paket untuk dibandingkan side-by-side</p>
          </div>
        </div>

        {paketVendors.length < 2 ? (
          <div className="text-center py-14 bg-gray-50 rounded-2xl border border-gray-100">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-700 text-lg">Belum cukup paket untuk dibandingkan</h3>
            <p className="text-sm text-gray-500 mt-2 max-w-md mx-auto">
              Tambahkan minimal <strong>2 vendor</strong> dengan kategori <strong>PAKET WEDDING</strong> untuk bisa membandingkan. Saat ini ada {paketVendors.length} paket.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Package Selection Cards */}
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-3">
                Pilih Paket ({selected.length}/3):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {paketVendors.map(v => {
                  const isSelected = selected.includes(v.vendor_id);
                  const cost = v.actual_cost > 0 ? v.actual_cost : v.estimated_cost;
                  const parsed = parsePaketNotes(v.notes);
                  return (
                    <motion.button key={v.vendor_id} type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                      onClick={() => toggleSelect(v.vendor_id)}
                      disabled={!isSelected && selected.length >= 3}
                      className={`relative text-left p-4 rounded-2xl border-2 transition-all ${
                        isSelected
                          ? "border-[#C2185B] bg-gradient-to-br from-[#C2185B]/5 to-[#E91E63]/5 shadow-md shadow-[#C2185B]/10"
                          : "border-gray-100 bg-white hover:border-gray-200 disabled:opacity-40"
                      }`}>
                      {isSelected && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#C2185B] rounded-full flex items-center justify-center shadow-lg">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <p className="font-bold text-[#1A1A1A] text-sm truncate">{v.vendor_name}</p>
                      <p className="text-lg font-bold text-[#C2185B] mt-1">{formatRupiah(cost)}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {parsed.slice(0, 4).map((b, i) => (
                          <span key={i} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{b.emoji} {b.label}</span>
                        ))}
                        {parsed.length > 4 && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">+{parsed.length - 4} lainnya</span>}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Comparison Table */}
            {selectedVendors.length >= 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm text-left">
                      <thead className="bg-gradient-to-r from-[#C2185B]/5 to-[#E91E63]/5 border-b">
                        <tr>
                          <th className="py-4 px-4 font-semibold text-gray-600 w-40">Kriteria</th>
                          {selectedVendors.map(v => {
                            const cost = v.actual_cost > 0 ? v.actual_cost : v.estimated_cost;
                            const isCheapest = cost === cheapestCost;
                            const bCount = (parsedMap.get(v.vendor_id) || []).length;
                            const isMostComplete = bCount === maxBenefitCount && maxBenefitCount > 0;
                            return (
                              <th key={v.vendor_id} className="py-4 px-4 text-center border-l bg-white">
                                <span className="block text-base font-bold text-[#1A1A1A]">{v.vendor_name}</span>
                                <div className="flex items-center justify-center gap-1 mt-1">
                                  {isCheapest && <span className="text-[9px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><TrendingDown className="w-2.5 h-2.5" />Termurah</span>}
                                  {isMostComplete && <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5"><Crown className="w-2.5 h-2.5" />Terlengkap</span>}
                                </div>
                              </th>
                            );
                          })}
                        </tr>
                      </thead>
                      <tbody>
                        {/* Price Row */}
                        <tr className="border-b bg-gray-50/50">
                          <td className="py-4 px-4 font-semibold text-gray-700">💰 Harga Total</td>
                          {selectedVendors.map(v => {
                            const cost = v.actual_cost > 0 ? v.actual_cost : v.estimated_cost;
                            const isCheapest = cost === cheapestCost;
                            return (
                              <td key={v.vendor_id} className={`py-4 px-4 text-center border-l font-bold text-lg ${isCheapest ? "bg-green-50 text-green-700" : "text-gray-900"}`}>
                                {formatRupiah(cost)}
                              </td>
                            );
                          })}
                        </tr>
                        {/* Standard Benefit Rows */}
                        {STANDARD_BENEFITS.map(std => {
                          const keywords = std.label.toLowerCase().split(/[\s&]+/);
                          return (
                            <tr key={std.key} className="border-b hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-medium text-gray-700 text-xs">
                                <span className="mr-1.5">{std.emoji}</span>{std.label}
                              </td>
                              {selectedVendors.map(v => {
                                const parsed = parsedMap.get(v.vendor_id) || [];
                                const match = findBenefitMatch(parsed, keywords);
                                return (
                                  <td key={v.vendor_id} className="py-3 px-4 text-center border-l">
                                    {match ? (
                                      <div>
                                        <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs">
                                          <Check className="w-3.5 h-3.5" /> Termasuk
                                        </span>
                                        {match.detail && match.detail !== "Termasuk" && (
                                          <p className="text-[10px] text-gray-500 mt-0.5 max-w-[200px] mx-auto">{match.detail}</p>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-300 text-xs">✕ Tidak termasuk</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                        {/* Extra items */}
                        {(() => {
                          const allExtras = new Set<string>();
                          selectedVendors.forEach(v => {
                            const parsed = parsedMap.get(v.vendor_id) || [];
                            parsed.forEach(p => {
                              const isStandard = STANDARD_BENEFITS.some(std => {
                                const kw = std.label.toLowerCase().split(/[\s&]+/);
                                return kw.some(k => (p.label + " " + p.detail).toLowerCase().includes(k));
                              });
                              if (!isStandard) allExtras.add(p.label);
                            });
                          });
                          return Array.from(allExtras).map(extra => (
                            <tr key={extra} className="border-b hover:bg-gray-50/50">
                              <td className="py-3 px-4 font-medium text-gray-700 text-xs"><span className="mr-1.5">➕</span>{extra}</td>
                              {selectedVendors.map(v => {
                                const parsed = parsedMap.get(v.vendor_id) || [];
                                const match = parsed.find(p => p.label === extra);
                                return (
                                  <td key={v.vendor_id} className="py-3 px-4 text-center border-l">
                                    {match ? <span className="text-green-600 font-bold text-xs flex items-center justify-center gap-1"><Check className="w-3 h-3" />{match.detail !== "Termasuk" ? match.detail : "Termasuk"}</span>
                                      : <span className="text-gray-300 text-xs">✕</span>}
                                  </td>
                                );
                              })}
                            </tr>
                          ));
                        })()}
                        {/* Contact */}
                        <tr className="border-b">
                          <td className="py-3 px-4 font-medium text-gray-700 text-xs">📞 Kontak</td>
                          {selectedVendors.map(v => (
                            <td key={v.vendor_id} className="py-3 px-4 text-center border-l text-xs text-gray-600">
                              {v.contact_name || "-"}<br/><span className="text-gray-400">{v.phone_wa || "-"}</span>
                            </td>
                          ))}
                        </tr>
                        {/* Contract */}
                        <tr>
                          <td className="py-3 px-4 font-medium text-gray-700 text-xs">📝 Kontrak</td>
                          {selectedVendors.map(v => (
                            <td key={v.vendor_id} className="py-3 px-4 text-center border-l">
                              <span className={`px-2 py-1 rounded text-[10px] font-bold ${v.contract_signed === "YA" ? "bg-green-100 text-green-700" : v.contract_signed === "PROSES" ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"}`}>
                                {v.contract_signed}
                              </span>
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Analysis Button */}
                <div className="flex justify-center">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAIAnalysis} disabled={isAnalyzing}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-60 flex items-center gap-2">
                    {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Sedang Menganalisis...</> : <><Bot className="w-4 h-4" /> 🤖 AI Analisis — Saran Objektif</>}
                  </motion.button>
                </div>

                {/* AI Result */}
                <AnimatePresence>
                  {aiResult && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-indigo-600" />
                        <h3 className="font-bold text-indigo-900">Hasil Analisis AI</h3>
                      </div>
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{aiResult}</div>
                    </motion.div>
                  )}
                  {aiError && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{aiError}</motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}
    </div>
  );
}
