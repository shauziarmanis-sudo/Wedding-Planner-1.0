"use server";

import { Vendor } from "@/types/vendor.types";

export async function analyzeVendors(vendors: Vendor[], userApiKey?: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || userApiKey;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY_REQUIRED" };
    }

    const prompt = `
      Anda adalah "Wedding Consultant" profesional untuk pernikahan di Indonesia.
      Bantu calon pengantin ini membandingkan ${vendors.length} kandidat vendor untuk kategori: ${vendors[0].category.replace(/_/g, ' ')}.
      
      Berikut data kandidatnya:
      ${vendors.map(v => `
      - NAMA VENDOR: ${v.vendor_name}
      - TOTAL BIAYA (Rp): ${v.actual_cost > 0 ? v.actual_cost : v.estimated_cost}
      - KONTRAK: ${v.contract_signed}
      - DETAIL/CATATAN: ${v.notes || "Tidak ada catatan spesifik"}
      `).join("\n")}
      
      Tugas Anda:
      1. Berikan analisis perbandingan yang objektif namun ramah (menggunakan bahasa Indonesia yang luwes seperti "Halo Kak!").
      2. Sorot Vendor yang PALING MURAH dan apakah benefitnya sepadan.
      3. Sorot Vendor yang PALING LENGKAP (berdasarkan rincian catatan/paket).
      4. Berikan 1 rekomendasi final terbaik menurut Anda dan alasannya.

      Format output dalam Markdown. Jangan terlalu panjang, maksimal 3-4 paragraf.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || \`Gagal menghubungi AI Server (Status: \${response.status})\`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI tidak memberikan respons.";

    return { success: true, data: text };
  } catch (error: any) {
    console.error("AI Analysis Error:", error);
    return { success: false, error: error.message || "Gagal menghubungi AI Server." };
  }
}

// ── AI Analysis khusus untuk Paket Wedding ──
export async function analyzeWeddingPackages(vendors: Vendor[], userApiKey?: string): Promise<{ success: boolean; data?: string; error?: string }> {
  try {
    const apiKey = process.env.GEMINI_API_KEY || userApiKey;
    if (!apiKey) {
      return { success: false, error: "GEMINI_API_KEY_REQUIRED" };
    }

    const prompt = `
Anda adalah "Wedding Consultant" profesional senior yang berpengalaman di industri pernikahan Indonesia.

Seorang calon pengantin ingin membandingkan ${vendors.length} PAKET WEDDING ALL-IN-ONE berikut:

${vendors.map((v, i) => `
═══════════════════════════════
📦 PAKET ${i + 1}: ${v.vendor_name}
═══════════════════════════════
💰 HARGA TOTAL: Rp ${(v.actual_cost > 0 ? v.actual_cost : v.estimated_cost).toLocaleString("id-ID")}
📝 STATUS KONTRAK: ${v.contract_signed}
📞 KONTAK: ${v.contact_name || "-"} | ${v.phone_wa || "-"}

DETAIL BENEFIT PAKET:
${v.notes || "Tidak ada detail spesifik"}
`).join("\n")}

TUGAS ANDA (jawab dalam Bahasa Indonesia yang ramah dan profesional, panggil "Kak"):

1. **💰 RANKING HARGA** — Urutkan dari yang TERMURAH ke TERMAHAL. Sebutkan selisih harga antara paket.

2. **📊 ANALISIS VALUE FOR MONEY** — Untuk setiap paket, hitung estimasi "harga per benefit". Paket mana yang memberikan value terbaik per rupiah yang dikeluarkan?

3. **🏆 KELENGKAPAN PAKET** — Paket mana yang paling LENGKAP benefitnya? Adakah benefit penting yang TIDAK termasuk di salah satu paket?

4. **⚠️ HAL YANG PERLU DIPERHATIKAN** — Apakah ada red flag atau hal yang perlu ditanyakan lebih lanjut ke vendor? (misal: detail yang kurang spesifik, benefit yang ambigu)

5. **✅ REKOMENDASI FINAL** — Berikan 1 rekomendasi paket terbaik secara OBJEKTIF dengan alasan yang jelas. Jika budget terbatas, rekomendasikan alternatif.

Format dalam Markdown yang rapi. Gunakan emoji untuk mempercantik. Maksimal 5-6 paragraf, langsung to the point.
    `;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || \`Gagal menghubungi AI Server (Status: \${response.status})\`);
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, AI tidak memberikan respons.";

    return { success: true, data: text };
  } catch (error: any) {
    console.error("AI Wedding Package Analysis Error:", error);
    return { success: false, error: error.message || "Gagal menghubungi AI Server." };
  }
}
