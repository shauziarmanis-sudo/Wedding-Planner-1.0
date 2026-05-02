# **Implementation Plan: Life-Start Exclusive Invitation Builder (Puck.js)**

## **Konteks Proyek**

Proyek: Life-Start (SaaS Wedding Planner)

Tech Stack: Next.js 14 (App Router), TypeScript, Supabase, Tailwind CSS, Framer Motion.

Tujuan: Membangun *visual page builder* eksklusif (drag-and-drop) untuk undangan digital menggunakan library @measured/puck, membebaskan ketergantungan dari JSON vendor eksternal (seperti Elementor) dan membangun IP (Intellectual Property) internal.

## **FASE 1: Setup Dasar & Database (Fondasi)**

Fase ini berfokus pada persiapan *environment* Puck dan skema *database* untuk menyimpan struktur blok JSON.

### **1.1 Instalasi Dependensi**

* Install Puck: npm install @measured/puck  
* Install dependensi pendukung (opsional tapi disarankan): lucide-react (untuk ikon di editor), date-fns (untuk formatting tanggal).

### **1.2 Database Schema (Supabase)**

Buat migrasi SQL untuk tabel yang akan menyimpan struktur JSON dari Puck.

* **Tabel:** user\_invitations  
  * id (uuid, PK)  
  * wedding\_id (uuid, FK ke tabel weddings utama)  
  * slug (text, unik, untuk URL publik)  
  * puck\_data (JSONB, menyimpan state lengkap dari Puck)  
  * is\_published (boolean, default: false)  
  * created\_at, updated\_at (timestamp)

### **1.3 TypeScript Definitions**

Buat tipe data di types/invitation.types.ts.

* Definisikan interface UserInvitation yang mencakup properti puck\_data bertipe any atau tipe spesifik Data dari @measured/puck.

## **FASE 2: Membangun Registri Komponen Puck (The Engine)**

Ini adalah inti dari *builder*. Kita mendefinisikan "Blok" apa saja yang bisa ditarik oleh pengguna.

### **2.1 Setup puck.config.tsx**

Buat file lib/puck.config.tsx sebagai sumber kebenaran (Source of Truth) untuk *builder*.

* **Definisikan Props:** Buat type PuckProps yang berisi struktur data untuk setiap komponen (misal: WeddingHero, CoupleProfile, EventDetails, Gallery, RSVPGateway).

### **2.2 Membuat Komponen Dasar (MVP Blocks)**

Implementasikan komponen-komponen React di dalam puck.config.tsx menggunakan Tailwind CSS.

* **Block WeddingHero:** Fields: Nama Mempelai, Tanggal, Gambar Background.  
* **Block CoupleProfile:** Fields: Nama Panggilan, Nama Lengkap Orang Tua, Foto Profil.  
* **Block RSVPGateway:** Komponen khusus yang dirender dengan tombol yang mengarah ke sistem manajemen tamu Life-Start.

### **2.3 Custom Field: Image Upload (Supabase Storage)**

* **Tantangan:** Puck menggunakan field text biasa untuk gambar secara *default*.  
* **Solusi:** Buat *custom component* untuk field bertipe *image* di Puck yang mengintegrasikan input *file* HTML, melakukan *upload* ke Supabase Storage (bucket: invitation\_assets), dan mengembalikan URL publiknya ke dalam *state* Puck.

## **FASE 3: Halaman Editor & Halaman Publik (The Interfaces)**

Membangun antarmuka tempat *user* merancang, dan tempat tamu melihat hasil akhirnya.

### **3.1 Halaman Editor (Dashboard)**

Buat halaman app/dashboard/builder/page.tsx (Client Component).

* Render komponen \<Puck\> dengan menyuntikkan puck.config.tsx.  
* Implementasikan fungsi onPublish yang memanggil *Server Action* untuk menyimpan data (JSON) ke kolom puck\_data di Supabase.

### **3.2 Halaman Publik (Tamu)**

Buat halaman app/i/\[slug\]/page.tsx (Server Component).

* *Fetch* JSON dari kolom puck\_data Supabase berdasarkan slug.  
* Gunakan komponen \<Render\> dari Puck untuk merender JSON menjadi halaman statis berkinerja tinggi.  
* **Optimasi:** Gunakan Next.js *cache* atau revalidasi untuk mempercepat waktu *load*.

## **FASE 4: Integrasi Manajemen Tamu (The SaaS Logic)**

Menghubungkan undangan visual dengan sistem inti (Otak) Life-Start.

### **4.1 Logika RSVP Gateway**

Pastikan komponen RSVPGateway di dalam undangan publik (Fase 3.2) dapat menangkap parameter tamu (misal ?g=TOKEN123).

* Saat tombol RSVP di undangan diklik, arahkan tamu ke *endpoint* atau *modal* konfirmasi kehadiran yang terhubung langsung ke tabel guests di Supabase.

### **4.2 Dynamic URL Generation di Dashboard**

Di halaman manajemen tamu (GuestListView.tsx), pastikan tombol *share/copy link* menghasilkan URL publik undangan dengan menyisipkan parameter token masing-masing tamu (contoh: lifestart.com/i/romeo-juliet?g=token\_tamu\_a).

## **FASE 5: Scaling & Tematisasi (Post-MVP)**

Setelah mesin *builder* berjalan stabil, fokus pada variasi desain.

### **5.1 Penambahan Komponen Lanjutan**

Tambahkan blok-blok kompleks ke puck.config.tsx seperti Galeri Foto (Grid/Carousel), Countdown Timer, dan Peta (Google Maps embed).

### **5.2 Presets/Templates System**

Buat mekanisme untuk memuat *pre-defined JSON* ke dalam editor Puck. Ini memungkinkan fitur "Pilih Template Cepat" di mana *user* tidak perlu mendesain dari kanvas kosong, melainkan memulai dengan susunan blok yang sudah diatur untuk tema tertentu (misal: Jawa Klasik, Sunda Modern).

## **FASE 6: Blueprint Arsitektur Direktori (Rekomendasi)**

Untuk menjaga *codebase* tetap bersih saat komponen Puck bertambah banyak, gunakan struktur berikut:

/lib/puck/  
  ├── puck.config.tsx       \# File registri utama  
  ├── components/           \# Folder khusus komponen Puck  
  │   ├── HeroBlock.tsx  
  │   ├── CoupleBlock.tsx  
  │   ├── GalleryBlock.tsx  
  │   └── RsvpBlock.tsx  
  └── fields/               \# Folder khusus custom fields (sidebar editor)  
      ├── ImageUploadField.tsx  
      └── ColorPickerField.tsx

## **FASE 7: Alur Data (Data Flow) & Optimasi Kinerja**

1. **Write Flow (Editor):** User \-\> Interaksi \<Puck\> \-\> State Internal Puck \-\> Klik "Publish" \-\> Trigger onPublish \-\> Panggil saveInvitation(data) Server Action \-\> Simpan JSONB ke Supabase.  
2. **Read Flow (Tamu):** Request Tamu /i/\[slug\] \-\> Server Component Next.js \-\> Fetch JSONB via Supabase Client \-\> Masukkan ke \<Render config={config} data={data} /\> \-\> Halaman Statis di-cache (ISR/Static).