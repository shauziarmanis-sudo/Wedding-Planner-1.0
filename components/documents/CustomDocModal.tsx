"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { Religion, DocParty } from "@/types/document.types";
import { addCustomDocument } from "@/actions/document.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CustomDocModalProps {
  religion: Religion;
  existingCategories: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function CustomDocModal({ religion, existingCategories, onClose, onSuccess }: CustomDocModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    doc_name: "",
    category: existingCategories[0] || "DOKUMEN TAMBAHAN",
    isNewCategory: false,
    newCategory: "",
    party: "BERSAMA" as DocParty,
    is_required: true,
    note: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.doc_name.trim()) {
      alert("Nama dokumen wajib diisi");
      return;
    }

    const finalCategory = formData.isNewCategory ? formData.newCategory : formData.category;
    if (!finalCategory.trim()) {
      alert("Kategori wajib diisi");
      return;
    }

    setLoading(true);
    const res = await addCustomDocument({
      religion,
      party: formData.party,
      category: finalCategory.toUpperCase(),
      doc_name: formData.doc_name,
      is_required: formData.is_required,
      note: formData.note
    });

    if (res.success) {
      onSuccess();
    } else {
      alert(res.error || "Gagal menambahkan dokumen custom");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg text-[#1A1A1A]">Tambah Dokumen Custom</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Dokumen *</label>
            <Input 
              value={formData.doc_name} 
              onChange={e => setFormData({ ...formData, doc_name: e.target.value })}
              placeholder="Contoh: Surat Izin Atasan"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
            {formData.isNewCategory ? (
              <div className="flex gap-2">
                <Input 
                  value={formData.newCategory} 
                  onChange={e => setFormData({ ...formData, newCategory: e.target.value })}
                  placeholder="Ketik kategori baru"
                />
                <Button type="button" variant="outline" onClick={() => setFormData({ ...formData, isNewCategory: false })}>Batal</Button>
              </div>
            ) : (
              <select 
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.category}
                onChange={e => {
                  if (e.target.value === "NEW") {
                    setFormData({ ...formData, isNewCategory: true });
                  } else {
                    setFormData({ ...formData, category: e.target.value });
                  }
                }}
              >
                {existingCategories.map(c => <option key={c} value={c}>{c}</option>)}
                <option value="NEW">+ Kategori Baru</option>
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Untuk Siapa</label>
            <select 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={formData.party}
              onChange={e => setFormData({ ...formData, party: e.target.value as DocParty })}
            >
              <option value="PRIA">Calon Pengantin Pria</option>
              <option value="WANITA">Calon Pengantin Wanita</option>
              <option value="BERSAMA">Bersama</option>
            </select>
          </div>

          <div className="flex items-center gap-2 mt-2">
            <input 
              type="checkbox" 
              id="is_required"
              checked={formData.is_required}
              onChange={e => setFormData({ ...formData, is_required: e.target.checked })}
              className="rounded border-gray-300 text-[#C8975A] focus:ring-[#C8975A]"
            />
            <label htmlFor="is_required" className="text-sm font-medium text-gray-700">Wajib Dipenuhi</label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catatan (Opsional)</label>
            <textarea 
              value={formData.note}
              onChange={e => setFormData({ ...formData, note: e.target.value })}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Misal: Fotokopi legalisir 2 rangkap"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full bg-[#1A1A1A] hover:bg-[#333333]">
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Simpan Dokumen
          </Button>
        </form>
      </div>
    </div>
  );
}
