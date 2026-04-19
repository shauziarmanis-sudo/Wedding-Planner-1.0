"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Upload, Download, FileSpreadsheet, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { GuestCategory, GuestImportRow } from "@/types/guest.types";
import { bulkAddGuests } from "@/actions/guest.actions";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ParsedRow {
  data: GuestImportRow;
  status: 'valid' | 'warning' | 'error';
  message?: string;
}

function mapCategory(raw: string): GuestCategory {
  const s = raw?.toLowerCase().trim() || '';
  if (s.includes('pria') || s === 'keluarga_pria') return 'KELUARGA_PRIA';
  if (s.includes('wanita') || s === 'keluarga_wanita') return 'KELUARGA_WANITA';
  if (s.includes('sahabat') || s.includes('teman')) return 'SAHABAT';
  if (s.includes('rekan') || s.includes('kerja') || s.includes('kantor')) return 'REKAN_KERJA';
  if (s.includes('vip')) return 'VIP';
  return 'KENALAN';
}

function mapHeader(raw: string): string | null {
  const s = raw?.toLowerCase().trim() || '';
  if (['nama', 'name', 'nama tamu', 'nama_tamu'].includes(s)) return 'name';
  if (['no_wa', 'whatsapp', 'phone', 'nomor', 'no wa', 'telepon', 'hp', 'wa'].includes(s)) return 'phone_wa';
  if (['kategori', 'category', 'group', 'kelompok'].includes(s)) return 'category';
  if (['jumlah', 'pax', 'pax_estimate', 'orang', 'jml'].includes(s)) return 'pax_estimate';
  if (['catatan', 'notes', 'note', 'keterangan'].includes(s)) return 'notes';
  return null;
}

function formatPhone(raw: string): string {
  let cleaned = String(raw || '').replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }
  return cleaned;
}

