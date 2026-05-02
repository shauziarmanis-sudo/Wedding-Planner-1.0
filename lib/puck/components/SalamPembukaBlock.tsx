"use client";

import { SharedStyleProps, getSectionStyle, getAccentAnimClass, getLayoutClasses } from "./shared";

export type SalamPembukaProps = SharedStyleProps & {
  greeting: string;
  body: string;
};

export function SalamPembukaBlock(props: SalamPembukaProps) {
  const {
    greeting,
    body,
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
    <section className="py-20 px-6 relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}
      <div className={`max-w-2xl mx-auto relative z-10 ${layoutClass}`}>
        {/* Ornament */}
        <div className={`flex items-center gap-3 mb-8 ${animClass} ${contentAlignX === 'center' ? 'justify-center' : contentAlignX === 'left' ? 'justify-start' : 'justify-end'}`}>
          <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
          <svg style={{ width: accentSize, height: accentSize }} viewBox="0 0 24 24" fill="none" className="opacity-40">
            <path d="M12 2L14.09 8.26L20.18 8.27L15.54 12.14L17.63 18.4L12 14.67L6.37 18.4L8.46 12.14L3.82 8.27L9.91 8.26L12 2Z" fill={accentColor} />
          </svg>
          <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
        </div>

        <h2
          className="font-bold mb-6"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.8 }}
        >
          {greeting}
        </h2>

        <p
          className="leading-relaxed opacity-85"
          style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}
        >
          {body}
        </p>

        {/* Bottom Ornament */}
        <div className={`flex items-center gap-3 mt-8 ${animClass} ${contentAlignX === 'center' ? 'justify-center' : contentAlignX === 'left' ? 'justify-start' : 'justify-end'}`}>
          <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
          <svg style={{ width: accentSize, height: accentSize }} viewBox="0 0 24 24" fill="none" className="opacity-40">
            <path d="M12 2L14.09 8.26L20.18 8.27L15.54 12.14L17.63 18.4L12 14.67L6.37 18.4L8.46 12.14L3.82 8.27L9.91 8.26L12 2Z" fill={accentColor} />
          </svg>
          <div className="h-px w-16 opacity-30" style={{ backgroundColor: accentColor }} />
        </div>
      </div>
    </section>
  );
}
