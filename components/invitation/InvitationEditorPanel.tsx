"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { UserInvitation, InvitationConfig, InvitationPhoto, SectionKey, HeroLayout, AnimationType, SpacingType } from "@/types/invitation.types";
import { updateInvitationConfig, updateInvitationMusic, updateInvitationPhotos, uploadInvitationPhoto } from "@/actions/invitation.actions";
import { Type, Palette, LayoutGrid, Image, Music, Wand2, FileText, Upload, Trash2, GripVertical, Loader2, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  invitation: UserInvitation;
  onConfigChange: (config: InvitationConfig) => void;
  onPhotosChange: (photos: InvitationPhoto[]) => void;
  onMusicChange: (url: string | null, autoplay: boolean) => void;
}

const HEADING_FONTS = [
  'Playfair Display', 'Cormorant Garamond', 'Great Vibes', 'Montserrat',
  'Merriweather', 'Amiri', 'Lora', 'Cinzel', 'Dancing Script', 'Abril Fatface'
];
const BODY_FONTS = [
  'Inter', 'Lato', 'Open Sans', 'Source Sans 3', 'Nunito',
  'Raleway', 'Source Serif 4', 'Roboto', 'Poppins', 'Work Sans'
];
const SECTION_LABELS: Record<SectionKey, string> = {
  hero: '🏠 Hero', countdown: '⏱️ Countdown', couple: '💑 Mempelai', event: '📅 Acara',
  love_story: '💕 Love Story', gallery: '📸 Galeri', map: '📍 Peta', rsvp: '✉️ RSVP',
  wishes: '💝 Ucapan', gift: '🎁 Amplop Digital', music_player: '🎵 Musik'
};

type TabKey = 'font' | 'color' | 'layout' | 'photo' | 'music' | 'animation' | 'text';

const TABS: { key: TabKey; label: string; icon: typeof Type }[] = [
  { key: 'font', label: 'Font', icon: Type },
  { key: 'color', label: 'Warna', icon: Palette },
  { key: 'layout', label: 'Layout', icon: LayoutGrid },
  { key: 'photo', label: 'Foto', icon: Image },
  { key: 'music', label: 'Musik', icon: Music },
  { key: 'animation', label: 'Animasi', icon: Wand2 },
  { key: 'text', label: 'Teks', icon: FileText },
];

