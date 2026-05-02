# Codex Prompt — Revisi & Upgrade `BaseTemplate.tsx`
> Copy seluruh isi file ini sebagai prompt ke Codex / Claude Code.

---

## KONTEKS PROYEK

Kamu bekerja di proyek **platform undangan digital pernikahan** berbasis **Next.js App Router + TypeScript**.  
File utama yang perlu direvisi adalah `src/components/templates/BaseTemplate.tsx`.  
Platform ini memungkinkan pengguna mengisi form input dan menghasilkan undangan digital yang bisa dibagikan via link personal per tamu.

**Stack yang sudah ada:**
- Next.js 14+ (App Router, `"use client"`)
- TypeScript
- Framer Motion (`motion`, `AnimatePresence`, `Variants`)
- Tailwind CSS
- `lucide-react` untuk icons
- `date-fns` dengan locale `id` (Bahasa Indonesia)
- CSS variables untuk theming (`--color-primary`, `--color-accent`, `--color-bg`, `--font-heading`, `--font-body`)

---

## ISI `BaseTemplate.tsx` SAAT INI

File saat ini sudah berisi section-section berikut:

```
getAnimationVariants(type)   — fade, slide, zoom, none
getSpacingClass(spacing)     — compact, normal, spacious
HeroSection                  — 3 layout: full / split / center, guestName support
CountdownSection             — countdown timer, style: box / minimal
CoupleSection                — nama mempelai + nama orang tua + quote
EventSection                 — akad + resepsi HARDCODED (hanya akadTime, resepsiTime, venueName)
GallerySection               — grid foto basic (2-3 kolom), hanya dari photos prop
MapSection                   — iframe Google Maps + tombol buka maps
RSVPSection                  — form hadir/tidak hadir, pax (1–5), ucapan, submit via onRSVP callback
WishesSection                — PLACEHOLDER ONLY, hanya heading + deskripsi statis
MusicPlayer                  — fixed button kanan bawah, play/pause
withBaseTemplate HOC         — inject CSS vars, load Google Fonts
```

**Type yang sudah ada (di `@/types/invitation.types`):**
```typescript
BaseTemplateProps {
  weddingData: WeddingData;
  config: InvitationConfig;
  photos: InvitationPhoto[];
  guestName?: string;
  publicSlug?: string;
  musicUrl?: string;
  musicAutoplay?: boolean;
  isPreview?: boolean;
  onRSVP?: (payload: RSVPPayload) => Promise<void>;
}

WeddingData {
  groomName: string;
  brideName: string;
  groomFather?: string; groomMother?: string;
  brideFather?: string; brideMother?: string;
  weddingDate: string; // ISO
  quote?: string;
  akadTime?: string;      // ← LEGACY, akan diganti events[]
  resepsiTime?: string;   // ← LEGACY, akan diganti events[]
  venueName?: string;
  venueAddress?: string;
  venueMapUrl?: string;
}

InvitationConfig {
  colorPrimary: string;
  colorAccent: string;
  colorBg: string;
  fontHeading: string;
  fontBody: string;
  animation: 'fade' | 'slide' | 'zoom' | 'none';
  heroLayout: 'full' | 'split' | 'center';
  spacing: 'compact' | 'normal' | 'spacious';
  countdownStyle?: 'box' | 'minimal';
}

InvitationPhoto {
  url: string;
  type: 'couple' | 'prewedding' | 'groom' | 'bride';
  caption?: string;
  order: number;
}

RSVPPayload {
  rsvp_token: string;
  rsvp_status: 'HADIR' | 'TIDAK_HADIR';
  actual_pax: number;
  message?: string;
}
```

---

## TUGAS YANG HARUS DIKERJAKAN

### TUGAS 1 — Extend Type Definitions

**File: `src/types/invitation.types.ts`**

Tambahkan type-type baru berikut **tanpa menghapus** type yang sudah ada:

```typescript
// ── Type baru: EventItem (ganti akadTime/resepsiTime hardcoded)
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

// ── Type baru: LoveStoryItem
export interface LoveStoryItem {
  id: string;
  year: string;           // "2019"
  title: string;          // "Pertama Bertemu"
  description: string;    // Cerita singkat
  emoji?: string;         // "💕" opsional
}

// ── Type baru: BankAccount
export interface BankAccount {
  id: string;
  bankName: string;       // "BCA" | "Mandiri" | dll
  accountNumber: string;
  accountName: string;    // Nama pemilik rekening
  logoUrl?: string;       // URL logo bank (opsional)
}

// ── Type baru: WishItem (dari buku tamu)
export interface WishItem {
  id: string;
  guestName: string;
  message: string;
  createdAt: string;      // ISO timestamp
}
```

