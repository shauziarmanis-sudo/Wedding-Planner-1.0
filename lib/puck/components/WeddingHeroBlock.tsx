"use client";

import { Calendar, Heart } from "lucide-react";
import { SharedStyleProps, getSectionStyle, getAccentAnimClass, getLayoutClasses } from "./shared";

export type WeddingHeroProps = SharedStyleProps & {
  groomName: string;
  brideName: string;
  weddingDate: string;
  tagline: string;
  backgroundType: "color" | "image";
};

export function WeddingHeroBlock(props: WeddingHeroProps) {
  const {
    groomName,
    brideName,
    weddingDate,
    tagline,
    backgroundType,
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

  const bgStyle =
    backgroundType === "image"
      ? getSectionStyle(props)
      : getSectionStyle({ ...props, backgroundImageUrl: undefined });

  const animClass = getAccentAnimClass(accentAnimation);
  // getLayoutClasses outputs something like "flex flex-col w-full h-full justify-center items-center text-center"
  const layoutClass = getLayoutClasses(contentAlignX, contentAlignY);

  return (
    <section className="relative min-h-[85vh] overflow-hidden" style={bgStyle}>
      {/* Overlay */}
      {backgroundType === "image" && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${overlayOpacity / 100})` }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 p-6 sm:p-12 ${layoutClass}`}>
        <div className="max-w-2xl w-full">
          <p
            className="uppercase tracking-[0.35em] mb-6 opacity-80"
            style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 2 }}
          >
            {tagline}
          </p>

          <div className="mb-8">
            <h1
              className="font-bold leading-tight"
              style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
            >
              {groomName}
            </h1>
            <div className={`flex items-center gap-4 my-4 ${animClass} ${contentAlignX === 'center' ? 'justify-center' : contentAlignX === 'left' ? 'justify-start' : 'justify-end'}`}>
              <div className="h-px w-16 opacity-40" style={{ backgroundColor: accentColor }} />
              <Heart opacity={0.6} style={{ color: accentColor, width: accentSize, height: accentSize }} />
              <div className="h-px w-16 opacity-40" style={{ backgroundColor: accentColor }} />
            </div>
            <h1
              className="font-bold leading-tight"
              style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
            >
              {brideName}
            </h1>
          </div>

          {weddingDate && (
            <div
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border opacity-80"
              style={{ borderColor: textColor, color: textColor, fontFamily: bodyFont, fontSize: bodySize }}
            >
              <Calendar className="w-4 h-4" />
              <span className="font-medium tracking-wide">{weddingDate}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
