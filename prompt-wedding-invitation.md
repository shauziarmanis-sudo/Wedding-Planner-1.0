# CODEX PROMPT — Digital Wedding Invitation Template Feature
# Life-Start Wedding Planner App
# Next.js 14 · TypeScript · Supabase · Tailwind CSS · Framer Motion

---

## KONTEKS PROYEK

Kamu sedang mengerjakan aplikasi **Life-Start** — sebuah wedding planner berbasis web yang dibangun dengan:
- **Framework**: Next.js 14 (App Router, Server Components, Server Actions)
- **Database & Auth**: Supabase (PostgreSQL + Supabase Auth + Supabase Storage)
- **Styling**: Tailwind CSS + CSS Variables (sudah ada di `globals.css`)
- **Animasi**: Framer Motion
- **Icons**: Lucide React
- **Notifikasi**: react-hot-toast
- **ID unik**: nanoid
- **Bahasa UI**: Bahasa Indonesia
- **Tipe**: TypeScript strict mode

Struktur folder utama:
```
/app              → Next.js App Router pages
/actions          → Server Actions ("use server")
/components       → React components
/lib              → Utilities, Supabase clients, registries
/types            → TypeScript type definitions
```

Auth helpers sudah ada di `lib/auth-helpers.ts` → `getAuthenticatedUser()` untuk semua server actions yang butuh auth.
Supabase client: `lib/supabase/server.ts` (server), `lib/supabase/client.ts` (browser), `lib/supabase/admin.ts` (service role).

---

## TUGAS UTAMA

Implementasikan fitur **Template Undangan Digital** secara lengkap. Fitur ini memungkinkan pengguna memilih template undangan pernikahan dari 15 kategori adat/gaya, mengeditnya secara visual (font, warna, layout, foto, musik, animasi), mempublikasikannya sebagai halaman publik dengan URL unik, dan mengirimkan link personal ke setiap tamu di guest list.

---

## LANGKAH 1 — DATABASE MIGRATION (Supabase SQL)

Buat file `supabase/migrations/001_invitation_templates.sql` dengan isi:

```sql
-- Tabel master template (diisi oleh seed data)
CREATE TABLE invitation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  region_tags TEXT[] NOT NULL DEFAULT '{}',
  description TEXT NOT NULL DEFAULT '',
  preview_thumbnail_url TEXT,
  component_path TEXT NOT NULL,
  default_config JSONB NOT NULL DEFAULT '{}',
  is_premium BOOLEAN NOT NULL DEFAULT false,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabel undangan milik user (satu user bisa punya satu undangan aktif)
CREATE TABLE user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id TEXT NOT NULL REFERENCES invitation_templates(template_id),
  public_slug TEXT UNIQUE NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  music_url TEXT,
  music_autoplay BOOLEAN DEFAULT false,
  photos JSONB NOT NULL DEFAULT '[]',
  is_published BOOLEAN NOT NULL DEFAULT false,
  view_count INT NOT NULL DEFAULT 0,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Index untuk lookup cepat
CREATE INDEX idx_user_invitations_slug ON user_invitations(public_slug);
CREATE INDEX idx_user_invitations_user ON user_invitations(user_id);

-- RLS Policies
ALTER TABLE invitation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- Templates: siapapun bisa baca
CREATE POLICY "Anyone can read templates" ON invitation_templates FOR SELECT USING (true);

-- User invitations: user hanya bisa akses milik sendiri
CREATE POLICY "User owns their invitation" ON user_invitations
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Public invitation: bisa dibaca tanpa auth jika is_published = true
CREATE POLICY "Public can read published invitations" ON user_invitations
  FOR SELECT USING (is_published = true);
```

Buat file `supabase/migrations/002_invitation_seed.sql` dengan data seed 15 template:

