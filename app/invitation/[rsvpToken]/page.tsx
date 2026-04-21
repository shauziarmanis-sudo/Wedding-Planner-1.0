import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';
import InvitationTemplate from '@/components/invitation/InvitationTemplate';

interface Props {
  params: { rsvpToken: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Undangan Pernikahan',
    description: 'Konfirmasi kehadiran Anda di acara pernikahan kami.',
  };
}

export default async function InvitationPage({ params }: Props) {
  const { rsvpToken } = params;

  if (!rsvpToken) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF7F2]">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-[#C8975A]/20">
          <h1 className="text-2xl font-serif text-[#2C1810] mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Maaf, link undangan tidak valid atau tidak lengkap.</p>
        </div>
      </div>
    );
  }

  const supabase = createAdminClient();
  const { data: guest, error } = await supabase
    .from('guests')
    .select('*, wedding_profiles!inner(*)')
    .eq('rsvp_token', rsvpToken)
    .single();

  if (error || !guest) {
    notFound();
  }

  const profile = Array.isArray(guest.wedding_profiles) ? guest.wedding_profiles[0] : guest.wedding_profiles;
  const weddingProps = {
    groomName: profile?.groom_name || "Groom",
    brideName: profile?.bride_name || "Bride",
    akadDate: profile?.wedding_date || "",
    akadTime: profile?.akad_time || "",
    akadVenue: profile?.venue_name || "",
    resepsiDate: profile?.wedding_date || "",
    resepsiTime: profile?.resepsi_time || "",
    resepsiVenue: profile?.venue_name || "",
    quote: "Terima kasih atas doa dan restunya.",
  };

  return (
    <InvitationTemplate 
      guest={{ name: guest.name, pax: guest.pax_estimate || 1, rsvp_token: rsvpToken }} 
      wedding={weddingProps}
    />
  );
}
