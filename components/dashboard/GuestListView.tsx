"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MessageCircle, Copy, Trash2, Edit2, Wallet, Users, CheckCircle2, XCircle, Clock, ExternalLink, Filter, Loader2 } from "lucide-react";
import { Guest, GuestStats, GuestCategory, RSVPStatus, GiftType } from "@/types/guest.types";
import { getGuests, getGuestStats, deleteGuest, ensureGuestSheet } from "@/actions/guest.actions";
import { getMetadata } from "@/actions/metadata";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GiftRecordModal from "../guests/GiftRecordModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const CATEGORIES: { id: GuestCategory; label: string }[] = [
  { id: 'KELUARGA_PRIA', label: 'Keluarga Pria' },
  { id: 'KELUARGA_WANITA', label: 'Keluarga Wanita' },
  { id: 'SAHABAT', label: 'Sahabat' },
  { id: 'REKAN_KERJA', label: 'Rekan Kerja' },
  { id: 'KENALAN', label: 'Kenalan' },
  { id: 'VIP', label: 'VIP' },
];

export default function GuestListView() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GuestCategory | 'ALL'>('ALL');
  const [selectedGuestForGift, setSelectedGuestForGift] = useState<Guest | null>(null);
  const [token, setToken] = useState("");
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    setLoading(true);
    await ensureGuestSheet();
    const [gData, sData, mData] = await Promise.all([
      getGuests(),
      getGuestStats(),
      getMetadata()
    ]);
    setGuests(gData);
    setStats(sData);
    setMetadata(mData);
    // In a real app, token should come from session. 
    // We'll just placeholder it or fetch spreadsheetId.
    setLoading(false);
  }

  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.phone_wa.includes(search);
    const matchCat = activeCategory === 'ALL' || g.category === activeCategory;
    return matchSearch && matchCat;
  });

  const chartData = stats ? [
    { name: 'Hadir', value: stats.rsvp_hadir, color: '#C2185B' },
    { name: 'Absen', value: stats.rsvp_tidak_hadir, color: '#ef4444' },
    { name: 'Belum', value: stats.rsvp_belum, color: '#94a3b8' },
  ] : [];

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus tamu ini?")) return;
    await deleteGuest(id);
    setGuests(guests.filter(g => g.guest_id !== id));
  };

  const copyLink = (id: string) => {
    // We'd need the token here. For the dashboard tab version, 
    // we'll assume the URL construction is handled.
    alert("Link undangan: /invitation/" + id);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-[#C2185B]" /></div>;

  return (
    <div className="space-y-8 pb-20">
      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#C2185B]">Daftar Tamu & RSVP</h1>
          <p className="text-gray-500 text-sm">Kelola undangan dan konfirmasi kehadiran tamu Anda.</p>
        </div>
        <Button className="rounded-full bg-[#C2185B] hover:bg-[#AD1457]">
          <Plus className="w-4 h-4 mr-2" /> Tambah Tamu
        </Button>
      </div>

      {/* ── Stats ── */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Tamu</p>
            <p className="text-2xl font-bold text-[#212121]">{stats.total_guests}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Hadir</p>
            <p className="text-2xl font-bold text-green-600">{stats.total_pax_confirmed}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Absen</p>
            <p className="text-2xl font-bold text-red-500">{stats.rsvp_tidak_hadir}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total Amplop</p>
            <p className="text-2xl font-bold text-[#C2185B]">Rp {stats.total_gifts.toLocaleString('id-ID')}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari nama..." 
                className="pl-12 rounded-xl bg-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto no-scrollbar w-full md:w-auto">
              <Button variant={activeCategory === 'ALL' ? 'default' : 'ghost'} size="sm" onClick={() => setActiveCategory('ALL')} className="rounded-full">Semua</Button>
              {CATEGORIES.map(c => (
                <Button key={c.id} variant={activeCategory === c.id ? 'default' : 'ghost'} size="sm" onClick={() => setActiveCategory(c.id)} className="rounded-full whitespace-nowrap">{c.label}</Button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Tamu</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Pax</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGuests.map(guest => (
                  <tr key={guest.guest_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#212121]">{guest.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold">{guest.category.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${
                        guest.rsvp_status === 'HADIR' ? "bg-green-50 text-green-600" :
                        guest.rsvp_status === 'TIDAK_HADIR' ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-400"
                      }`}>
                        {guest.rsvp_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{guest.rsvp_status === 'HADIR' ? guest.actual_pax : guest.pax_estimate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedGuestForGift(guest)} className="text-[#C2185B]"><Wallet className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(guest.guest_id)} className="text-gray-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-black/5 shadow-sm h-fit">
          <h3 className="font-serif text-lg font-bold mb-6 text-center">Komposisi RSVP</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                  {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-6">
            {chartData.map(d => (
              <div key={d.name} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-gray-500">{d.name}</span>
                </div>
                <span className="font-bold">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedGuestForGift && (
        <GiftRecordModal 
          guest={selectedGuestForGift}
          onClose={() => setSelectedGuestForGift(null)}
          onSuccess={() => {
            setSelectedGuestForGift(null);
            init();
          }}
        />
      )}
    </div>
  );
}
