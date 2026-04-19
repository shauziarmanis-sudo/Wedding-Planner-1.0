"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Minus, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useTransition } from "react";
import { ChecklistTask, TaskStatus } from "@/types/checklist.types";
import { updateTaskStatus } from "@/actions/checklist.actions";
import { AdatBadge } from "./AdatBadge";

const statusConfig: Record<TaskStatus, { label: string; bg: string; text: string }> = {
  BELUM: { label: "Belum", bg: "bg-gray-100", text: "text-gray-600" },
  PROSES: { label: "Proses", bg: "bg-blue-100", text: "text-blue-700" },
  SELESAI: { label: "Selesai", bg: "bg-green-100", text: "text-green-700" },
  SKIP: { label: "Skip", bg: "bg-gray-50", text: "text-gray-400" },
};

const assigneeLabel: Record<string, string> = {
  PENGANTIN_PRIA: "👤 Pria",
  PENGANTIN_WANITA: "👰 Wanita",
  BERDUA: "💑 Berdua",
  KELUARGA: "👪 Keluarga",
};

const categoryEmoji: Record<string, string> = {
  VENUE: "🏛️", KATERING: "🍽️", DOKUMENTASI: "📸", BUSANA_RIAS: "👗",
  UNDANGAN: "💌", ADAT_PROSESI: "🎎", DOKUMEN_KUA: "📋", VENDOR_HIBURAN: "🎤",
  DEKOR_FLORIST: "🌸", TRANSPORTASI: "🚗", SESERAHAN_MAHAR: "🎁",
  HONEYMOON: "✈️", KESEHATAN: "💊", SOUVENIR: "🎀", RUNDOWN: "📝", KEUANGAN: "💰",
};

interface TaskCardProps {
  task: ChecklistTask;
  localStatus?: TaskStatus;
  onUpdateLocalStatus: (taskId: string, status: TaskStatus) => void;
}

export default function TaskCard({ task, localStatus, onUpdateLocalStatus }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const effectiveStatus = localStatus || task.status;
  const isCompleted = effectiveStatus === "SELESAI";
  const isSkipped = effectiveStatus === "SKIP";

  function cycleStatus() {
    const next: TaskStatus = effectiveStatus === "BELUM" ? "SELESAI" : effectiveStatus === "SELESAI" ? "BELUM" : "SELESAI";
    onUpdateLocalStatus(task.task_id, next);
  }

  function setStatus(status: TaskStatus) {
    onUpdateLocalStatus(task.task_id, status);
  }

  const cfg = statusConfig[effectiveStatus] || statusConfig["BELUM"];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border transition-all ${
        isCompleted ? "bg-green-50/50 border-green-200/50" :
        isSkipped ? "bg-gray-50/50 border-gray-200/50 opacity-60" :
        "bg-white border-black/[0.06] hover:shadow-md hover:border-[#C8975A]/30"
      }`}
    >
      <div className="flex items-start gap-3 p-4">
        {/* Checkbox */}
        <button onClick={cycleStatus} disabled={isPending} className="mt-0.5 flex-shrink-0">
          {isCompleted ? (
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          ) : (
            <Circle className={`w-5 h-5 ${isPending ? "text-gray-300 animate-pulse" : "text-gray-300 hover:text-[#C8975A]"}`} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className={`text-sm font-medium ${isCompleted ? "line-through text-gray-400" : isSkipped ? "line-through text-gray-400" : "text-[#1A1A1A]"}`}>
              {categoryEmoji[task.category] || "📌"} {task.title}
              {task.is_overdue && !isCompleted && !isSkipped && (
                <span className="ml-2 inline-flex items-center text-[10px] text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                  <Clock className="w-3 h-3 mr-1" /> Terlewat
                </span>
              )}
            </p>
            <button onClick={() => setExpanded(!expanded)} className="p-1 rounded hover:bg-black/5 flex-shrink-0">
              {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C8975A]/10 text-[#C8975A] font-medium">{assigneeLabel[task.assignee] || task.assignee}</span>
            {!task.is_required && <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Opsional</span>}
            <AdatBadge 
              adatTags={task.adat_tags || ["ALL"]} 
              isCustom={task.is_custom} 
              addedBySwitch={task.added_by_adat_switch} 
              compact={true} 
            />
          </div>

          {/* Expanded content */}
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 space-y-3">
              <p className="text-xs text-gray-500">{task.description}</p>
              {task.completed_at && <p className="text-[10px] text-green-600">✓ Selesai: {new Date(task.completed_at).toLocaleDateString("id-ID")}</p>}
              <div className="flex gap-1.5">
                {(["BELUM", "PROSES", "SELESAI", "SKIP"] as TaskStatus[]).map((s) => (
                  <button key={s} onClick={() => setStatus(s)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-colors ${
                      effectiveStatus === s ? `${statusConfig[s].bg} ${statusConfig[s].text} ring-1 ring-current` : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                    }`}
                  >{statusConfig[s].label}</button>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
