"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  InvitationTemplate,
  UserInvitation,
  InvitationConfig,
  InvitationPhoto,
  RegionTag,
  PublicInvitationPageData
} from "@/types/invitation.types";

// ── GET TEMPLATES (public, no auth) ──────────────────────────────
export async function getInvitationTemplates(
  regionFilter?: RegionTag
): Promise<InvitationTemplate[]> {
  try {
    const supabase = createAdminClient();
    let query = supabase
      .from('invitation_templates')
      .select('*')
      .order('sort_order', { ascending: true });

    if (regionFilter) {
      query = query.contains('region_tags', [regionFilter]);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as InvitationTemplate[];
  } catch (error: any) {
    console.error("getInvitationTemplates error:", error);
    return [];
  }
}

// ── GET USER INVITATION ───────────────────────────────────────────
export async function getUserInvitation(): Promise<UserInvitation | null> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { data, error } = await supabase
      .from('user_invitations')
      .select('*, invitation_templates(*)')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return null;

    return {
      ...data,
      template: data.invitation_templates
    } as UserInvitation;
  } catch (error: any) {
    console.error("getUserInvitation error:", error);
    return null;
  }
}

// ── CREATE OR SWITCH INVITATION TEMPLATE ────────────────────────
export async function createOrSwitchTemplate(
  templateId: string
): Promise<{ success: boolean; invitation?: UserInvitation; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Ambil default config dari template
    const { data: template, error: tError } = await supabase
      .from('invitation_templates')
      .select('*')
      .eq('template_id', templateId)
      .single();

    if (tError || !template) return { success: false, error: "Template tidak ditemukan" };

    // Cek apakah user sudah punya undangan
    const { data: existing } = await supabase
      .from('user_invitations')
      .select('id, public_slug')
      .eq('user_id', user.id)
      .single();

    const publicSlug = existing?.public_slug || `undangan-${nanoid(10)}`;

    const invitationData = {
      user_id: user.id,
      template_id: templateId,
      public_slug: publicSlug,
      config: template.default_config,
      photos: [],
      is_published: false,
      music_url: null,
      music_autoplay: false,
      updated_at: new Date().toISOString()
    };

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('user_invitations')
        .update(invitationData)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('user_invitations')
        .insert(invitationData)
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    revalidatePath("/dashboard/invitation");
    return { success: true, invitation: result as UserInvitation };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── UPDATE CONFIG (auto-save) ────────────────────────────────────
export async function updateInvitationConfig(
  config: Partial<InvitationConfig>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    // Merge dengan config yang ada
    const { data: current } = await supabase
      .from('user_invitations')
      .select('config')
      .eq('user_id', user.id)
      .single();

    const mergedConfig = { ...(current?.config || {}), ...config };

    const { error } = await supabase
      .from('user_invitations')
      .update({ config: mergedConfig, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── UPDATE MUSIC ─────────────────────────────────────────────────
export async function updateInvitationMusic(
  musicUrl: string | null,
  autoplay: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { error } = await supabase
      .from('user_invitations')
      .update({
        music_url: musicUrl,
        music_autoplay: autoplay,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── UPDATE PHOTOS ────────────────────────────────────────────────
export async function updateInvitationPhotos(
  photos: InvitationPhoto[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { error } = await supabase
      .from('user_invitations')
      .update({ photos, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── UPLOAD PHOTO TO STORAGE ──────────────────────────────────────
export async function uploadInvitationPhoto(
  formData: FormData
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const file = formData.get('file') as File;
    if (!file) return { success: false, error: "File tidak ditemukan" };

    // Validasi file: max 5MB, tipe jpg/png/webp
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { success: false, error: "Ukuran file maksimal 5MB" };
    }
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: "Tipe file harus JPG, PNG, atau WebP" };
    }

    const ext = file.name.split('.').pop();
    const path = `invitations/${user.id}/${nanoid(8)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('wedding-assets')
      .upload(path, file, { cacheControl: '3600', upsert: false });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('wedding-assets')
      .getPublicUrl(path);

    return { success: true, url: publicUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── PUBLISH INVITATION ───────────────────────────────────────────
export async function publishInvitation(): Promise<{
  success: boolean;
  publicUrl?: string;
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data: inv, error: fetchErr } = await supabase
      .from('user_invitations')
      .select('public_slug')
      .eq('user_id', user.id)
      .single();

    if (fetchErr || !inv) return { success: false, error: "Undangan tidak ditemukan" };

    const { error } = await supabase
      .from('user_invitations')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (error) throw error;

    revalidatePath(`/i/${inv.public_slug}`);
    revalidatePath("/dashboard/invitation");
    return {
      success: true,
      publicUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/i/${inv.public_slug}`
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── UNPUBLISH INVITATION ─────────────────────────────────────────
export async function unpublishInvitation(): Promise<{ success: boolean; error?: string }> {
  try {
    const { supabase, user } = await getAuthenticatedUser();
    const { error } = await supabase
      .from('user_invitations')
      .update({ is_published: false, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    if (error) throw error;
    revalidatePath("/dashboard/invitation");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ── GET PUBLIC INVITATION (no auth, by slug) ─────────────────────
export async function getPublicInvitation(
  slug: string,
  rsvpToken?: string
): Promise<PublicInvitationPageData | null> {
  try {
    const supabase = createAdminClient();

    const { data: inv, error } = await supabase
      .from('user_invitations')
      .select('*, invitation_templates(*)')
      .eq('public_slug', slug)
      .eq('is_published', true)
      .single();

    if (error || !inv) return null;

    // Ambil wedding profile user tersebut
    const { data: profile } = await supabase
      .from('wedding_profiles')
      .select('*')
      .eq('user_id', inv.user_id)
      .single();

    // Jika ada rsvp_token, ambil nama tamu
    let guestName: string | undefined;
    if (rsvpToken) {
      const { data: guest } = await supabase
        .from('guests')
        .select('name')
        .eq('rsvp_token', rsvpToken)
        .eq('user_id', inv.user_id)
        .single();
      guestName = guest?.name;
    }

    // Increment view count (non-blocking, fire and forget)
    supabase
      .from('user_invitations')
      .update({ view_count: (inv.view_count || 0) + 1 })
      .eq('public_slug', slug)
      .then(() => {});

    return {
      invitation: { ...inv, template: inv.invitation_templates } as UserInvitation,
      template: inv.invitation_templates as InvitationTemplate,
      weddingProfile: profile || {},
      guestName,
      rsvpToken
    };
  } catch (error: any) {
    console.error("getPublicInvitation error:", error);
    return null;
  }
}

// ── GET INVITATION STATS ─────────────────────────────────────────
export async function getInvitationStats(): Promise<{
  viewCount: number;
  rsvpCount: number;
  isPublished: boolean;
  publicSlug: string;
  publishedAt?: string;
} | null> {
  try {
    const { supabase, user } = await getAuthenticatedUser();

    const { data: inv } = await supabase
      .from('user_invitations')
      .select('view_count, is_published, public_slug, published_at')
      .eq('user_id', user.id)
      .single();

    if (!inv) return null;

    const { count: rsvpCount } = await supabase
      .from('guests')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .neq('rsvp_status', 'BELUM_KONFIRMASI');

    return {
      viewCount: inv.view_count || 0,
      rsvpCount: rsvpCount || 0,
      isPublished: inv.is_published,
      publicSlug: inv.public_slug,
      publishedAt: inv.published_at
    };
  } catch (error: any) {
    return null;
  }
}
