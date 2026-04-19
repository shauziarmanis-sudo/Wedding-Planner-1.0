import { ChecklistSeedTask } from '@/types/checklist.types';
import { AdatType } from '@/lib/adat-registry';

type S = ChecklistSeedTask;
const t = (
  phase_label: S['phase_label'], days_before: number, category: S['category'],
  title: string, description: string, adat_tags: AdatType[] | ['ALL'], assignee: S['assignee'], is_required: boolean
): S => ({ phase_label, days_before, category, title, description, adat_tags, assignee, is_required });

export const MASTER_CHECKLIST: ChecklistSeedTask[] = [
  // ═══ H-6 BULAN (180 days) ═══
  // -- KATEGORI: VENUE --
  t('H-6 Bulan', 180, 'VENUE', 'Diskusikan konsep & tema pernikahan bersama pasangan', 'Tentukan apakah ingin adat penuh, modern, outdoor, atau intimate', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Tetapkan total budget + alokasi dana cadangan minimal 10–15%', 'Alokasikan budget untuk setiap kategori vendor', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Susun daftar tamu estimasi awal (perkiraan jumlah)', 'Buat daftar tamu dari kedua belah pihak keluarga', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Tentukan tanggal pernikahan', 'Diskusikan dengan keluarga inti', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Konsultasi penentuan hari baik dengan Sulinggih / Pemangku', 'Konsultasi Dewasa Ayu', ['BALI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Konsultasi penentuan tanggal dengan Pawang/Pemangku Adat (kalender Jawa/weton)', 'Hitung weton/hari baik', ['JAWA', 'SUNDA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENUE', "Konsultasi pemimpin adat (To Minaa) untuk Rampanan Kapa'", 'Tentukan tanggal acara adat', ['TORAJA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Tentukan format adat: adat penuh / adat ringkas / elemen adat pilihan', 'Sesuai budget dan keinginan', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Survey & booking venue utama', 'Kunjungi minimal 3 venue dan bandingkan harga', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Pastikan venue bisa menampung prosesi adat (cek ukuran pelaminan, area siraman, dll)', 'Sangat penting untuk kelancaran acara adat', ['JAWA', 'SUNDA', 'BALI', 'BATAK', 'BUGIS', 'MELAYU', 'BETAWI', 'MINANG'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Konfirmasi fasilitas venue: parkir, mushola, ruang rias, toilet, genset', 'Cek kesiapan utilitas', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENUE', 'Venue bisa menampung Gawai Kawin di Rumah Betang atau alternatif gedung', 'Penting untuk adat Dayak', ['DAYAK'], 'KELUARGA', true),
  // -- KATEGORI: KATERING --
  t('H-6 Bulan', 180, 'KATERING', 'Booking katering utama (cek apakah bundle dengan venue)', 'Pilih rekanan venue jika ada', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Konfirmasi menu halal — pastikan tidak ada bahan non-halal', 'Untuk tamu muslim', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Koordinasikan kebutuhan sajian adat: tumpeng, apem, wajik, jenang (Jawa)', 'Pesan di katering atau terpisah', ['JAWA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Koordinasikan kebutuhan sajian adat: ketan kuning, dodol, wajit (Sunda)', 'Pesan di katering atau terpisah', ['SUNDA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Koordinasikan sajian adat Minang: nasi kapau, rendang, gulai kambing (Baralek Gadang)', 'Pesan makanan khas', ['MINANG'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Koordinasikan sajian adat Batak: ikan mas arsik (dengke), naniura, saksang', 'Pesan di katering atau keluarga yang masak', ['BATAK'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Koordinasikan babi guling / sajian adat Bali (sesajen katering)', 'Pesan katering khusus', ['BALI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Koordinasikan sajian adat Toraja: pa\'piong, babi atau kerbau sembelih', 'Persiapkan hewan sembelihan', ['TORAJA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'KATERING', 'Koordinasikan sajian adat Bugis: nasi ketan putih, telur, pisang (untuk Mappacci)', 'Persiapan kue/makanan khas', ['BUGIS'], 'KELUARGA', true),
  // -- KATEGORI: DOKUMENTASI --
  t('H-6 Bulan', 180, 'DOKUMENTASI', 'Survey & booking fotografer + videografer', 'Bandingkan portofolio', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'DOKUMENTASI', 'Diskusikan paket: akad, resepsi, prewedding, coverage prosesi adat', 'Tentukan jumlah tim fotografer', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'DOKUMENTASI', 'Pastikan fotografer berpengalaman dengan prosesi adat yang dipilih', 'Agar momen sakral tidak terlewat', ['JAWA', 'SUNDA', 'BATAK', 'MINANG', 'BALI', 'BUGIS', 'BETAWI', 'TORAJA', 'DAYAK', 'MELAYU'], 'BERDUA', true),
  // -- KATEGORI: BUSANA_RIAS --
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Mulai hunting busana pengantin sesuai adat yang dipilih', 'Sewa atau bikin custom', ['ALL'], 'PENGANTIN_WANITA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Booking Make Up Artist (MUA) yang berpengalaman dengan tata rias adat yang dipilih', 'MUA harus bersertifikat adat jika perlu (seperti Paes)', ['ALL'], 'PENGANTIN_WANITA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Tentukan konsep busana: adat penuh / adat modern / gabungan', 'Untuk akad dan resepsi', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Cari vendor/pengrajin kain ulos Batak untuk busana pengantin dan keluarga', 'Pesan kain ulos', ['BATAK'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Cari vendor songket Minang + suntiang (hiasan kepala mahkota kerbau)', 'Pesan songket', ['MINANG'], 'PENGANTIN_WANITA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Booking vendor payas agung Bali + gelungan + bunga khas', 'Pesan sewa busana Bali', ['BALI'], 'PENGANTIN_WANITA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Cari vendor baju bodo Bugis + lipa sabbe (sarung sutra Bugis)', 'Pesan busana Bugis', ['BUGIS'], 'PENGANTIN_WANITA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Cari vendor busana kebaya encim Betawi untuk pengantin wanita', 'Pesan busana Betawi', ['BETAWI'], 'PENGANTIN_WANITA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Cari vendor pakaian adat Dayak: King Baba & King Bibinge + manik-manik', 'Pesan busana Dayak', ['DAYAK'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Cari vendor baju Pokko + kandaure Toraja', 'Pesan busana Toraja', ['TORAJA'], 'PENGANTIN_WANITA', true),
  t('H-6 Bulan', 180, 'BUSANA_RIAS', 'Cari vendor baju kurung teluk belanga + songket Melayu', 'Pesan busana Melayu', ['MELAYU'], 'BERDUA', true),
  // -- KATEGORI: VENDOR_HIBURAN --
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking MC / Pemandu Acara yang mengerti prosesi adat pilihan', 'Sangat vital untuk menjelaskan makna adat', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking grup musik pendukung', 'Band/DJ untuk resepsi', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking grup Gamelan / Karawitan (khusus prosesi adat Jawa)', 'Untuk mengiringi prosesi panggih', ['JAWA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking grup Degung / Kacapi Suling (khusus prosesi adat Sunda)', 'Untuk mengiringi resepsi/adat', ['SUNDA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking Pargonsi — grup musik Gondang Batak', 'Untuk mengiringi Tor-Tor', ['BATAK'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking penari Tor-Tor + grup musik Gondang', 'Hiburan tradisional Batak', ['BATAK'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking grup musik Tanjidor / Gambang Kromong (khas Betawi)', 'Hiburan tradisional Betawi', ['BETAWI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking Jawara Betawi untuk prosesi Palang Pintu (pencak silat + pantun)', 'Wajib untuk adat Betawi saat iring-iringan pengantin pria tiba', ['BETAWI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking Sekaa Gong (gamelan Bali) + penari Legong untuk penyambutan', 'Musik dan tarian Bali', ['BALI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking penari & grup musik Pa\'pompang / Sape (Dayak)', 'Hiburan adat Dayak', ['DAYAK'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking grup Hadroh / Rebana (Islami Modern)', 'Hiburan Islami', ['ISLAMI_MODERN', 'JAWA', 'SUNDA', 'MELAYU', 'BETAWI'], 'KELUARGA', false),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking grup Kompang (khas Melayu) untuk iring-iringan pengantin', 'Wajib untuk adat Melayu saat penyambutan', ['MELAYU'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking grup musik & penari adat Toraja (Pa\'randing, Pa\'gellu)', 'Hiburan adat Toraja', ['TORAJA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'VENDOR_HIBURAN', 'Booking penari Pasambahan Minang untuk penyambutan tamu', 'Wajib untuk adat Minang (Baralek Gadang)', ['MINANG'], 'KELUARGA', true),
  // -- KATEGORI: DEKOR_FLORIST --
  t('H-6 Bulan', 180, 'DEKOR_FLORIST', 'Survey vendor dekorasi & florist', 'Lihat referensi dekorasi', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'DEKOR_FLORIST', 'Tentukan tema dekorasi & palet warna', 'Sesuaikan dengan pakaian pengantin', ['ALL'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'DEKOR_FLORIST', 'Konfirmasi vendor Kembar Mayang (hiasan pandan janur khas Jawa)', 'Hiasan wajib di pelaminan Jawa', ['JAWA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'DEKOR_FLORIST', 'Konfirmasi vendor Penjor (ornamen bambu khas Bali)', 'Hiasan depan rumah/venue di Bali', ['BALI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'DEKOR_FLORIST', 'Konfirmasi dekorasi Rumah Betang / venue adat Dayak', 'Dekorasi khas Dayak', ['DAYAK'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'DEKOR_FLORIST', 'Konfirmasi dekorasi Tongkonan / venue adat Toraja', 'Dekorasi khas Toraja', ['TORAJA'], 'KELUARGA', true),
  // -- KATEGORI: ADAT_PROSESI (PRE-PLANNING) --
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Konsultasi prosesi adat dengan keluarga & sesepuh / tetua adat', 'Untuk mengetahui urutan adat yang benar', ['JAWA', 'SUNDA', 'BATAK', 'MINANG', 'BALI', 'BUGIS', 'BETAWI', 'DAYAK', 'TORAJA', 'MELAYU'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Hubungi KUA untuk pendaftaran awal + booking penghulu', 'Tanya ketersediaan jadwal penghulu di tanggal yang dipilih', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Hubungi pendeta / pastor untuk jadwal pemberkatan gereja', 'Tanya ketersediaan jadwal pemberkatan', ['BATAK', 'TORAJA', 'DAYAK'], 'BERDUA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal prosesi siraman (1–3 hari sebelum akad)', 'Tentukan jadwal siraman dengan keluarga', ['JAWA', 'SUNDA', 'BUGIS'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal prosesi midodareni (malam sebelum akad)', 'Jadwalkan midodareni', ['JAWA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal prosesi ngeuyeuk seureuh (malam sebelum akad)', 'Jadwalkan ngeuyeuk seureuh', ['SUNDA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal & jadwal malam bainai (malam sebelum akad)', 'Jadwalkan malam bainai', ['MINANG', 'MELAYU'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal prosesi Mappacci (malam sebelum pernikahan Bugis)', 'Jadwalkan Mappacci', ['BUGIS'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal prosesi Ngekeb — sehari sebelum pernikahan (adat Bali)', 'Jadwalkan Ngekeb', ['BALI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal Martuppol (pertunangan di gereja — adat Batak)', 'Jadwalkan Martuppol', ['BATAK'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal Maccera Tapparik (ritual pemurnian pra-nikah Toraja)', 'Jadwalkan Maccera Tapparik', ['TORAJA'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan tanggal Masa Dipiare (pengurungan pengantin wanita Betawi ~1 bulan sebelum)', 'Jadwalkan Masa Dipiare', ['BETAWI'], 'KELUARGA', true),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan jadwal Pengajian / Khatam Al-Quran pengantin wanita', 'Khatam Al-Quran pra nikah', ['ISLAMI_MODERN', 'BUGIS', 'MINANG', 'MELAYU'], 'KELUARGA', false),
  t('H-6 Bulan', 180, 'ADAT_PROSESI', 'Tentukan jadwal Martonggo Raja (kumpul keluarga besar adat Batak)', 'Jadwalkan Martonggo Raja sebelum acara', ['BATAK'], 'KELUARGA', true),

  // ═══ H-5 BULAN (150 days) ═══
  // -- KATEGORI: DOKUMEN_KUA --
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Urus surat pengantar RT/RW sesuai domisili', 'Minta dari RT & RW setempat', ['ALL'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Siapkan fotokopi: KTP, KK, Akta Lahir, Ijazah Terakhir', 'Untuk KUA atau catatan sipil', ['ALL'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Ambil & isi formulir N1–N7 di KUA setempat', 'Sesuai domisili kecamatan', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Imunisasi Tetanus Toxoid (TT) untuk calon pengantin wanita — wajib KUA', 'Bawa surat keterangan TT', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'PENGANTIN_WANITA', true),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Foto background biru: 4x6 (1 lembar), 3x4 (5 lembar), 2x3 (5 lembar)', 'Foto untuk buku nikah/catatan sipil', ['ALL'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Daftarkan jadwal bimbingan pra-nikah di KUA', 'Wajib bagi beberapa KUA', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'BERDUA', false),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Urus dokumen surat baptis + surat gereja (untuk pasangan Kristen)', 'Kepereluan pemberkatan', ['BATAK', 'TORAJA', 'DAYAK'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Urus dokumen surat gereja untuk pemberkatan pernikahan', 'Formulir pemberkatan', ['BATAK', 'TORAJA', 'DAYAK'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'DOKUMEN_KUA', 'Siapkan surat keterangan belum menikah dari desa/kelurahan', 'Sebagai syarat catatan sipil/KUA', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: UNDANGAN --
  t('H-5 Bulan', 150, 'UNDANGAN', 'Mulai rancang desain undangan cetak & digital', 'Pilih desain', ['ALL'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'UNDANGAN', 'Kirim save-the-date ke tamu (4–6 bulan sebelum hari H)', 'Kirim secara online/digital', ['ALL'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'UNDANGAN', 'Finalisasi daftar tamu lengkap dengan nomor WA & alamat', 'Masukan ke sistem/excel', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: SESERAHAN_MAHAR --
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Diskusikan isi seserahan / hantaran dengan keluarga', 'Sesuai kemampuan pihak pria', ['JAWA', 'SUNDA', 'BETAWI', 'BUGIS', 'MELAYU'], 'KELUARGA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Tentukan mahar: jenis, nilai, desain', 'Sepakati besaran mahar', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'PENGANTIN_PRIA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Booking vendor box seserahan / hantaran', 'Sewa box yang bagus', ['JAWA', 'SUNDA', 'BETAWI', 'BUGIS', 'MELAYU'], 'KELUARGA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Diskusikan Sinamot (mahar uang adat Batak) dengan keluarga besar — jumlah, hewan sembelih, ulos', 'Penting untuk pernikahan adat Batak', ['BATAK'], 'KELUARGA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Persiapkan prosesi Marhata Sinamot (negosiasi mahar Batak) — jadwalkan pertemuan keluarga besar', 'Pelaksanaan Marhata Sinamot', ['BATAK'], 'KELUARGA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Diskusikan mahar & harta pusaka untuk prosesi Rampanan Kapa\' (Toraja)', 'Pembahasan dengan keluarga', ['TORAJA'], 'KELUARGA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Persiapkan Tande Putus (perjanjian lamaran Betawi): cincin belah rotan, duit pesalin, kue-kue', 'Perlengkapan lamaran resmi', ['BETAWI'], 'KELUARGA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Diskusikan prosesi Mappetuada — termasuk jumlah uang panai (Bugis)', 'Penentuan Uang Panai', ['BUGIS'], 'KELUARGA', true),
  t('H-5 Bulan', 150, 'SESERAHAN_MAHAR', 'Persiapkan benda-benda pusaka untuk Batimbang Tando (Minang)', 'Untuk acara Batimbang Tando', ['MINANG'], 'KELUARGA', true),
  // -- KATEGORI: TRANSPORTASI --
  t('H-5 Bulan', 150, 'TRANSPORTASI', 'Booking mobil pengantin / kereta kencana / transportasi adat', 'Untuk membawa pengantin', ['ALL'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'TRANSPORTASI', 'Rencanakan shuttle/bus untuk tamu luar kota', 'Transportasi tamu rombongan', ['ALL'], 'BERDUA', false),
  t('H-5 Bulan', 150, 'TRANSPORTASI', 'Persiapkan perahu/transportasi air jika venue di pinggir sungai (Dayak)', 'Akses lewat air jika diperlukan', ['DAYAK'], 'KELUARGA', false),
  // -- KATEGORI: SOUVENIR --
  t('H-5 Bulan', 150, 'SOUVENIR', 'Survey & pilih jenis souvenir pernikahan', 'Pesan di pasar/vendor', ['ALL'], 'BERDUA', true),
  t('H-5 Bulan', 150, 'SOUVENIR', 'Order souvenir (berikan waktu 2–3 bulan untuk produksi custom)', 'Order jumlah sesuai tamu', ['ALL'], 'BERDUA', true),

  // ═══ H-4 BULAN (120 days) ═══
  // -- KATEGORI: BUSANA_RIAS --
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Trial makeup pertama — foto & video hasilnya untuk evaluasi', 'Coba makeup akad/resepsi', ['ALL'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Fitting busana pengantin pertama', 'Fitting ke vendor busana', ['ALL'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Fitting ulos Batak untuk pengantin + keluarga inti (orang tua & saudara)', 'Sesuaikan ukuran', ['BATAK'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Trial riasan adat Jawa lengkap: sanggul, paes, bulu-bulu', 'Khusus paes Jawa', ['JAWA'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Trial riasan adat Sunda: siger, sanggul, paes Sunda', 'Khusus Siger Sunda', ['SUNDA'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Trial riasan Payas Agung Bali: gelungan, bunga, busana adat lengkap', 'Uji coba payas agung', ['BALI'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Trial riasan suntiang Minang — cek kenyamanan karena beratnya signifikan', 'Penting untuk kenyamanan suntiang', ['MINANG'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Trial riasan adat Bugis: baju bodo, hiasan kepala, perhiasan', 'Coba pakaian adat', ['BUGIS'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Trial riasan adat Betawi: kebaya encim, hiasan kepala, perlengkapan', 'Coba pakaian Betawi', ['BETAWI'], 'PENGANTIN_WANITA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Konfirmasi seragam keluarga & bridesmaids', 'Pesan seragam ke penjahit/vendor', ['ALL'], 'BERDUA', true),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Mulai program perawatan kulit & rambut rutin', 'Persiapan fisik', ['ALL'], 'PENGANTIN_WANITA', false),
  t('H-4 Bulan', 120, 'BUSANA_RIAS', 'Pilih & beli cincin pernikahan (sisakan 4–6 minggu untuk ukir)', 'Cincin kawin / tunangan', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: KATERING --
  t('H-4 Bulan', 120, 'KATERING', 'Tasting menu katering — pilih menu akad & resepsi', 'Pilih menu makanan final', ['ALL'], 'BERDUA', true),
  t('H-4 Bulan', 120, 'KATERING', 'Konfirmasi kebutuhan menu halal & dietary khusus', 'Tanya makanan alergi', ['ALL'], 'BERDUA', true),
  t('H-4 Bulan', 120, 'KATERING', 'Tasting sajian adat khusus (dendeng, arsik, dll) — konfirmasi dengan katering', 'Tes masakan adat', ['BATAK', 'TORAJA', 'BALI', 'DAYAK'], 'KELUARGA', true),
  // -- KATEGORI: ADAT_PROSESI (PERSIAPAN BAHAN) --
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Siapkan daftar perlengkapan prosesi siraman: kendi, bunga 7 jenis, dll', 'Perlengkapan untuk siraman', ['JAWA', 'SUNDA', 'BUGIS'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Siapkan perlengkapan ngeuyeuk seureuh: daun sirih, harupat, bakakak, beras kuning', 'Bahan untuk prosesi adat Sunda', ['SUNDA'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Siapkan perlengkapan midodareni: kembar mayang, jadah pasar, dll', 'Bahan untuk midodareni', ['JAWA'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Siapkan perlengkapan malam bainai: daun inai, lilin, perlengkapan kuku', 'Perlengkapan malam inai', ['MINANG', 'MELAYU'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Siapkan perlengkapan Mappacci Bugis: daun pacci/inai, lilin, bantal, sarung, pisang, gula merah', 'Perlengkapan untuk Mappacci', ['BUGIS'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Siapkan bahan sesajen / banten untuk upacara Bali (koordinasi dengan Pemangku)', 'Bahan upacara banten', ['BALI'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Hubungi To Minaa untuk persiapan detail Rampanan Kapa\'', 'Persiapan detail oleh To Minaa', ['TORAJA'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Siapkan perlengkapan Palang Pintu Betawi: alat pencak silat, pantun, Al-Quran', 'Bahan prosesi Palang Pintu', ['BETAWI'], 'KELUARGA', true),
  t('H-4 Bulan', 120, 'ADAT_PROSESI', 'Konfirmasi semua perlengkapan adat Dayak: manik-manik, gong, tuak adat (jika ada)', 'Peralatan ritual Dayak', ['DAYAK'], 'KELUARGA', true),
  // -- KATEGORI: UNDANGAN --
  t('H-4 Bulan', 120, 'UNDANGAN', 'Finalisasi desain undangan cetak — kirim ke percetakan', 'Cetak undangan', ['ALL'], 'BERDUA', true),
  t('H-4 Bulan', 120, 'UNDANGAN', 'Setup undangan digital & link RSVP unik per tamu di Life-Start', 'Siapkan link e-invitation', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: RUNDOWN --
  t('H-4 Bulan', 120, 'RUNDOWN', 'Susun rundown acara awal (akad + resepsi, menit per menit)', 'Draft awal', ['ALL'], 'BERDUA', true),
  t('H-4 Bulan', 120, 'RUNDOWN', 'Masukkan semua prosesi adat ke dalam rundown dengan estimasi durasi', 'Agar waktu tidak molor panjang', ['JAWA', 'SUNDA', 'BATAK', 'MINANG', 'BALI', 'BUGIS', 'BETAWI', 'DAYAK', 'TORAJA', 'MELAYU'], 'BERDUA', true),

  // ═══ H-3 BULAN (90 days) ═══
  // -- KATEGORI: VENDOR_HIBURAN --
  t('H-3 Bulan', 90, 'VENDOR_HIBURAN', 'Kirim email konfirmasi ke SEMUA vendor — gedung, foto, katering, dekor, MC, musik', 'Follow up semua vendor', ['ALL'], 'BERDUA', true),
  t('H-3 Bulan', 90, 'VENDOR_HIBURAN', 'Review semua kontrak & jadwal pembayaran tersisa', 'Cek termin pembayaran vendor', ['ALL'], 'BERDUA', true),
  t('H-3 Bulan', 90, 'VENDOR_HIBURAN', 'Catat semua vendor: paid/unpaid/partial di budget tracker Life-Start', 'Update tracker keuangan', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: DOKUMEN_KUA --
  t('H-3 Bulan', 90, 'DOKUMEN_KUA', 'Daftar resmi ke KUA (minimal 10 hari kerja sebelum akad nikah)', 'Berikan semua berkas ke KUA', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'BERDUA', true),
  t('H-3 Bulan', 90, 'DOKUMEN_KUA', 'Konfirmasi penghulu & jadwal resmi akad nikah', 'Minta konfirmasi buku nikah', ['JAWA', 'SUNDA', 'MINANG', 'BETAWI', 'BUGIS', 'MELAYU', 'ISLAMI_MODERN'], 'BERDUA', true),
  t('H-3 Bulan', 90, 'DOKUMEN_KUA', 'Konfirmasi jadwal pemberkatan dengan pendeta / gereja', 'Minta konfirmasi dari pendeta', ['BATAK', 'TORAJA', 'DAYAK'], 'BERDUA', true),
  t('H-3 Bulan', 90, 'DOKUMEN_KUA', 'Siapkan 2 orang saksi: nama, fotokopi KTP', 'Syarat akad', ['ALL'], 'PENGANTIN_PRIA', true),
  // -- KATEGORI: BUSANA_RIAS --
  t('H-3 Bulan', 90, 'BUSANA_RIAS', 'Trial makeup final — konfirmasi look akhir', 'Fixkan style makeup', ['ALL'], 'PENGANTIN_WANITA', true),
  t('H-3 Bulan', 90, 'BUSANA_RIAS', 'Fitting busana kedua + penyesuaian', 'Coba pakaian jika berat badan berubah', ['ALL'], 'PENGANTIN_WANITA', true),
  // -- KATEGORI: ADAT_PROSESI (KOORDINASI LANJUT) --
  t('H-3 Bulan', 90, 'ADAT_PROSESI', 'Koordinasi detail prosesi Tor-Tor + pembagian ulos (Batak) — siapa mendapat ulos apa', 'Pembagian tugas saat Tor-Tor', ['BATAK'], 'KELUARGA', true),
  t('H-3 Bulan', 90, 'ADAT_PROSESI', 'Konfirmasi tata urutan pemberian ulos Batak (Dalihan Na Tolu)', 'Urutan adat Batak', ['BATAK'], 'KELUARGA', true),
  t('H-3 Bulan', 90, 'ADAT_PROSESI', 'Finalisasi prosesi Manjapuik Marapulai (penjemputan pengantin pria oleh pihak wanita — Minang)', 'Rencana penjemputan pengantin pria', ['MINANG'], 'KELUARGA', true),
  t('H-3 Bulan', 90, 'ADAT_PROSESI', 'Konfirmasi detail prosesi Ngerudat (iring-iringan Betawi)', 'Urutan acara kedatangan rombongan', ['BETAWI'], 'KELUARGA', true),
  t('H-3 Bulan', 90, 'ADAT_PROSESI', 'Finalisasi urutan prosesi Mungkah Lawang & Ngekeb (Bali)', 'Urutan prosesi upacara Hindu', ['BALI'], 'KELUARGA', true),
  t('H-3 Bulan', 90, 'ADAT_PROSESI', 'Koordinasi prosesi Melah Pinang / Gawai Kawin — jadwal per keluarga (Dayak)', 'Jadwal di Rumah Betang', ['DAYAK'], 'KELUARGA', true),
  t('H-3 Bulan', 90, 'ADAT_PROSESI', 'Konfirmasi tata urutan prosesi Ma\'bua & Rampanan Kapa\' (Toraja)', 'Koordinasi acara Toraja', ['TORAJA'], 'KELUARGA', true),
  // -- KATEGORI: HONEYMOON --
  t('H-3 Bulan', 90, 'HONEYMOON', 'Booking hotel honeymoon & transportasi', 'Pesan tiket pesawat/hotel', ['ALL'], 'PENGANTIN_PRIA', false),
  t('H-3 Bulan', 90, 'HONEYMOON', 'Cek paspor jika honeymoon ke luar negeri', 'Perpanjang paspor jika diperlukan', ['ALL'], 'BERDUA', false),

  // ═══ H-2 BULAN (60 days) ═══
  // -- KATEGORI: UNDANGAN --
  t('H-2 Bulan', 60, 'UNDANGAN', 'Kirim undangan cetak (8 minggu sebelum — batas ideal)', 'Distribusi fisik', ['ALL'], 'BERDUA', true),
  t('H-2 Bulan', 60, 'UNDANGAN', 'Blast undangan digital via WA ke semua tamu + link RSVP', 'Gunakan blast WA', ['ALL'], 'BERDUA', true),
  t('H-2 Bulan', 60, 'UNDANGAN', 'Pantau & update status RSVP setiap minggu', 'Lihat di dashboard', ['ALL'], 'BERDUA', true),
  t('H-2 Bulan', 60, 'UNDANGAN', 'Follow up tamu yang belum konfirmasi via WA', 'Untuk hitung final porsi katering', ['ALL'], 'BERDUA', true),
  t('H-2 Bulan', 60, 'UNDANGAN', 'Susun seating chart / denah tempat duduk tamu', 'Atur meja untuk tamu VIP', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: RUNDOWN --
  t('H-2 Bulan', 60, 'RUNDOWN', 'Finalisasi rundown detail hari H (menit per menit, versi final)', 'Kunci susunan acara', ['ALL'], 'BERDUA', true),
  t('H-2 Bulan', 60, 'RUNDOWN', 'Kirim rundown ke semua vendor & keluarga inti', 'Bagi rundown ke seluruh panitia', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: BUSANA_RIAS --
  t('H-2 Bulan', 60, 'BUSANA_RIAS', 'Fitting busana FINAL — bawa sepatu & semua aksesoris', 'Coba pakaian secara utuh', ['ALL'], 'PENGANTIN_WANITA', true),
  t('H-2 Bulan', 60, 'BUSANA_RIAS', 'Konfirmasi fitting ulos Batak final untuk semua anggota keluarga yang wajib memakai', 'Fitting untuk keluarga Batak', ['BATAK'], 'KELUARGA', true),
  // -- KATEGORI: ADAT_PROSESI (PERSIAPAN MASA DIPIARE — BETAWI) --
  t('H-2 Bulan', 60, 'ADAT_PROSESI', 'Mulai Masa Dipiare: pengantin wanita Betawi mulai \'dikurung\' di rumah, dijaga dukun pengantin', 'Perawatan calon pengantin wanita', ['BETAWI'], 'KELUARGA', true),
  t('H-2 Bulan', 60, 'ADAT_PROSESI', 'Siapkan \'Tukang Piare\' (dukun pengantin Betawi) — sudah harus dihubungi & siap', 'Koordinasi Tukang Piare', ['BETAWI'], 'KELUARGA', true),

  // ═══ H-1 BULAN (30 days) ═══
  // -- KATEGORI: VENDOR_HIBURAN --
  t('H-1 Bulan', 30, 'VENDOR_HIBURAN', 'Hubungi semua vendor: konfirmasi ulang jam, lokasi, akses masuk venue', 'Pastikan semua vendor ready', ['ALL'], 'BERDUA', true),
  t('H-1 Bulan', 30, 'VENDOR_HIBURAN', 'Lunasi semua sisa pembayaran vendor (catat di budget tracker)', 'Pelunasan', ['ALL'], 'BERDUA', true),
  t('H-1 Bulan', 30, 'VENDOR_HIBURAN', 'Siapkan amplop tips vendor', 'Berikan ke Best Man/WO', ['ALL'], 'BERDUA', false),
  // -- KATEGORI: UNDANGAN --
  t('H-1 Bulan', 30, 'UNDANGAN', 'Tutup RSVP & hitung final headcount tamu hadir', 'Rekap jumlah orang pasti', ['ALL'], 'BERDUA', true),
  t('H-1 Bulan', 30, 'UNDANGAN', 'Kirimkan angka final ke katering & venue', 'Untuk porsi makan yang pasti', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: RUNDOWN --
  t('H-1 Bulan', 30, 'RUNDOWN', 'Gladi bersih (rehearsal) di venue: MC, keluarga inti, pengiring pengantin', 'Latihan sebelum hari H', ['ALL'], 'BERDUA', true),
  t('H-1 Bulan', 30, 'RUNDOWN', 'Briefing semua kru & keluarga: tugas & posisi masing-masing hari H', 'Technical Meeting dengan vendor', ['ALL'], 'BERDUA', true),
  // -- KATEGORI: ADAT_PROSESI (H-7 SAMPAI H-1) --
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Siraman (1–3 hari sebelum akad) — koordinasikan 7 orang penyiram (Jawa)', 'Pelaksanaan Siraman', ['JAWA'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Midodareni (malam sebelum akad) — pendampingan keluarga pengantin wanita', 'Pelaksanaan Midodareni', ['JAWA'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Ngeuyeuk Seureuh (malam sebelum akad) — dipimpin oleh Pengeuyeuk', 'Pelaksanaan Ngeuyeuk Seureuh', ['SUNDA'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Siraman adat Sunda (3 hari sebelum akad)', 'Pelaksanaan Siraman Sunda', ['SUNDA'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Malam Bainai (malam sebelum akad) — ritual inai kuku pengantin wanita', 'Pelaksanaan Malam Bainai', ['MINANG', 'MELAYU'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Mappasau Botting (perawatan pengantin wanita 3 hari sebelum — Bugis)', 'Pelaksanaan Mappasau Botting', ['BUGIS'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Mappanre Temme (khatam Al-Quran pengantin wanita — Bugis)', 'Khatam Al-Quran Bugis', ['BUGIS'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Mappacci (ritual penyucian malam sebelum pernikahan — Bugis)', 'Pelaksanaan Mappacci', ['BUGIS'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Mappasili (siraman air 7 sumber — Bugis, sebelum hari H)', 'Pelaksanaan Mappasili', ['BUGIS'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Ngekeb (siraman + luluran khas Bali, malam sebelum hari H)', 'Pelaksanaan Ngekeb', ['BALI'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Marsibuha-buhai — persiapan penjemputan pengantin wanita oleh rombongan pria (Batak)', 'Penjemputan Marsibuha-buhai', ['BATAK'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Koordinasi Martonggo Raja — pastikan semua anggota keluarga besar hadir & tahu posisi', 'Kumpul Martonggo Raja', ['BATAK'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Seserahan (7–1 hari sebelum pernikahan)', 'Penyerahan barang seserahan', ['JAWA', 'SUNDA', 'BETAWI', 'BUGIS', 'MELAYU'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Potong Centung — prosesi membersihkan rambut halus tengkuk pengantin wanita Betawi', 'Prosesi Potong Centung', ['BETAWI'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Maccera Tapparik (ritual pemurnian pra-nikah Toraja) — koordinasikan dengan To Minaa', 'Pelaksanaan Maccera Tapparik', ['TORAJA'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Upacara Nyangahatn (doa adat Dayak sebelum pernikahan) — koordinasikan dengan pemimpin adat', 'Pelaksanaan Nyangahatn', ['DAYAK'], 'KELUARGA', true),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Dekorasi Tarub & Janur di rumah', 'Pemasangan tarub & janur kuning', ['JAWA'], 'KELUARGA', false),
  t('H-1 Bulan', 30, 'ADAT_PROSESI', 'Pasang Penjor di kediaman keluarga pria (Bali)', 'Pemasangan Penjor', ['BALI'], 'KELUARGA', true),
  // -- KATEGORI: BUSANA_RIAS --
  t('H-1 Bulan', 30, 'BUSANA_RIAS', 'Pack semua keperluan hari-H dalam 1 tas khusus', 'Siapkan koper', ['ALL'], 'PENGANTIN_WANITA', true),
  t('H-1 Bulan', 30, 'BUSANA_RIAS', 'Cincin pernikahan & buku nikah — simpan di tempat aman yang mudah diakses', 'Sangat vital', ['ALL'], 'BERDUA', true),
  t('H-1 Bulan', 30, 'BUSANA_RIAS', 'Siapkan amplop tips vendor — titipkan ke best man atau WO', 'Untuk kelancaran acara', ['ALL'], 'PENGANTIN_PRIA', true),
  // -- KATEGORI: KESEHATAN --
  t('H-1 Bulan', 30, 'KESEHATAN', 'Izin cuti kerja untuk hari H + honeymoon', 'Ajukan cuti ke HRD', ['ALL'], 'BERDUA', true),
  t('H-1 Bulan', 30, 'KESEHATAN', 'Tidur cukup, makan bergizi, hindari stres berlebih', 'Jaga kesehatan fisik & mental', ['ALL'], 'BERDUA', true),
];
