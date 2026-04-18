import InvitationTemplate from "@/components/invitation/InvitationTemplate";

export default function InvitationPage({
  params,
}: {
  params: { slug: string };
}) {
  // In production, this would look up the guest by slug from a public API
  // For now, decode the slug to show the guest name
  const guestName = params.slug
    .split("-")
    .slice(0, -1) // remove the ID suffix
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ") || "Tamu Undangan";

  return (
    <InvitationTemplate
      guest={{
        name: guestName,
        pax: 2,
      }}
    />
  );
}
