import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    // Using simple supabase client since we are in edge runtime without cookies for public data
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: inv, error } = await supabase
      .from("user_invitations")
      .select("*, wedding_profiles(*)")
      .eq("public_slug", params.slug)
      .eq("is_published", true)
      .single();

    if (error || !inv) {
      return new Response("Not found", { status: 404 });
    }

    const couplePhoto = inv.photos?.find((p: any) => p.type === "couple")?.url || null;
    const groomName = inv.wedding_profiles?.groom_name || "Groom";
    const brideName = inv.wedding_profiles?.bride_name || "Bride";
    const weddingDate = inv.wedding_profiles?.wedding_date;
    const primaryColor = inv.config?.colorPrimary || "#C2185B";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFF8E1",
            fontFamily: "sans-serif",
            position: "relative",
          }}
        >
          {couplePhoto && (
            <img
              src={couplePhoto}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          )}
          {couplePhoto && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
              }}
            />
          )}

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "60px 80px",
              border: `4px solid ${couplePhoto ? "rgba(255,255,255,0.3)" : primaryColor}`,
              borderRadius: "24px",
              backgroundColor: couplePhoto ? "rgba(0, 0, 0, 0.4)" : "#ffffff",
              boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              zIndex: 10,
            }}
          >
            <p
              style={{
                fontSize: 24,
                textTransform: "uppercase",
                letterSpacing: "0.4em",
                color: couplePhoto ? "#ffffff" : primaryColor,
                marginBottom: 24,
                fontWeight: 600,
              }}
            >
              Wedding Invitation
            </p>
            <h1
              style={{
                fontSize: 84,
                fontWeight: "bold",
                color: couplePhoto ? "#ffffff" : "#1A1A1A",
                margin: 0,
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              {groomName} &amp; {brideName}
            </h1>
            {weddingDate && (
              <p
                style={{
                  fontSize: 32,
                  color: couplePhoto ? "rgba(255,255,255,0.9)" : "#666666",
                  marginTop: 32,
                  fontWeight: 500,
                }}
              >
                {format(new Date(weddingDate), "EEEE, d MMMM yyyy", { locale: idLocale })}
              </p>
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("OG Image generation failed:", e);
    return new Response("Failed to generate image", { status: 500 });
  }
}
