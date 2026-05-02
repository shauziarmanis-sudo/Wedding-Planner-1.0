export type RegionTag =
  | 'JAWA' | 'SUNDA' | 'BETAWI' | 'BATAK' | 'MINANG'
  | 'MODERN' | 'ISLAMI' | 'BUGIS' | 'MELAYU' | 'PALEMBANG'
  | 'KALIMANTAN' | 'NTT' | 'PAPUA' | 'BALI' | 'TORAJA' | 'CUSTOM';

export type HeroLayout = 'center' | 'split' | 'full';
export type AnimationType = 'fade' | 'slide' | 'zoom' | 'none';
export type SpacingType = 'compact' | 'normal' | 'spacious';
export type SectionKey =
  | 'hero' | 'countdown' | 'couple' | 'event'
  | 'gallery' | 'map' | 'rsvp' | 'wishes' | 'music_player'
  | 'love_story' | 'gift';

// ── Type baru: EventItem (ganti akadTime/resepsiTime hardcoded) ──
export interface EventItem {
  id: string;
  name: string;           // "Akad Nikah" | "Resepsi" | nama custom
  date: string;           // ISO date string
  startTime: string;      // "08:00"
  endTime?: string;       // "11:00"
  venue: string;          // Nama gedung
  address: string;        // Alamat lengkap
  mapsUrl?: string;       // Google Maps embed URL
  mapsDirectUrl?: string; // Google Maps direct URL untuk tombol navigasi
  dresscode?: string;     // "Formal" | "Earth Tone" | dll
  icon?: 'akad' | 'resepsi' | 'ngunduh' | 'default';
}

// ── Type baru: LoveStoryItem ──
export interface LoveStoryItem {
  id: string;
  year: string;           // "2019"
  title: string;          // "Pertama Bertemu"
  description: string;    // Cerita singkat
  emoji?: string;         // "💕" opsional
}

// ── Type baru: BankAccount ──
export interface BankAccount {
  id: string;
  bankName: string;       // "BCA" | "Mandiri" | dll
  accountNumber: string;
  accountName: string;    // Nama pemilik rekening
  logoUrl?: string;       // URL logo bank (opsional)
}

// ── Type baru: WishItem (dari buku tamu) ──
export interface WishItem {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;      // ISO timestamp
}

// ── WeddingData ──
export interface WeddingData {
  groomName: string;
  brideName: string;
  weddingDate: string;
  // Legacy fields (backward compat) — prefer events[] jika tersedia
  akadTime?: string;
  resepsiTime?: string;
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
  // Orang tua
  groomFather?: string;
  groomMother?: string;
  brideFather?: string;
  brideMother?: string;
  // Quote
  quote?: string;
  // ── Tambahan baru (Tugas 1) ──
  groomBio?: string;           // Bio singkat pria
  brideBio?: string;           // Bio singkat wanita
  groomChildOrder?: string;    // "Putra ke-1 dari 3 bersaudara"
  brideChildOrder?: string;    // "Putri ke-2 dari 4 bersaudara"
  events?: EventItem[];        // GANTI akadTime/resepsiTime (backward-compat)
  loveStory?: LoveStoryItem[];
  bankAccounts?: BankAccount[];
  qrisImageUrl?: string;       // URL gambar QRIS
  videoUrl?: string;           // YouTube/Vimeo URL
  streamingUrl?: string;       // Link live streaming hari H
}

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
  // ── Tambahan baru (Tugas 1) ──
  openingStyle?: 'envelope' | 'curtain' | 'fade' | 'none';
  galleryLayout?: 'grid' | 'masonry' | 'slideshow';
  language?: 'id' | 'en';
  rsvpDeadline?: string;       // ISO date — RSVP ditutup setelah tanggal ini
  isPrivate?: boolean;
  enableWishes?: boolean;
  enableGift?: boolean;
  enableLoveStory?: boolean;
}

export interface InvitationPhoto {
  url: string;
  caption?: string;
  type: 'couple' | 'prewedding' | 'family' | 'groom' | 'bride';
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
  weddingData: WeddingData;
  guestName?: string;
  config: InvitationConfig;
  photos: InvitationPhoto[];
  musicUrl?: string;
  musicAutoplay?: boolean;
  isPreview?: boolean;
  onRSVP?: (data: RSVPData) => Promise<void>;
  publicSlug?: string;
  rsvpToken?: string;
  // ── Tambahan baru (Tugas 1) ──
  wishes?: WishItem[];
  onSubmitWish?: (name: string, message: string) => Promise<void>;
  isLoadingWishes?: boolean;
}

export interface RSVPData {
  rsvp_token: string;
  rsvp_status: 'HADIR' | 'TIDAK_HADIR';
  actual_pax: number;
  message?: string;
  notes?: string;           // catatan diet/kebutuhan khusus (Tugas 10)
}

export interface PublicInvitationPageData {
  invitation: UserInvitation;
  template: InvitationTemplate;
  weddingProfile: any;
  guestName?: string;
  rsvpToken?: string;
}