export default function InvitationEditorPanel({ invitation, onConfigChange, onPhotosChange, onMusicChange }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('font');
  const [config, setConfig] = useState<InvitationConfig>(invitation.config);
  const [photos, setPhotos] = useState<InvitationPhoto[]>(invitation.photos);
  const [musicUrl, setMusicUrl] = useState(invitation.music_url || '');
  const [autoplay, setAutoplay] = useState(invitation.music_autoplay);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // ── Auto-save config with debounce ─────────────────────────────
  const saveConfig = useCallback((newConfig: InvitationConfig) => {
    setConfig(newConfig);
    onConfigChange(newConfig);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSaving(true);
      const result = await updateInvitationConfig(newConfig);
      if (!result.success) toast.error("Gagal menyimpan perubahan");
      setSaving(false);
    }, 1000);
  }, [onConfigChange]);

  const updateField = <K extends keyof InvitationConfig>(key: K, value: InvitationConfig[K]) => {
    saveConfig({ ...config, [key]: value });
  };

  // ── Photo upload ───────────────────────────────────────────────
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append('file', file);
      const result = await uploadInvitationPhoto(fd);
      if (result.success && result.url) {
        const newPhoto: InvitationPhoto = { url: result.url, type: 'prewedding', order: photos.length, caption: '' };
        const updated = [...photos, newPhoto];
        setPhotos(updated);
        onPhotosChange(updated);
        await updateInvitationPhotos(updated);
        toast.success("Foto berhasil diupload");
      } else {
        toast.error(result.error || "Gagal upload foto");
      }
    }
    setUploading(false);
    e.target.value = '';
  };

  const removePhoto = async (index: number) => {
    const updated = photos.filter((_, i) => i !== index).map((p, i) => ({ ...p, order: i }));
    setPhotos(updated);
    onPhotosChange(updated);
    await updateInvitationPhotos(updated);
  };

  const setPhotoType = async (index: number, type: InvitationPhoto['type']) => {
    const updated = photos.map((p, i) => i === index ? { ...p, type } : p);
    setPhotos(updated);
    onPhotosChange(updated);
    await updateInvitationPhotos(updated);
  };

  // ── Music save ─────────────────────────────────────────────────
  const saveMusic = useCallback(async () => {
    const url = musicUrl.trim() || null;
    onMusicChange(url, autoplay);
    const result = await updateInvitationMusic(url, autoplay);
    if (result.success) toast.success("Musik tersimpan");
    else toast.error("Gagal menyimpan musik");
  }, [musicUrl, autoplay, onMusicChange]);

  // ── Section toggle ─────────────────────────────────────────────
  const toggleSection = (key: SectionKey) => {
    const currentSections = config.sections || [];
    const sections = currentSections.includes(key)
      ? currentSections.filter(s => s !== key)
      : [...currentSections, key];
    saveConfig({ ...config, sections });
  };

  // ── Select Component ───────────────────────────────────────────
  const Select = ({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30">
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer p-0.5" />
        <input type="text" value={value} onChange={e => onChange(e.target.value)}
          className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/30" />
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Saving indicator */}
      <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500">Editor</span>
        {saving && <span className="text-xs text-rose-500 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Menyimpan...</span>}
      </div>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b border-gray-100 px-2 gap-0.5 scrollbar-none">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2
              ${activeTab === tab.key ? 'text-rose-600 border-rose-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* ── Tab: Font ── */}
        {activeTab === 'font' && (
          <>
            <Select label="Font Judul" value={config.fontHeading} options={HEADING_FONTS} onChange={v => updateField('fontHeading', v)} />
            <Select label="Font Teks" value={config.fontBody} options={BODY_FONTS} onChange={v => updateField('fontBody', v)} />
            <div className="rounded-xl bg-gray-50 p-4 mt-2">
              <p className="text-xs text-gray-400 mb-2">Preview</p>
              <p className="text-xl font-bold" style={{ fontFamily: `'${config.fontHeading}', serif`, color: config.colorPrimary }}>Romeo & Juliet</p>
              <p className="text-sm mt-1" style={{ fontFamily: `'${config.fontBody}', sans-serif`, color: config.colorPrimary }}>Sabtu, 15 November 2025</p>
            </div>
          </>
        )}

        {/* ── Tab: Color ── */}
        {activeTab === 'color' && (
          <>
            <ColorInput label="Warna Utama" value={config.colorPrimary} onChange={v => updateField('colorPrimary', v)} />
            <ColorInput label="Warna Aksen" value={config.colorAccent} onChange={v => updateField('colorAccent', v)} />
            <ColorInput label="Warna Latar" value={config.colorBg} onChange={v => updateField('colorBg', v)} />
            {config.colorText !== undefined && (
              <ColorInput label="Warna Teks" value={config.colorText || '#333'} onChange={v => updateField('colorText', v)} />
            )}
            <div className="rounded-xl p-4 mt-2 border" style={{ backgroundColor: config.colorBg }}>
              <p className="text-xs mb-2" style={{ color: config.colorAccent }}>PREVIEW PALET</p>
              <p className="text-lg font-bold" style={{ color: config.colorPrimary }}>Warna Utama</p>
              <div className="w-12 h-1 rounded mt-2" style={{ backgroundColor: config.colorAccent }} />
            </div>
          </>
        )}

        {/* ── Tab: Layout ── */}
        {activeTab === 'layout' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Hero Layout</label>
              <div className="grid grid-cols-3 gap-2">
                {(['center', 'split', 'full'] as HeroLayout[]).map(layout => (
                  <button key={layout} onClick={() => updateField('heroLayout', layout)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-all border
                      ${config.heroLayout === layout ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {layout}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Spacing</label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'normal', 'spacious'] as SpacingType[]).map(s => (
                  <button key={s} onClick={() => updateField('spacing', s)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-all border
                      ${config.spacing === s ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-600">Section Aktif</label>
              {(Object.keys(SECTION_LABELS) as SectionKey[]).filter(k => k !== 'music_player').map(key => (
                <label key={key} className="flex items-center gap-3 py-1.5 cursor-pointer">
                  <input type="checkbox" checked={(config.sections || []).includes(key)} onChange={() => toggleSection(key)}
                    className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
                  <span className="text-sm text-gray-700">{SECTION_LABELS[key]}</span>
                </label>
              ))}
            </div>
            <label className="flex items-center gap-3 py-1.5 cursor-pointer">
              <input type="checkbox" checked={config.parallax || false} onChange={e => updateField('parallax', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
              <span className="text-sm text-gray-700">Efek Parallax</span>
            </label>
          </>
        )}

        {/* ── Tab: Photo ── */}
        {activeTab === 'photo' && (
          <>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-rose-300 transition-colors">
              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500 mb-2">Upload foto (max 5MB, JPG/PNG/WebP)</p>
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium cursor-pointer hover:bg-rose-100">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Mengupload...' : 'Pilih File'}
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
            {photos.length > 0 && (
              <div className="space-y-2">
                {photos.map((photo, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-200 p-2">
                    <img src={photo.url} alt="" className="w-14 h-14 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <select value={photo.type} onChange={e => setPhotoType(i, e.target.value as InvitationPhoto['type'])}
                        className="w-full rounded-md border border-gray-200 text-xs py-1 px-2">
                        <option value="couple">Foto Pasangan</option>
                        <option value="prewedding">Prewedding</option>
                        <option value="family">Keluarga</option>
                      </select>
                    </div>
                    <button onClick={() => removePhoto(i)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Tab: Music ── */}
        {activeTab === 'music' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">URL Musik (MP3)</label>
              <input type="url" value={musicUrl} onChange={e => setMusicUrl(e.target.value)} placeholder="https://example.com/music.mp3"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/30" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={autoplay} onChange={e => setAutoplay(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
              <span className="text-sm text-gray-700">Autoplay saat halaman dibuka</span>
            </label>
            {musicUrl && (
              <div className="rounded-xl bg-gray-50 p-3">
                <audio controls src={musicUrl} className="w-full h-8" />
              </div>
            )}
            <button onClick={saveMusic}
              className="w-full py-2.5 rounded-xl bg-rose-500 text-white text-sm font-medium hover:bg-rose-600 transition-colors">
              Simpan Musik
            </button>
          </>
        )}

        {/* ── Tab: Animation ── */}
        {activeTab === 'animation' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Tipe Animasi</label>
              <div className="grid grid-cols-2 gap-2">
                {(['fade', 'slide', 'zoom', 'none'] as AnimationType[]).map(anim => (
                  <button key={anim} onClick={() => updateField('animation', anim)}
                    className={`py-2.5 rounded-lg text-xs font-medium capitalize transition-all border
                      ${config.animation === anim ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {anim === 'none' ? 'Tanpa Animasi' : anim}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Gaya Countdown</label>
              <div className="grid grid-cols-3 gap-2">
                {(['box', 'minimal', 'ring'] as const).map(style => (
                  <button key={style} onClick={() => updateField('countdownStyle', style)}
                    className={`py-2 rounded-lg text-xs font-medium capitalize transition-all border
                      ${config.countdownStyle === style ? 'bg-rose-50 border-rose-300 text-rose-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                    {style}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={config.showOrnament || false} onChange={e => updateField('showOrnament', e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-rose-500 focus:ring-rose-500" />
              <span className="text-sm text-gray-700">Tampilkan Ornamen Adat</span>
            </label>
            {config.showOrnament && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-600">Opacity Ornamen: {Math.round((config.ornamentOpacity || 0.3) * 100)}%</label>
                <input type="range" min="0.1" max="1" step="0.05" value={config.ornamentOpacity || 0.3}
                  onChange={e => updateField('ornamentOpacity', parseFloat(e.target.value))}
                  className="w-full accent-rose-500" />
              </div>
            )}
          </>
        )}

        {/* ── Tab: Text ── */}
        {activeTab === 'text' && (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-600">Quote / Kutipan</label>
              <textarea value={config.quote || ''} onChange={e => updateField('quote', e.target.value)}
                rows={4} placeholder="Contoh: Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-500/30" />
            </div>
            {config.quote && (
              <div className="rounded-xl p-4 border" style={{ backgroundColor: config.colorBg }}>
                <p className="text-sm italic text-center" style={{ fontFamily: `'${config.fontBody}', sans-serif`, color: config.colorPrimary }}>
                  &ldquo;{config.quote}&rdquo;
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
