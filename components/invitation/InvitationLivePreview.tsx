"use client";

import { Suspense, lazy, useMemo, useState } from "react";
import { UserInvitation, InvitationConfig, InvitationPhoto, BaseTemplateProps } from "@/types/invitation.types";
import { getTemplateLoader } from "@/lib/invitation-registry";
import { Monitor, Smartphone, User, Loader2 } from "lucide-react";

interface Props {
  invitation: UserInvitation;
  config: InvitationConfig;
  photos: InvitationPhoto[];
  musicUrl: string | null;
  musicAutoplay: boolean;
}

function PreviewSkeleton() {
  return (
    <div className="flex items-center justify-center h-full min-h-[500px] bg-gray-50">
      <div className="text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-300" />
        <p className="text-sm text-gray-400">Memuat template...</p>
      </div>
    </div>
  );
}

export default function InvitationLivePreview({ invitation, config, photos, musicUrl, musicAutoplay }: Props) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('mobile');
  const [previewAsGuest, setPreviewAsGuest] = useState(false);
  const [guestNameInput, setGuestNameInput] = useState('');

  const componentPath = invitation.template?.component_path || '';

  const TemplateComponent = useMemo(() => {
    const loader = getTemplateLoader(componentPath);
    if (!loader) return null;
    return lazy(loader);
  }, [componentPath]);

  const weddingData: BaseTemplateProps['weddingData'] = {
    groomName: 'Romeo',
    brideName: 'Juliet',
    weddingDate: '2025-11-15',
    akadTime: '08:00 WIB',
    resepsiTime: '11:00 - 14:00 WIB',
    venueName: 'Grand Ballroom Hotel',
    venueAddress: 'Jl. Contoh No. 123, Jakarta',
    groomFather: 'Ahmad',
    groomMother: 'Siti',
    brideFather: 'Budi',
    brideMother: 'Ani',
    quote: config.quote || 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan hidup dari jenismu sendiri.',
  };

  if (!TemplateComponent) {
    return (
      <div className="flex items-center justify-center h-full min-h-[500px] rounded-2xl bg-gray-50 border border-gray-200">
        <p className="text-sm text-gray-400">Template tidak ditemukan</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${viewMode === 'desktop' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Monitor className="w-3.5 h-3.5" /> Desktop
          </button>
          <button onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${viewMode === 'mobile' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            <Smartphone className="w-3.5 h-3.5" /> Mobile
          </button>
        </div>

        {/* Guest preview toggle */}
        <div className="flex items-center gap-2">
          <button onClick={() => setPreviewAsGuest(!previewAsGuest)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border
              ${previewAsGuest ? 'bg-rose-50 border-rose-200 text-rose-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
            <User className="w-3.5 h-3.5" /> Preview Tamu
          </button>
          {previewAsGuest && (
            <input
              type="text"
              value={guestNameInput}
              onChange={e => setGuestNameInput(e.target.value)}
              placeholder="Nama tamu..."
              className="w-32 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/30"
            />
          )}
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto bg-[#f0f0f0] p-4 flex justify-center">
        <div
          className={`bg-white shadow-xl transition-all duration-300 overflow-hidden ${
            viewMode === 'mobile'
              ? 'w-[375px] rounded-[2rem] ring-4 ring-gray-800 ring-offset-2'
              : 'w-full max-w-[1024px] rounded-xl'
          }`}
          style={{ minHeight: viewMode === 'mobile' ? '667px' : '600px' }}
        >
          <div className={`${viewMode === 'mobile' ? 'overflow-y-auto' : ''}`}
            style={{ maxHeight: viewMode === 'mobile' ? '667px' : 'none' }}>
            <Suspense fallback={<PreviewSkeleton />}>
              <TemplateComponent
                key={`${componentPath}-${JSON.stringify(config)}`}
                weddingData={weddingData}
                guestName={previewAsGuest ? (guestNameInput || 'Budi Santoso') : undefined}
                config={config}
                photos={photos}
                musicUrl={undefined}
                musicAutoplay={false}
                isPreview={true}
                publicSlug={invitation.public_slug}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
