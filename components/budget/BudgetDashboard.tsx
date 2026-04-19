"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Store, AlertCircle, Banknote, CreditCard, TrendingUp, CheckCircle2 } from "lucide-react";
import { Vendor, BudgetSummary, VendorCategory } from "@/types/vendor.types";
import { getVendors, getBudgetSummary } from "@/actions/vendor.actions";
import VendorCard, { formatRupiah } from "./VendorCard";
import AddVendorForm from "./AddVendorForm";
import PaymentModal from "./PaymentModal";
import BudgetBreakdownChart from "./BudgetBreakdownChart";
import VendorComparisonModal from "./VendorComparisonModal";

export default function BudgetDashboard() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [summary, setSummary] = useState<BudgetSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [showAddForm, setShowAddForm] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [paymentVendor, setPaymentVendor] = useState<Vendor | null>(null);
  const [editVendor, setEditVendor] = useState<Vendor | null>(null); // For future edit functionality

  // Filtering
  const [activeCategory, setActiveCategory] = useState<VendorCategory | "ALL">("ALL");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [fetchedVendors, fetchedSummary] = await Promise.all([
      getVendors(),
      getBudgetSummary(),
    ]);
    setVendors(fetchedVendors);
    setSummary(fetchedSummary);
    setIsLoading(false);
  }

  const filteredVendors = vendors.filter(v => activeCategory === "ALL" || v.category === activeCategory);
  const categories = ["ALL", ...Array.from(new Set(vendors.map(v => v.category)))];

  const upcomingPayments = vendors.filter(v => v.status === "BELUM_BAYAR" && v.dp_amount > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <Store className="w-12 h-12 text-[#C8975A] animate-pulse mb-4" />
        <p className="text-gray-500 font-medium">Memuat Data Vendor & Budget...</p>
      </div>
    );
  }

  const budgetPercent = summary && summary.total_actual > 0 
    ? Math.min(100, Math.round((summary.total_paid / summary.total_actual) * 100)) 
    : 0;

  return (
    <div className="space-y-8 relative pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-[#1A1A1A]">Vendor & Budget</h2>
          <p className="text-sm text-gray-500 mt-1">Lacak pengeluaran dan kelola vendor pernikahan Anda</p>
        </div>
        
        <button 
          onClick={() => setShowComparison(true)}
          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm border border-indigo-100 hover:bg-indigo-100 transition-colors"
        >
          ⚖️ Bandingkan Vendor
        </button>
      </div>

      {/* ── Summary Metrics ── */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.06]">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Banknote className="w-4 h-4" />
              <span className="text-xs font-semibold">Total Budget</span>
            </div>
            <p className="text-lg font-bold text-[#1A1A1A]">{formatRupiah(summary.total_actual)}</p>
            <p className="text-[10px] text-gray-400 mt-1">Estimasi awal: {formatRupiah(summary.total_estimated)}</p>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.06]">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-semibold">Total Dibayar</span>
            </div>
            <p className="text-lg font-bold text-green-600">{formatRupiah(summary.total_paid)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{summary.vendors_lunas} vendor lunas</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.06]">
            <div className="flex items-center gap-2 text-red-500 mb-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold">Sisa Tagihan</span>
            </div>
            <p className="text-lg font-bold text-red-500">{formatRupiah(summary.total_unpaid)}</p>
            <p className="text-[10px] text-gray-400 mt-1">{summary.vendors_belum} vendor belum lunas</p>
          </div>

          <div className="bg-white rounded-2xl p-4 shadow-sm border border-black/[0.06]">
            <div className="flex items-center gap-2 text-blue-500 mb-2">
              <Store className="w-4 h-4" />
              <span className="text-xs font-semibold">Total Vendor</span>
            </div>
            <p className="text-lg font-bold text-blue-600">{summary.vendors_count} Vendor</p>
            <p className="text-[10px] text-gray-400 mt-1">Terkontrak</p>
          </div>
        </div>
      )}

      {/* ── Progress Bar ── */}
      {summary && summary.total_actual > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.06]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-[#1A1A1A]">Utilisasi Budget</span>
            <span className="text-sm font-bold text-green-600">{budgetPercent}% Terbayar</span>
          </div>
          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} animate={{ width: `${budgetPercent}%` }} transition={{ duration: 1 }}
              className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full" 
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {formatRupiah(summary.total_paid)} dari {formatRupiah(summary.total_actual)} terpakai
          </p>
        </div>
      )}

      {/* ── Chart & Alerts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-black/[0.06]">
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-4">Distribusi Budget per Kategori</h3>
          {summary && summary.by_category.length > 0 ? (
            <BudgetBreakdownChart data={summary.by_category} />
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-400 text-sm">Belum ada data budget</div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-black/[0.06]">
          <h3 className="text-sm font-bold text-[#1A1A1A] mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-500" /> Perlu Perhatian
          </h3>
          <div className="space-y-3">
            {upcomingPayments.length > 0 ? (
              upcomingPayments.slice(0, 4).map(v => (
                <div key={v.vendor_id} className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-sm font-bold text-amber-900">{v.vendor_name}</p>
                  <p className="text-xs text-amber-700 mt-1">DP belum dibayar: {formatRupiah(v.dp_amount)}</p>
                  <button onClick={() => setPaymentVendor(v)} className="mt-2 text-[10px] font-bold bg-amber-200 text-amber-900 px-3 py-1 rounded hover:bg-amber-300 transition-colors">
                    Bayar Sekarang
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="w-8 h-8 text-green-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Tidak ada tagihan mendesak.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Vendor List ── */}
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as any)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                activeCategory === cat ? "bg-[#1A1A1A] text-white" : "bg-white text-gray-600 border hover:bg-gray-50"
              }`}
            >
              {cat === "ALL" ? "Semua Kategori" : cat.replace(/_/g, " ")}
            </button>
          ))}
        </div>

        {vendors.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-black/[0.06]">
            <Store className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-[#1A1A1A] mb-2">Belum ada vendor</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Mulai catat pengeluaran dan kontrak dengan menambahkan vendor pertamamu! Di Indonesia, sering ada opsi paket All-in-One juga.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={() => setShowAddForm(true)} className="px-6 py-3 bg-[#C8975A] text-white rounded-xl font-bold hover:bg-[#B3854A] transition-colors inline-flex items-center gap-2">
                <Plus className="w-5 h-5" /> Tambah Vendor
              </button>
            </div>
          </div>
        ) : filteredVendors.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-sm">Tidak ada vendor di kategori ini.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredVendors.map(vendor => (
                <VendorCard 
                  key={vendor.vendor_id} 
                  vendor={vendor} 
                  onPaymentClick={setPaymentVendor}
                  onEditClick={setEditVendor}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#1A1A1A] text-white rounded-full shadow-xl flex items-center justify-center z-40 hover:bg-black transition-colors"
      >
        <Plus className="w-6 h-6" />
      </motion.button>

      {/* Modals */}
      <AnimatePresence>
        {showAddForm && <AddVendorForm onClose={() => setShowAddForm(false)} onSuccess={loadData} />}
        {paymentVendor && <PaymentModal vendor={paymentVendor} onClose={() => setPaymentVendor(null)} onSuccess={loadData} />}
        {showComparison && <VendorComparisonModal vendors={vendors} onClose={() => setShowComparison(false)} />}
        {editVendor && <EditVendorModal vendor={editVendor} onClose={() => setEditVendor(null)} onSuccess={loadData} />}
      </AnimatePresence>
    </div>
  );
}
