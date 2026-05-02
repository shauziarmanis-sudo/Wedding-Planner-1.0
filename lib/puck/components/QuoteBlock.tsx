"use client";

import { Quote } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass, getLayoutClasses } from "./shared";

export type QuoteProps = SharedStyleProps & {
  quote: string;
  author: string;
};

export function QuoteBlock(props: QuoteProps) {
  const {
    quote,
    author,
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
    <section className="py-24 px-6 relative flex justify-center items-center" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}

      <div className={`max-w-2xl mx-auto relative z-10 ${layoutClass}`}>
        <Quote className={`mb-8 opacity-40 ${animClass} ${contentAlignX === 'center' ? 'mx-auto' : contentAlignX === 'right' ? 'ml-auto' : ''}`} style={{ color: accentColor, width: accentSize * 2, height: accentSize * 2 }} />
        <p
          className="italic leading-relaxed mb-8"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.7 }}
        >
          "{quote}"
        </p>
        <div className={`h-px w-16 mb-4 opacity-50 ${animClass} ${contentAlignX === 'center' ? 'mx-auto' : contentAlignX === 'right' ? 'ml-auto' : ''}`} style={{ backgroundColor: accentColor }} />
        <p className="font-bold tracking-widest uppercase opacity-80" style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}>
          {author}
        </p>
      </div>
    </section>
  );
}
