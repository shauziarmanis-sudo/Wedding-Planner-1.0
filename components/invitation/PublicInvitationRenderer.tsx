"use client";

import { Suspense, lazy, useMemo, useCallback } from "react";
import { PublicInvitationPageData, BaseTemplateProps } from "@/types/invitation.types";
import { getTemplateLoader } from "@/lib/invitation-registry";
import { submitRSVP } from "@/actions/rsvp";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

interface Props {
  data: PublicInvitationPageData;
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400" />
        <p className="text-sm text-gray-500">Memuat undangan...</p>
      </div>
    </div>
  );
}

export default function PublicInvitationRenderer({ data }: Props) {
  const { invitation, template, weddingProfile, guestName, rsvpToken } = data;

  const TemplateComponent = useMemo(() => {
    const loader = getTemplateLoader(template.component_path);
    if (!loader) return null;
    return lazy(loader);
  }, [template.component_path]);

  const handleRSVP = useCallback(async (rsvpData: Parameters<NonNullable<BaseTemplateProps['onRSVP']>>[0]) => {
    try {
      const result = await submitRSVP(rsvpData);
      if (result && 'error' in result && result.error) {
        toast.error(result.error as string);
      } else {
        toast.success("Terima kasih! Konfirmasi Anda telah tersimpan.");
      }
    } catch {
      toast.error("Gagal mengirim konfirmasi. Silakan coba lagi.");
    }
  }, []);

  if (!TemplateComponent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-gray-500">Template tidak ditemukan.</p>
      </div>
    );
  }

  const weddingData: BaseTemplateProps['weddingData'] = {
    groomName: weddingProfile.groom_name || 'Mempelai Pria',
    brideName: weddingProfile.bride_name || 'Mempelai Wanita',
    weddingDate: weddingProfile.wedding_date || '',
    akadTime: weddingProfile.akad_time || undefined,
    resepsiTime: weddingProfile.resepsi_time || undefined,
    venueName: weddingProfile.venue_name || undefined,
    venueAddress: weddingProfile.venue_address || undefined,
    venueMapUrl: weddingProfile.venue_map_url || undefined,
    groomFather: weddingProfile.groom_father || undefined,
    groomMother: weddingProfile.groom_mother || undefined,
    brideFather: weddingProfile.bride_father || undefined,
    brideMother: weddingProfile.bride_mother || undefined,
    quote: invitation.config.quote || weddingProfile.quote || undefined,
  };

  return (
    <Suspense fallback={<LoadingFallback />}>
      <TemplateComponent
        weddingData={weddingData}
        guestName={guestName}
        config={invitation.config}
        photos={invitation.photos}
        musicUrl={invitation.music_url}
        musicAutoplay={invitation.music_autoplay}
        isPreview={false}
        onRSVP={handleRSVP}
        publicSlug={invitation.public_slug}
        rsvpToken={rsvpToken}
      />
    </Suspense>
  );
}
