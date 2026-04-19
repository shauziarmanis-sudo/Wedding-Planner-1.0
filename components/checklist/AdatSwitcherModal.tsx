import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ADAT_REGISTRY, AdatType, ADAT_TYPES } from '@/lib/adat-registry';
import { executeAdatSwitch, previewAdatSwitch } from '@/actions/checklist.actions';
import { AdatSwitchResult } from '@/types/checklist.types';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, Plus, Minus, CheckCircle, RefreshCw } from 'lucide-react';

interface AdatSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAdat: AdatType;
  currentSecondary?: AdatType;
  onSuccess: () => void;
}

export function AdatSwitcherModal({ isOpen, onClose, currentAdat, currentSecondary, onSuccess }: AdatSwitcherModalProps) {
  const [selectedAdat, setSelectedAdat] = useState<AdatType>(currentAdat);
  const [selectedSecondary, setSelectedSecondary] = useState<AdatType | undefined>(currentSecondary);
  const [showSecondary, setShowSecondary] = useState(!!currentSecondary);
  
  const [previewData, setPreviewData] = useState<AdatSwitchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState('');

  const handlePreview = async () => {
    setIsLoading(true);
    setError('');
    const res = await previewAdatSwitch(selectedAdat, selectedSecondary);
    if (res.success && res.data) {
      setPreviewData(res.data);
    } else {
      setError(res.error || 'Gagal memuat preview perubahan');
    }
    setIsLoading(false);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    const res = await executeAdatSwitch(selectedAdat, selectedSecondary);
    setIsExecuting(false);
    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.error || 'Gagal mengganti adat');
    }
  };

  const handleAdatClick = (adat: AdatType, isPrimary: boolean) => {
    if (isPrimary) {
      setSelectedAdat(adat);
      if (adat === selectedSecondary) setSelectedSecondary(undefined);
    } else {
      setSelectedSecondary(adat === selectedSecondary ? undefined : adat);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ganti Adat Pernikahan</DialogTitle>
          <DialogDescription>
            Ubah konfigurasi adat untuk menyesuaikan checklist secara otomatis.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          {!previewData ? (
            <>
              {/* Selection Phase */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Adat Utama</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ADAT_TYPES.map(adat => {
                    const isSelected = selectedAdat === adat;
                    return (
                      <button
                        key={adat}
                        onClick={() => handleAdatClick(adat, true)}
                        className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                          isSelected 
                            ? 'border-[color:var(--primary)] bg-[color:var(--primary)]/5 ring-1 ring-[color:var(--primary)]' 
                            : 'hover:border-gray-300'
                        }`}
                      >
                        <span className="text-xl">{ADAT_REGISTRY[adat].emoji}</span>
                        <span className="text-sm font-medium">{ADAT_REGISTRY[adat].label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="campuran" 
                  checked={showSecondary} 
                  onCheckedChange={(c) => {
                    setShowSecondary(!!c);
                    if (!c) setSelectedSecondary(undefined);
                  }} 
                />
                <label htmlFor="campuran" className="text-sm font-medium leading-none cursor-pointer">
                  Tambah adat kedua (Campuran)
                </label>
              </div>

              {showSecondary && (
                <motion.div initial={{opacity:0, height:0}} animate={{opacity:1, height:'auto'}}>
                  <h3 className="text-sm font-semibold mb-3 mt-2">Adat Kedua</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ADAT_TYPES.filter(a => a !== selectedAdat).map(adat => {
                      const isSelected = selectedSecondary === adat;
                      return (
                        <button
                          key={adat}
                          onClick={() => handleAdatClick(adat, false)}
                          className={`p-3 rounded-lg border text-left flex items-center gap-2 transition-colors ${
                            isSelected 
                              ? 'border-indigo-600 bg-indigo-50 ring-1 ring-indigo-600' 
                              : 'hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xl">{ADAT_REGISTRY[adat].emoji}</span>
                          <span className="text-sm font-medium">{ADAT_REGISTRY[adat].label}</span>
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {error && <p className="text-red-500 text-sm">{error}</p>}
              
              <Button 
                onClick={handlePreview} 
                className="w-full mt-4" 
                disabled={isLoading || (selectedAdat === currentAdat && selectedSecondary === currentSecondary)}
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Lihat Preview Perubahan
              </Button>
            </>
          ) : (
            <>
              {/* Preview Phase */}
              <div className="space-y-4">
                <Button variant="ghost" size="sm" onClick={() => setPreviewData(null)} className="mb-2">
                  &larr; Kembali Pilih Adat
                </Button>
                
                {previewData.conflict_warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h4 className="font-semibold text-amber-800 flex items-center gap-2 mb-2">
                      <AlertCircle className="w-4 h-4" /> Peringatan
                    </h4>
                    <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
                      {previewData.conflict_warnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
                      <Plus className="w-4 h-4" /> {previewData.tasks_added.length} Task Baru Ditambahkan
                    </h4>
                    <ul className="text-sm text-green-700 max-h-32 overflow-y-auto space-y-1">
                      {previewData.tasks_added.map(t => <li key={t.title} className="truncate">• {t.title}</li>)}
                      {previewData.tasks_added.length === 0 && <li>Tidak ada penambahan</li>}
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
                      <Minus className="w-4 h-4" /> {previewData.tasks_removed.length} Task Dinonaktifkan
                    </h4>
                    <ul className="text-sm text-red-700 max-h-32 overflow-y-auto space-y-1">
                      {previewData.tasks_removed.map(t => <li key={t.task_id} className="truncate line-through">• {t.title}</li>)}
                      {previewData.tasks_removed.length === 0 && <li>Tidak ada pengurangan</li>}
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4" /> {previewData.tasks_kept.length + previewData.tasks_completed_kept.length} Task Tetap
                  </h4>
                  <p className="text-sm text-gray-500">
                    Termasuk {previewData.tasks_completed_kept.length} task dari adat sebelumnya yang sudah selesai.
                  </p>
                </div>

                <div className="flex items-start space-x-2 bg-blue-50/50 p-3 rounded border border-blue-100">
                  <Checkbox 
                    id="ack" 
                    checked={acknowledged} 
                    onCheckedChange={(c) => setAcknowledged(!!c)} 
                    className="mt-1"
                  />
                  <label htmlFor="ack" className="text-sm text-blue-900 cursor-pointer">
                    Saya memahami bahwa perubahan adat ini akan memodifikasi checklist saya secara otomatis sesuai dengan review di atas. Task yang sudah "Selesai" tidak akan dihapus.
                  </label>
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
            </>
          )}
        </div>

        {previewData && (
          <DialogFooter className="mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setPreviewData(null)} disabled={isExecuting}>Batalkan</Button>
            <Button onClick={handleExecute} disabled={!acknowledged || isExecuting}>
              {isExecuting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Konfirmasi Ganti Adat
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
