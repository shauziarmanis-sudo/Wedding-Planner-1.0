"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Heart, Users, Wallet, LogOut, ListTodo, Store, FileText } from "lucide-react";
import WeddingDashboard from "./WeddingDashboard";
import GuestListView from "./GuestListView";
import FinanceDashboard from "./FinanceDashboard";
import ChecklistDashboard from "../checklist/ChecklistDashboard";
import BudgetDashboard from "../budget/BudgetDashboard";
import DocumentDashboard from "../documents/DocumentDashboard";

type TabKey = "wedding" | "checklist" | "documents" | "budget" | "guests" | "finance";

interface Props {
  userName: string;
  userEmail: string;
  userImage?: string;
  status: "WEDDING" | "MARRIED";
  initialReligion: string | null;
}

const tabs = [
  { key: "wedding" as TabKey, label: "Overview", icon: Heart },
  { key: "checklist" as TabKey, label: "Checklist", icon: ListTodo },
  { key: "documents" as TabKey, label: "Dokumen Resmi", icon: FileText },
  { key: "budget" as TabKey, label: "Vendor & Budget", icon: Store },
  { key: "guests" as TabKey, label: "Guest List", icon: Users },
  { key: "finance" as TabKey, label: "Keuangan", icon: Wallet },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

export default function DashboardClient({ userName, userEmail, userImage, status, initialReligion }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>(status === "MARRIED" ? "finance" : "wedding");

  return (
    <div className="min-h-screen bg-[#FFF8E1] flex flex-col md:flex-row">
      {/* ── Mobile Header ── */}
      <header className="md:hidden sticky top-0 z-50 glass-strong border-b border-black/5 shadow-sm">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#C2185B] fill-[#C2185B]" />
              <span className="font-serif text-xl font-bold text-[#C2185B]">Life-Start</span>
            </div>
            
            <div className="flex items-center gap-3">
              {userImage ? (
                <img src={userImage} alt={userName} className="w-8 h-8 rounded-full border-2 border-[#E91E63]/30" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C2185B] to-[#E91E63] flex items-center justify-center text-white font-bold text-xs">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 rounded-lg text-[#212121]/40 hover:text-[#C2185B] transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex gap-1 pb-3 overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-gradient-to-r from-[#C2185B] to-[#E91E63] text-white"
                      : "bg-black/[0.03] text-[#212121]/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-black/5 shadow-sm sticky top-0 h-screen shrink-0">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Heart className="w-8 h-8 text-[#C2185B] fill-[#C2185B]" />
            <span className="font-serif text-2xl font-bold text-[#C2185B]">Life-Start</span>
          </div>
          
          <nav className="space-y-1.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center w-full gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive ? "text-white shadow-md shadow-pink-500/20" : "text-[#212121]/60 hover:bg-black/5 hover:text-[#212121]"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="desktopActiveTab"
                      className="absolute inset-0 bg-gradient-to-r from-[#C2185B] to-[#E91E63] rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-black/5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-50/50">
            {userImage ? (
              <img src={userImage} alt={userName} className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#C2185B] to-[#E91E63] flex items-center justify-center text-white font-bold shadow-sm">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#212121] truncate">{userName}</p>
              <p className="text-xs text-[#212121]/50 truncate">{userEmail}</p>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <main className="flex-1 w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {activeTab === "wedding" && <WeddingDashboard />}
              {activeTab === "checklist" && <ChecklistDashboard />}
              {activeTab === "documents" && <DocumentDashboard initialReligion={initialReligion} />}
              {activeTab === "budget" && <BudgetDashboard />}
              {activeTab === "guests" && <GuestListView />}
              {activeTab === "finance" && <FinanceDashboard />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
