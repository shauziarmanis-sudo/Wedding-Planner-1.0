"use server";

import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Data } from "@puckeditor/core";
import type {
  PuckInvitation,
  PuckActionResult,
  PublicPuckPageData,
} from "@/types/puck.types";

// ── GET PUCK DATA BY SLUG (public, no auth — untuk render halaman tamu) ──
export async function getPuckInvitationBySlug(
  slug: string,
  rsvpToken?: string
): Promise<PuckActionResult<PublicPuckPageData>> {
  try {
    const supabase = createAdminClient();

    const { data: inv, error } = await supabase
      .from("user_invitations")
      .select("*")
      .eq("public_slug", slug)
      .eq("is_published", true)
      .eq("builder_mode", "puck")
      .single();

    if (error || !inv) {
      return { success: false, error: "Undangan tidak ditemukan atau belum dipublikasikan" };
    }

    if (!inv.puck_data) {
      return { success: false, error: "Data undangan kosong" };
    }

    // Ambil wedding profile untuk data mempelai
    const { data: profile } = await supabase
      .from("wedding_profiles")
      .select("*")
      .eq("user_id", inv.user_id)
      .single();

    // Resolve nama tamu dari RSVP token
    let guestName: string | undefined;
    if (rsvpToken) {
      const { data: guest } = await supabase
        .from("guests")
        .select("name")
        .eq("rsvp_token", rsvpToken)
        .eq("user_id", inv.user_id)
        .single();
      guestName = guest?.name;
    }

    // Increment view count (fire-and-forget)
    supabase
      .from("user_invitations")
      .update({ view_count: (inv.view_count || 0) + 1 })
      .eq("public_slug", slug)
      .then(() => {});

    return {
      success: true,
      data: {
        puckData: inv.puck_data as Data,
        slug: inv.public_slug,
        isPublished: inv.is_published,
        weddingProfile: profile || {},
        guestName,
        rsvpToken,
      },
    };
  } catch (error: any) {
    console.error("getPuckInvitationBySlug error:", error);
    return { success: false, error: error.message };
  }
}

// ── GET PUCK DATA FOR EDITOR (auth required — untuk dashboard builder) ──
export async function getPuckDataForEditor(): Promise<PuckActionResult<{
  puckData: Data | null;
  slug: string;
  isPublished: boolean;
}>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data: inv, error } = await supabase
      .from("user_invitations")
      .select("public_slug, puck_data, is_published, builder_mode")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    if (!inv) {
      return { success: false, error: "Belum ada undangan. Silakan buat terlebih dahulu." };
    }

    return {
      success: true,
      data: {
        puckData: (inv.puck_data as Data) || null,
        slug: inv.public_slug,
        isPublished: inv.is_published,
      },
    };
  } catch (error: any) {
    console.error("getPuckDataForEditor error:", error);
    return { success: false, error: error.message };
  }
}

// ── SAVE / UPSERT PUCK DATA (auth required — auto-save dari editor) ──
export async function savePuckData(
  puckData: Data
): Promise<PuckActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { error } = await supabase
      .from("user_invitations")
      .update({
        puck_data: puckData as unknown as Record<string, unknown>,
        builder_mode: "puck",
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("savePuckData error:", error);
    return { success: false, error: error.message };
  }
}

// ── PUBLISH PUCK INVITATION (auth required) ──────────────────────
export async function publishPuckInvitation(): Promise<PuckActionResult<{
  publicUrl: string;
}>> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Validasi: pastikan puck_data tidak kosong sebelum publish
    const { data: inv, error: fetchErr } = await supabase
      .from("user_invitations")
      .select("public_slug, puck_data, builder_mode")
      .eq("user_id", user.id)
      .single();

    if (fetchErr || !inv) {
      return { success: false, error: "Undangan tidak ditemukan" };
    }

    if (inv.builder_mode === "puck" && !inv.puck_data) {
      return { success: false, error: "Desain undangan masih kosong. Silakan tambahkan konten terlebih dahulu." };
    }

    const { error } = await supabase
      .from("user_invitations")
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw error;

    const publicUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/i/${inv.public_slug}`;

    revalidatePath(`/i/${inv.public_slug}`);
    revalidatePath("/dashboard/invitation");
    revalidatePath("/dashboard/builder");

    return { success: true, data: { publicUrl } };
  } catch (error: any) {
    console.error("publishPuckInvitation error:", error);
    return { success: false, error: error.message };
  }
}

// ── SWITCH BUILDER MODE (auth required) ──────────────────────────
// Memungkinkan user beralih antara mode template dan puck
export async function switchBuilderMode(
  mode: "template" | "puck"
): Promise<PuckActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { error } = await supabase
      .from("user_invitations")
      .update({
        builder_mode: mode,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (error) throw error;

    revalidatePath("/dashboard/invitation");
    revalidatePath("/dashboard/builder");

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
