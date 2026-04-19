import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ADAT_REGISTRY, ADAT_TYPES, AdatType, getAdatColor } from "@/lib/adat-registry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { initChecklist } from "@/actions/checklist.actions";
import { Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import { toast } from "react-hot-toast";

interface AdatOnboardingProps {
  onComplete: () => void;
}

export default function AdatOnboarding({ onComplete }: AdatOnboardingProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [primaryAdat, setPrimaryAdat] = useState<AdatType | null>(null);
  const [useSecondary, setUseSecondary] = useState(false);
  const [secondaryAdat, setSecondaryAdat] = useState<AdatType | null>(null);
  const [weddingDate, setWeddingDate] = useState("");
  const [guestCount, setGuestCount] = useState("");
  const [sukuPria, setSukuPria] = useState("");
  const [sukuWanita, setSukuWanita] = useState("");

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleSubmit = async () => {
    if (!primaryAdat || !weddingDate || !guestCount) return;

    setLoading(true);
    try {
      const res = await initChecklist({
        adat_type: primaryAdat,
        adat_secondary: useSecondary && secondaryAdat ? secondaryAdat : undefined,
        wedding_date: weddingDate,
        guest_count_estimate: parseInt(guestCount, 10),
        pasangan_pria_suku: sukuPria || undefined,
        pasangan_wanita_suku: sukuWanita || undefined,
      });

      if (res.success) {
        toast.success("Checklist berhasil dibuat!");
        onComplete();
      } else {
        toast.error(res.error || "Gagal membuat checklist");
      }
    } catch (e: any) {
      toast.error(e.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full p-4">
      <div className="mb-8">
        <div className="flex justify-between text-sm font-medium text-gray-500 mb-2 px-1">
          <span className={step >= 1 ? "text-primary" : ""}>1. Pilih Adat</span>
          <span className={step >= 2 ? "text-primary" : ""}>2. Detail Acara</span>
          <span className={step >= 3 ? "text-primary" : ""}>3. Konfirmasi</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Pilih Adat Pernikahan</h2>
              <p className="text-gray-500">Pilih tradisi yang akan menjadi panduan checklist Anda.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Adat Utama</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ADAT_TYPES.map((adat) => {
                  const data = ADAT_REGISTRY[adat];
                  const isSelected = primaryAdat === adat;
                  const colors = getAdatColor(adat);
                  return (
                    <button
                      key={adat}
                      onClick={() => setPrimaryAdat(adat)}
                      className="p-4 rounded-xl border text-center transition-all duration-200 hover:-translate-y-1"
                      style={{
                        borderColor: isSelected ? colors.main : "var(--border)",
                        backgroundColor: isSelected ? colors.light : "transparent",
                        boxShadow: isSelected ? `0 0 0 2px ${colors.main}20` : "none"
                      }}
                    >
                      <div className="text-3xl mb-2">{data.emoji}</div>
                      <div className="font-semibold text-sm" style={{ color: isSelected ? colors.main : "inherit" }}>
                        {data.label}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 border rounded-xl p-4 mt-6">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="useSecondary" 
                  checked={useSecondary} 
                  onCheckedChange={(c) => {
                    setUseSecondary(!!c);
                    if (!c) setSecondaryAdat(null);
                  }} 
                />
                <label htmlFor="useSecondary" className="text-sm font-medium leading-none cursor-pointer">
                  Gunakan Adat Campuran (Dua Adat)
                </label>
              </div>
              
              <AnimatePresence>
                {useSecondary && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto", marginTop: 16 }} 
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    className="overflow-hidden"
                  >
                    <h3 className="text-sm font-semibold mb-3">Adat Kedua</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {ADAT_TYPES.filter(a => a !== primaryAdat).map((adat) => {
                        const data = ADAT_REGISTRY[adat];
                        const isSelected = secondaryAdat === adat;
                        return (
                          <button
                            key={adat}
                            onClick={() => setSecondaryAdat(adat)}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              isSelected ? 'border-primary bg-primary/5' : 'hover:border-gray-300'
                            }`}
                          >
                            <div className="text-xl mb-1">{data.emoji}</div>
                            <div className="font-medium text-xs">{data.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} disabled={!primaryAdat || (useSecondary && !secondaryAdat)}>
                Lanjut <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-xl mx-auto"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">Detail Acara</h2>
              <p className="text-gray-500">Informasi ini untuk menghitung timeline secara otomatis.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tanggal Pernikahan (Target)</label>
                <Input 
                  type="date" 
                  value={weddingDate} 
                  onChange={(e) => setWeddingDate(e.target.value)} 
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Estimasi Jumlah Tamu (Undangan)</label>
                <Input 
                  type="number" 
                  placeholder="Contoh: 500" 
                  value={guestCount} 
                  onChange={(e) => setGuestCount(e.target.value)} 
                  className="w-full"
                />
              </div>

              {useSecondary && (
                <div className="grid grid-cols-2 gap-4 mt-4 bg-gray-50 p-4 rounded-xl border">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Suku Pihak Pria</label>
                    <Input 
                      placeholder="Contoh: Jawa" 
                      value={sukuPria} 
                      onChange={(e) => setSukuPria(e.target.value)} 
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Suku Pihak Wanita</label>
                    <Input 
                      placeholder="Contoh: Minang" 
                      value={sukuWanita} 
                      onChange={(e) => setSukuWanita(e.target.value)} 
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrev}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <Button onClick={handleNext} disabled={!weddingDate || !guestCount}>
                Lanjut <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 max-w-xl mx-auto text-center"
          >
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">{primaryAdat ? ADAT_REGISTRY[primaryAdat].emoji : '✨'}</span>
              </div>
              <h2 className="text-3xl font-bold mb-2">Siap Membangun Checklist!</h2>
              <p className="text-gray-500">Kami akan men-generate ratusan task yang disesuaikan dengan adat pilihan Anda.</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 text-left space-y-3 border">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Adat Utama</span>
                <span className="font-semibold">{primaryAdat ? ADAT_REGISTRY[primaryAdat].label : ''}</span>
              </div>
              {useSecondary && secondaryAdat && (
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-500">Adat Tambahan</span>
                  <span className="font-semibold">{ADAT_REGISTRY[secondaryAdat].label}</span>
                </div>
              )}
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Tanggal Acara</span>
                <span className="font-semibold">{new Date(weddingDate).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Tamu</span>
                <span className="font-semibold">{guestCount} Undangan</span>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handlePrev} disabled={loading}>
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali
              </Button>
              <Button onClick={handleSubmit} disabled={loading} className="px-8">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Generate Checklist Saya
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
