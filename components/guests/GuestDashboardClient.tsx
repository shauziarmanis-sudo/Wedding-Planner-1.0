"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, MessageCircle, Copy, Trash2, Edit2, Wallet, Users, CheckCircle2, XCircle, Clock, ExternalLink, Filter } from "lucide-react";
import { Guest, GuestStats, GuestCategory, RSVPStatus, GiftType } from "@/types/guest.types";
import { deleteGuest, markInvitationSent } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import GiftRecordModal from "./GiftRecordModal";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

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

export default function GuestDashboardClient({ initialGuests, initialStats, token, metadata }: Props) {
  const [guests, setGuests] = useState<Guest[]>(initialGuests);
  const [stats, setStats] = useState<GuestStats>(initialStats);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<GuestCategory | 'ALL'>('ALL');
  const [selectedGuestForGift, setSelectedGuestForGift] = useState<Guest | null>(null);

  const filteredGuests = guests.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) || g.phone_wa.includes(search);
    const matchCat = activeCategory === 'ALL' || g.category === activeCategory;
    return matchSearch && matchCat;
  });

  const chartData = [
    { name: 'Hadir', value: stats.rsvp_hadir, color: '#22c55e' },
    { name: 'Absen', value: stats.rsvp_tidak_hadir, color: '#ef4444' },
    { name: 'Belum', value: stats.rsvp_belum, color: '#94a3b8' },
  ];

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus tamu ini?")) return;
    await deleteGuest(id);
    setGuests(guests.filter(g => g.guest_id !== id));
  };

  const copyLink = (id: string) => {
    const link = `${window.location.origin}/invitation/${id}?t=${token}`;
    navigator.clipboard.writeText(link);
    alert("Link undangan disalin!");
  };

  const openWA = (guest: Guest) => {
    const link = `${window.location.origin}/invitation/${guest.guest_id}?t=${token}`;
    const text = `Kepada Yth. Bapak/Ibu/Saudara/i ${guest.name}\n\nKami mengundang Anda ke acara pernikahan kami pada 12 Januari 2026. Konfirmasi kehadiran Anda melalui link ini: ${link}`;
    window.open(`https://wa.me/${guest.phone_wa}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-8">
      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Tamu</p>
            <p className="text-2xl font-bold">{stats.total_guests}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Hadir</p>
            <p className="text-2xl font-bold">{stats.total_pax_confirmed} <span className="text-sm font-normal text-gray-400">Pax</span></p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Belum RSVP</p>
            <p className="text-2xl font-bold">{stats.rsvp_belum}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Amplop</p>
            <p className="text-2xl font-bold">Rp {(stats.total_gifts / 1000000).toFixed(1)}M</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ── Filters & Table ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input 
                placeholder="Cari nama atau nomor WA..." 
                className="pl-12 rounded-2xl bg-white border-none shadow-sm h-12"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
               <Button 
                variant={activeCategory === 'ALL' ? 'default' : 'ghost'} 
                onClick={() => setActiveCategory('ALL')}
                className="rounded-full"
               >Semua</Button>
               {CATEGORIES.map(c => (
                 <Button 
                  key={c.id} 
                  variant={activeCategory === c.id ? 'default' : 'ghost'} 
                  onClick={() => setActiveCategory(c.id)}
                  className="rounded-full whitespace-nowrap"
                 >{c.label}</Button>
               ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 font-bold uppercase text-[10px] tracking-widest border-b border-gray-100">
                  <th className="px-6 py-4">Nama & Kategori</th>
                  <th className="px-6 py-4">Status RSVP</th>
                  <th className="px-6 py-4">Pax</th>
                  <th className="px-6 py-4">Undangan</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGuests.map((guest) => (
                  <tr key={guest.guest_id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#1A1A1A]">{guest.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{guest.category.replace('_', ' ')}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        guest.rsvp_status === 'HADIR' ? "bg-green-50 text-green-600" :
                        guest.rsvp_status === 'TIDAK_HADIR' ? "bg-red-50 text-red-600" :
                        "bg-gray-50 text-gray-400"
                      }`}>
                        {guest.rsvp_status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{guest.rsvp_status === 'HADIR' ? guest.actual_pax : guest.pax_estimate}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold ${guest.invitation_sent ? "text-blue-500" : "text-gray-300"}`}>
                        {guest.invitation_sent ? "TERKIRIM" : "BELUM"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" onClick={() => openWA(guest)} className="text-green-500"><MessageCircle className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => copyLink(guest.guest_id)}><Copy className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedGuestForGift(guest)}><Wallet className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(guest.guest_id)} className="text-red-400"><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── RSVP Chart & Sidebar ── */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm text-center">
            <h3 className="font-serif text-lg mb-6">Komposisi RSVP</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {chartData.map(d => (
                <div key={d.name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></div>
                  <span className="text-xs text-gray-500">{d.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1A1A1A] p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-bl-full"></div>
             <h3 className="font-serif text-xl mb-4 relative z-10">Undangan Digital</h3>
             <p className="text-gray-400 text-sm mb-6 relative z-10">Kirim undangan digital personal ke tamu Anda via WhatsApp.</p>
             <Button className="w-full bg-[#C8975A] hover:bg-[#B68649] text-white rounded-2xl h-12">
               Blast WA Undangan
             </Button>
          </div>
        </div>
      </div>

      {selectedGuestForGift && (
        <GiftRecordModal 
          guest={selectedGuestForGift}
          onClose={() => setSelectedGuestForGift(null)}
          onSuccess={() => {
            setSelectedGuestForGift(null);
            // Refresh logic should be here
          }}
        />
      )}
    </div>
  );
}