```sql
INSERT INTO invitation_templates (template_id, slug, name, region_tags, description, component_path, default_config, sort_order) VALUES
('tpl_jawa_klasik', 'jawa-klasik', 'Jawa Klasik', ARRAY['JAWA'], 'Elegan dengan motif batik kawung dan paes, palet cokelat tembaga dan emas', 'jawa/JawaKlasik', '{"fontHeading":"Playfair Display","fontBody":"Source Serif 4","colorPrimary":"#92400E","colorAccent":"#D97706","colorBg":"#FFF8E7","heroLayout":"center","animation":"fade","spacing":"spacious","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 1),
('tpl_jawa_modern', 'jawa-modern', 'Jawa Modern', ARRAY['JAWA'], 'Batik kontemporer dengan sentuhan minimalis dan tipografi bersih', 'jawa/JawaModern', '{"fontHeading":"Cormorant Garamond","fontBody":"Inter","colorPrimary":"#78350F","colorAccent":"#B45309","colorBg":"#FFFBF5","heroLayout":"split","animation":"slide","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 2),
('tpl_sunda_pastel', 'sunda-pastel', 'Sunda Pastel', ARRAY['SUNDA'], 'Nuansa floral hijau sage dan krem, terinspirasi taman Sunda yang asri', 'sunda/SundaPastel', '{"fontHeading":"Great Vibes","fontBody":"Lato","colorPrimary":"#166534","colorAccent":"#4ADE80","colorBg":"#F0FDF4","heroLayout":"full","animation":"zoom","spacing":"spacious","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 3),
('tpl_betawi_kencana', 'betawi-kencana', 'Betawi Kencana', ARRAY['BETAWI'], 'Merah meriah dengan aksen emas, ornamen khas Betawi, nuansa pesta rakyat', 'betawi/BetawiKencana', '{"fontHeading":"Playfair Display","fontBody":"Source Sans 3","colorPrimary":"#831843","colorAccent":"#D97706","colorBg":"#FFF1F2","heroLayout":"center","animation":"fade","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 4),
('tpl_batak_ulos', 'batak-ulos', 'Batak Ulos', ARRAY['BATAK'], 'Terinspirasi kain ulos merah biru dengan motif gorga, kuat dan elegan', 'batak/BatakUlos', '{"fontHeading":"Montserrat","fontBody":"Open Sans","colorPrimary":"#1E3A5F","colorAccent":"#DC2626","colorBg":"#EFF6FF","heroLayout":"split","animation":"slide","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 5),
('tpl_minang_songket', 'minang-songket', 'Minang Songket', ARRAY['MINANG'], 'Kemewahan songket dengan warna dasar hitam dan aksen emas berkilau', 'minang/MinangSongket', '{"fontHeading":"Cormorant Garamond","fontBody":"Lato","colorPrimary":"#7C2D12","colorAccent":"#CA8A04","colorBg":"#FFFBEB","heroLayout":"center","animation":"fade","spacing":"spacious","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 6),
('tpl_modern_minimal', 'modern-minimal', 'Modern Minimal', ARRAY['MODERN'], 'Clean, tipografi kuat, tanpa ornamen — timeless dan sophisticated', 'modern/ModernMinimal', '{"fontHeading":"Montserrat","fontBody":"Inter","colorPrimary":"#1A1A1A","colorAccent":"#71717A","colorBg":"#FFFFFF","heroLayout":"center","animation":"fade","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 7),
('tpl_modern_romantic', 'modern-romantic', 'Modern Romantic', ARRAY['MODERN'], 'Serif elegan dengan aksen blush pink dan foto besar yang dramatis', 'modern/ModernRomantic', '{"fontHeading":"Playfair Display","fontBody":"Raleway","colorPrimary":"#C2185B","colorAccent":"#F48FB1","colorBg":"#FFF0F5","heroLayout":"full","animation":"zoom","spacing":"spacious","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 8),
('tpl_islami_elegan', 'islami-elegan', 'Islami Elegan', ARRAY['ISLAMI'], 'Kaligrafi bismillah, palet hijau zamrud dan emas, nuansa Islami yang hangat', 'islami/IslamiElegan', '{"fontHeading":"Amiri","fontBody":"Source Sans 3","colorPrimary":"#065F46","colorAccent":"#D97706","colorBg":"#F0FDF4","heroLayout":"center","animation":"fade","spacing":"spacious","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 9),
('tpl_bugis_bodobaju', 'bugis-bodo', 'Bugis Bodo', ARRAY['BUGIS'], 'Terinspirasi baju bodo dengan warna-warna cerah khas Sulawesi Selatan', 'bugis/BugisBodo', '{"fontHeading":"Playfair Display","fontBody":"Nunito","colorPrimary":"#1D4ED8","colorAccent":"#F59E0B","colorBg":"#EFF6FF","heroLayout":"split","animation":"slide","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 10),
('tpl_melayu_songket', 'melayu-songket', 'Melayu Songket', ARRAY['MELAYU'], 'Songket Melayu dengan palet hijau tua dan emas, bernuansa kerajaan', 'melayu/MelayuSongket', '{"fontHeading":"Cormorant Garamond","fontBody":"Lato","colorPrimary":"#064E3B","colorAccent":"#CA8A04","colorBg":"#ECFDF5","heroLayout":"center","animation":"fade","spacing":"spacious","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 11),
('tpl_palembang_songket', 'palembang-songket', 'Palembang Songket', ARRAY['PALEMBANG'], 'Songket Palembang merah hitam emas yang mewah dan berkarakter kuat', 'palembang/PalembangSongket', '{"fontHeading":"Playfair Display","fontBody":"Source Serif 4","colorPrimary":"#7F1D1D","colorAccent":"#B45309","colorBg":"#FFF5F5","heroLayout":"center","animation":"fade","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 12),
('tpl_dayak_borneo', 'dayak-borneo', 'Dayak Borneo', ARRAY['KALIMANTAN'], 'Motif manik Dayak yang kaya warna, ornamen tribal Kalimantan yang unik', 'dayak/DayakBorneo', '{"fontHeading":"Montserrat","fontBody":"Open Sans","colorPrimary":"#3B0764","colorAccent":"#DC2626","colorBg":"#F5F3FF","heroLayout":"full","animation":"slide","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 13),
('tpl_ntt_tenun', 'ntt-tenun', 'NTT Tenun Ikat', ARRAY['NTT'], 'Tenun ikat NTT dengan warna-warna bumi yang hangat dan autentik', 'ntt/NTTTenun', '{"fontHeading":"Merriweather","fontBody":"Source Sans 3","colorPrimary":"#78350F","colorAccent":"#B45309","colorBg":"#FFF7ED","heroLayout":"center","animation":"fade","spacing":"normal","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 14),
('tpl_papua_cendrawasih', 'papua-cendrawasih', 'Papua Cendrawasih', ARRAY['PAPUA'], 'Warna-warna tropis Papua yang menawan, motif cendrawasih yang eksotik', 'papua/PapuaCendrawasih', '{"fontHeading":"Playfair Display","fontBody":"Nunito","colorPrimary":"#065F46","colorAccent":"#7C3AED","colorBg":"#ECFDF5","heroLayout":"full","animation":"zoom","spacing":"spacious","sections":["hero","countdown","couple","event","gallery","map","rsvp","wishes"]}', 15);
```

