import type { Config } from "@puckeditor/core";
import {
  CoverEnvelopeBlock,
  SalamPembukaBlock,
  MempelaiBlock,
  WeddingHeroBlock,
  EventDetailsBlock,
  QuoteBlock,
  TimelineBlock,
  GalleryBlock,
  VideoGalleryBlock,
  CountdownBlock,
  GiftBlock,
  WishesBlock,
  PenutupBlock,
  type CoverEnvelopeProps,
  type SalamPembukaProps,
  type MempelaiProps,
  type WeddingHeroProps,
  type EventDetailsProps,
  type QuoteProps,
  type TimelineProps,
  type GalleryProps,
  type VideoGalleryProps,
  type CountdownProps,
  type GiftProps,
  type WishesProps,
  type PenutupProps,
} from "./components";
import ImageUploadField from "./fields/ImageUploadField";
import ColorPickerField from "./fields/ColorPickerField";
import FontPickerField from "./fields/FontPickerField";
import FontSizeField from "./fields/FontSizeField";

// ── Puck Component Map ───────────────────────────────────────────
type PuckComponents = {
  CoverEnvelope: CoverEnvelopeProps;
  SalamPembuka: SalamPembukaProps;
  Mempelai: MempelaiProps;
  WeddingHero: WeddingHeroProps;
  Quote: QuoteProps;
  EventDetails: EventDetailsProps;
  Countdown: CountdownProps;
  Timeline: TimelineProps;
  Gallery: GalleryProps;
  VideoGallery: VideoGalleryProps;
  Wishes: WishesProps;
  Gift: GiftProps;
  Penutup: PenutupProps;
};

// ── Reusable Field Helpers ───────────────────────────────────────
const colorField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({ value, onChange, name, field }: any) => (
    <ColorPickerField name={name} value={value} onChange={onChange} field={field} />
  ),
});

const fontField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({ value, onChange, name, field }: any) => (
    <FontPickerField name={name} value={value} onChange={onChange} field={field} />
  ),
});

const fontSizeField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({ value, onChange, name, field }: any) => (
    <FontSizeField name={name} value={value} onChange={onChange} field={field} />
  ),
});

const imageField = (label: string) => ({
  type: "custom" as const,
  label,
  render: ({ value, onChange, name, field }: any) => (
    <ImageUploadField name={name} value={value} onChange={onChange} field={field} />
  ),
});

// ── Grouped common fields ────────────────────────────────────────
const styleFields = {
  accentColor: colorField("Warna Aksen"),
  backgroundColor: colorField("Warna Latar Belakang"),
  textColor: colorField("Warna Teks"),
  headingFont: fontField("Font Judul"),
  bodyFont: fontField("Font Isi"),
  headingSize: fontSizeField("Ukuran Font Judul"),
  bodySize: fontSizeField("Ukuran Font Isi"),
  backgroundImageUrl: imageField("Gambar Background (opsional)"),
  overlayOpacity: { type: "number" as const, label: "Opacity Overlay (%)", min: 0, max: 100 },
  accentSize: { type: "number" as const, label: "Ukuran Ornamen Aksen (px)", min: 8, max: 80 },
  accentAnimation: {
    type: "select" as const,
    label: "Animasi Aksen",
    options: [
      { label: "Tidak Ada", value: "none" },
      { label: "Pulse (Berdenyut)", value: "pulse" },
      { label: "Bounce (Memantul)", value: "bounce" },
      { label: "Spin (Berputar)", value: "spin" },
      { label: "Fade In Up", value: "fadeInUp" },
    ],
  },
  contentAlignX: {
    type: "radio" as const,
    label: "Posisi Horizontal (X)",
    options: [
      { label: "Kiri", value: "left" },
      { label: "Tengah", value: "center" },
      { label: "Kanan", value: "right" },
    ],
  },
  contentAlignY: {
    type: "radio" as const,
    label: "Posisi Vertikal (Y)",
    options: [
      { label: "Atas", value: "top" },
      { label: "Tengah", value: "center" },
      { label: "Bawah", value: "bottom" },
    ],
  },
  paddingTop: { type: "number" as const, label: "Jarak Atas (Padding Top)", min: 0, max: 400 },
  paddingBottom: { type: "number" as const, label: "Jarak Bawah (Padding Bottom)", min: 0, max: 400 },
  paddingLeft: { type: "number" as const, label: "Jarak Kiri (Padding Left)", min: 0, max: 400 },
  paddingRight: { type: "number" as const, label: "Jarak Kanan (Padding Right)", min: 0, max: 400 },
  bgZoom: { type: "number" as const, label: "Zoom Background (%) - 0 untuk Cover", min: 0, max: 400 },
  bgPosX: { type: "number" as const, label: "Posisi Background Horizontal (%)", min: 0, max: 100 },
  bgPosY: { type: "number" as const, label: "Posisi Background Vertikal (%)", min: 0, max: 100 },
};