**Extend `WeddingData`** dengan field tambahan:
```typescript
// Tambahkan ke WeddingData:
groomBio?: string;           // Bio singkat pria
brideBio?: string;           // Bio singkat wanita
groomChildOrder?: string;    // "Putra ke-1 dari 3 bersaudara"
brideChildOrder?: string;    // "Putri ke-2 dari 4 bersaudara"
events?: EventItem[];        // GANTI akadTime/resepsiTime (tapi tetap backward-compat)
loveStory?: LoveStoryItem[];
bankAccounts?: BankAccount[];
qrisImageUrl?: string;       // URL gambar QRIS
videoUrl?: string;           // YouTube/Vimeo URL
streamingUrl?: string;       // Link live streaming hari H
```

**Extend `InvitationConfig`** dengan field tambahan:
```typescript
// Tambahkan ke InvitationConfig:
openingStyle?: 'envelope' | 'curtain' | 'fade' | 'none';
galleryLayout?: 'grid' | 'masonry' | 'slideshow';
language?: 'id' | 'en';
rsvpDeadline?: string;       // ISO date — RSVP ditutup setelah tanggal ini
isPrivate?: boolean;
enableWishes?: boolean;
enableGift?: boolean;
enableLoveStory?: boolean;
sections?: SectionKey[];     // Override urutan & visibility section
```

---

### TUGAS 2 — Buat `OpeningSection` (BARU)

Komponen splash screen yang ditampilkan **sebelum undangan dibuka**. Setelah user klik/tap, opening menghilang dengan animasi dan undangan tampil.

**Spec:**
- State: `opened: boolean` di-manage di `withBaseTemplate` HOC, di-pass ke TemplateComponent
- Tiga style sesuai `config.openingStyle`:
  - `'envelope'` — animasi dua sisi kertas membuka ke atas dan bawah (seperti amplop)
  - `'curtain'` — dua panel geser ke kiri dan kanan
  - `'fade'` — fade out sederhana
  - `'none'` — langsung tampil tanpa opening (default jika tidak diset)
- Konten opening menampilkan: nama mempelai, tanggal pernikahan, dan teks "Buka Undangan"
- Gunakan `AnimatePresence` + `motion.div` dari Framer Motion
- Background opening menggunakan `var(--color-primary)`
- Selama `!opened`, scroll undangan harus dikunci (`document.body.style.overflow = 'hidden'`)
- Setelah opened, unlock scroll

**Struktur komponen:**
```typescript
export function OpeningSection({
  data,
  config,
  guestName,
  onOpen,
}: {
  data: BaseTemplateProps['weddingData'];
  config: InvitationConfig;
  guestName?: string;
  onOpen: () => void;
}) { ... }
```

---

### TUGAS 3 — Upgrade `EventSection` (REVISI BESAR)

`EventSection` saat ini hardcoded untuk `akadTime` + `resepsiTime` + satu venue.  
Harus diubah untuk support **`events[]` (multi-sesi)** dengan backward compatibility.

**Spec:**
- Jika `data.events` tersedia dan length > 0, render dari `events[]`
- Jika tidak ada `data.events`, fallback ke logic lama (akadTime + resepsiTime + venueName)
- Tiap event card menampilkan: nama sesi, tanggal + jam (format `id` locale), nama venue, alamat, dresscode (jika ada), tombol navigasi (buka mapsDirectUrl)
- Jika `mapsUrl` tersedia di event item, tampilkan mini iframe maps di bawah card event tersebut
- Icon per event: `akad` = cincin (Ring icon atau custom SVG), `resepsi` = Users icon, `default` = Calendar icon
- Layout: kartu full-width berurutan ke bawah (bukan grid 2 kolom) untuk mobile-first readability
- Warna card: `rgba(255,255,255,0.85)` dengan border `1px solid rgba(var(--color-accent), 0.3)`

---

### TUGAS 4 — Buat `LoveStorySection` (BARU)

Timeline vertikal perjalanan cinta pasangan.

