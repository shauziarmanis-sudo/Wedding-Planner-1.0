"use client";

import { SharedStyleProps, getSectionStyle, getContentStyle, renderAccentContainer, getLayoutClasses } from "./shared";

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
    textColor,
    headingFont,
    bodyFont,
    headingSize,
    bodySize,
    backgroundImageUrl,
    overlayOpacity,
    contentAlignX,
    contentAlignY,
  } = props;

  const bgStyle = getSectionStyle(props);
  const layoutClass = getLayoutClasses(contentAlignX, contentAlignY);
  const contentStyle = getContentStyle(props);

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
        <div className={`py-20 px-6`}>
          <div className={`max-w-2xl mx-auto w-full flex flex-col ${layoutClass}`} style={contentStyle}>
            {renderAccentContainer(props)}

            <p
              className="opacity-85"
              style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize + 2 }}
            >
              {closingText}
            </p>

            <p
              className="tracking-widest uppercase opacity-60"
              style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 2 }}
            >
              {familyLabel}
            </p>

            {/* Couple Names */}
            <h2
              className="font-bold leading-tight"
              style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
            >
              {groomName} <span style={{ color: accentColor }}>&amp;</span> {brideName}
            </h2>

            {/* Family Names */}
            <div className="flex gap-8 justify-center w-full max-w-md mx-auto mt-4">
              <div className="flex flex-col flex-1" style={contentStyle}>
                <p className="tracking-widest uppercase opacity-50" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 4 }}>
                  Keluarga Besar
                </p>
                <p className="font-semibold" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.4 }}>
                  {groomFamily}
                </p>
              </div>
              <div className="flex flex-col flex-1" style={contentStyle}>
                <p className="tracking-widest uppercase opacity-50" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 4 }}>
                  Keluarga Besar
                </p>
                <p className="font-semibold" style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.4 }}>
                  {brideFamily}
                </p>
              </div>
            </div>

            {renderAccentContainer(props)}
          </div>
        </div>

        {/* Footer / Copyright */}
        <div className="border-t py-6 px-6 text-center bg-black/5 mt-auto" style={{ borderColor: `${accentColor}20` }}>
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
