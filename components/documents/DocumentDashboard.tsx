"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Save, Plus, Loader2, Info, FileText } from "lucide-react";
import { ChecklistDocument, DocStatus, Religion } from "@/types/document.types";
import { getDocuments, initDocuments, batchUpdateDocumentStatus, deleteDocument } from "@/actions/document.actions";
import ReligionSelector from "./ReligionSelector";
import DocumentCard from "./DocumentCard";
import CustomDocModal from "./CustomDocModal";
import { Button } from "@/components/ui/button";

interface DocumentDashboardProps {
  initialReligion: string | null;
}

export default function DocumentDashboard({ initialReligion }: DocumentDashboardProps) {
  const [religion, setReligion] = useState<Religion | null>((initialReligion as Religion) || null);
  const [docs, setDocs] = useState<ChecklistDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [localStatuses, setLocalStatuses] = useState<Record<string, DocStatus>>({});
  const [showCustomModal, setShowCustomModal] = useState(false);

  useEffect(() => {
    if (religion) {
      fetchDocs();
    } else {
      setLoading(false);
    }
  }, [religion]);

  const fetchDocs = async () => {
    setLoading(true);
    const res = await getDocuments();
    if (res.success && res.data) {
      if (res.data.length === 0 && religion) {
        // Init if empty but religion is selected
        await handleReligionSelect(religion);
      } else {
        setDocs(res.data);
      }
    }
    setLoading(false);
  };

  const handleReligionSelect = async (selected: Religion) => {
    const res = await initDocuments(selected);
    if (res.success) {
      setReligion(selected);
      const docsRes = await getDocuments();
      if (docsRes.success && docsRes.data) {
        setDocs(docsRes.data);
      }
    } else {
      alert("Gagal menginisiasi dokumen: " + res.error);
    }
  };

  const handleUpdateLocalStatus = (id: string, status: DocStatus) => {
    setLocalStatuses(prev => ({ ...prev, [id]: status }));
  };

  const pendingUpdatesCount = Object.keys(localStatuses).filter(
    id => localStatuses[id] !== docs.find(d => d.doc_id === id)?.status
  ).length;

  const handleSave = async () => {
    if (pendingUpdatesCount === 0) return;
    setSaving(true);
    
    const updates = Object.entries(localStatuses).map(([id, status]) => ({ id, status }));
    const res = await batchUpdateDocumentStatus(updates);
    
    if (res.success) {
      // Update local state
      setDocs(docs.map(d => localStatuses[d.doc_id] ? { ...d, status: localStatuses[d.doc_id] } : d));
      setLocalStatuses({});
    } else {
      alert("Gagal menyimpan dokumen: " + res.error);
    }
    setSaving(false);
  };

  const handleDeleteCustom = async (id: string) => {
    if (!confirm("Hapus dokumen custom ini?")) return;
    const res = await deleteDocument(id);
    if (res.success) {
      setDocs(docs.filter(d => d.doc_id !== id));
      const newLocal = { ...localStatuses };
      delete newLocal[id];
      setLocalStatuses(newLocal);
    } else {
      alert("Gagal menghapus dokumen");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#C8975A]" />
      </div>
    );
  }

  if (!religion || docs.length === 0) {
    return <ReligionSelector onSelect={handleReligionSelect} />;
  }

  // Group by category
  const categories = Array.from(new Set(docs.map(d => d.category)));
  const completedCount = docs.filter(d => (localStatuses[d.doc_id] || d.status) === 'DONE').length;
  const progressPercent = Math.round((completedCount / docs.length) * 100) || 0;

  return (
    <div className="pb-24">
      {/* Header Info */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C8975A]/5 rounded-bl-full -z-0"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-serif text-[#1A1A1A]">Pemberkasan Dokumen</h2>
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <Info className="w-4 h-4 mr-1" />
              Sistem pencatatan disesuaikan dengan agama: <strong className="ml-1 text-[#C8975A]">{religion}</strong>
            </p>
          </div>
          
          <div className="flex flex-col items-end">
            <span className="text-3xl font-bold text-[#C8975A]">{progressPercent}%</span>
            <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">Selesai</span>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full mt-4 overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-[#C8975A] rounded-full"
          />
        </div>
      </div>

      {/* Document Lists by Category */}
      <div className="space-y-8">
        {categories.map(category => {
          const categoryDocs = docs.filter(d => d.category === category);
          return (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-gray-900 border-b pb-2 flex justify-between items-end">
                {category}
                <span className="text-xs font-normal text-gray-400">
                  {categoryDocs.filter(d => (localStatuses[d.doc_id] || d.status) === 'DONE').length} / {categoryDocs.length}
                </span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categoryDocs.map(doc => (
                  <DocumentCard 
                    key={doc.doc_id} 
                    doc={doc} 
                    localStatus={localStatuses[doc.doc_id]}
                    onUpdateLocalStatus={handleUpdateLocalStatus}
                    onDeleteCustom={doc.party === 'CUSTOM' || doc.doc_id.includes('_c_') ? handleDeleteCustom : undefined}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Custom Button */}
      <div className="mt-8 border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
        <div className="w-12 h-12 rounded-full bg-orange-50 flex items-center justify-center mb-3">
          <FileText className="w-6 h-6 text-orange-500" />
        </div>
        <h4 className="font-semibold text-gray-900 mb-1">Ada dokumen lain yang perlu diurus?</h4>
        <p className="text-sm text-gray-500 mb-4 max-w-sm">
          Tambahkan dokumen custom jika ada persyaratan khusus dari instansi, keluarga, atau tempat ibadah Anda.
        </p>
        <Button onClick={() => setShowCustomModal(true)} variant="outline" className="rounded-full border-orange-200 text-orange-700 hover:bg-orange-50">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Dokumen Custom
        </Button>
      </div>

      {showCustomModal && (
        <CustomDocModal 
          religion={religion}
          existingCategories={categories}
          onClose={() => setShowCustomModal(false)}
          onSuccess={() => {
            setShowCustomModal(false);
            fetchDocs(); // Refresh docs
          }}
        />
      )}

      {/* Floating Save Button */}
      <AnimatePresence>
        {pendingUpdatesCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4"
          >
            <div className="bg-white rounded-full shadow-lg shadow-black/10 border p-2 flex items-center gap-4 pl-6">
              <span className="text-sm font-medium text-gray-600">
                <strong className="text-[#1A1A1A]">{pendingUpdatesCount}</strong> perubahan belum disimpan
              </span>
              <Button 
                onClick={handleSave} 
                disabled={saving}
                className="rounded-full bg-[#1A1A1A] hover:bg-[#333333] text-white px-6"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Perubahan
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