**Spec:**
- Hanya render jika `data.loveStory && data.loveStory.length > 0` DAN `config.enableLoveStory !== false`
- Layout: timeline vertikal dengan garis tengah, item bergantian kiri-kanan di desktop, semua kiri di mobile
- Tiap item: tahun (bold, warna accent), judul, deskripsi, emoji (jika ada)
- Animasi: tiap item fade+slide saat scroll masuk viewport (gunakan `whileInView`)
- Garis timeline: `2px solid var(--color-accent)` dengan opacity 30%
- Titik di timeline: circle kecil `var(--color-accent)`

---

### TUGAS 5 — Upgrade `GallerySection` (REVISI)

Saat ini hanya grid statis. Upgrade dengan support tiga layout dari `config.galleryLayout`.

**Spec:**
- `'grid'` (default) — grid 2-3 kolom seperti sekarang, tapi tambahkan lightbox saat foto diklik
- `'masonry'` — CSS masonry columns (gunakan `columns-2 md:columns-3` Tailwind)
- `'slideshow'` — carousel satu foto penuh dengan tombol prev/next dan dot indicator
- Untuk slideshow: gunakan `AnimatePresence` + `motion.img` dengan `key={currentIndex}` dan `initial={{ opacity: 0, x: 60 }}` / `exit={{ opacity: 0, x: -60 }}`
- Lightbox (untuk grid & masonry): fullscreen overlay saat foto diklik, bisa close dengan `Escape` atau klik di luar

---

### TUGAS 6 — Upgrade `CoupleSection` (REVISI)

Tambahkan foto individual mempelai dan bio.

**Spec:**
- Ambil foto `type === 'groom'` untuk pria dan `type === 'bride'` untuk wanita dari `photos[]`
- Jika foto individual tersedia, tampilkan dalam circle (w-32 h-32) dengan border `var(--color-accent)`
- Tambahkan `groomBio` dan `brideBio` jika tersedia (italic, opacity 70%)
- Tambahkan `groomChildOrder` dan `brideChildOrder` di bawah nama orang tua

---

### TUGAS 7 — Upgrade `WishesSection` (REVISI BESAR)

Saat ini hanya placeholder. Harus menjadi section fungsional penuh.

**Spec:**
- Props tambahan:
```typescript
export function WishesSection({
  publicSlug,
  config,
  wishes,           // WishItem[] — list ucapan yang sudah ada
  onSubmitWish,     // async (name: string, message: string) => Promise<void>
  isLoadingWishes,  // boolean
}: { ... })
```
- Bagian atas: list ucapan yang sudah masuk (scroll, maks tampil 5, ada tombol "Lihat Lebih Banyak")
- Tiap wish card: nama tamu, pesan, waktu relatif (gunakan `formatDistanceToNow` dari date-fns dengan locale `id`)
- Bagian bawah: form kirim ucapan baru (nama, pesan textarea, tombol kirim)
- State: `showForm: boolean`, `name: string`, `message: string`, `isSubmitting: boolean`, `submitted: boolean`
- Setelah submit berhasil, tampilkan animasi konfirmasi dan reset form
- Jika `config.enableWishes === false`, return null

---

### TUGAS 8 — Buat `GiftSection` (BARU)

Section amplop digital untuk transfer hadiah.

**Spec:**
- Hanya render jika `(data.bankAccounts && data.bankAccounts.length > 0) || data.qrisImageUrl`
- AND `config.enableGift !== false`
- Tiap rekening ditampilkan sebagai card: nama bank, nomor rekening, nama pemilik
- Tombol "Salin Nomor Rekening" — gunakan `navigator.clipboard.writeText()`, berubah jadi "Tersalin ✓" selama 2 detik
- Jika `data.qrisImageUrl` tersedia, tampilkan tab/toggle "QRIS" dengan gambar QRIS
- Toggle antara "Transfer" dan "QRIS" menggunakan state `activeTab`
- Style card: border `var(--color-accent)`, background `rgba(255,255,255,0.85)`

---

### TUGAS 9 — Upgrade `withBaseTemplate` HOC

Tambahkan logika opening dan state management.

**Spec:**
- Tambahkan state `opened: boolean` — default `true` jika `config.openingStyle === 'none'` atau tidak diset, default `false` jika ada opening style
- Render `<OpeningSection>` di atas semua konten jika `!opened`
- Gunakan `AnimatePresence` untuk animasi transisi opening → undangan
- Lock/unlock scroll saat opening aktif
- Pass `opened` prop ke `TemplateComponent` jika dibutuhkan

