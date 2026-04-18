"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useTransition } from "react";
import { CheckCircle2, ListTodo, Search, AlertTriangle } from "lucide-react";
import { ChecklistTask, TaskPhase, TaskAssignee, ChecklistProgress } from "@/types/checklist.types";
import { getChecklist, getChecklistProgress } from "@/actions/checklist.actions";
import ChecklistOnboarding from "./ChecklistOnboarding";
import ProgressRing from "./ProgressRing";
import TaskCard from "./TaskCard";

const phases: TaskPhase[] = [
  "H-6 Bulan", "H-5 Bulan", "H-4 Bulan",
  "H-3 Bulan", "H-2 Bulan", "H-1 Bulan"
];

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

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [fetchedTasks, fetchedProgress] = await Promise.all([
      getChecklist(),
      getChecklistProgress(),
    ]);

    if (fetchedTasks.length === 0) {
      setNeedsOnboarding(true);
    } else {
      setTasks(fetchedTasks);
      setProgress(fetchedProgress);
      setNeedsOnboarding(false);
    }
    setIsLoading(false);
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
    return <ChecklistOnboarding onComplete={loadData} />;
  }

  const filteredTasks = tasks
    .filter((t) => t.phase_label === activePhase)
    .filter((t) => activeAssignee === "SEMUA" || t.assignee === activeAssignee);

  const totalCompleted = tasks.filter((t) => t.status === "SELESAI" || t.status === "SKIP").length;
  const totalTasks = tasks.length;
  const overallPercentage = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* ── Top Summary ── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-black/[0.06] flex flex-col md:flex-row gap-8 items-center">
        <div className="flex-shrink-0">
          <ProgressRing percentage={overallPercentage} completed={totalCompleted} total={totalTasks} />
        </div>
        <div className="flex-1 w-full">
          <h2 className="text-2xl font-serif font-bold text-[#1A1A1A] mb-4">Progress Persiapan</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {progress.map((p) => (
              <button
                key={p.phase}
                onClick={() => setActivePhase(p.phase)}
                className={`text-left p-3 rounded-xl border transition-all ${
                  activePhase === p.phase
                    ? "border-[#C8975A] bg-[#C8975A]/5 shadow-sm"
                    : "border-transparent bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <p className={`text-sm font-bold ${activePhase === p.phase ? "text-[#C8975A]" : "text-gray-600"}`}>
                  {p.phase}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2 mb-1">
                  <div
                    className="bg-[#C8975A] h-1.5 rounded-full"
                    style={{ width: `${p.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">{p.completed}/{p.total} Selesai</p>
              </button>
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
                <TaskCard key={task.task_id} task={task} onStatusChange={loadData} />
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
