"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Users, CheckCircle2, Clock, Wallet,
  Plus, Send, MoreHorizontal, Copy, MessageCircle, Edit2, Trash2,
  ChevronDown, FileSpreadsheet, UserPlus,
} from "lucide-react";
import { Guest, GuestStats, GuestCategory } from "@/types/guest.types";
import { getGuests, getGuestStats, deleteGuest, markBulkInvitationSent } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GiftRecordModal from "./GiftRecordModal";
import AddGuestModal from "./AddGuestModal";
import EditGuestModal from "./EditGuestModal";
import ImportExcelModal from "./ImportExcelModal";
import BulkSendModal from "./BulkSendModal";
import toast from "react-hot-toast";

interface Props {
  initialGuests: Guest[];
  initialStats: GuestStats;
  token: string;
  metadata: any;
}

const CATEGORIES: { id: GuestCategory; label: string }[] = [
  { id: 'KELUARGA_PRIA', label: 'Keluarga Pria' },
  { id: 'KELUARGA_WANITA', label: 'Keluarga Wanita' },
  { id: 'SAHABAT', label: 'Sahabat' },
  { id: 'REKAN_KERJA', label: 'Rekan Kerja' },
  { id: 'KENALAN', label: 'Kenalan' },
  { id: 'VIP', label: 'VIP' },
];

const CATEGORY_COLORS: Record<GuestCategory, string> = {
  KELUARGA_PRIA: 'bg-blue-50 text-blue-600',
  KELUARGA_WANITA: 'bg-pink-50 text-pink-600',
  SAHABAT: 'bg-green-50 text-green-600',
  REKAN_KERJA: 'bg-purple-50 text-purple-600',
  KENALAN: 'bg-gray-50 text-gray-500',
  VIP: 'bg-amber-50 text-amber-600',
};

const RSVP_DOT: Record<string, string> = {
  HADIR: 'bg-green-500',
  TIDAK_HADIR: 'bg-red-500',
  RAGU: 'bg-amber-500',
  BELUM_KONFIRMASI: 'bg-gray-300',
};

const RSVP_LABEL: Record<string, string> = {
  HADIR: 'Hadir',
  TIDAK_HADIR: 'Tidak Hadir',
  RAGU: 'Ragu',
  BELUM_KONFIRMASI: 'Belum',
};