const defaultStyle = {
  accentColor: "#c8a060",
  backgroundColor: "#faf8f5",
  textColor: "#2d2d2d",
  headingFont: "'Great Vibes', cursive",
  bodyFont: "'Cormorant Garamond', serif",
  headingSize: 40,
  bodySize: 16,
  backgroundImageUrl: "",
  overlayOpacity: 40,
  accentSize: 24,
  accentAnimation: "pulse",
  contentAlignX: "center",
  contentAlignY: "center",
  paddingTop: 96,
  paddingBottom: 96,
  paddingLeft: 24,
  paddingRight: 24,
  bgZoom: 0,
  bgPosX: 50,
  bgPosY: 50,
};

// ── Konfigurasi Utama ────────────────────────────────────────────
export const puckConfig: Config<PuckComponents> = {
  root: {
    render: ({ children }) => {
      return (
        <div className="w-full flex justify-center bg-gray-100 min-h-screen">
          <main className="w-full max-w-[430px] min-h-screen bg-white shadow-2xl relative overflow-x-hidden">
            {children}
          </main>
        </div>
      );
    },
  },
  components: {
    // ─── 1. COVER AMPLOP ─────────────────────────────────────────
    CoverEnvelope: {
      label: "✉️ Cover Amplop",
      fields: {
        groomName: { type: "text", label: "Nama Pria" },
        brideName: { type: "text", label: "Nama Wanita" },
        guestNameLabel: { type: "text", label: "Label Tamu" },
        invitationText: { type: "textarea", label: "Teks Undangan" },
        buttonText: { type: "text", label: "Teks Tombol" },
        ...styleFields,
      },
      defaultProps: {
        groomName: "Romeo",
        brideName: "Juliet",
        guestNameLabel: "Kpd Yth",
        invitationText: "You are cordially invited to our wedding celebration. We would be honored to have you join us on our special day.",
        buttonText: "Buka Undangan",
        ...defaultStyle,
        backgroundColor: "#1a1a2e",
        textColor: "#ffffff",
      },
      render: (props) => <CoverEnvelopeBlock {...props} isEditor={true} />,
    },

    // ─── 2. SALAM PEMBUKA ────────────────────────────────────────
    SalamPembuka: {
      label: "🤲 Salam Pembuka",
      fields: {
        greeting: { type: "text", label: "Salam" },
        body: { type: "textarea", label: "Kata Pembuka" },
        ...styleFields,
      },
      defaultProps: {
        greeting: "Assalamu'alaikum Wr. Wb.",
        body: "Tanpa mengurangi rasa hormat, kami bermaksud mengundang Bapak/Ibu/Saudara/i pada acara resepsi pernikahan kami.",
        ...defaultStyle,
      },
      render: (props) => <SalamPembukaBlock {...props} />,
    },

    // ─── 3. MEMPELAI ─────────────────────────────────────────────
    Mempelai: {
      label: "💍 Pasangan Mempelai",
      fields: {
        subHeading: { type: "text", label: "Sub Judul" },
        groomName: { type: "text", label: "Nama Mempelai Pria" },
        groomParents: { type: "text", label: "Orang Tua Pria" },
        groomPhoto: imageField("Foto Mempelai Pria"),
        groomInstagram: { type: "text", label: "Instagram Pria" },
        brideName: { type: "text", label: "Nama Mempelai Wanita" },
        brideParents: { type: "text", label: "Orang Tua Wanita" },
        bridePhoto: imageField("Foto Mempelai Wanita"),
        brideInstagram: { type: "text", label: "Instagram Wanita" },
        tagline: { type: "textarea", label: "Tagline / Deskripsi" },
        ...styleFields,
      },
      defaultProps: {
        subHeading: "The Wedding Of",
        groomName: "Romeo",
        groomParents: "Putra Pertama Bapak Ahmad & Ibu Dio",
        groomPhoto: "",
        groomInstagram: "@romeo",
        brideName: "Juliet",
        brideParents: "Putri Pertama Bapak Oni & Ibu Aisah",
        bridePhoto: "",
        brideInstagram: "@juliet",
        tagline: "Kami akan menikah, dan kami ingin Anda menjadi bagian dari hari istimewa kami!",
        ...defaultStyle,
      },
      render: (props) => <MempelaiBlock {...props} />,
    },

    // ─── 4. HERO / NAMA MEMPELAI ─────────────────────────────────
    WeddingHero: {
      label: "💒 Hero / Nama Mempelai",
      fields: {
        groomName: { type: "text", label: "Nama Mempelai Pria" },
        brideName: { type: "text", label: "Nama Mempelai Wanita" },
        weddingDate: { type: "text", label: "Tanggal Pernikahan" },
        tagline: { type: "text", label: "Tagline" },
        backgroundType: {
          type: "select",
          label: "Tipe Background",
          options: [
            { label: "Warna Solid", value: "color" },
            { label: "Gambar", value: "image" },
          ],
        },
        ...styleFields,
      },
      defaultProps: {
        groomName: "Romeo",
        brideName: "Juliet",
        weddingDate: "Sabtu, 15 November 2025",
        tagline: "Undangan Pernikahan",
        backgroundType: "image",
        ...defaultStyle,
        backgroundColor: "#1a1a2e",
        textColor: "#ffffff",
      },
      render: (props) => <WeddingHeroBlock {...props} />,
    },

    // ─── 5. QUOTE / DOA ──────────────────────────────────────────
    Quote: {
      label: "✨ Quote / Doa",
      fields: {
        quote: { type: "textarea", label: "Kutipan / Doa" },
        author: { type: "text", label: "Sumber / Ayat" },
        ...styleFields,
      },
      defaultProps: {
        quote: "Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu isteri-isteri dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.",
        author: "Q.S. Ar-Rum: 21",
        ...defaultStyle,
        backgroundColor: "#ffffff",
        textColor: "#333333",
      },
      render: (props) => <QuoteBlock {...props} />,
    },

    // ─── 6. DETAIL ACARA & LOKASI ────────────────────────────────
    EventDetails: {
      label: "📍 Detail Acara & Lokasi",
      fields: {
        sectionTitle: { type: "text", label: "Judul Bagian" },
        akadLabel: { type: "text", label: "Label Akad" },
        akadTime: { type: "text", label: "Waktu Akad" },
        akadDate: { type: "text", label: "Tanggal Akad" },
        resepsiLabel: { type: "text", label: "Label Resepsi" },
        resepsiTime: { type: "text", label: "Waktu Resepsi" },
        resepsiDate: { type: "text", label: "Tanggal Resepsi" },
        venueName: { type: "text", label: "Nama Venue" },
        venueAddress: { type: "textarea", label: "Alamat Venue" },
        mapsUrl: { type: "text", label: "Link Google Maps" },
        ...styleFields,
      },
      defaultProps: {
        sectionTitle: "Jadwal & Lokasi Acara",
        akadLabel: "Akad Nikah",
        akadTime: "08:00 - 10:00 WIB",
        akadDate: "Sabtu, 15 Nov 2025",
        resepsiLabel: "Resepsi Pernikahan",
        resepsiTime: "11:00 - 14:00 WIB",
        resepsiDate: "Sabtu, 15 Nov 2025",
        venueName: "Gedung Pernikahan Impian",
        venueAddress: "Jl. Sudirman No. 123, Jakarta",
        mapsUrl: "https://maps.google.com",
        ...defaultStyle,
      },
      render: (props) => <EventDetailsBlock {...props} />,
    },

    // ─── 7. HITUNG MUNDUR ────────────────────────────────────────
    Countdown: {
      label: "⏳ Hitung Mundur",
      fields: {
        targetDate: { type: "text", label: "Tanggal & Waktu (ISO)" },
        heading: { type: "text", label: "Judul" },
        ...styleFields,
      },
      defaultProps: {
        targetDate: "2025-11-15T08:00:00",
        heading: "Menuju Hari Bahagia",
        ...defaultStyle,
      },
      render: (props) => <CountdownBlock {...props} />,
    },

    // ─── 8. LOVE STORY TIMELINE ──────────────────────────────────
    Timeline: {
      label: "📖 Love Story Timeline",
      fields: {
        heading: { type: "text", label: "Judul" },
        stories: {
          type: "array",
          label: "Cerita",
          arrayFields: {
            year: { type: "text", label: "Tahun/Tanggal" },
            title: { type: "text", label: "Judul" },
            description: { type: "textarea", label: "Deskripsi" },
          },
        },
        ...styleFields,
      },
      defaultProps: {
        heading: "Perjalanan Cinta Kami",
        stories: [
          { year: "2020", title: "Pertama Bertemu", description: "Kami bertemu di bangku kuliah..." },
          { year: "2023", title: "Lamaran", description: "Momen bahagia saat kami memutuskan untuk serius." },
        ],
        ...defaultStyle,
      },
      render: (props) => <TimelineBlock {...props} />,
    },

    // ─── 9. GALERI FOTO ──────────────────────────────────────────
    Gallery: {
      label: "🖼️ Galeri Foto",
      fields: {
        heading: { type: "text", label: "Judul Galeri" },
        layout: {
          type: "select",
          label: "Layout",
          options: [
            { label: "Grid (Kotak)", value: "grid" },
            { label: "Masonry (Dinamis)", value: "masonry" },
            { label: "Carousel (Geser)", value: "carousel" },
          ],
        },
        images: {
          type: "array",
          label: "Foto-foto",
          arrayFields: {
            url: imageField("Gambar"),
            alt: { type: "text", label: "Alt Text" },
          },
        },
        ...styleFields,
      },
      defaultProps: {
        heading: "Galeri Foto",
        layout: "grid",
        images: [
          { url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=800&auto=format&fit=crop", alt: "Photo 1" },
          { url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop", alt: "Photo 2" },
        ],
        ...defaultStyle,
      },
      render: (props) => <GalleryBlock {...props} />,
    },

    // ─── 10. VIDEO ACARA ─────────────────────────────────────────
    VideoGallery: {
      label: "🎬 Video Acara",
      fields: {
        heading: { type: "text", label: "Judul" },
        videoUrl: { type: "text", label: "URL Embed YouTube/Vimeo" },
        ...styleFields,
      },
      defaultProps: {
        heading: "Video Teaser",
        videoUrl: "",
        ...defaultStyle,
      },
      render: (props) => <VideoGalleryBlock {...props} />,
    },

    // ─── 11. UCAPAN & KONFIRMASI ─────────────────────────────────
    Wishes: {
      label: "💬 Ucapan & Konfirmasi",
      fields: {
        heading: { type: "text", label: "Judul" },
        nameLabel: { type: "text", label: "Label Nama" },
        attendLabel: { type: "text", label: "Label Kehadiran" },
        messageLabel: { type: "text", label: "Label Ucapan" },
        buttonText: { type: "text", label: "Teks Tombol Kirim" },
        ...styleFields,
      },
      defaultProps: {
        heading: "Ucapan & Konfirmasi",
        nameLabel: "Nama",
        attendLabel: "Bersedia hadir di acara kami?",
        messageLabel: "Kirim Ucapan",
        buttonText: "Kirim Ucapan",
        ...defaultStyle,
      },
      render: (props) => <WishesBlock {...props} />,
    },

    // ─── 12. AMPLOP DIGITAL ──────────────────────────────────────
    Gift: {
      label: "💸 Amplop Digital",
      fields: {
        heading: { type: "text", label: "Judul" },
        description: { type: "textarea", label: "Deskripsi" },
        bankName: { type: "text", label: "Nama Bank" },
        accountNumber: { type: "text", label: "Nomor Rekening" },
        accountName: { type: "text", label: "Atas Nama" },
        qrisImageUrl: imageField("QRIS Image"),
        ...styleFields,
      },
      defaultProps: {
        heading: "Wedding Gift",
        description: "Doa restu Bapak/Ibu/Saudara/i merupakan karunia yang sangat berarti.",
        bankName: "BCA",
        accountNumber: "1234567890",
        accountName: "Romeo",
        qrisImageUrl: "",
        ...defaultStyle,
      },
      render: (props) => <GiftBlock {...props} />,
    },

    // ─── 13. PENUTUP ─────────────────────────────────────────────
    Penutup: {
      label: "🎀 Penutup & Copyright",
      fields: {
        closingText: { type: "textarea", label: "Teks Penutup" },
        familyLabel: { type: "text", label: "Label Keluarga" },
        groomName: { type: "text", label: "Nama Pria" },
        brideName: { type: "text", label: "Nama Wanita" },
        groomFamily: { type: "text", label: "Keluarga Besar Pria" },
        brideFamily: { type: "text", label: "Keluarga Besar Wanita" },
        brandName: { type: "text", label: "Nama Brand / Pembuat" },
        ...styleFields,
      },
      defaultProps: {
        closingText: "Atas kehadiran dan doa restunya kami ucapkan terima kasih. Kami yang berbahagia, keluarga besar kedua mempelai.",
        familyLabel: "Kami yang berbahagia",
        groomName: "Romeo",
        brideName: "Juliet",
        groomFamily: "Keluarga Besar Ahmad",
        brideFamily: "Keluarga Besar Oni",
        brandName: "Life-Start",
        ...defaultStyle,
      },
      render: (props) => <PenutupBlock {...props} />,
    },
  },
};

export default puckConfig;
