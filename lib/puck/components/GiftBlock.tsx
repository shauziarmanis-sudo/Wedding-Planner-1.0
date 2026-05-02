"use client";

import { useState } from "react";
import { Gift, Copy, Check, CreditCard, QrCode } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass } from "./shared";

export type GiftProps = SharedStyleProps & {
  heading: string;
  description: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  qrisImageUrl: string;
};

export function GiftBlock(props: GiftProps) {
  const {
    heading,
    description,
    bankName,
    accountNumber,
    accountName,
    qrisImageUrl,
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

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

      <div className="max-w-2xl mx-auto relative z-10 text-center">
        <div
          className={`inline-flex items-center justify-center rounded-full mb-6 ${animClass}`}
          style={{ backgroundColor: `${accentColor}15`, width: accentSize * 2, height: accentSize * 2 }}
        >
          <Gift style={{ color: accentColor, width: accentSize, height: accentSize }} />
        </div>
        <h2
          className="font-bold mb-4"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
        >
          {heading}
        </h2>
        <p className="opacity-80 mb-10 leading-relaxed" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
          {description}
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Bank Transfer Card */}
          <div
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border relative overflow-hidden text-left"
            style={{ borderColor: `${accentColor}20` }}
          >
            <div className="absolute -right-4 -top-4 opacity-5">
              <CreditCard className="w-32 h-32" />
            </div>
            <div className="relative z-10">
              <p className="font-bold mb-4 uppercase tracking-wider" style={{ color: accentColor, fontFamily: headingFont, fontSize: headingSize * 0.5 }}>
                Transfer Bank
              </p>
              <p className="font-semibold mb-1" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.6 }}>{bankName}</p>
              <p className="font-mono text-xl tracking-wider mb-2" style={{ color: textColor }}>{accountNumber}</p>
              <p className="opacity-70 mb-6" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>a.n. {accountName}</p>

              <button
                onClick={handleCopy}
                className="w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all hover:bg-gray-50"
                style={{ color: accentColor, border: `1px solid ${accentColor}30`, fontFamily: bodyFont }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "Berhasil Disalin!" : "Salin Nomor Rekening"}
              </button>
            </div>
          </div>

          {/* QRIS Card */}
          <div
            className="bg-white/80 backdrop-blur-md rounded-2xl p-6 shadow-lg border text-center"
            style={{ borderColor: `${accentColor}20` }}
          >
            <p className="font-bold mb-4 uppercase tracking-wider" style={{ color: accentColor, fontFamily: headingFont, fontSize: headingSize * 0.5 }}>
              Scan QRIS
            </p>
            {qrisImageUrl ? (
              <div className="bg-white p-2 rounded-xl inline-block mb-2 shadow-sm border">
                <img src={qrisImageUrl} alt="QRIS" className="w-32 h-32 object-contain" />
              </div>
            ) : (
              <div className="bg-gray-50 border-2 border-dashed w-32 h-32 mx-auto rounded-xl flex flex-col items-center justify-center mb-2" style={{ borderColor: `${accentColor}30` }}>
                <QrCode className="opacity-20 mb-2" style={{ color: accentColor, width: accentSize, height: accentSize }} />
                <span className="opacity-50" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize * 0.8 }}>Belum ada QRIS</span>
              </div>
            )}
            <p className="opacity-70" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize * 0.9 }}>
              Scan untuk mentransfer
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