---

## LANGKAH 2 — TYPE DEFINITIONS

Buat file `types/invitation.types.ts`:

```typescript
export type RegionTag =
  | 'JAWA' | 'SUNDA' | 'BETAWI' | 'BATAK' | 'MINANG'
  | 'MODERN' | 'ISLAMI' | 'BUGIS' | 'MELAYU' | 'PALEMBANG'
  | 'KALIMANTAN' | 'NTT' | 'PAPUA' | 'BALI' | 'TORAJA';

export type HeroLayout = 'center' | 'split' | 'full';
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'none';
export type SpacingType = 'compact' | 'normal' | 'spacious';
export type SectionKey =
  | 'hero' | 'countdown' | 'couple' | 'event'
  | 'gallery' | 'map' | 'rsvp' | 'wishes' | 'music_player';

export interface InvitationConfig {
  fontHeading: string;
  fontBody: string;
  colorPrimary: string;
  colorAccent: string;
  colorBg: string;
  colorText?: string;
  heroLayout: HeroLayout;
  animation: AnimationType;
  spacing: SpacingType;
  sections: SectionKey[];
  sectionOrder?: SectionKey[];
  quote?: string;
  showOrnament?: boolean;
  ornamentOpacity?: number;
  parallax?: boolean;
  countdownStyle?: 'box' | 'minimal' | 'ring';
}

export interface InvitationPhoto {
  url: string;
  caption?: string;
  type: 'couple' | 'prewedding' | 'family';
  order: number;
}

export interface InvitationTemplate {
  id: string;
  template_id: string;
  slug: string;
  name: string;
  region_tags: RegionTag[];
  description: string;
  preview_thumbnail_url?: string;
  component_path: string;
  default_config: InvitationConfig;
  is_premium: boolean;
  sort_order: number;
}

export interface UserInvitation {
  id: string;
  user_id: string;
  template_id: string;
  public_slug: string;
  config: InvitationConfig;
  music_url?: string;
  music_autoplay: boolean;
  photos: InvitationPhoto[];
  is_published: boolean;
  view_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Joined
  template?: InvitationTemplate;
}

// Props contract yang harus diimplementasi setiap template
export interface BaseTemplateProps {
  weddingData: {
    groomName: string;
    brideName: string;
    weddingDate: string;
    akadTime?: string;
    resepsiTime?: string;
    venueName?: string;
    venueAddress?: string;
    venueMapUrl?: string;
    groomFather?: string;
    groomMother?: string;
    brideFather?: string;
    brideMother?: string;
    quote?: string;
  };
  guestName?: string;
  config: InvitationConfig;
  photos: InvitationPhoto[];
  musicUrl?: string;
  musicAutoplay?: boolean;
  isPreview?: boolean;
  onRSVP?: (data: RSVPData) => Promise<void>;
  publicSlug?: string;
  rsvpToken?: string;
}

export interface RSVPData {
  rsvp_token: string;
  rsvp_status: 'HADIR' | 'TIDAK_HADIR';
  actual_pax: number;
  message?: string;
}

export interface PublicInvitationPageData {
  invitation: UserInvitation;
  template: InvitationTemplate;
  weddingProfile: any;
  guestName?: string;
  rsvpToken?: string;
}
```