export default function GuestDashboardClient({ initialGuests, initialStats, token, metadata }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [stats, setStats] = useState<GuestStats>(initialStats);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GuestCategory | 'ALL'>('ALL');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Modal states
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBulkSendModal, setShowBulkSendModal] = useState(false);
  const [selectedGuestForGift, setSelectedGuestForGift] = useState<Guest | null>(null);
  const [selectedGuestForEdit, setSelectedGuestForEdit] = useState<Guest | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);

  const addDropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (addDropdownRef.current && !addDropdownRef.current.contains(e.target as Node)) {
        setShowAddDropdown(false);
      }
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const refresh = async () => {
    const [g, s] = await Promise.all([getGuests(), getGuestStats()]);
    setGuests(g);
    setStats(s);
  };

  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.phone_wa.includes(search);
    const matchCat = activeCategory === 'ALL' || g.category === activeCategory;
    return matchSearch && matchCat;
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus tamu ini? Tindakan ini tidak bisa dibatalkan.")) return;
    try {
      await deleteGuest(id);
      setGuests(prev => prev.filter(g => g.guest_id !== id));
      toast.success("Tamu berhasil dihapus.");
      refresh();
    } catch {
      toast.error("Gagal menghapus tamu.");
    }
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/invitation/${id}?t=${token}`;
    navigator.clipboard.writeText(link);
    toast.success("Link undangan berhasil disalin!");
    setOpenActionMenu(null);
  };

  const openWA = async (guest: Guest) => {
    const link = `${window.location.origin}/invitation/${guest.guest_id}?t=${token}`;
    const text = `Kepada Yth. Bapak/Ibu/Saudara/i ${guest.name}\n\nKami mengundang Anda pada acara pernikahan kami. Konfirmasi kehadiran Anda melalui link ini: ${link}`;
    window.open(`https://wa.me/${guest.phone_wa}?text=${encodeURIComponent(text)}`, '_blank');
    await markBulkInvitationSent([guest.guest_id]);
    setGuests(prev => prev.map(g => g.guest_id === guest.guest_id ? { ...g, invitation_sent: true, invitation_sent_at: new Date().toISOString() } : g));
    toast.success(`Undangan untuk ${guest.name} dibuka di WA.`);
    setOpenActionMenu(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredGuests.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map(g => g.guest_id)));
    }
  };

  const handleAddSuccess = (newGuest: Guest) => {
    setGuests(prev => [newGuest, ...prev]);
    setShowAddModal(false);
    refresh();
  };

  const handleEditSuccess = (updated: Guest) => {
    setGuests(prev => prev.map(g => g.guest_id === updated.guest_id ? updated : g));
    setSelectedGuestForEdit(null);
    refresh();
  };

  const handleBulkSendComplete = (sentIds: string[], skippedIds: string[]) => {
    setShowBulkSendModal(false);
    if (sentIds.length > 0) {
      setGuests(prev => prev.map(g =>
        sentIds.includes(g.guest_id) ? { ...g, invitation_sent: true, invitation_sent_at: new Date().toISOString() } : g
      ));
      toast.success(`${sentIds.length} undangan berhasil dikirim!`);
    }
    refresh();
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#1A1A1A]">Daftar Tamu <span className="text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full align-middle ml-2">v2.0 REBUILT</span></h1>
          <p className="text-sm text-gray-500 mt-1">{stats.total_guests} tamu terdaftar</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Add Dropdown */}
          <div className="relative" ref={addDropdownRef}>
            <Button
              onClick={() => setShowAddDropdown(!showAddDropdown)}
              className="rounded-xl h-11 bg-[#1A1A1A] hover:bg-[#333] text-white px-4"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Tamu
              <ChevronDown className="w-3.5 h-3.5 ml-2" />
            </Button>
            <AnimatePresence>
              {showAddDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-30"
                >
                  <button
                    onClick={() => { setShowAddDropdown(false); setShowAddModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-sm"
                  >
                    <UserPlus className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Isi Manual</span>
                  </button>
                  <button
                    onClick={() => { setShowAddDropdown(false); setShowImportModal(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-sm border-t border-gray-50"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">Import Excel</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bulk Send Button */}
          <Button
            onClick={() => setShowBulkSendModal(true)}
            className="rounded-xl h-11 bg-[#C8975A] hover:bg-[#B68649] text-white px-4"
          >
            <Send className="w-4 h-4 mr-2" />
            Kirim Undangan
          </Button>
        </div>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Tamu', value: stats.total_guests, sub: `${stats.total_pax_estimate} Pax`, icon: Users, iconBg: 'bg-purple-50', iconColor: 'text-purple-600' },
          { label: 'Hadir', value: stats.total_pax_confirmed, sub: 'Pax konfirmasi', icon: CheckCircle2, iconBg: 'bg-green-50', iconColor: 'text-green-600' },
          { label: 'Belum RSVP', value: stats.rsvp_belum, sub: 'Menunggu', icon: Clock, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { label: 'Total Amplop', value: `Rp ${stats.total_gifts >= 1_000_000 ? (stats.total_gifts / 1_000_000).toFixed(1) + 'M' : stats.total_gifts.toLocaleString('id-ID')}`, sub: '', icon: Wallet, iconBg: 'bg-orange-50', iconColor: 'text-orange-600' },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4"
          >
            <div className={`w-11 h-11 ${card.iconBg} rounded-xl flex items-center justify-center ${card.iconColor}`}>
              <card.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{card.label}</p>
              <p className="text-xl font-bold text-[#1A1A1A]">{card.value}</p>
              {card.sub && <p className="text-[10px] text-gray-400">{card.sub}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Filter Row ── */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Cari nama atau nomor WA..."
            className="pl-12 rounded-xl bg-white border-gray-200 shadow-sm h-11"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setActiveCategory('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap transition-all ${
              activeCategory === 'ALL'
                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            Semua
          </button>
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-4 py-2 rounded-full text-xs font-semibold border whitespace-nowrap transition-all ${
                activeCategory === c.id
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Guest Table ── */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                <th className="px-4 py-3.5 w-10">
                  <input
                    type="checkbox"
                    checked={filteredGuests.length > 0 && selectedIds.size === filteredGuests.length}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#C8975A] focus:ring-[#C8975A]"
                  />
                </th>
                <th className="px-4 py-3.5">Nama</th>
                <th className="px-4 py-3.5">Kategori</th>
                <th className="px-4 py-3.5">Status RSVP</th>
                <th className="px-4 py-3.5 text-center">WA Terkirim</th>
                <th className="px-4 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredGuests.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                    <p className="font-medium">Belum ada tamu</p>
                    <p className="text-xs mt-1">Tambahkan tamu pertama Anda</p>
                  </td>
                </tr>
              )}
              {filteredGuests.map((guest) => (
                <tr key={guest.guest_id} className="hover:bg-gray-50/50 transition-colors group">
                  {/* Checkbox */}
                  <td className="px-4 py-3.5">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(guest.guest_id)}
                      onChange={() => toggleSelect(guest.guest_id)}
                      className="w-4 h-4 rounded border-gray-300 text-[#C8975A] focus:ring-[#C8975A]"
                    />
                  </td>

                  {/* Name + Badge */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-[#1A1A1A]">{guest.name}</p>
                        <span className={`inline-block mt-0.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          guest.pax_estimate > 1 ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-gray-500'
                        }`}>
                          {guest.pax_estimate > 1 ? `GRUP · ${guest.pax_estimate} Pax` : 'PERSONAL'}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${CATEGORY_COLORS[guest.category]}`}>
                      {guest.category.replace(/_/g, ' ')}
                    </span>
                  </td>

                  {/* RSVP */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${RSVP_DOT[guest.rsvp_status]}`} />
                      <span className="text-xs text-gray-600 font-medium">{RSVP_LABEL[guest.rsvp_status]}</span>
                    </div>
                  </td>

                  {/* WA Sent */}
                  <td className="px-4 py-3.5 text-center">
                    {guest.invitation_sent ? (
                      <span className="text-green-500 font-bold text-xs">✓</span>
                    ) : (
                      <span className="text-gray-300 font-bold text-xs">✗</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="relative inline-block">
                      <button
                        onClick={() => setOpenActionMenu(openActionMenu === guest.guest_id ? null : guest.guest_id)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                      <AnimatePresence>
                        {openActionMenu === guest.guest_id && (
                          <motion.div
                            ref={actionMenuRef}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20"
                          >
                            <button onClick={() => copyLink(guest.guest_id)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-left transition-colors">
                              <Copy className="w-4 h-4 text-gray-400" /> Salin Link Undangan
                            </button>
                            <button onClick={() => openWA(guest)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-left transition-colors">
                              <MessageCircle className="w-4 h-4 text-[#25D366]" /> Kirim WA Sekarang
                            </button>
                            <button onClick={() => { setSelectedGuestForGift(guest); setOpenActionMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-left transition-colors">
                              <Wallet className="w-4 h-4 text-orange-500" /> Catat Amplop
                            </button>
                            <button onClick={() => { setSelectedGuestForEdit(guest); setOpenActionMenu(null); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-left transition-colors">
                              <Edit2 className="w-4 h-4 text-blue-500" /> Edit Data Tamu
                            </button>
                            <div className="border-t border-gray-50" />
                            <button onClick={() => { setOpenActionMenu(null); handleDelete(guest.guest_id); }} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-left transition-colors text-red-500">
                              <Trash2 className="w-4 h-4" /> Hapus
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ── */}
      <AddGuestModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={handleAddSuccess}
      />

      <ImportExcelModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onSuccess={refresh}
      />

      <BulkSendModal
        isOpen={showBulkSendModal}
        guests={guests}
        token={token}
        metadata={metadata}
        onClose={() => setShowBulkSendModal(false)}
        onComplete={handleBulkSendComplete}
      />

      {selectedGuestForEdit && (
        <EditGuestModal
          isOpen={true}
          guest={selectedGuestForEdit}
          onClose={() => setSelectedGuestForEdit(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {selectedGuestForGift && (
        <GiftRecordModal
          guest={selectedGuestForGift}
          onClose={() => setSelectedGuestForGift(null)}
          onSuccess={() => {
            setSelectedGuestForGift(null);
            refresh();
          }}
        />
      )}
    </div>
  );
}