export default function ImportExcelModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const validCount = parsedRows.filter(r => r.status !== 'error').length;
  const errorCount = parsedRows.filter(r => r.status === 'error').length;
  const warningCount = parsedRows.filter(r => r.status === 'warning').length;

  const downloadTemplate = () => {
    // Dynamically import xlsx to create template
    import('xlsx').then((XLSX) => {
      const wb = XLSX.utils.book_new();
      const data = [
        ['nama', 'no_wa', 'kategori', 'jumlah', 'catatan'],
        ['Budi Santoso', '081234567890', 'keluarga_pria', 2, 'Vegetarian'],
        ['Siti Nurhaliza', '089876543210', 'sahabat', 1, ''],
        ['Keluarga Pak Ahmad', '082112345678', 'vip', 5, 'Alergi kacang'],
      ];
      const ws = XLSX.utils.aoa_to_sheet(data);
      ws['!cols'] = [{ width: 25 }, { width: 18 }, { width: 18 }, { width: 10 }, { width: 25 }];
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      XLSX.writeFile(wb, 'template_daftar_tamu.xlsx');
      toast.success('Template berhasil diunduh!');
    });
  };

  const handleFile = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const raw: any[] = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (raw.length === 0) {
        toast.error('File kosong atau tidak memiliki data.');
        setLoading(false);
        return;
      }

      // Map headers flexibly
      const sampleKeys = Object.keys(raw[0]);
      const headerMap: Record<string, string> = {};
      for (const key of sampleKeys) {
        const mapped = mapHeader(key);
        if (mapped) headerMap[key] = mapped;
      }

      const rows: ParsedRow[] = raw.map((row, i) => {
        const getName = () => {
          for (const [k, v] of Object.entries(headerMap)) {
            if (v === 'name') return String(row[k] || '').trim();
          }
          return '';
        };
        const getPhone = () => {
          for (const [k, v] of Object.entries(headerMap)) {
            if (v === 'phone_wa') return formatPhone(String(row[k] || ''));
          }
          return '';
        };
        const getCat = () => {
          for (const [k, v] of Object.entries(headerMap)) {
            if (v === 'category') return mapCategory(String(row[k] || ''));
          }
          return 'KENALAN' as GuestCategory;
        };
        const getPax = () => {
          for (const [k, v] of Object.entries(headerMap)) {
            if (v === 'pax_estimate') return parseInt(String(row[k])) || 1;
          }
          return 1;
        };
        const getNotes = () => {
          for (const [k, v] of Object.entries(headerMap)) {
            if (v === 'notes') return String(row[k] || '');
          }
          return '';
        };

        const name = getName();
        const phone = getPhone();
        const pax = getPax();

        const data: GuestImportRow = {
          name,
          phone_wa: phone,
          category: getCat(),
          pax_estimate: pax,
          notes: getNotes(),
          guest_type: pax > 1 ? 'GRUP' : 'PERSONAL',
        };

        if (!name) return { data, status: 'error' as const, message: 'Nama kosong' };
        if (!phone) return { data, status: 'warning' as const, message: 'No WA kosong' };
        return { data, status: 'valid' as const };
      });

      setParsedRows(rows);
    } catch (err: any) {
      toast.error('Gagal membaca file: ' + (err.message || 'Format tidak didukung'));
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleImport = async () => {
    const validRows = parsedRows.filter(r => r.status !== 'error').map(r => r.data);
    if (validRows.length === 0) return;

    setImporting(true);
    try {
      const result = await bulkAddGuests(validRows);
      if (result.success) {
        toast.success(`Berhasil mengimpor ${result.added} tamu!`);
        if (result.errors.length > 0) {
          toast(`${result.errors.length} baris dilewati`, { icon: '⚠️' });
        }
        onSuccess();
        onClose();
        setParsedRows([]);
      } else {
        toast.error(result.errors[0] || 'Gagal mengimpor.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengimpor data.');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setParsedRows([]);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl text-[#1A1A1A]">Import Tamu dari Excel</h3>
                <p className="text-sm text-gray-500 mt-1">Upload file .xlsx atau .csv</p>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Download Template */}
              <button
                onClick={downloadTemplate}
                className="flex items-center gap-3 w-full p-4 rounded-2xl border-2 border-dashed border-[#C8975A]/30 bg-[#C8975A]/5 hover:bg-[#C8975A]/10 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-[#C8975A]/20 flex items-center justify-center">
                  <Download className="w-5 h-5 text-[#C8975A]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-[#1A1A1A]">Download Template Excel</p>
                  <p className="text-xs text-gray-500">Berisi header & 3 baris contoh data</p>
                </div>
              </button>

              {/* Upload Zone */}
              {parsedRows.length === 0 && (
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-4 p-12 rounded-2xl border-2 border-dashed cursor-pointer transition-all ${
                    dragOver ? 'border-[#C8975A] bg-[#C8975A]/5' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".xlsx,.csv,.xls"
                    className="hidden"
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (file) handleFile(file);
                    }}
                  />
                  {loading ? (
                    <Loader2 className="w-10 h-10 text-[#C8975A] animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-gray-400" />
                      <div className="text-center">
                        <p className="font-semibold text-gray-700">Drag & drop file di sini</p>
                        <p className="text-xs text-gray-400 mt-1">atau klik untuk memilih file (.xlsx, .csv)</p>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Preview Table */}
              {parsedRows.length > 0 && (
                <>
                  {/* Summary */}
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-green-700 font-semibold">{validCount - warningCount} valid</span>
                    </div>
                    {warningCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-700 font-semibold">{warningCount} WA kosong</span>
                      </div>
                    )}
                    {errorCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-red-700 font-semibold">{errorCount} error</span>
                      </div>
                    )}
                  </div>

                  <div className="border rounded-2xl overflow-hidden max-h-[300px] overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                          <th className="px-4 py-3 text-left">Status</th>
                          <th className="px-4 py-3 text-left">Nama</th>
                          <th className="px-4 py-3 text-left">No WA</th>
                          <th className="px-4 py-3 text-left">Kategori</th>
                          <th className="px-4 py-3 text-center">Pax</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {parsedRows.map((row, i) => (
                          <tr key={i} className={row.status === 'error' ? 'bg-red-50/50' : row.status === 'warning' ? 'bg-amber-50/50' : ''}>
                            <td className="px-4 py-2.5">
                              {row.status === 'valid' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                              {row.status === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                              {row.status === 'error' && <XCircle className="w-4 h-4 text-red-500" />}
                            </td>
                            <td className="px-4 py-2.5 font-medium text-[#1A1A1A]">{row.data.name || <span className="text-red-400 italic">Kosong</span>}</td>
                            <td className="px-4 py-2.5 text-gray-600">{row.data.phone_wa || <span className="text-amber-400 italic">-</span>}</td>
                            <td className="px-4 py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">{row.data.category.replace('_', ' ')}</span>
                            </td>
                            <td className="px-4 py-2.5 text-center font-semibold">{row.data.pax_estimate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => { setParsedRows([]); if(fileRef.current) fileRef.current.value = ''; }}
                      className="flex-1 rounded-xl h-12"
                    >
                      Ganti File
                    </Button>
                    <Button
                      onClick={handleImport}
                      disabled={importing || validCount === 0}
                      className="flex-[2] rounded-xl h-12 bg-[#1A1A1A] hover:bg-[#333] text-white"
                    >
                      {importing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 mr-2" />}
                      Import {validCount} Tamu
                    </Button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