---

## LANGKAH 3 — SERVER ACTIONS

Buat file `actions/invitation.actions.ts`:

```typescript
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
```

---

## LANGKAH 4 — TEMPLATE REGISTRY

Buat file `lib/invitation-registry.ts`:

```typescript
import { lazy, ComponentType } from 'react';
import { BaseTemplateProps } from '@/types/invitation.types';

// Lazy load setiap template untuk code splitting
const templateRegistry: Record<string, () => Promise<{ default: ComponentType<BaseTemplateProps> }>> = {
  'jawa/JawaKlasik': () => import('@/components/invitation-templates/jawa/JawaKlasik'),
  'jawa/JawaModern': () => import('@/components/invitation-templates/jawa/JawaModern'),
  'sunda/SundaPastel': () => import('@/components/invitation-templates/sunda/SundaPastel'),
  'betawi/BetawiKencana': () => import('@/components/invitation-templates/betawi/BetawiKencana'),
  'batak/BatakUlos': () => import('@/components/invitation-templates/batak/BatakUlos'),
  'minang/MinangSongket': () => import('@/components/invitation-templates/minang/MinangSongket'),
  'modern/ModernMinimal': () => import('@/components/invitation-templates/modern/ModernMinimal'),
  'modern/ModernRomantic': () => import('@/components/invitation-templates/modern/ModernRomantic'),
  'islami/IslamiElegan': () => import('@/components/invitation-templates/islami/IslamiElegan'),
  'bugis/BugisBodo': () => import('@/components/invitation-templates/bugis/BugisBodo'),
  'melayu/MelayuSongket': () => import('@/components/invitation-templates/melayu/MelayuSongket'),
  'palembang/PalembangSongket': () => import('@/components/invitation-templates/palembang/PalembangSongket'),
  'dayak/DayakBorneo': () => import('@/components/invitation-templates/dayak/DayakBorneo'),
  'ntt/NTTTenun': () => import('@/components/invitation-templates/ntt/NTTTenun'),
  'papua/PapuaCendrawasih': () => import('@/components/invitation-templates/papua/PapuaCendrawasih'),
};

export function getTemplateLoader(componentPath: string) {
  return templateRegistry[componentPath] || null;
}

export const REGION_LABELS: Record<string, string> = {
  'JAWA': '🏛️ Jawa',
  'SUNDA': '🌿 Sunda',
  'BETAWI': '🎭 Betawi',
  'BATAK': '🦅 Batak',
  'MINANG': '🏠 Minang',
  'MODERN': '💍 Modern',
  'ISLAMI': '🕌 Islami',
  'BUGIS': '⚓ Bugis',
  'MELAYU': '🌙 Melayu',
  'PALEMBANG': '🌺 Palembang',
  'KALIMANTAN': '🌿 Kalimantan',
  'NTT': '🏝️ NTT',
  'PAPUA': '🦜 Papua',
  'BALI': '🌺 Bali',
  'TORAJA': '🏔️ Toraja',
};

export const ALL_REGIONS = Object.keys(REGION_LABELS);
```

---

## LANGKAH 5 — BASE TEMPLATE COMPONENT

Buat file `components/invitation-templates/BaseTemplate.tsx`:

