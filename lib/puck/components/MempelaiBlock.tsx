"use client";

import { Instagram } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass } from "./shared";

export type MempelaiProps = SharedStyleProps & {
  subHeading: string;
  groomName: string;
  groomParents: string;
  groomPhoto: string;
  groomInstagram: string;
  brideName: string;
  brideParents: string;
  bridePhoto: string;
  brideInstagram: string;
  tagline: string;
};

export function MempelaiBlock(props: MempelaiProps) {
  const {
    subHeading,
    groomName,
    groomParents,
    groomPhoto,
    groomInstagram,
    brideName,
    brideParents,
    bridePhoto,
    brideInstagram,
    tagline,
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

  const bgStyle = getSectionStyle(props);
  const animClass = getAccentAnimClass(accentAnimation);

  const renderPerson = (
    name: string,
    photo: string,
    parents: string,
    instagram: string
  ) => (
    <div className="flex flex-col items-center">
      {/* Circle Photo Frame */}
      <div
        className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-xl border-4 mb-6"
        style={{ borderColor: `${accentColor}40` }}
      >
        {photo ? (
          <img src={photo} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
      </div>
      <h3
        className="font-bold mb-2"
        style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.8 }}
      >
        {name}
      </h3>
      <p className="opacity-70 mb-3 leading-relaxed" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
        {parents}
      </p>
      {instagram && (
        <a
          href={`https://instagram.com/${instagram.replace("@", "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full transition-all hover:scale-105"
          style={{ backgroundColor: `${accentColor}15`, color: accentColor, fontFamily: bodyFont, fontSize: bodySize - 2 }}
        >
          <Instagram className="w-4 h-4" />
          {instagram.startsWith("@") ? instagram : `@${instagram}`}
        </a>
      )}
    </div>
  );

  return (
    <section className="py-20 px-6 relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}
      <div className="max-w-3xl mx-auto text-center relative z-10">
        {/* Sub Heading */}
        <p
          className="tracking-[0.25em] uppercase opacity-60 mb-2"
          style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 2 }}
        >
          {subHeading}
        </p>

        {/* Big Names */}
        <h2
          className="font-bold mb-4 leading-tight"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 1.2 }}
        >
          {groomName} <span style={{ color: accentColor }} className={animClass}>&amp;</span> {brideName}
        </h2>

        <p className="opacity-70 mb-14 max-w-lg mx-auto leading-relaxed" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
          {tagline}
        </p>

        {/* Two Columns: Groom & Bride */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {renderPerson(groomName, groomPhoto, groomParents, groomInstagram)}
          
          {/* Divider on mobile */}
          <div className={`md:hidden flex items-center justify-center ${animClass}`}>
            <div className="h-px w-12 opacity-30" style={{ backgroundColor: accentColor }} />
            <span className="mx-4 font-bold" style={{ color: accentColor, fontFamily: headingFont, fontSize: headingSize }}>&amp;</span>
            <div className="h-px w-12 opacity-30" style={{ backgroundColor: accentColor }} />
          </div>

          {renderPerson(brideName, bridePhoto, brideParents, brideInstagram)}
        </div>
      </div>
    </section>
  );
}
