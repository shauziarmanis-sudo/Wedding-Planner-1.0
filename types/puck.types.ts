import type { Data } from "@puckeditor/core";

// ── Puck Builder Types ───────────────────────────────────────────

/**
 * Mode builder yang digunakan oleh sebuah undangan.
 * - 'template': menggunakan arsitektur BaseTemplate + section components (legacy)
 * - 'puck': menggunakan visual drag-and-drop builder (Puck.js)
 */
export type BuilderMode = "template" | "puck";

/**
 * Row tabel user_invitations yang sudah di-extend dengan kolom Puck.
 * Extends dari UserInvitation yang sudah ada di invitation.types.ts
 */
export interface PuckInvitation {
  id: string;
  user_id: string;
  template_id: string;
  public_slug: string;
  builder_mode: BuilderMode;
  puck_data: Data | null;
  config: Record<string, unknown>;
  music_url: string | null;
  music_autoplay: boolean;
  photos: unknown[];
  is_published: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Payload untuk menyimpan/update Puck data dari editor.
 */
export interface SavePuckDataPayload {
  slug: string;
  data: Data;
}

/**
 * Response standar dari server actions Puck.
 */
export interface PuckActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Data yang dibutuhkan halaman publik untuk render Puck invitation.
 */
export interface PublicPuckPageData {
  puckData: Data;
  slug: string;
  isPublished: boolean;
  weddingProfile: Record<string, unknown>;
  guestName?: string;
  rsvpToken?: string;
}