---

### TUGAS 10 — Upgrade `RSVPSection` (MINOR)

**Spec:**
- Tambahkan validasi: jika `config.rsvpDeadline` tersedia dan tanggal sekarang sudah lewat deadline, tampilkan pesan "RSVP sudah ditutup" dan sembunyikan form
- Tambahkan field `notes` (textarea opsional) untuk catatan diet/kebutuhan khusus
- Naikkan max pax dari 5 ke 10

---

## KONVENSI KODE YANG HARUS DIIKUTI

1. **Semua komponen export sebagai named export** (`export function NamaSection...`), bukan default export
2. **Gunakan CSS variables** untuk semua warna (`var(--color-primary)`, `var(--color-accent)`, `var(--color-bg)`)
3. **Gunakan `var(--font-heading)` dan `var(--font-body)`** untuk semua font, bukan hardcode
4. **Semua section wrap dengan** `<motion.section initial="hidden" whileInView="visible" viewport={{ once: true }} variants={variants}>` kecuali OpeningSection
5. **Gunakan `getAnimationVariants(config.animation)`** dan `getSpacingClass(config.spacing)` yang sudah ada
6. **Responsive mobile-first** — selalu gunakan `px-6 max-w-Xxl mx-auto` pattern
7. **Background section** selalu `style={{ backgroundColor: 'var(--color-bg)' }}`
8. **Jangan gunakan warna hardcode** selain untuk fallback opacity overlays (`rgba(255,255,255,0.8)`, `rgba(0,0,0,0.4)`)
9. **TypeScript strict** — semua props harus typed, gunakan optional chaining `?.`
10. **Import hanya yang dipakai** — tidak ada unused imports

---

## URUTAN PENGERJAAN YANG DISARANKAN

Kerjakan dalam urutan ini agar tidak ada dependency yang belum siap:

```
1. src/types/invitation.types.ts    ← Extend types dulu (Tugas 1)
2. OpeningSection                   ← Buat komponen baru (Tugas 2)
3. EventSection                     ← Revisi (Tugas 3)
4. LoveStorySection                 ← Buat komponen baru (Tugas 4)
5. GallerySection                   ← Upgrade (Tugas 5)
6. CoupleSection                    ← Upgrade (Tugas 6)
7. WishesSection                    ← Upgrade besar (Tugas 7)
8. GiftSection                      ← Buat komponen baru (Tugas 8)
9. withBaseTemplate HOC             ← Upgrade (Tugas 9)
10. RSVPSection                     ← Minor upgrade (Tugas 10)
```

---

## OUTPUT YANG DIHARAPKAN

Setelah semua tugas selesai, file `BaseTemplate.tsx` harus mengexport:

```typescript
export { getAnimationVariants }      // sudah ada
export { getSpacingClass }           // sudah ada
export { OpeningSection }            // BARU
export { HeroSection }               // sudah ada (tidak perlu diubah)
export { CountdownSection }          // sudah ada (tidak perlu diubah)
export { CoupleSection }             // diupgrade
export { LoveStorySection }          // BARU
export { EventSection }              // diupgrade
export { GallerySection }            // diupgrade
export { MapSection }                // sudah ada (tidak perlu diubah)
export { RSVPSection }               // minor upgrade
export { WishesSection }             // diupgrade besar
export { GiftSection }               // BARU
export { MusicPlayer }               // sudah ada (tidak perlu diubah)
export { withBaseTemplate }          // diupgrade
```

Dan `src/types/invitation.types.ts` harus mengexport tambahan:
```typescript
export type { EventItem, LoveStoryItem, BankAccount, WishItem }
```

---

## CATATAN TAMBAHAN

- Jika ada import yang belum tersedia (misalnya `formatDistanceToNow` dari date-fns), tambahkan import-nya
- Jika membutuhkan icon baru dari `lucide-react` (misalnya `Copy`, `CheckCheck`, `Image`, `Gift`, `BookOpen`), tambahkan di import
- Untuk `OpeningSection`, `AnimatePresence` sudah diimport dari framer-motion — pastikan digunakan dengan benar
- Jaga agar file tetap dalam **satu file** (`BaseTemplate.tsx`) kecuali type definitions yang memang di file terpisah
- Pastikan semua komponen baru **kompatibel dengan `isPreview` prop** — saat `isPreview === true`, nonaktifkan fitur yang butuh API call (RSVP submit, wishes submit, music autoplay)
