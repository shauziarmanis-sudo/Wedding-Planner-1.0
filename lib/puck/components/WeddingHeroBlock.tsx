"use client";

import { Calendar } from "lucide-react";

import { SharedStyleProps, getSectionStyle, getContentStyle, renderAccentContainer, getLayoutClasses } from "./shared";

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
    textColor,
    headingFont,
    bodyFont,
    headingSize,
    bodySize,
    overlayOpacity,
    contentAlignX,
    contentAlignY,
  } = props;

  const bgStyle =
    backgroundType === "image"
      ? getSectionStyle(props)
      : getSectionStyle({ ...props, backgroundImageUrl: undefined });

  const layoutClass = getLayoutClasses(contentAlignX, contentAlignY);
  const contentStyle = getContentStyle(props);

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
        <div className="max-w-2xl w-full flex flex-col" style={contentStyle}>
          <p
            className="uppercase tracking-[0.35em] opacity-80"
            style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize - 2 }}
          >
            {tagline}
          </p>

          <div className="flex flex-col" style={{ gap: contentStyle.gap }}>
            <h1
              className="font-bold leading-tight"
              style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
            >
              {groomName}
            </h1>
            
            {renderAccentContainer(props)}

            <h1
              className="font-bold leading-tight"
              style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize }}
            >
              {brideName}
            </h1>
          </div>

          {weddingDate && (
            <div
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border opacity-80 mt-4"
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
