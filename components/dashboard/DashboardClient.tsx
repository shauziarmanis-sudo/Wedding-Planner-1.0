"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signOut } from "next-auth/react";
import { Heart, Users, Wallet, LogOut } from "lucide-react";
import WeddingDashboard from "./WeddingDashboard";
import GuestListView from "./GuestListView";
import FinanceDashboard from "./FinanceDashboard";

type TabKey = "wedding" | "guests" | "finance";

interface Props {
  userName: string;
  userEmail: string;
  userImage?: string;
  status: "WEDDING" | "MARRIED";
}

const tabs = [
  { key: "wedding" as TabKey, label: "Wedding Planner", icon: Heart },
  { key: "guests" as TabKey, label: "Guest List", icon: Users },
  { key: "finance" as TabKey, label: "Keuangan Keluarga", icon: Wallet },
];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

export default function DashboardClient({ userName, userEmail, userImage, status }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>(status === "MARRIED" ? "finance" : "wedding");

  return (
    <div className="min-h-screen bg-[#FFF8E1]">
      {/* ── Glassmorphism Navbar ── */}
      <header className="sticky top-0 z-50 glass-strong border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Heart className="w-6 h-6 text-[#C2185B] fill-[#C2185B]" />
              <span className="font-serif text-xl font-bold text-[#C2185B]">Life-Start</span>
            </div>

            {/* Tab Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-black/[0.03] rounded-full p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
                      isActive ? "text-white" : "text-[#212121]/60 hover:text-[#212121]"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-[#C2185B] to-[#E91E63] rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-semibold text-[#212121]">{userName}</p>
                <p className="text-xs text-[#212121]/50">{userEmail}</p>
              </div>
              {userImage ? (
                <img src={userImage} alt={userName} className="w-9 h-9 rounded-full border-2 border-[#E91E63]/30" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C2185B] to-[#E91E63] flex items-center justify-center text-white font-bold text-sm">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg text-[#212121]/40 hover:text-[#C2185B] hover:bg-[#C2185B]/5 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mobile Tab Navigation */}
          <div className="flex md:hidden gap-1 pb-3 overflow-x-auto">
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

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {activeTab === "guests" && <GuestListView />}
            {activeTab === "finance" && <FinanceDashboard />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
