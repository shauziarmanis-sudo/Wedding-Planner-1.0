import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInvitation } from "@/actions/invitation.actions";
import { getPuckInvitationBySlug } from "@/actions/puck.actions";
import { createAdminClient } from "@/lib/supabase/admin";
import PublicInvitationRenderer from "@/components/invitation/PublicInvitationRenderer";
import dynamic from "next/dynamic";

// Lazy load Puck renderer (hanya dibutuhkan jika builder_mode === 'puck')
const PuckPublicRenderer = dynamic(
  () => import("@/components/puck/PuckPublicRenderer"),
  { ssr: false }
);

interface Props {
  params: { slug: string };
  searchParams: { g?: string };
}

// ── Helper: Tentukan builder_mode dari slug ──────────────────────
async function getBuilderMode(slug: string): Promise<"template" | "puck" | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("user_invitations")
    .select("builder_mode")
    .eq("public_slug", slug)
    .eq("is_published", true)
    .single();

  return data?.builder_mode || null;
}

// ── Metadata (SEO) ───────────────────────────────────────────────
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const data = await getPublicInvitation(params.slug, searchParams.g);
  if (!data) return { title: "Undangan Pernikahan" };

  const { weddingProfile, invitation } = data;
  const groomName = weddingProfile.groom_name || "Mempelai Pria";
  const brideName = weddingProfile.bride_name || "Mempelai Wanita";
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
        },
      ],
    },
  };
}

// ── Page Component ───────────────────────────────────────────────
export default async function PublicInvitationPage({ params, searchParams }: Props) {
  const builderMode = await getBuilderMode(params.slug);

  if (!builderMode) notFound();

  // ── Mode PUCK: Render dari puck_data JSON ──
  if (builderMode === "puck") {
    const result = await getPuckInvitationBySlug(params.slug, searchParams.g);
    if (!result.success || !result.data) notFound();

    return <PuckPublicRenderer puckData={result.data.puckData} />;
  }

  // ── Mode TEMPLATE: Render dari arsitektur lama ──
  const data = await getPublicInvitation(params.slug, searchParams.g);
  if (!data) notFound();

  return <PublicInvitationRenderer data={data} />;
}

// ISR: revalidate setiap 60 detik
export const revalidate = 60;
