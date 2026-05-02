"use client";

import { Heart } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass, getLayoutClasses } from "./shared";

export type PenutupProps = SharedStyleProps & {
  closingText: string;
  familyLabel: string;
  groomName: string;
  brideName: string;
  groomFamily: string;
  brideFamily: string;
  brandName: string;
};

export function PenutupBlock(props: PenutupProps) {
  const {
    closingText,
    familyLabel,
    groomName,
    brideName,
    groomFamily,
    brideFamily,
    brandName,
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
  } = props;

  const bgStyle = getSectionStyle(props);
  const animClass = getAccentAnimClass(accentAnimation);
  const layoutClass = getLayoutClasses(contentAlignX, contentAlignY);

  return (
    <section className="relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}
      <div className={`relative z-10 h-full flex flex-col`}>
        {/* Main Closing Content */}
        <div className={`py-20 px-6 ${layoutClass}`}>
          <div className="max-w-2xl mx-auto w-full">
            {/* Ornament */}
            <div className={`flex items-center gap-3 mb-8 ${animClass} ${contentAlignX === 'center' ? 'justify-center' : contentAlignX === 'left' ? 'justify-start' : 'justify-end'}`}>
              <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
              <Heart className="opacity-40" style={{ color: accentColor, width: accentSize, height: accentSize }} />
              <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
            </div>

            <p
              className="leading-relaxed opacity-85 mb-10"
              style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize + 2 }}
            >
              {closingText}
            </p>

            <p
              className="tracking-widest uppercase opacity-60 mb-6"
              style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 2 }}
            >
              {familyLabel}
            </p>

            {/* Couple Names */}
            <h2
              className="font-bold mb-10 leading-tight"
              style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
            >
              {groomName} <span style={{ color: accentColor }}>&amp;</span> {brideName}
            </h2>

            {/* Family Names */}
            <div className="grid grid-cols-2 gap-8 max-w-md mx-auto mb-8">
              <div>
                <p className="tracking-widest uppercase opacity-50 mb-2" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 4 }}>
                  Keluarga Besar
                </p>
                <p className="font-semibold" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.4 }}>
                  {groomFamily}
                </p>
              </div>
              <div>
                <p className="tracking-widest uppercase opacity-50 mb-2" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 4 }}>
                  Keluarga Besar
                </p>
                <p className="font-semibold" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.4 }}>
                  {brideFamily}
                </p>
              </div>
            </div>

            {/* Bottom Ornament */}
            <div className={`flex items-center justify-center gap-3 ${animClass}`}>
              <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
              <Heart className="opacity-40" style={{ color: accentColor, width: accentSize, height: accentSize }} />
              <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
            </div>
          </div>
        </div>

        {/* Footer / Copyright */}
        <div className="border-t py-6 px-6 text-center bg-black/5" style={{ borderColor: `${accentColor}20` }}>
          <p className="font-semibold tracking-wider opacity-60" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
            {brandName}
          </p>
          <p className="opacity-40 mt-1" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 4 }}>
            Copyright &copy; {new Date().getFullYear()} &middot; All Rights Reserved
          </p>
        </div>
      </div>
    </section>
  );
}
