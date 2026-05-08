"use client";

import { SharedStyleProps, getSectionStyle, getContentStyle, renderAccentContainer, getLayoutClasses } from "./shared";

export type SalamPembukaProps = SharedStyleProps & {
  greeting: string;
  body: string;
};

export function SalamPembukaBlock(props: SalamPembukaProps) {
  const {
    greeting,
    body,
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
    <section className="py-20 px-6 relative" style={bgStyle}>
      {backgroundImageUrl && (
        <div
          className="absolute inset-0 backdrop-blur-sm"
          style={{ backgroundColor: `rgba(255,255,255,${overlayOpacity / 100})` }}
        />
      )}
      <div className={`max-w-2xl mx-auto relative z-10 flex flex-col ${layoutClass}`} style={contentStyle}>
        {renderAccentContainer(props)}

        <h2
          className="font-bold"
          style={{ color: textColor, fontFamily: headingFont, fontSize: headingSize * 0.8 }}
        >
          {greeting}
        </h2>

        <p
          className="opacity-85"
          style={{ color: textColor, fontFamily: bodyFont, fontSize: bodySize }}
        >
          {body}
        </p>

        {renderAccentContainer(props)}
      </div>
    </section>
  );
}
