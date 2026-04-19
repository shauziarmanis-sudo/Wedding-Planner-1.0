import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getGuestPublic } from '@/actions/guest.actions';
import { getMetadataPublic } from '@/actions/metadata';
import InvitationTemplate from '@/components/invitation/InvitationTemplate';

interface Props {
  params: { guestId: string };
  searchParams: { t?: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: 'Undangan Pernikahan',
    description: 'Konfirmasi kehadiran Anda di acara pernikahan kami.',
  };
}

export default async function InvitationPage({ params, searchParams }: Props) {
  const { guestId } = params;
  const token = searchParams.t;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF7F2]">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl border border-[#C8975A]/20">
          <h1 className="text-2xl font-serif text-[#2C1810] mb-4">Akses Ditolak</h1>
          <p className="text-gray-600 mb-6">Maaf, link undangan tidak valid atau tidak lengkap.</p>
        </div>
      </div>
    );
  }

  const guest = await getGuestPublic(guestId, token);
  if (!guest) {
    notFound();
  }

  const spreadsheetId = Buffer.from(token, 'base64').toString();
  const metadata = await getMetadataPublic(spreadsheetId);
  
  const weddingProps = {
    groomName: metadata.groom_name || "Groom",
    brideName: metadata.bride_name || "Bride",
    akadDate: metadata.akad_date || "",
    akadTime: metadata.akad_time || "",
    akadVenue: metadata.akad_venue || "",
    resepsiDate: metadata.resepsi_date || "",
    resepsiTime: metadata.resepsi_time || "",
    resepsiVenue: metadata.resepsi_venue || "",
    quote: metadata.wedding_quote || "",
  };

  return (
    <InvitationTemplate 
      guest={{ name: guest.name, pax: guest.pax_estimate || 1 }} 
      wedding={weddingProps}
    />
  );
}