```typescript
"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BaseTemplateProps, SectionKey } from "@/types/invitation.types";

// Shared sections yang dipakai oleh semua template
export function HeroSection({ data, config, photos }: any) { /* ... */ }
export function CountdownSection({ weddingDate, config }: any) { /* ... */ }
export function CoupleSection({ data, config }: any) { /* ... */ }
export function EventSection({ data, config }: any) { /* ... */ }
export function GallerySection({ photos, config }: any) { /* ... */ }
export function MapSection({ data, config }: any) { /* ... */ }
export function RSVPSection({ onRSVP, rsvpToken, guestName, config }: any) { /* ... */ }
export function WishesSection({ publicSlug, config }: any) { /* ... */ }
export function MusicPlayer({ musicUrl, autoplay }: any) { /* ... */ }

// HOC wrapper yang dibungkus semua template
export function withBaseTemplate<P extends BaseTemplateProps>(
  TemplateComponent: React.ComponentType<P>
) {
  return function WrappedTemplate(props: P) {
    const { config, musicUrl, musicAutoplay, isPreview } = props;
    
    // Apply dynamic font loading
    useEffect(() => {
      if (isPreview) return;
      const fonts = [config.fontHeading, config.fontBody].filter(Boolean);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fonts.map(f => f.replace(/ /g, '+')).join('&family=')}&display=swap`;
      document.head.appendChild(link);
    }, [config.fontHeading, config.fontBody]);

    return (
      <div
        style={{
          '--color-primary': config.colorPrimary,
          '--color-accent': config.colorAccent,
          '--color-bg': config.colorBg,
          '--font-heading': `'${config.fontHeading}', serif`,
          '--font-body': `'${config.fontBody}', sans-serif`,
        } as React.CSSProperties}
        className="min-h-screen"
      >
        {musicUrl && !isPreview && (
          <MusicPlayer musicUrl={musicUrl} autoplay={musicAutoplay} />
        )}
        <TemplateComponent {...props} />
      </div>
    );
  };
}
```

---

## LANGKAH 6 — IMPLEMENTASI TEMPLATE (CONTOH LENGKAP)

Buat file `components/invitation-templates/modern/ModernMinimal.tsx` sebagai template pertama yang paling lengkap dan menjadi acuan template lainnya:

```typescript
"use client";
// Template: Modern Minimal
// Gunakan template ini sebagai REFERENSI untuk membuat 14 template lainnya.
// Setiap template wajib:
// 1. Menerima semua props dari BaseTemplateProps
// 2. Menggunakan CSS variables --color-primary, --color-accent, --color-bg, --font-heading, --font-body
// 3. Merender semua sections yang ada di config.sections (dalam urutan config.sectionOrder jika ada)
// 4. Menjalankan animasi sesuai config.animation (fade / slide / zoom / none)
// 5. Menerapkan spacing sesuai config.spacing (compact / normal / spacious)
// 6. Menampilkan nama tamu jika props.guestName ada
// 7. Memanggil props.onRSVP dengan RSVPData yang benar
// 8. Tidak boleh ada hardcoded warna atau font — semua dari CSS variables atau config

import { motion } from "framer-motion";
import { BaseTemplateProps, SectionKey } from "@/types/invitation.types";
import { withBaseTemplate } from "../BaseTemplate";
import { Calendar, MapPin, Clock, Heart, Users, Check, X } from "lucide-react";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

// ... implementasi lengkap component ...
// Render sections berdasarkan config.sections array
// Setiap section adalah komponen terpisah

export default withBaseTemplate(ModernMinimalTemplate);
```

**Buat semua 15 template dengan pendekatan yang sama.** Setiap template berbeda pada:
- Ornamen/motif adat (SVG inline, bukan gambar)
- Palet warna default
- Tipografi
- Layout hero section
- Animasi entrance yang khas

Template yang harus dibuat:
1. `jawa/JawaKlasik.tsx` — batik kawung SVG background, gold ornament
2. `jawa/JawaModern.tsx` — batik kontemporer, clean typography
3. `sunda/SundaPastel.tsx` — floral pattern hijau, soft
4. `betawi/BetawiKencana.tsx` — ornamen khas Betawi merah-emas
5. `batak/BatakUlos.tsx` — motif ulos, gorga pattern
6. `minang/MinangSongket.tsx` — songket pattern hitam-emas
7. `modern/ModernMinimal.tsx` — **BUAT DULU INI sebagai referensi**
8. `modern/ModernRomantic.tsx` — serif + blush pink
9. `islami/IslamiElegan.tsx` — kaligrafi SVG, bismillah header
10. `bugis/BugisBodo.tsx` — warna-warna cerah Bugis
11. `melayu/MelayuSongket.tsx` — songket Melayu hijau-emas
12. `palembang/PalembangSongket.tsx` — songket merah-hitam-emas
13. `dayak/DayakBorneo.tsx` — motif manik tribal
14. `ntt/NTTTenun.tsx` — tenun ikat warna bumi
15. `papua/PapuaCendrawasih.tsx` — motif cendrawasih, tropis

---

## LANGKAH 7 — HALAMAN GALLERY & EDITOR

Buat file `app/dashboard/invitation/page.tsx` (Server Component):

```typescript
import { getUserInvitation, getInvitationTemplates, getInvitationStats } from "@/actions/invitation.actions";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import InvitationDashboardClient from "@/components/invitation/InvitationDashboardClient";

