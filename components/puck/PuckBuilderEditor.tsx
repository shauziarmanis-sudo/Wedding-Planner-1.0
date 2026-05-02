"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Puck } from "@puckeditor/core";
import type { Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import { puckConfig } from "@/lib/puck/puck.config";
import { getPuckDataForEditor, savePuckData, publishPuckInvitation } from "@/actions/puck.actions";
import { Loader2, Save, Globe, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

// ── Default empty Puck data ──────────────────────────────────────
const EMPTY_PUCK_DATA: Data = {
  root: { props: {} },
  content: [],
  zones: {},
};

// ── Status badge component ───────────────────────────────────────
function StatusBadge({ saving, lastSaved }: { saving: boolean; lastSaved: string | null }) {
  if (saving) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full">
        <Loader2 className="w-3 h-3 animate-spin" />
        Menyimpan...
      </div>
    );
  }
  if (lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
        <CheckCircle className="w-3 h-3" />
        Tersimpan {lastSaved}
      </div>
    );
  }
  return null;
}

// ── Main Editor Component ────────────────────────────────────────
export default function PuckBuilderEditor() {
  const [initialData, setInitialData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slug, setSlug] = useState<string>("");
  const [isPublished, setIsPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // Debounce timer ref for auto-save
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ── Load existing data ──
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const result = await getPuckDataForEditor();
      if (result.success && result.data) {
        setInitialData(result.data.puckData || EMPTY_PUCK_DATA);
        setSlug(result.data.slug);
        setIsPublished(result.data.isPublished);
      } else {
        setError(result.error || "Gagal memuat data editor");
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // ── Auto-save handler (debounced) ──
  const handleChange = useCallback(
    (data: Data) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        setSaving(true);
        const result = await savePuckData(data);
        setSaving(false);
        if (result.success) {
          const now = new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
          setLastSaved(now);
        }
      }, 2000); // 2 detik debounce
    },
    []
  );

  // ── Publish handler (onPublish callback from Puck) ──
  const handlePublish = useCallback(
    async (data: Data) => {
      setPublishing(true);

      // Save dulu sebelum publish
      const saveResult = await savePuckData(data);
      if (!saveResult.success) {
        toast.error("Gagal menyimpan. Coba lagi.");
        setPublishing(false);
        return;
      }

      const publishResult = await publishPuckInvitation();
      setPublishing(false);

      if (publishResult.success && publishResult.data) {
        setIsPublished(true);
        toast.success(
          <div>
            <p className="font-semibold">Undangan Berhasil Dipublikasikan! 🎉</p>
            <p className="text-xs mt-1 opacity-70">{publishResult.data.publicUrl}</p>
          </div>,
          { duration: 5000 }
        );
      } else {
        toast.error(publishResult.error || "Gagal mempublikasikan undangan");
      }
    },
    []
  );

  // ── Import JSON handler ──
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.content) {
          setInitialData(json);
          // Set as modified to trigger save
          handleChange(json);
          toast.success("Berhasil mengimpor template!");
        } else {
          toast.error("Format JSON tidak valid untuk Puck");
        }
      } catch (err) {
        toast.error("Gagal membaca file JSON");
      }
    };
    reader.readAsText(file);
    // reset input
    e.target.value = '';
  };

  // ── Loading state ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-indigo-500" />
          <p className="text-sm text-gray-500 font-medium">Memuat Builder...</p>
        </div>
      </div>
    );
  }

  // ── Error state ──
  if (error || !initialData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-4 max-w-md px-6">
          <AlertCircle className="w-12 h-12 mx-auto text-red-400" />
          <h2 className="text-lg font-semibold text-gray-800">Tidak Dapat Membuka Builder</h2>
          <p className="text-sm text-gray-500">{error || "Data tidak ditemukan. Pastikan Anda sudah membuat undangan terlebih dahulu."}</p>
          <a
            href="/dashboard"
            className="inline-block mt-4 px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Kembali ke Dashboard
          </a>
        </div>
      </div>
    );
  }

  // ── Editor UI ──
  return (
    <div className="h-screen flex flex-col">
      {/* Top bar */}
      <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0 z-50">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
            ← Dashboard
          </a>
          <span className="text-gray-300">|</span>
          <span className="text-sm font-semibold text-gray-700">Visual Builder</span>
          {isPublished && (
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
              Published
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <StatusBadge saving={saving} lastSaved={lastSaved} />
          
          <label className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer flex items-center gap-1 font-medium bg-gray-100 px-3 py-1.5 rounded-full hover:bg-gray-200 transition-colors">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Import JSON
            <input
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleImportJson}
            />
          </label>

          {slug && (
            <a
              href={`/i/${slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-indigo-600 hover:underline flex items-center gap-1 font-medium ml-2"
            >
              <Globe className="w-3 h-3" /> Lihat Live
            </a>
          )}
        </div>
      </div>

      {/* Puck Editor */}
      <div className="flex-1 overflow-hidden">
        <Puck
          key={initialData === EMPTY_PUCK_DATA ? "empty" : "loaded"} // force remount occasionally if needed, puck usually handles data prop changes
          config={puckConfig}
          data={initialData}
          onChange={handleChange}
          onPublish={handlePublish}
        />
      </div>
    </div>
  );
}
