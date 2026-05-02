"use client";

import { useState } from "react";
import { MessageCircle, User, Send, CheckCircle } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass } from "./shared";

export type WishesProps = SharedStyleProps & {
  heading: string;
  nameLabel: string;
  attendLabel: string;
  messageLabel: string;
  buttonText: string;
};

export function WishesBlock(props: WishesProps) {
  const {
    heading,
    nameLabel,
    attendLabel,
    messageLabel,
    buttonText,
    accentColor,
    backgroundColor,
    textColor,
    headingFont,
    bodyFont,
    headingSize,
    bodySize,
    backgroundImageUrl,
    overlayOpacity,
    accentSize,
    accentAnimation,
  } = props;
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"hadir" | "tidak" | "">("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [wishes, setWishes] = useState([
    { name: "Andi & Keluarga", message: "Selamat menempuh hidup baru! Semoga samawa.", date: "2 Mei 2025" },
    { name: "Budi", message: "Lancar sampai hari H ya bro!", date: "1 Mei 2025" },
    { name: "Citra", message: "Happy wedding! Semoga menjadi keluarga yang sakinah.", date: "30 Apr 2025" },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;
    setLoading(true);

    setTimeout(() => {
      setWishes((prev) => [
        { name, message, date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) },
        ...prev,
      ]);
      setSubmitted(true);
      setLoading(false);
    }, 800);
  };

  const bgStyle = getSectionStyle(props);
  const animClass = getAccentAnimClass(accentAnimation);

  return (
    <section className="py-24 px-6 relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div
            className={`inline-flex items-center justify-center rounded-full mb-6 ${animClass}`}
            style={{ backgroundColor: `${accentColor}15`, width: accentSize * 2, height: accentSize * 2 }}
          >
            <MessageCircle style={{ color: accentColor, width: accentSize, height: accentSize }} />
          </div>
          <h2
            className="font-bold"
            style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
          >
            {heading}
          </h2>
        </div>

        {/* RSVP Form */}
        {!submitted ? (
          <form
            onSubmit={handleSubmit}
            className="bg-white/80 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-xl border mb-10"
            style={{ borderColor: `${accentColor}20` }}
          >
            <div className="mb-6">
              <label className="block font-medium mb-2" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
                {nameLabel}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Masukkan nama Anda"
                required
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all"
                style={{
                  borderColor: `${accentColor}30`,
                  fontFamily: bodyFont,
                  fontSize: bodySize,
                  // @ts-ignore
                  "--tw-ring-color": accentColor,
                }}
              />
            </div>

            <div className="mb-6">
              <label className="block font-medium mb-2" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
                {attendLabel}
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setAttendance("hadir")}
                  className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
                    attendance === "hadir" ? "shadow-md scale-[1.02]" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: attendance === "hadir" ? accentColor : `${accentColor}30`,
                    backgroundColor: attendance === "hadir" ? `${accentColor}10` : "transparent",
                    color: textColor,
                    fontFamily: bodyFont,
                    fontSize: bodySize * 0.9,
                  }}
                >
                  ✅ Ya, Hadir
                </button>
                <button
                  type="button"
                  onClick={() => setAttendance("tidak")}
                  className={`flex-1 py-3 rounded-xl font-medium border-2 transition-all ${
                    attendance === "tidak" ? "shadow-md scale-[1.02]" : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    borderColor: attendance === "tidak" ? "#ef4444" : `${accentColor}30`,
                    backgroundColor: attendance === "tidak" ? "#fef2f2" : "transparent",
                    color: textColor,
                    fontFamily: bodyFont,
                    fontSize: bodySize * 0.9,
                  }}
                >
                  😔 Maaf, Tidak Bisa
                </button>
              </div>
            </div>

            <div className="mb-8">
              <label className="block font-medium mb-2" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
                {messageLabel}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tulis ucapan untuk kedua mempelai..."
                rows={3}
                required
                className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all resize-none"
                style={{
                  borderColor: `${accentColor}30`,
                  fontFamily: bodyFont,
                  fontSize: bodySize,
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !name || !message || !attendance}
              className="w-full py-4 rounded-full font-medium text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              style={{ backgroundColor: accentColor, fontFamily: bodyFont, fontSize: bodySize }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {buttonText}
                </>
              )}
            </button>
          </form>
        ) : (
          <div
            className={`bg-white/80 backdrop-blur-md rounded-3xl p-8 shadow-xl border mb-10 text-center ${animClass}`}
            style={{ borderColor: `${accentColor}20` }}
          >
            <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: accentColor }} />
            <h3 className="font-bold mb-2" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.6 }}>
              Terima Kasih!
            </h3>
            <p className="opacity-70" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
              Ucapan Anda telah terkirim.
            </p>
          </div>
        )}

        {/* Wishes List */}
        <div
          className="bg-white/60 backdrop-blur-md rounded-3xl p-6 shadow-xl border max-h-[400px] overflow-y-auto no-scrollbar"
          style={{ borderColor: `${accentColor}20` }}
        >
          <div className="space-y-4">
            {wishes.map((w, i) => (
              <div
                key={i}
                className={`bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex gap-4 ${animClass}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className="rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}10`, width: accentSize * 1.5, height: accentSize * 1.5 }}
                >
                  <User style={{ color: accentColor, width: accentSize * 0.8, height: accentSize * 0.8 }} />
                </div>
                <div>
                  <h4 className="font-bold" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize * 0.9 }}>
                    {w.name}
                  </h4>
                  <p className="opacity-50 mb-2" style={{ color: textColor, fontSize: bodySize * 0.7 }}>
                    {w.date}
                  </p>
                  <p className="opacity-80 leading-relaxed" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
                    {w.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