export default async function InvitationPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/signin");

  const [invitation, templates, stats] = await Promise.all([
    getUserInvitation(),
    getInvitationTemplates(),
    getInvitationStats()
  ]);

  return (
    <InvitationDashboardClient
      initialInvitation={invitation}
      templates={templates}
      initialStats={stats}
    />
  );
}
```

Buat file `components/invitation/InvitationDashboardClient.tsx` (Client Component) dengan struktur:

```typescript
"use client";
// State: activeView: 'gallery' | 'editor' | 'preview' | 'stats'
// Jika belum punya invitation → tampilkan TemplateGallery
// Jika sudah ada invitation → tampilkan tab Editor, Preview, Stats
// Tombol "Ganti Template" → kembali ke TemplateGallery

// Layout:
// - Jika activeView === 'editor': split layout
//   - Kiri: InvitationEditorPanel (sidebar 320px)
//   - Kanan: InvitationLivePreview (flex-1)
// - Jika activeView === 'gallery': TemplateGallery fullwidth
// - Jika activeView === 'preview': fullscreen preview
// - Jika activeView === 'stats': InvitationStats
```

Buat file `components/invitation/TemplateGallery.tsx`:

```typescript
"use client";
// Props: templates, onSelect, currentTemplateId
// UI:
// - Filter chips: Semua, Jawa, Sunda, Betawi, dst (15 region)
// - Grid 3 kolom: card per template
// - Setiap card: thumbnail/placeholder, nama, badge region, tombol "Gunakan" / "Ganti" (jika sudah aktif)
// - Click "Gunakan" → call createOrSwitchTemplate(template.template_id) → onSelect()
// - Preview modal: klik thumbnail → buka full preview template (gunakan iframe atau dynamic import)
// - Loading state saat switch template
```

Buat file `components/invitation/InvitationEditorPanel.tsx`:

```typescript
"use client";
// Props: invitation, onConfigChange, onPhotosChange, onMusicChange
// UI: sidebar dengan Tab navigation
// Tab 1: Font
//   - Select heading font (list 15 Google Fonts: Playfair Display, Cormorant Garamond, Great Vibes, Montserrat, Merriweather, dll)
//   - Select body font (list 10 Google Fonts: Inter, Lato, Open Sans, Source Sans 3, dll)
//   - Slider heading size
// Tab 2: Warna & Tema
//   - ColorPicker primary (react-colorful)
//   - ColorPicker accent
//   - ColorPicker background
//   - Preset palet per adat (8 preset)
// Tab 3: Layout
//   - Radio: Hero layout (center/split/full)
//   - Checkbox list sections yang aktif
//   - Drag-and-drop order sections (@dnd-kit/core)
//   - Select spacing (compact/normal/spacious)
//   - Toggle parallax
// Tab 4: Foto
//   - Upload area (dropzone)
//   - Grid foto yang sudah upload dengan delete button
//   - Reorder drag-and-drop
// Tab 5: Musik
//   - Upload audio file (mp3) ATAU input URL YouTube
//   - Preview audio player
//   - Toggle autoplay
// Tab 6: Animasi
//   - Radio: animation type (fade/slide/zoom/none)
//   - Toggle ornamen adat
//   - Slider ornamen opacity
//   - Select countdown style
// Tab 7: Teks
//   - Textarea: quote/caption
// 
// Auto-save: debounce 1000ms → call updateInvitationConfig()
// Tombol "Publish" di bawah sidebar
```

Buat file `components/invitation/InvitationLivePreview.tsx`:

```typescript
"use client";
// Props: invitation, config (real-time dari editor), photos, weddingProfile
// Fitur:
// - Toggle mobile/desktop view
// - Dynamically import template component berdasarkan invitation.template.component_path
// - Pass isPreview=true ke template
// - Re-render saat config berubah (React key atau useMemo)
// - Toggle: "Preview sebagai Tamu" → minta input nama tamu untuk preview
// - Suspense + loading skeleton saat lazy load template
```

---

## LANGKAH 8 — HALAMAN PUBLIK UNDANGAN

Buat file `app/i/[slug]/page.tsx` (Server Component, fully public):

```typescript
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicInvitation } from "@/actions/invitation.actions";
import PublicInvitationRenderer from "@/components/invitation/PublicInvitationRenderer";

interface Props {
  params: { slug: string };
  searchParams: { g?: string }; // g = rsvp_token tamu
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const data = await getPublicInvitation(params.slug, searchParams.g);
  if (!data) return { title: "Undangan Pernikahan" };
  
