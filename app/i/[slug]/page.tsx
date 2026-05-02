import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInvitation } from "@/actions/invitation.actions";
import PublicInvitationRenderer from "@/components/invitation/PublicInvitationRenderer";

interface Props {
  params: { slug: string };
  searchParams: { g?: string };
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const data = await getPublicInvitation(params.slug, searchParams.g);
  if (!data) return { title: "Undangan Pernikahan" };

  const { weddingProfile, invitation } = data;
  const groomName = weddingProfile.groom_name || 'Mempelai Pria';
  const brideName = weddingProfile.bride_name || 'Mempelai Wanita';
  const title = `${groomName} & ${brideName} — Undangan Pernikahan`;
  const description = `Kami mengundang Anda hadir di hari bahagia kami. Konfirmasi kehadiran Anda sekarang.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: `/api/og/invitation/${params.slug}`,
          width: 1200,
          height: 630,
          alt: title,
        }
      ],
    },
  };
}

export default async function PublicInvitationPage({ params, searchParams }: Props) {
  const data = await getPublicInvitation(params.slug, searchParams.g);
  if (!data) notFound();

  return <PublicInvitationRenderer data={data} />;
}

export const revalidate = 60;
