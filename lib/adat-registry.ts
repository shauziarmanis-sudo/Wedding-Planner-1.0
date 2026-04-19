export interface AdatInfo {
  readonly id: string;
  readonly label: string;
  readonly region: string;
  readonly emoji: string;
  readonly color: string;
  readonly colorLight: string;
  readonly agama_default: string | null;
  readonly deskripsi: string;
  readonly prosesi_khas: readonly string[];
  readonly busana_khas: string;
  readonly vendor_khusus: readonly string[];
  readonly catatan?: string;
}

export const ADAT_REGISTRY = {
  JAWA: {
    id: 'JAWA',
    label: 'Adat Jawa',
    region: 'Jawa Tengah & Yogyakarta',
    emoji: '🏛️',
    color: '#92400E',         // amber-800
    colorLight: '#FEF3C7',    // amber-50
    agama_default: 'ISLAM',
    deskripsi: 'Prosesi lengkap adat Jawa Tengah/Yogyakarta: siraman, midodareni, panggih, sungkeman, balangan gantal, wiji dadi.',
    prosesi_khas: ['Siraman', 'Midodareni', 'Panggih', 'Sungkeman', 'Balangan Gantal', 'Wiji Dadi', 'Dodol Dawet', 'Kacar-Kucur', 'Dulangan', 'Kirab Pengantin'],
    busana_khas: 'Kebaya + Beskap Jawa / Sorjan',
    vendor_khusus: ['Pemangku Adat Jawa', 'Gamelan / Karawitan', 'Abdi Dalem (opsional)', 'Kembar Mayang'],
  },

  SUNDA: {
    id: 'SUNDA',
    label: 'Adat Sunda',
    region: 'Jawa Barat',
    emoji: '🌿',
    color: '#166534',         // green-800
    colorLight: '#DCFCE7',    // green-50
    agama_default: 'ISLAM',
    deskripsi: 'Prosesi adat Sunda lengkap: ngeuyeuk seureuh, siraman, mapag pengantin, saweran, nincak endog, huap lingkung.',
    prosesi_khas: ['Ngeuyeuk Seureuh', 'Siraman', 'Ngaras', 'Mapag Pengantin', 'Sawer Panganten', 'Nincak Endog', 'Buka Pintu', 'Huap Lingkung', 'Meuleum Harupat'],
    busana_khas: 'Kebaya Sunda / Siger Sunda',
    vendor_khusus: ['Pengeuyeuk (pemandu ngeuyeuk)', 'Degung / Kacapi Suling', 'Pager Ayu', 'Ki Lengser'],
  },

  BATAK: {
    id: 'BATAK',
    label: 'Adat Batak (Toba)',
    region: 'Sumatera Utara',
    emoji: '🦅',
    color: '#1E3A5F',         // blue-900-like
    colorLight: '#DBEAFE',    // blue-100
    agama_default: 'KRISTEN',
    deskripsi: 'Prosesi adat Batak Toba: marhusip, marhata sinamot, martuppol, marunjuk/pesta unjuk, pemberian ulos, tor-tor.',
    prosesi_khas: ['Marhusip', 'Marhata Sinamot (negosiasi sinamot/mahar)', 'Martuppol (pertunangan di gereja)', 'Martonggo Raja (kumpul keluarga besar)', 'Marsibuha-buhai (penjemputan)', 'Pamasu-masuon (pemberkatan gereja)', 'Pesta Unjuk / Marunjuk', 'Pemberian Ulos', 'Tor-Tor & Gondang', 'Manjalo Pasu-pasu', 'Pasahat Jambar', 'Paulak Une (kunjungan balasan)'],
    busana_khas: 'Ulos Batak + Jas / Baju Adat Batak',
    vendor_khusus: ['Pargonsi (musik gondang batak)', 'Penghulu/Pendeta', 'Dalihan Na Tolu (koordinator adat)', 'Babi/Hewan Sembelihan (untuk marga tertentu)'],
    catatan: 'Membutuhkan koordinasi intensif dengan keluarga besar (marga). Timeline bisa lebih panjang karena negosiasi sinamot.',
  },

  MINANG: {
    id: 'MINANG',
    label: 'Adat Minangkabau',
    region: 'Sumatera Barat',
    emoji: '🏠',
    color: '#7C2D12',         // orange-900
    colorLight: '#FFEDD5',    // orange-50
    agama_default: 'ISLAM',
    deskripsi: 'Sistem matrilineal: keluarga pihak WANITA yang melamar pria. Prosesi: maresek, maminang, malam bainai, manjapuik marapulai, baralek gadang.',
    prosesi_khas: ['Maresek (penjajakan awal — wanita ke pria)', 'Maminang / Batimbang Tando (lamaran + bertukar tanda)', 'Mahanta Siriah (minta izin keluarga besar)', 'Babako-Babaki (dukungan keluarga ayah)', 'Malam Bainai (inai kuku pengantin wanita)', 'Manjapuik Marapulai (jemput pengantin pria)', 'Akad Nikah', 'Baralek Gadang (pesta besar)', 'Maanta Pabukoan', 'Manjalang Mintuo (kunjungan mertua)'],
    busana_khas: 'Suntiang (mahkota tanduk kerbau) + Baju Kurung Basiba + Songket',
    vendor_khusus: ['Ninik Mamak / Penghulu Adat', 'Tukang Pasumandan', 'Penari Pasambahan', 'Randai (musik tradisional Minang)'],
    catatan: 'PENTING: Dalam adat Minang, pihak WANITA yang aktif melamar pria — checklist berbeda dari adat lain. Biaya pesta besar di tanggung pihak wanita.',
  },

  BETAWI: {
    id: 'BETAWI',
    label: 'Adat Betawi',
    region: 'DKI Jakarta',
    emoji: '🎭',
    color: '#831843',         // pink-900
    colorLight: '#FCE7F3',    // pink-50
    agama_default: 'ISLAM',
    deskripsi: 'Perpaduan budaya Melayu, Arab, Tionghoa, Belanda. Prosesi khas: palang pintu, ngerudat, masa dipiare, potong centung.',
    prosesi_khas: ['Ngedelengin (pengenalan via mak comblang)', 'Nglamar (lamaran resmi)', 'Tande Putus (perjanjian)', 'Masa Dipiare (pengurungan calon pengantin wanita ~1 bulan)', 'Potong Centung (bersih rambut halus)', 'Ngerudat (iring-iringan rombongan pria)', 'Palang Pintu (laga pencak silat + adu pantun)', 'Akad Nikah', 'Resepsi dengan Tanjidor / Gambang Kromong'],
    busana_khas: 'Kebaya Encim (wanita) + Baju Sadariah/Pangsi (pria)',
    vendor_khusus: ['Jawara Betawi (untuk Palang Pintu)', 'Gambang Kromong / Tanjidor', 'Mak Comblang', 'Dukun Pengantin Betawi'],
    catatan: 'Masa Dipiare (pengurungan ~1 bulan) adalah ciri khas Betawi — perlu direncanakan jauh sebelum hari H.',
  },

  BALI: {
    id: 'BALI',
    label: 'Adat Bali (Hindu)',
    region: 'Bali',
    emoji: '🌺',
    color: '#065F46',         // emerald-800
    colorLight: '#D1FAE5',    // emerald-50
    agama_default: 'HINDU',
    deskripsi: 'Pernikahan Hindu Bali (Pawiwahan): masedek, madewasa ayu, ngekeb, mungkah lawang, mepamit, byakala, mekalan-kalan, mejauman/ngabe tipat bantal.',
    prosesi_khas: ['Masedek (lamaran keluarga)', 'Madewasa Ayu (tentukan hari baik dengan sulinggih)', 'Ngekeb (siraman + luluran khas Bali, sehari sebelum)', 'Mungkah Lawang (buka pintu / penjemputan)', 'Mepamit (pamit ke leluhur wanita)', 'Byakala (pembersihan kekuatan buruk)', 'Mekalan-kalan (upacara di merajan/pura)', 'Makejang (pemberkatan di pura)', 'Mejauman / Ngabe Tipat Bantal (kunjungan keluarga wanita ke keluarga pria)'],
    busana_khas: 'Payas Agung Bali + Gelungan + Bunga',
    vendor_khusus: ['Sulinggih / Pemangku (menentukan hari baik & memimpin upacara)', 'Penjor maker', 'Sesajen / Banten specialist', 'Sekaa Gong (gamelan Bali)'],
    catatan: 'Pernikahan dilaksanakan di rumah keluarga PRIA (berbeda dari adat lain). Butuh konsultasi Sulinggih untuk tentukan hari baik (Dewasa Ayu) — lakukan ini pertama kali.',
  },

  BUGIS: {
    id: 'BUGIS',
    label: 'Adat Bugis-Makassar',
    region: 'Sulawesi Selatan',
    emoji: '⚓',
    color: '#1D4ED8',         // blue-700
    colorLight: '#DBEAFE',    // blue-100
    agama_default: 'ISLAM',
    deskripsi: 'Prosesi adat Bugis-Makassar: mappetuada, mappasau botting, mappanre temme, mappacci, mappasili, akad nikah, mappasikarawa, mapparola.',
    prosesi_khas: ['Massuro/Madduta (melamar resmi)', 'Mappetuada (lamaran resmi + tentukan mahar)', 'Mappasau Botting (perawatan pengantin wanita 3 hari)', 'Mappanre Temme (khatam Al-Quran pengantin wanita)', 'Mappacci (ritual penyucian jiwa dengan daun pacci/inai)', 'Mappasili (siraman air 7 mata air)', 'Akad Nikah / Ijab Kabul', 'Mappasikarawa (pertemuan pertama suami-istri)', 'Mapparola (kunjungan balasan ke keluarga pria)', 'Ziarah & Massita Beseng'],
    busana_khas: 'Baju Bodo (wanita) + Jas Tutup Bugis / Lipa Sabbe (pria)',
    vendor_khusus: ['To Makkawin / Penghulu Adat Bugis', 'Pemimpin Mappacci', 'Penjemput Pengantin', 'Musik Gendang Bugis'],
    catatan: 'Mappacci adalah momen paling sakral — perlu dipersiapkan daunnya (daun pacci/inai) dan koordinasi tokoh adat setempat.',
  },

  MELAYU: {
    id: 'MELAYU',
    label: 'Adat Melayu',
    region: 'Riau, Kepri, Kalimantan, Sumatera',
    emoji: '🌙',
    color: '#065F46',         // emerald-800
    colorLight: '#ECFDF5',    // emerald-50
    agama_default: 'ISLAM',
    deskripsi: 'Kaya unsur Islam. Prosesi: merisik, meminang, berinai besar, akad nikah, bersanding, tepung tawar, makan bersuap.',
    prosesi_khas: ['Merisik (penjajakan diam-diam)', 'Meminang (lamaran formal)', 'Berkhatam Al-Quran (calon pengantin wanita)', 'Berinai Kecil (inai kuku)', 'Berinai Besar (inai tangan penuh)', 'Akad Nikah', 'Bersanding di Pelaminan', 'Tepung Tawar (doa restu)', 'Makan Bersuap (suap menyuap oleh orang tua)', 'Mandi Belimau (mandi limau/jeruk)'],
    busana_khas: 'Baju Kurung Teluk Belanga + Songket Melayu + Tengkuluk',
    vendor_khusus: ['Tok Kadi / Penghulu Melayu', 'Pemain Kompang', 'Pembuat Inai Melayu', 'Tukang Tepung Tawar'],
    catatan: 'Tradisi Melayu sangat beragam antar daerah (Riau vs Pontianak vs Deli Serdang). Konfirmasi dengan keluarga untuk variasi lokal.',
  },

  DAYAK: {
    id: 'DAYAK',
    label: 'Adat Dayak',
    region: 'Kalimantan',
    emoji: '🌿',
    color: '#3B0764',         // purple-950-like
    colorLight: '#F3E8FF',    // purple-50
    agama_default: 'KRISTEN',
    deskripsi: 'Pernikahan adat Dayak Iban / Kenyah / Ngaju: Gawai Kawin, Melah Pinang, prosesi di Rumah Betang, tarian adat.',
    prosesi_khas: ['Penyelidikan Jodoh (penjajakan keluarga)', 'Peminangan / Betunangan', 'Upacara Nyangahatn (doa adat sebelum pernikahan)', 'Melah Pinang (prosesi iring-iringan dari rumah ke rumah)', 'Gawai Kawin (pesta pernikahan di Rumah Betang)', 'Tari Adat (Kancet Ledo / Ngajat)', 'Upacara Minum Tuak Adat', 'Pemberian Mahar (bisa berupa benda pusaka)', 'Pemberkatan oleh Pemimpin Adat'],
    busana_khas: 'King Baba (pria) + King Bibinge (wanita) + Manik-manik + Bulu Enggang',
    vendor_khusus: ['Pemimpin Adat Dayak', 'Penari Adat Dayak', 'Pengisi Musik Sape / Gong Dayak', 'Pembuat Manik-manik Adat'],
    catatan: 'Sub-suku Dayak sangat beragam (Iban, Kenyah, Kayan, Ngaju, dll) — prosesi berbeda per sub-suku. Konsultasi dengan keluarga dan pemimpin adat WAJIB dilakukan pertama kali.',
  },

  TORAJA: {
    id: 'TORAJA',
    label: 'Adat Toraja',
    region: 'Sulawesi Selatan (Tana Toraja)',
    emoji: '🏔️',
    color: '#7F1D1D',         // red-900
    colorLight: '#FEF2F2',    // red-50
    agama_default: 'KRISTEN',
    deskripsi: 'Rampanan Kapa (perjanjian pra-nikah adat Toraja), melibatkan seluruh komunitas, pesta besar dengan tarian dan musik Pa\'pompang.',
    prosesi_khas: ["Manta'dang (meminang oleh keluarga pria)", "Rampanan Kapa' (perjanjian adat + aturan pernikahan)", "Ma'bua (upacara perayaan dengan tarian adat)", "Maccera' Tapparik (ritual pemurnian pra-nikah)", "Pemberkatan Gereja / Akad (tergantung agama)", "Pa'pompang (musik bambu khas Toraja)", "Tarian Ma'randing & Pa'gellu'", "Pesta Tongkonan (di rumah adat)"],
    busana_khas: 'Baju Pokko (wanita) + Baju Kandaure + Perhiasan Emas Toraja',
    vendor_khusus: ["Pemimpin Adat To Minaa", "Grup Pa'pompang", "Penari Ma'randing", "Pembuat Kandaure & Manik-manik Toraja"],
    catatan: "Rampanan Kapa' (semacam perjanjian pra-nikah adat) melibatkan seluruh komunitas — harus difasilitasi jauh sebelum hari H. Pernikahan Toraja bisa berlangsung berhari-hari.",
  },

  ISLAMI_MODERN: {
    id: 'ISLAMI_MODERN',
    label: 'Islami Modern',
    region: 'Seluruh Indonesia',
    emoji: '🕌',
    color: '#065F46',         // teal-like
    colorLight: '#CCFBF1',    // teal-50
    agama_default: 'ISLAM',
    deskripsi: 'Pernikahan Islami tanpa prosesi adat lokal spesifik. Fokus pada syariat Islam: akad nikah yang sah, walimatul ursy, tanpa ikhtilat.',
    prosesi_khas: ['Khitbah / Lamaran Islami (sederhana, keluarga inti)', 'Bimbingan Pra-Nikah (KUA atau ustaz)', 'Akad Nikah (ijab kabul di masjid/KUA/rumah)', 'Walimatul Ursy (resepsi)', 'Pemisahan tamu pria & wanita (jika dipilih)', 'Doa Bersama', 'Pengajian Pra-Nikah (opsional)', 'Tidak ada prosesi adat khusus'],
    busana_khas: 'Gamis / Kebaya Syari + Jas/Koko untuk pria',
    vendor_khusus: ['Penghulu KUA', 'Ustaz / Ustazah (bimbingan pra-nikah)', 'MC Islami', 'Grup Hadroh / Rebana'],
    catatan: 'Pilih ini jika tidak ingin mengikuti prosesi adat spesifik namun tetap ingin pernikahan yang sesuai syariat Islam.',
  },

  MODERN: {
    id: 'MODERN',
    label: 'Modern / International',
    region: 'Seluruh Indonesia',
    emoji: '💍',
    color: '#374151',         // gray-700
    colorLight: '#F9FAFB',    // gray-50
    agama_default: null,
    deskripsi: 'Pernikahan modern tanpa prosesi adat khusus. Fokus pada pengalaman tamu, estetika venue, dan momen berkesan. Bisa dikombinasikan dengan elemen adat pilihan.',
    prosesi_khas: ['Engagement / Lamaran', 'Akad Nikah (minimalis)', 'Wedding Reception', 'First Dance', 'Cake Cutting', 'Bouquet Toss (opsional)', 'Photo & Video Session'],
    busana_khas: 'Wedding Dress / Suit (internasional) atau Kebaya Modern',
    vendor_khusus: ['Wedding Organizer profesional', 'DJ / Live Band'],
    catatan: 'Pilih ini untuk fleksibilitas maksimal. Bisa tambahkan elemen dari adat lain secara a-la-carte.',
  },
} as const

export type AdatType = keyof typeof ADAT_REGISTRY
export const ADAT_TYPES = Object.keys(ADAT_REGISTRY) as AdatType[]

export function getAdatColor(adat: AdatType): { main: string; light: string } {
  return {
    main: ADAT_REGISTRY[adat]?.color || '#374151',
    light: ADAT_REGISTRY[adat]?.colorLight || '#F9FAFB',
  }
}

import { ChecklistTask } from '@/types/checklist.types'

export function filterTasksByAdat<T extends { adat_tags: any }>(
  tasks: T[],
  adat: AdatType,
  adat_secondary?: AdatType
): T[] {
  return tasks.filter(task => {
    const tags = task.adat_tags as string[];
    if (tags.includes('ALL')) return true;
    if (tags.includes(adat)) return true;
    if (adat_secondary && tags.includes(adat_secondary)) return true;
    return false;
  });
}