  const { weddingProfile, invitation } = data;
  const title = `${weddingProfile.groom_name} & ${weddingProfile.bride_name} — Undangan Pernikahan`;
  const description = `Kami mengundang Anda hadir di hari bahagia kami. Konfirmasi kehadiran Anda sekarang.`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: invitation.photos.find(p => p.type === 'couple')?.url || '/og-default.jpg',
          width: 1200,
          height: 630,
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

// ISR: revalidate setiap 60 detik
export const revalidate = 60;
```

Buat file `components/invitation/PublicInvitationRenderer.tsx` (Client Component):

```typescript
"use client";
// Props: data: PublicInvitationPageData
// Dynamically import template berdasarkan data.template.component_path
// Pass semua props ke template termasuk:
// - weddingData dari data.weddingProfile
// - guestName dari data.guestName
// - config dari data.invitation.config
// - photos dari data.invitation.photos
// - musicUrl, musicAutoplay
// - onRSVP: async function yang call server action submitRSVP
// - rsvpToken dari data.rsvpToken
// - publicSlug dari data.invitation.public_slug
// - isPreview: false

// Submit RSVP: import { submitRSVP } from "@/actions/rsvp" (sudah ada)
// Tampilkan toast success/error setelah RSVP
```

---

## LANGKAH 9 — INTEGRASI KE GUEST LIST

Update file `lib/wa-template.ts` — tambahkan fungsi baru:

```typescript
export function generateWABlastTextWithInvitation(
  metadata: any,
  guest: Guest,
  invitationBaseUrl: string // URL undangan publik tanpa ?g=...
): string {
  const personalLink = `${invitationBaseUrl}?g=${guest.rsvp_token || guest.guest_id}`;
  // Format pesan WA yang menyertakan link personal
  // ... sama seperti generateWABlastText tapi gunakan personalLink
}
```

Update file `components/guests/BulkSendModal.tsx`:
- Tambahkan logic: jika `invitation.is_published`, gunakan `generateWABlastTextWithInvitation()` 
- Jika belum published, tampilkan warning banner kuning: "Undangan digital belum dipublish. Link yang dikirim adalah link RSVP lama. Publish undangan terlebih dahulu untuk pengalaman terbaik."
- Tambahkan tombol shortcut: "Setup Undangan Digital →" yang membuka tab invitation

Update file `components/guests/GuestDashboardClient.tsx`:
- Di kolom aksi per tamu, tambahkan menu item: "Lihat Undangan →" → buka `/i/[slug]?g=[rsvp_token]` di tab baru
- Tambahkan kolom "Invitation Opened" (opsional, dari tracking)

---

## LANGKAH 10 — INTEGRASI KE DASHBOARD UTAMA

Update file `components/dashboard/DashboardClient.tsx`:

```typescript
// Tambahkan tab baru ke array tabs:
{ key: "invitation" as TabKey, label: "Undangan Digital", icon: Mail }

// Tambahkan render:
{activeTab === "invitation" && <InvitationDashboard />}
```

Buat file `components/dashboard/InvitationDashboard.tsx`:

```typescript
"use client";
// Wrapper yang load data invitation dan render InvitationDashboardClient
// Sama pola dengan GuestListView.tsx yang sudah ada
```

Update file `components/dashboard/WeddingDashboard.tsx` (Overview tab):
- Tambahkan widget "Status Undangan Digital" di grid stats
- Jika published: tampilkan view count, tombol "Buka Undangan"
- Jika draft: tampilkan CTA "Setup Undangan Digital"

---

## LANGKAH 11 — PACKAGE.JSON DEPENDENCIES BARU

Tambahkan ke `package.json`:

```json
{
  "dependencies": {
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "react-colorful": "^5.6.1",
    "react-image-crop": "^11.0.7",
    "qrcode.react": "^4.0.0",
    "@vercel/og": "^0.6.2",
    "react-dropzone": "^14.2.3"
  }
}
```

Install dengan: `npm install`

---

## LANGKAH 12 — OG IMAGE ROUTE (OPSIONAL TAPI DIREKOMENDASIKAN)

Buat file `app/api/og/invitation/[slug]/route.tsx`:

```typescript
import { ImageResponse } from "@vercel/og";
import { getPublicInvitation } from "@/actions/invitation.actions";

export const runtime = "edge";

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const data = await getPublicInvitation(params.slug);
  if (!data) return new Response("Not found", { status: 404 });

