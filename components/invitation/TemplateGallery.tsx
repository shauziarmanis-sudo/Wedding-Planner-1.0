"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { InvitationTemplate, RegionTag } from "@/types/invitation.types";
import { REGION_LABELS } from "@/lib/invitation-registry";
import { Check, Loader2, Sparkles, Eye } from "lucide-react";

interface Props {
  templates: InvitationTemplate[];
  onSelect: (templateId: string) => Promise<void>;
  currentTemplateId?: string;
}

const ALL_FILTER = 'SEMUA';

export default function TemplateGallery({ templates, onSelect, currentTemplateId }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>(ALL_FILTER);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<InvitationTemplate | null>(null);

  // Collect unique regions from templates
  const regions = Array.from(new Set(templates.flatMap(t => t.region_tags)));

  const filtered = activeFilter === ALL_FILTER
    ? templates
    : templates.filter(t => t.region_tags.includes(activeFilter as RegionTag));

  const handleSelect = useCallback(async (templateId: string) => {
    setLoadingId(templateId);
    await onSelect(templateId);
    setLoadingId(null);
  }, [onSelect]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Pilih Template Undangan</h2>
        <p className="text-sm text-gray-500 mt-1">15 desain dari berbagai adat &amp; gaya Indonesia</p>
      </div>

      {/* Region Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveFilter(ALL_FILTER)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all
            ${activeFilter === ALL_FILTER
              ? 'bg-gray-900 text-white shadow-md'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
        >
          ✨ Semua
        </button>
        {regions.map(region => (
          <button
            key={region}
            onClick={() => setActiveFilter(region)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all
              ${activeFilter === region
                ? 'bg-gray-900 text-white shadow-md'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {REGION_LABELS[region] || region}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filtered.map(template => {
            const isActive = template.template_id === currentTemplateId;
            const isLoading = loadingId === template.template_id;

            return (
              <motion.div
                key={template.template_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                className={`group relative rounded-2xl border-2 overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all
                  ${isActive ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-gray-200 hover:border-gray-300'}`}
              >
                {/* Thumbnail / Color Preview */}
                <div
                  className="h-44 relative overflow-hidden cursor-pointer"
                  onClick={() => setPreviewTemplate(template)}
                  style={{ backgroundColor: (template.default_config as any)?.colorBg || '#f5f5f5' }}
                >
                  {/* Decorative preview with template colors */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center px-6">
                      <p className="text-xs uppercase tracking-[0.2em] mb-2 opacity-60"
                        style={{ color: (template.default_config as any)?.colorAccent, fontFamily: 'sans-serif' }}>
                        Undangan Pernikahan
                      </p>
                      <p className="text-2xl font-bold"
                        style={{ color: (template.default_config as any)?.colorPrimary, fontFamily: 'serif' }}>
                        Romeo &amp; Juliet
                      </p>
                      <div className="w-16 h-0.5 mx-auto mt-3 rounded-full"
                        style={{ backgroundColor: (template.default_config as any)?.colorAccent }} />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 text-sm font-medium text-gray-700 shadow-lg">
                      <Eye className="w-4 h-4" /> Preview
                    </span>
                  </div>

                  {/* Active badge */}
                  {isActive && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500 text-white text-xs font-medium shadow-md">
                      <Check className="w-3 h-3" /> Aktif
                    </div>
                  )}

                  {/* Premium badge */}
                  {template.is_premium && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500 text-white text-xs font-medium shadow-md">
                      <Sparkles className="w-3 h-3" /> Premium
                    </div>
                  )}
                </div>

                {/* Card Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{template.description}</p>
                  </div>

                  {/* Region badges */}
                  <div className="flex flex-wrap gap-1.5">
                    {template.region_tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 text-xs text-gray-600 font-medium">
                        {REGION_LABELS[tag] || tag}
                      </span>
                    ))}
                  </div>

                  {/* Action button */}
                  <button
                    onClick={() => handleSelect(template.template_id)}
                    disabled={isActive || isLoading}
                    className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all
                      ${isActive
                        ? 'bg-rose-50 text-rose-600 cursor-default'
                        : 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-sm hover:shadow-md active:scale-[0.98]'}
                      disabled:opacity-60`}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                    ) : isActive ? (
                      'Template Aktif'
                    ) : currentTemplateId ? (
                      'Ganti Template'
                    ) : (
                      'Gunakan Template'
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">Tidak ada template untuk filter ini.</p>
        </div>
      )}

      {/* Preview Modal */}
      <AnimatePresence>
        {previewTemplate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={() => setPreviewTemplate(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
            >
              {/* Modal preview header */}
              <div className="h-56 relative"
                style={{ backgroundColor: (previewTemplate.default_config as any)?.colorBg || '#f5f5f5' }}>
                <div className="absolute inset-0 flex items-center justify-center text-center px-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] mb-3 opacity-50"
                      style={{ color: (previewTemplate.default_config as any)?.colorAccent }}>
                      Undangan Pernikahan
                    </p>
                    <p className="text-3xl font-bold"
                      style={{ color: (previewTemplate.default_config as any)?.colorPrimary, fontFamily: 'serif' }}>
                      Romeo &amp; Juliet
                    </p>
                    <p className="text-sm mt-2 opacity-60"
                      style={{ color: (previewTemplate.default_config as any)?.colorPrimary }}>
                      Sabtu, 15 November 2025
                    </p>
                    <div className="w-20 h-0.5 mx-auto mt-4 rounded-full"
                      style={{ backgroundColor: (previewTemplate.default_config as any)?.colorAccent }} />
                  </div>
                </div>
              </div>
              {/* Modal info */}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{previewTemplate.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{previewTemplate.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.region_tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {REGION_LABELS[tag] || tag}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs text-gray-500">
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="font-semibold text-gray-700">{(previewTemplate.default_config as any)?.fontHeading}</p>
                    <p>Heading Font</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="font-semibold text-gray-700">{(previewTemplate.default_config as any)?.heroLayout}</p>
                    <p>Hero Layout</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3">
                    <p className="font-semibold text-gray-700">{(previewTemplate.default_config as any)?.animation}</p>
                    <p>Animasi</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setPreviewTemplate(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                    Tutup
                  </button>
                  <button
                    onClick={() => { handleSelect(previewTemplate.template_id); setPreviewTemplate(null); }}
                    disabled={previewTemplate.template_id === currentTemplateId}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-sm font-semibold text-white shadow-sm hover:shadow-md transition-all disabled:opacity-50">
                    {previewTemplate.template_id === currentTemplateId ? 'Sudah Aktif' : 'Gunakan Template'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
