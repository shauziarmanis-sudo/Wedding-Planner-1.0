"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Heart } from "lucide-react";
import { submitRSVP } from "@/actions/rsvp";
import toast from "react-hot-toast";

interface RSVPFormProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

export function RSVPForm({ isOpen, onClose, accentColor }: RSVPFormProps) {
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"HADIR" | "TIDAK_HADIR">("HADIR");
  const [pax, setPax] = useState<number>(1);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Ambil token dari URL (?g=TOKEN)
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      setToken(params.get("g"));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      toast.error("Token undangan tidak valid. Pastikan Anda membuka link yang benar.");
      return;
    }

    setLoading(true);
    try {
      const result = await submitRSVP({
        rsvp_token: token,
        rsvp_status: status,
        actual_pax: pax,
        message,
      });

      if (result.success) {
        setIsSuccess(true);
      } else {
        toast.error(result.error || "Gagal mengirim konfirmasi");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="p-10 text-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Heart className="w-8 h-8" style={{ color: accentColor }} />
            </div>
            <h3 className="text-2xl font-bold mb-2 font-serif text-gray-900">Terima Kasih!</h3>
            <p className="text-gray-600 mb-8">
              Konfirmasi kehadiran Anda telah kami terima.
            </p>
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full text-white font-medium shadow-lg transition-transform hover:scale-105 active:scale-95"
              style={{ backgroundColor: accentColor }}
            >
              Tutup
            </button>
          </div>
        ) : (
          <div className="p-8">
            <h3 className="text-2xl font-bold mb-2 font-serif text-gray-900 text-center">
              Konfirmasi Kehadiran
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Mohon isi form di bawah ini untuk konfirmasi
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!token && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl mb-4 border border-red-100">
                  ⚠️ <strong>Token tamu tidak ditemukan.</strong> Buka undangan menggunakan link khusus yang dikirimkan kepada Anda.
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Apakah Anda akan hadir?</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setStatus("HADIR")}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      status === "HADIR"
                        ? "border-transparent text-white shadow-md"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                    style={status === "HADIR" ? { backgroundColor: accentColor } : {}}
                  >
                    Ya, Hadir
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("TIDAK_HADIR")}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${
                      status === "TIDAK_HADIR"
                        ? "border-gray-800 bg-gray-800 text-white shadow-md"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    Maaf, Tidak Bisa
                  </button>
                </div>
              </div>

              {status === "HADIR" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Jumlah Orang (Termasuk Anda)</label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setPax(Math.max(1, pax - 1))}
                      className="w-12 h-12 flex items-center justify-center rounded-l-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600"
                    >
                      -
                    </button>
                    <div className="flex-1 h-12 flex items-center justify-center border-y border-gray-300 font-bold text-lg">
                      {pax}
                    </div>
                    <button
                      type="button"
                      onClick={() => setPax(pax + 1)}
                      className="w-12 h-12 flex items-center justify-center rounded-r-xl border border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ucapan / Pesan Tambahan</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:border-transparent transition-all"
                  style={{ focusRingColor: accentColor }}
                  rows={3}
                  placeholder="Berikan ucapan atau catatan..."
                />
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full py-3.5 rounded-xl text-white font-medium shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: accentColor }}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirim Konfirmasi"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