  const { weddingProfile, invitation } = data;
  const couplePhoto = invitation.photos.find(p => p.type === 'couple')?.url;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: invitation.config.colorBg || '#FFF8E1',
          fontFamily: 'serif',
        }}
      >
        {couplePhoto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={couplePhoto} width={300} height={400} style={{ objectFit: 'cover', borderRadius: 12 }} alt="" />
        )}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '40px', gap: '16px' }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: invitation.config.colorPrimary }}>
            {weddingProfile.groom_name} & {weddingProfile.bride_name}
          </div>
          <div style={{ fontSize: 24, color: '#666' }}>Undangan Pernikahan</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
```

---

## LANGKAH 13 — UPDATE MIDDLEWARE

Update file `middleware.ts` — tambahkan `/i` ke public routes (tidak perlu auth):

```typescript
// Hapus /i/:path* dari protected routes
// Pastikan hanya /dashboard/:path* dan /wedding/:path* yang protected
export const config = {
  matcher: ['/dashboard/:path*', '/wedding/:path*'],
};
```

---

## LANGKAH 14 — ENVIRONMENT VARIABLES

Tambahkan ke `.env.local.example`:

```
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## ATURAN IMPLEMENTASI PENTING

1. **Semua Server Actions wajib menggunakan `"use server"` directive dan memanggil `getAuthenticatedUser()` untuk operasi yang butuh auth.**

2. **Semua halaman publik (`/i/[slug]`) wajib menggunakan `createAdminClient()` dari `lib/supabase/admin.ts`, bukan client yang butuh session.**

3. **Template components wajib di-lazy load menggunakan `React.lazy` dan dibungkus `Suspense` agar tidak semua template di-bundle sekaligus.**

4. **Config changes di editor harus di-debounce 800–1000ms sebelum memanggil server action, untuk menghindari terlalu banyak request saat user sedang mengedit.**

5. **Semua warna di template harus menggunakan CSS variables (`var(--color-primary)`, dll) bukan hardcoded — sehingga color picker langsung berpengaruh tanpa re-render template.**

6. **Foto yang diupload harus divalidasi: max 5MB, tipe file harus jpg/png/webp. Tambahkan validasi di server action `uploadInvitationPhoto`.**

7. **Supabase Storage bucket `wedding-assets` harus sudah ada dan memiliki policy public read. Tambahkan di migration SQL.**

8. **URL publik undangan format: `/i/[public_slug]` — slug dibuat saat `createOrSwitchTemplate` dan tidak berubah walaupun template diganti.**

9. **Satu user hanya bisa punya satu undangan aktif (`UNIQUE(user_id)` di tabel). Switch template hanya mengubah `template_id` dan reset `config` ke default template baru.**

10. **Semua teks UI dalam Bahasa Indonesia. Tombol aksi: "Gunakan Template", "Edit Undangan", "Publish Sekarang", "Lihat Undangan Live", "Salin Link", "Ganti Template".**

---

## URUTAN PENGERJAAN YANG DIREKOMENDASIKAN

```
1. Jalankan migration SQL di Supabase dashboard
2. Buat types/invitation.types.ts
3. Buat actions/invitation.actions.ts  
4. Buat lib/invitation-registry.ts
5. Buat template ModernMinimal.tsx (referensi)
6. Buat app/i/[slug]/page.tsx + PublicInvitationRenderer.tsx
7. Buat app/dashboard/invitation/page.tsx + InvitationDashboardClient.tsx
8. Buat TemplateGallery.tsx
9. Buat InvitationEditorPanel.tsx
10. Buat InvitationLivePreview.tsx
11. Update DashboardClient.tsx (tambah tab)
12. Update wa-template.ts + BulkSendModal.tsx
13. Buat 14 template sisa
14. Tambah OG Image route
15. Testing end-to-end
```

---

## TESTING CHECKLIST

Setelah implementasi, verifikasi:
- [ ] Buka `/dashboard/invitation` → tampil galeri template
- [ ] Pilih template → editor terbuka dengan live preview
- [ ] Edit font → preview langsung berubah
- [ ] Upload foto → muncul di preview
- [ ] Klik Publish → dapat URL live
- [ ] Buka URL `/i/[slug]` tanpa login → tampil undangan
- [ ] Buka URL `/i/[slug]?g=[rsvp_token_valid]` → nama tamu tampil
- [ ] Klik RSVP di halaman undangan → status tamu update di guest list
- [ ] Blast WA dari Guest List → link menggunakan format baru
- [ ] OG Image muncul saat share link di WhatsApp

---

*End of prompt. Implementasikan secara berurutan sesuai langkah di atas.*
