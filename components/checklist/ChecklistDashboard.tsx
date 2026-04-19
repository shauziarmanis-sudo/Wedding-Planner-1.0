"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, ListTodo, Search, AlertTriangle, Edit2, Check, X, Settings2 } from "lucide-react";
import { ChecklistTask, TaskPhase, TaskAssignee, ChecklistProgress, UserProfile } from "@/types/checklist.types";
import { getChecklist, getChecklistProgress, renamePhase, batchUpdateTaskStatus } from "@/actions/checklist.actions";
import { getMetadata } from "@/actions/metadata";
import AdatOnboarding from "./AdatOnboarding";
import { AdatSwitcherModal } from "./AdatSwitcherModal";
import { AdatInfoCard } from "./AdatInfoCard";
import ProgressRing from "./ProgressRing";
import TaskCard from "./TaskCard";
import { Button } from "@/components/ui/button";

const assignees: { label: string; value: TaskAssignee | "SEMUA" }[] = [
  { label: "Semua", value: "SEMUA" },
  { label: "Pria", value: "PENGANTIN_PRIA" },
  { label: "Wanita", value: "PENGANTIN_WANITA" },
  { label: "Berdua", value: "BERDUA" },
  { label: "Keluarga", value: "KELUARGA" },
];

export default function ChecklistDashboard() {
  const [tasks, setTasks] = useState<ChecklistTask[]>([]);
  const [progress, setProgress] = useState<ChecklistProgress[]>([]);
  const [activePhase, setActivePhase] = useState<TaskPhase>("H-6 Bulan");
  const [activeAssignee, setActiveAssignee] = useState<TaskAssignee | "SEMUA">("SEMUA");
  const [isLoading, setIsLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [metadata, setMetadata] = useState<any>(null);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  // Rename state
  const [editingPhase, setEditingPhase] = useState<TaskPhase | null>(null);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [isPending, startTransition] = useTransition();

  // Local state for batch saving
  const [pendingUpdates, setPendingUpdates] = useState<Record<string, TaskStatus>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [fetchedTasks, progressData, fetchedMetadata] = await Promise.all([
      getChecklist(),
      getChecklistProgress(),
      getMetadata(),
    ]);

    if (fetchedTasks.length === 0) {
      setNeedsOnboarding(true);
    } else {
      setTasks(fetchedTasks);
      setProgress(progressData.by_phase);
      setMetadata(fetchedMetadata);
      // Ensure activePhase is still valid, else default to first
      if (progressData.by_phase.length > 0 && !progressData.by_phase.find(p => p.phase === activePhase)) {
        setActivePhase(progressData.by_phase[0].phase);
      }
      setNeedsOnboarding(false);
    }
    setIsLoading(false);
  }

  async function handleRename(oldPhase: string) {
    if (!newPhaseName || newPhaseName.trim() === "" || newPhaseName === oldPhase) {
      setEditingPhase(null);
      return;
    }
    
    startTransition(async () => {
      await renamePhase(oldPhase, newPhaseName.trim());
      setEditingPhase(null);
      if (activePhase === oldPhase) {
        setActivePhase(newPhaseName.trim() as TaskPhase);
      }
      await loadData();
    });
  }

  function handleUpdateLocalStatus(taskId: string, status: TaskStatus) {
    setPendingUpdates((prev) => {
      const next = { ...prev };
      if (tasks.find(t => t.task_id === taskId)?.status === status) {
        delete next[taskId];
      } else {
        next[taskId] = status;
      }
      return next;
    });
  }

  async function handleBatchSave() {
    setIsSaving(true);
    const updates = Object.entries(pendingUpdates).map(([task_id, status]) => ({ task_id, status }));
    const res = await batchUpdateTaskStatus(updates);
    if (res.success) {
      setPendingUpdates({});
      await loadData();
    }
    setIsSaving(false);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-50">
        <ListTodo className="w-12 h-12 text-[#C8975A] animate-pulse mb-4" />
        <p className="text-gray-500 font-medium">Memuat Checklist...</p>
      </div>
    );
  }

  if (needsOnboarding) {
    return <AdatOnboarding onComplete={loadData} />;
  }

  const localTasks = tasks.map(t => ({ ...t, status: pendingUpdates[t.task_id] || t.status }));

  const filteredTasks = localTasks
    .filter((t) => t.phase_label === activePhase)
    .filter((t) => activeAssignee === "SEMUA" || t.assignee === activeAssignee);

  const totalCompleted = localTasks.filter((t) => t.status === "SELESAI" || t.status === "SKIP").length;
  const totalTasks = localTasks.length;
  const overallPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  const localProgress = progress.map(p => {
    const phaseTasks = localTasks.filter(t => t.phase_label === p.phase);
    const completed = phaseTasks.filter(t => t.status === "SELESAI" || t.status === "SKIP").length;
    const percentage = phaseTasks.length > 0 ? Math.round((completed / phaseTasks.length) * 100) : 0;
    return { ...p, completed, percentage };
  });

  const hasPendingUpdates = Object.keys(pendingUpdates).length > 0;

  return (
    <div className="space-y-8">
      {/* ── Adat Header ── */}
      {(metadata?.adat_type || tasks.length > 0) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
          <div className="flex-1 max-w-2xl">
            <AdatInfoCard adat={metadata?.adat_type || "MODERN"} secondaryAdat={metadata?.adat_secondary} />
          </div>
          <Button variant="outline" onClick={() => setIsSwitcherOpen(true)} className="shrink-0 gap-2">
            <Settings2 className="w-4 h-4" />
            Ganti Adat
          </Button>
          
          <AdatSwitcherModal 
            isOpen={isSwitcherOpen} 
            onClose={() => setIsSwitcherOpen(false)} 
            currentAdat={metadata?.adat_type || "MODERN"}
            currentSecondary={metadata?.adat_secondary}
            onSuccess={loadData}
          />
        </div>
      )}

      {/* ── Top Summary ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.06] flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-shrink-0">
          <ProgressRing percentage={overallPercentage} completed={totalCompleted} total={totalTasks} />
        </div>
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-4">Progress Persiapan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {localProgress.map((p) => (
              <div
                key={p.phase}
                onClick={() => {
                  if (editingPhase !== p.phase) setActivePhase(p.phase);
                }}
                className={`relative text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  activePhase === p.phase
                    ? "border-[#C8975A] bg-[#C8975A]/5 shadow-sm"
                    : "border-transparent bg-gray-50 hover:bg-gray-100"
                } ${isPending ? "opacity-50 pointer-events-none" : ""}`}
              >
                {editingPhase === p.phase ? (
                  <div className="flex items-center gap-1 mb-1">
                    <input
                      autoFocus
                      type="text"
                      value={newPhaseName}
                      onChange={(e) => setNewPhaseName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleRename(p.phase)}
                      className="w-full px-2 py-0.5 text-sm font-bold text-[#1A1A1A] bg-white border border-[#C8975A] rounded focus:outline-none"
                    />
                    <button onClick={(e) => { e.stopPropagation(); handleRename(p.phase); }} className="text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setEditingPhase(null); }} className="text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mb-1 group">
                    <p className={`text-sm font-bold ${activePhase === p.phase ? "text-[#C8975A]" : "text-gray-600"}`}>
                      {p.phase}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPhase(p.phase);
                        setNewPhaseName(p.phase);
                      }}
                      className={`p-1 rounded text-gray-400 hover:text-[#C8975A] hover:bg-black/5 ${activePhase === p.phase ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
                      title="Edit Timeline"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                  <div
                    className="bg-[#C8975A] h-1.5 rounded-full"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{p.completed}/{p.total} Selesai</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Task List Area ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-black/[0.06] overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-black/[0.06] bg-gray-50 flex flex-wrap gap-2">
          {assignees.map((a) => (
            <button
              key={a.value}
              onClick={() => setActiveAssignee(a.value)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                activeAssignee === a.value
                  ? "bg-[#1A1A1A] text-white"
                  : "bg-white text-gray-600 border hover:border-gray-300"
              }`}
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Tasks */}
        <div className="p-4 space-y-3 bg-[#FAFAF8] min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredTasks.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Tidak ada tugas untuk filter ini.</p>
              </motion.div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard 
                  key={task.task_id} 
                  task={task} 
                  localStatus={pendingUpdates[task.task_id]}
                  onUpdateLocalStatus={handleUpdateLocalStatus}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Sticky Save Button ── */}
      <AnimatePresence>
        {hasPendingUpdates && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4"
          >
            <div className="bg-white rounded-full shadow-xl border border-gray-200 p-2 pr-4 pl-6 flex items-center gap-4 max-w-sm w-full mx-auto justify-between">
              <span className="text-sm font-medium text-gray-700">
                {Object.keys(pendingUpdates).length} perubahan belum disimpan
              </span>
              <Button 
                onClick={handleBatchSave} 
                disabled={isSaving}
                className="rounded-full px-6"
              >
                {isSaving ? "Menyimpan..." : "Simpan Checklist"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
