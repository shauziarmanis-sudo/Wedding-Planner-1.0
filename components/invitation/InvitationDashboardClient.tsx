"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InvitationTemplate, UserInvitation, InvitationConfig, InvitationPhoto } from "@/types/invitation.types";
import { createOrSwitchTemplate, publishInvitation, unpublishInvitation } from "@/actions/invitation.actions";
import { Palette, Eye, BarChart3, LayoutGrid, ArrowLeft, Globe, GlobeLock, ExternalLink, Copy, Check, Wand2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";

import TemplateGallery from "@/components/invitation/TemplateGallery";
import InvitationEditorPanel from "@/components/invitation/InvitationEditorPanel";
import InvitationLivePreview from "@/components/invitation/InvitationLivePreview";

interface Props {
  initialInvitation: UserInvitation | null;
  templates: InvitationTemplate[];
  initialStats: {
    viewCount: number;
    rsvpCount: number;
    isPublished: boolean;
    publicSlug: string;
    publishedAt?: string;
  } | null;
}

type ActiveView = 'gallery' | 'editor' | 'preview' | 'stats';

export default function InvitationDashboardClient({ initialInvitation, templates, initialStats }: Props) {
  const [invitation, setInvitation] = useState<UserInvitation | null>(initialInvitation);
  const [activeView, setActiveView] = useState<ActiveView>(initialInvitation ? 'editor' : 'gallery');
  const [stats, setStats] = useState(initialStats);
  const [publishing, setPublishing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Live editor state
  const [liveConfig, setLiveConfig] = useState<InvitationConfig>(initialInvitation?.config || {} as InvitationConfig);
  const [livePhotos, setLivePhotos] = useState<InvitationPhoto[]>(initialInvitation?.photos || []);
  const [liveMusicUrl, setLiveMusicUrl] = useState<string | null>(initialInvitation?.music_url || null);
  const [liveMusicAutoplay, setLiveMusicAutoplay] = useState(initialInvitation?.music_autoplay || false);

  const handleSelectTemplate = useCallback(async (templateId: string) => {
    const result = await createOrSwitchTemplate(templateId);
    if (result.success && result.invitation) {
      setInvitation(result.invitation);
      setLiveConfig(result.invitation.config);
      setLivePhotos(result.invitation.photos);
      setLiveMusicUrl(result.invitation.music_url || null);
      setLiveMusicAutoplay(result.invitation.music_autoplay);
      setActiveView('editor');
      toast.success("Template berhasil dipilih!");
    } else {
      toast.error(result.error || "Gagal memilih template");
    }
  }, []);

  const handlePublish = useCallback(async () => {
    setPublishing(true);
    const result = await publishInvitation();
    if (result.success) {
      setInvitation(prev => prev ? { ...prev, is_published: true } : prev);
      setStats(prev => prev ? { ...prev, isPublished: true } : prev);
      toast.success("Undangan berhasil dipublish!");
    } else {
      toast.error(result.error || "Gagal publish undangan");
    }
    setPublishing(false);
  }, []);

  const handleUnpublish = useCallback(async () => {
    const result = await unpublishInvitation();
    if (result.success) {
      setInvitation(prev => prev ? { ...prev, is_published: false } : prev);
      setStats(prev => prev ? { ...prev, isPublished: false } : prev);
      toast.success("Undangan di-unpublish");
    } else {
      toast.error(result.error || "Gagal unpublish");
    }
  }, []);

  const copyLink = useCallback(() => {
    if (!invitation) return;
    const url = `${window.location.origin}/i/${invitation.public_slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link disalin!");
    setTimeout(() => setCopied(false), 2000);
  }, [invitation]);

  // ── Gallery View ───────────────────────────────────────────────
  if (activeView === 'gallery') {
    return (
      <div className="p-4 md:p-6">
        {invitation && (
          <button onClick={() => setActiveView('editor')}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Editor
          </button>
        )}
        <TemplateGallery
          templates={templates}
          onSelect={handleSelectTemplate}
          currentTemplateId={invitation?.template_id}
        />
      </div>
    );
  }

  // ── No invitation yet ──────────────────────────────────────────
  if (!invitation) {
    return (
      <div className="p-4 md:p-6">
        <TemplateGallery templates={templates} onSelect={handleSelectTemplate} />
      </div>
    );
  }

  // ── Tab Navigation ─────────────────────────────────────────────
  const tabs: { key: ActiveView; label: string; icon: typeof Palette }[] = [
    { key: 'editor', label: 'Edit Undangan', icon: Palette },
    { key: 'preview', label: 'Preview', icon: Eye },
    { key: 'stats', label: 'Statistik', icon: BarChart3 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Undangan Digital</h2>
          <p className="text-sm text-gray-500">Template: {invitation.template?.name || invitation.template_id}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/dashboard/builder"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all">
            <Wand2 className="w-4 h-4" /> Buka Visual Builder
          </Link>
          <button onClick={() => setActiveView('gallery')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <LayoutGrid className="w-4 h-4" /> Ganti Template
          </button>
          {invitation.is_published ? (
            <div className="flex items-center gap-2">
              <button onClick={copyLink}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition-colors">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                Salin Link
              </button>
              <a href={`/i/${invitation.public_slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-700 transition-colors">
                <ExternalLink className="w-4 h-4" /> Lihat Live
              </a>
              <button onClick={handleUnpublish}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-100 transition-colors">
                <GlobeLock className="w-4 h-4" /> Unpublish
              </button>
            </div>
          ) : (
            <button onClick={handlePublish} disabled={publishing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all disabled:opacity-50">
              <Globe className="w-4 h-4" />
              {publishing ? 'Publishing...' : 'Publish Sekarang'}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActiveView(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${activeView === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>

          {activeView === 'editor' && (
            <div className="flex gap-6 items-start">
              <div className="w-80 shrink-0 sticky top-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                <InvitationEditorPanel
                  invitation={invitation}
                  onConfigChange={setLiveConfig}
                  onPhotosChange={setLivePhotos}
                  onMusicChange={(url, autoplay) => { setLiveMusicUrl(url); setLiveMusicAutoplay(autoplay); }}
                />
              </div>
              <div className="flex-1">
                <InvitationLivePreview
                  invitation={invitation}
                  config={liveConfig}
                  photos={livePhotos}
                  musicUrl={liveMusicUrl}
                  musicAutoplay={liveMusicAutoplay}
                />
              </div>
            </div>
          )}

          {activeView === 'preview' && (
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden">
              <div className="bg-gray-50 border-b px-4 py-3 flex items-center justify-between">
                <span className="text-sm text-gray-500">Preview Mode</span>
                <a href={`/i/${invitation.public_slug}`} target="_blank" rel="noopener noreferrer"
                  className="text-sm text-rose-600 hover:underline flex items-center gap-1">
                  Buka Full Page <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <iframe src={invitation.is_published ? `/i/${invitation.public_slug}` : undefined}
                className="w-full min-h-[700px] border-0"
                title="Invitation Preview" />
              {!invitation.is_published && (
                <div className="p-8 text-center text-gray-400 text-sm">
                  Publish undangan terlebih dahulu untuk melihat preview.
                </div>
              )}
            </div>
          )}

          {activeView === 'stats' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{stats?.viewCount || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Total Views</p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                <p className="text-3xl font-bold text-gray-900">{stats?.rsvpCount || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Sudah RSVP</p>
              </div>
              <div className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${stats?.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {stats?.isPublished ? <Globe className="w-4 h-4" /> : <GlobeLock className="w-4 h-4" />}
                  {stats?.isPublished ? 'Published' : 'Draft'}
                </div>
                <p className="text-sm text-gray-500 mt-2">Status</p>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}
