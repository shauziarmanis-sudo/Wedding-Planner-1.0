"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass, getLayoutClasses } from "./shared";

export type CoverEnvelopeProps = SharedStyleProps & {
  groomName: string;
  brideName: string;
  guestNameLabel: string;
  invitationText: string;
  buttonText: string;
  isEditor?: boolean;
};

export function CoverEnvelopeBlock(props: CoverEnvelopeProps) {
  const {
    groomName,
    brideName,
    guestNameLabel,
    invitationText,
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
    contentAlignX,
    contentAlignY,
    isEditor = false,
  } = props;

  const [isOpen, setIsOpen] = useState(isEditor);
  const [guestName, setGuestName] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const name = params.get("to") || params.get("g");
      if (name) {
        const formattedName = decodeURIComponent(name)
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
        setGuestName(formattedName);
      }
    }
  }, []);

  useEffect(() => {
    if (!isEditor) {
      document.body.style.overflow = isOpen ? "auto" : "hidden";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen, isEditor]);

  const bgStyle = getSectionStyle(props);
  const animClass = getAccentAnimClass(accentAnimation);
  const layoutClass = getLayoutClasses(contentAlignX, contentAlignY);

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.div
          initial={{ y: 0 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={`fixed inset-0 z-[100] p-6 sm:p-12 ${layoutClass}`}
          style={bgStyle}
        >
          {backgroundImageUrl && (
            <div
              className="absolute inset-0"
              style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
            />
          )}

          <div className="relative z-10 w-full max-w-md">
            {/* Envelope Icon */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
              className={`rounded-full mb-8 flex items-center justify-center ${animClass} ${contentAlignX === 'center' ? 'mx-auto' : contentAlignX === 'right' ? 'ml-auto' : ''}`}
              style={{
                backgroundColor: `${accentColor}20`,
                border: `2px solid ${accentColor}50`,
                width: accentSize * 2,
                height: accentSize * 2,
              }}
            >
              <Mail style={{ color: accentColor, width: accentSize, height: accentSize }} />
            </motion.div>

            {/* Names */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="mb-6"
            >
              <p
                className="tracking-[0.25em] uppercase opacity-70 mb-3"
                style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 2 }}
              >
                The Wedding Of
              </p>
              <h1
                className="font-bold mb-2 drop-shadow-lg leading-tight"
                style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
              >
                {groomName}
              </h1>
              <p className="mb-2" style={{ color: accentColor, fontFamily: headingFont, fontSize: headingSize * 0.5 }}>&amp;</p>
              <h1
                className="font-bold drop-shadow-lg leading-tight"
                style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
              >
                {brideName}
              </h1>
            </motion.div>

            {/* Invitation Card */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="bg-white/10 backdrop-blur-md border rounded-2xl p-8 shadow-2xl"
              style={{ borderColor: `${accentColor}40` }}
            >
              <p className="mb-2 opacity-70" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
                {guestNameLabel}
              </p>
              <h2
                className="font-bold border-b pb-4 mb-4"
                style={{ color: accentColor, borderColor: `${accentColor}30`, fontFamily: headingFont, fontSize: headingSize * 0.6 }}
              >
                {guestName || "Tamu Undangan"}
              </h2>
              <p className="opacity-80 mb-6 leading-relaxed" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
                {invitationText}
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="w-full py-4 rounded-full font-medium tracking-wide flex items-center justify-center gap-3 shadow-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: accentColor, color: "#fff", fontFamily: bodyFont, fontSize: bodySize }}
              >
                <Mail style={{ width: bodySize, height: bodySize }} />
                {buttonText}
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
