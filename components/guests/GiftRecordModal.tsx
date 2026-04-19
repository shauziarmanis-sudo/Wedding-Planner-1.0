"use client";

import { useState } from "react";
import { X, Loader2, Banknote, CreditCard, Gift, Ban } from "lucide-react";
import { Guest, GiftType } from "@/types/guest.types";
import { recordGift } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  guest: Guest;
  onClose: () => void;
  onSuccess: () => void;
}

const giftTypes: { id: GiftType; label: string; icon: any; color: string }[] = [
  { id: 'CASH', label: 'Cash (Tunai)', icon: Banknote, color: 'text-green-600 bg-green-50' },
  { id: 'TRANSFER', label: 'Transfer Bank', icon: CreditCard, color: 'text-blue-600 bg-blue-50' },
  { id: 'BARANG', label: 'Kado / Barang', icon: Gift, color: 'text-purple-600 bg-purple-50' },
  { id: 'TIDAK_ADA', label: 'Tidak Ada', icon: Ban, color: 'text-gray-400 bg-gray-50' },
];

export default function GiftRecordModal({ guest, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState<number>(guest.gift_amount || 0);
  const [type, setType] = useState<GiftType>(guest.gift_type || 'CASH');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await recordGift(guest.guest_id, amount, type);
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-serif text-xl text-[#1A1A1A]">Pencatatan Amplop / Kado</h3>
            <p className="text-sm text-gray-500 mt-1">Tamu: <strong className="text-gray-900">{guest.name}</strong></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-3">
            {giftTypes.map((gt) => {
              const Icon = gt.icon;
              const isActive = type === gt.id;
              return (
                <button
                  key={gt.id}
                  type="button"
                  onClick={() => setType(gt.id)}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    isActive ? `border-[#C8975A] ${gt.color}` : "border-gray-50 bg-gray-50/50 text-gray-400"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{gt.label}</span>
                </button>
              );
            })}
          </div>

          {(type === 'CASH' || type === 'TRANSFER') && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nominal (Rupiah)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">Rp</span>
                <Input 
                  type="number"
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  className="pl-12 py-6 text-xl font-bold rounded-2xl bg-gray-50 border-none focus-visible:ring-2 focus-visible:ring-[#C8975A]"
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="pt-4 flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1 rounded-xl h-12">Batal</Button>
            <Button type="submit" disabled={loading} className="flex-[2] rounded-xl h-12 bg-[#1A1A1A] hover:bg-[#333333]">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Simpan Data"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
