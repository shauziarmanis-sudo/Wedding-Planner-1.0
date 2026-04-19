"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, AlertCircle, FileText, User, Users } from "lucide-react";
import { ChecklistDocument, DocStatus, DocParty } from "@/types/document.types";

interface DocumentCardProps {
  doc: ChecklistDocument;
  localStatus?: DocStatus;
  onUpdateLocalStatus: (id: string, status: DocStatus) => void;
  onDeleteCustom?: (id: string) => void;
}

const statusConfig: Record<DocStatus, { label: string; bg: string; text: string }> = {
  PENDING: { label: "Belum", bg: "bg-gray-100", text: "text-gray-600" },
  IN_PROGRESS: { label: "Proses", bg: "bg-blue-100", text: "text-blue-700" },
  DONE: { label: "Selesai", bg: "bg-green-100", text: "text-green-700" },
  NOT_APPLICABLE: { label: "N/A", bg: "bg-gray-50", text: "text-gray-400" },
};

const partyConfig: Record<DocParty, { label: string; icon: React.ElementType; color: string }> = {
  PRIA: { label: "Pria", icon: User, color: "text-blue-600 bg-blue-50" },
  WANITA: { label: "Wanita", icon: User, color: "text-pink-600 bg-pink-50" },
  BERSAMA: { label: "Bersama", icon: Users, color: "text-purple-600 bg-purple-50" },
  CUSTOM: { label: "Custom", icon: FileText, color: "text-orange-600 bg-orange-50" },
};

export default function DocumentCard({ doc, localStatus, onUpdateLocalStatus, onDeleteCustom }: DocumentCardProps) {
  const effectiveStatus = localStatus || doc.status;
  const isCompleted = effectiveStatus === "DONE";
  const isNA = effectiveStatus === "NOT_APPLICABLE";
  const isCustom = doc.party === "CUSTOM" || doc.doc_id.includes('_c_');

  const PartyIcon = partyConfig[doc.party]?.icon || FileText;

  function cycleStatus() {
    const next: DocStatus = effectiveStatus === "PENDING" ? "DONE" : effectiveStatus === "DONE" ? "PENDING" : "DONE";
    onUpdateLocalStatus(doc.doc_id, next);
  }

  const setStatus = (status: DocStatus) => onUpdateLocalStatus(doc.doc_id, status);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl border transition-all ${
        isCompleted ? "bg-green-50/50 border-green-200/50" :
        isNA ? "bg-gray-50/50 border-gray-200/50 opacity-60" :
        isCustom ? "bg-orange-50/20 border-orange-200/50" :
        "bg-white border-black/[0.06] hover:shadow-md hover:border-[#C8975A]/30"
      }`}
    >
      <div className="flex items-start gap-3">
        <button onClick={cycleStatus} className="mt-0.5 flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className="w-5 h-5 text-gray-300 hover:text-[#C8975A]" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${isCompleted || isNA ? "line-through text-gray-400" : "text-[#1A1A1A]"}`}>
            {doc.doc_name}
            {doc.is_required && !isCompleted && !isNA && (
              <span className="ml-2 inline-flex items-center text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                <AlertCircle className="w-3 h-3 mr-1" /> Wajib
              </span>
            )}
            {isCustom && (
              <span className="ml-2 inline-flex items-center text-[10px] text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                Custom
              </span>
            )}
          </p>
          
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${partyConfig[doc.party].color}`}>
              <PartyIcon className="w-3 h-3 mr-1" />
              {partyConfig[doc.party].label}
            </span>
            
            {(["PENDING", "IN_PROGRESS", "DONE", "NOT_APPLICABLE"] as DocStatus[]).map((s) => (
              <button key={s} onClick={() => setStatus(s)}
                className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors ${
                  effectiveStatus === s ? `${statusConfig[s].bg} ${statusConfig[s].text} ring-1 ring-current` : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                }`}
              >{statusConfig[s].label}</button>
            ))}
          </div>

          {doc.note && (
            <p className="mt-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg italic">
              "{doc.note}"
            </p>
          )}

          {isCustom && onDeleteCustom && (
            <div className="mt-3 flex justify-end">
              <button 
                onClick={() => onDeleteCustom(doc.doc_id)}
                className="text-xs text-red-500 hover:text-red-700 underline"
              >
                Hapus
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
